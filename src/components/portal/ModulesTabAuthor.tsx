import { useEffect, useState, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import ContentViewer, { type ContentSource } from "@/components/portal/ContentViewer";
import InlineTitle from "@/components/portal/InlineTitle";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import {
  ChevronRight, ChevronDown, Eye, EyeOff, MoreVertical, Plus, GripVertical,
  FileText, FileIcon, Link as LinkIcon, Video, ClipboardList, GraduationCap,
  Trash2, Pencil, BarChart3, X, ArrowRightLeft, ArrowUp, ArrowDown,
  ChevronsUp, ChevronsDown, Type, CheckCircle2, Copy, MessageSquare, Plug,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  DndContext, pointerWithin, PointerSensor, useSensor, useSensors,
  DragEndEvent, useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext, useSortable, verticalListSortingStrategy, arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";


type Module = { id: string; title: string; position: number; published: boolean };
type ModuleItem = {
  id: string; module_id: string; title: string; item_type: string;
  content_ref: string | null; url: string | null; position: number; published: boolean;
  indent?: number | null;
  description?: string | null;
};

const ITEM_TYPES = [
  { value: "assignment", label: "Assignment", icon: ClipboardList },
  { value: "quiz",       label: "Quiz",       icon: GraduationCap },
  { value: "file",       label: "File",       icon: FileIcon },
  { value: "page",       label: "Page",       icon: FileText },
  { value: "discussion", label: "Discussion", icon: MessageSquare },
  { value: "header",     label: "Text Header", icon: Type },
  { value: "link",       label: "External URL", icon: LinkIcon },
  { value: "video",      label: "Video",      icon: Video },
  { value: "external_tool", label: "External Tool", icon: Plug },
];

const itemIcon = (t: string) => {
  const def = ITEM_TYPES.find(x => x.value === t);
  const I = def?.icon ?? FileText;
  return <I className="h-4 w-4 text-purple" />;
};

const ModulesTabAuthor = ({ courseId, isInstructor, openAddOnMount }: { courseId: string; isInstructor: boolean; openAddOnMount?: number }) => {
  const [modules, setModules] = useState<Module[]>([]);
  const [items, setItems] = useState<ModuleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [allCollapsed, setAllCollapsed] = useState(false);
  const [fileMap, setFileMap] = useState<Record<string, { url: string; name: string; type: string }>>({});
  const [pageMap, setPageMap] = useState<Record<string, { title: string; body: string }>>({});
  const [discussionMap, setDiscussionMap] = useState<Record<string, { title: string; body: string }>>({});
  const [viewer, setViewer] = useState<{ src: ContentSource; name: string; type?: string; title?: string } | null>(null);
  const [pageView, setPageView] = useState<{ title: string; body: string } | null>(null);

  // dialogs
  const [moduleDlg, setModuleDlg] = useState<{ open: boolean; module?: Module }>({ open: false });
  const [itemDlg, setItemDlg] = useState<{ open: boolean; moduleId?: string; item?: ModuleItem }>({ open: false });
  const [progressOpen, setProgressOpen] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  useEffect(() => {
    if (openAddOnMount && isInstructor) setModuleDlg({ open: true });
  }, [openAddOnMount, isInstructor]);

  const load = async () => {
    setLoading(true);
    let modQuery = supabase.from("modules").select("*").eq("course_id", courseId).order("position");
    if (!isInstructor) modQuery = modQuery.eq("published", true);
    const { data: mods } = await modQuery;
    const sortedMods = (mods ?? []).sort((a, b) => a.position - b.position);
    setModules(sortedMods);
    const ids = (mods ?? []).map(m => m.id);
    let allItems: ModuleItem[] = [];
    if (ids.length) {
      let itQuery = supabase.from("module_items").select("*").in("module_id", ids).order("position");
      if (!isInstructor) itQuery = itQuery.eq("published", true);
      const { data: its } = await itQuery;
      allItems = ((its ?? []) as any[]).sort((a, b) => a.position - b.position);
      setItems(allItems);
    } else {
      setItems([]);
    }

    // Preload lookup maps for smart routing (files, pages, discussions)
    const fileRefs = Array.from(new Set(allItems.filter(i => i.item_type === "file" && i.content_ref).map(i => i.content_ref!)));
    const pageRefs = Array.from(new Set(allItems.filter(i => i.item_type === "page" && i.content_ref).map(i => i.content_ref!)));
    const discRefs = Array.from(new Set(allItems.filter(i => i.item_type === "discussion" && i.content_ref).map(i => i.content_ref!)));
    const [fRes, pRes, dRes] = await Promise.all([
      fileRefs.length ? supabase.from("lms_files").select("id, file_url, file_name, name, file_type").in("id", fileRefs) : Promise.resolve({ data: [] as any[] }),
      pageRefs.length ? supabase.from("lms_pages").select("id, title, body_html").in("id", pageRefs) : Promise.resolve({ data: [] as any[] }),
      discRefs.length ? supabase.from("discussions").select("id, title, body").in("id", discRefs) : Promise.resolve({ data: [] as any[] }),
    ]);
    const fMap: Record<string, { url: string; name: string; type: string }> = {};
    ((fRes as any).data ?? []).forEach((r: any) => { fMap[r.id] = { url: r.file_url, name: r.name || r.file_name || "File", type: r.file_type || "" }; });
    setFileMap(fMap);
    const pMap: Record<string, { title: string; body: string }> = {};
    ((pRes as any).data ?? []).forEach((r: any) => { pMap[r.id] = { title: r.title, body: r.body_html || "" }; });
    setPageMap(pMap);
    const dMap: Record<string, { title: string; body: string }> = {};
    ((dRes as any).data ?? []).forEach((r: any) => { dMap[r.id] = { title: r.title, body: r.body || "" }; });
    setDiscussionMap(dMap);

    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [courseId, isInstructor]);

  const toggleCollapse = (id: string) => {
    setCollapsed(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const toggleAll = () => {
    if (allCollapsed) { setCollapsed(new Set()); setAllCollapsed(false); }
    else { setCollapsed(new Set(modules.map(m => m.id))); setAllCollapsed(true); }
  };

  const togglePublishModule = async (m: Module) => {
    await supabase.from("modules").update({ published: !m.published }).eq("id", m.id);
    load();
  };
  const togglePublishItem = async (i: ModuleItem) => {
    await supabase.from("module_items").update({ published: !i.published }).eq("id", i.id);
    load();
  };

  const renameModule = async (id: string, title: string) => {
    const { error } = await supabase.from("modules").update({ title }).eq("id", id);
    if (error) { toast({ title: "Rename failed", description: error.message, variant: "destructive" }); return; }
    setModules(p => p.map(m => m.id === id ? { ...m, title } : m));
  };

  const renameItem = async (id: string, title: string) => {
    const { error } = await supabase.from("module_items").update({ title }).eq("id", id);
    if (error) { toast({ title: "Rename failed", description: error.message, variant: "destructive" }); return; }
    setItems(p => p.map(i => i.id === id ? { ...i, title } : i));
  };

  const deleteModule = async (m: Module) => {
    if (!confirm(`Delete module "${m.title}" and all its items?`)) return;
    await supabase.from("module_items").delete().eq("module_id", m.id);
    await supabase.from("modules").delete().eq("id", m.id);
    toast({ title: "Module deleted" });
    load();
  };

  const deleteItem = async (i: ModuleItem) => {
    if (!confirm(`Remove "${i.title}" from this module?`)) return;
    await supabase.from("module_items").delete().eq("id", i.id);
    load();
  };

  // ----- Unified drag handler (modules + cross-module items) -----
  const onDragEnd = async (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;

    const activeData: any = active.data.current;
    const overData: any = over.data.current;
    const activeType = activeData?.type;

    // --- Module reorder ---
    if (activeType === "module") {
      const oldIdx = modules.findIndex(m => m.id === active.id);
      const newIdx = modules.findIndex(m => m.id === over.id);
      if (oldIdx < 0 || newIdx < 0) return;
      const next = arrayMove(modules, oldIdx, newIdx);
      setModules(next);
      await Promise.all(next.map((m, i) =>
        supabase.from("modules").update({ position: i }).eq("id", m.id)
      ));
      return;
    }

    // --- Item drag (within or across modules) ---
    if (activeType === "item") {
      const sourceModuleId = activeData.moduleId as string;
      // Determine target module: either dropped on another item, on a module header, or on a module drop zone
      let targetModuleId: string | undefined;
      let targetItemId: string | undefined;
      if (overData?.type === "item") {
        targetModuleId = overData.moduleId;
        targetItemId = over.id as string;
      } else if (overData?.type === "module" || overData?.type === "module-dropzone") {
        targetModuleId = (overData.moduleId as string) ?? (over.id as string);
      } else {
        return;
      }
      if (!targetModuleId) return;

      // Same module → reorder
      if (sourceModuleId === targetModuleId) {
        const within = items.filter(i => i.module_id === sourceModuleId);
        const oldIdx = within.findIndex(i => i.id === active.id);
        const newIdx = targetItemId
          ? within.findIndex(i => i.id === targetItemId)
          : within.length - 1;
        if (oldIdx < 0 || newIdx < 0 || oldIdx === newIdx) return;
        const reordered = arrayMove(within, oldIdx, newIdx);
        const others = items.filter(i => i.module_id !== sourceModuleId);
        setItems([...others, ...reordered]);
        await Promise.all(reordered.map((i, idx) =>
          supabase.from("module_items").update({ position: idx }).eq("id", i.id)
        ));
        return;
      }

      // Cross-module move
      const source = items.filter(i => i.module_id === sourceModuleId && i.id !== active.id);
      const target = items.filter(i => i.module_id === targetModuleId);
      const moved = items.find(i => i.id === active.id);
      if (!moved) return;
      const rawInsertIdx = targetItemId
        ? target.findIndex(i => i.id === targetItemId)
        : target.length;
      const insertIdx = rawInsertIdx < 0 ? target.length : rawInsertIdx;
      const nextTarget = [...target.slice(0, insertIdx), { ...moved, module_id: targetModuleId }, ...target.slice(insertIdx)];
      const others = items.filter(i => i.module_id !== sourceModuleId && i.module_id !== targetModuleId);
      setItems([...others, ...source.map((i, idx) => ({ ...i, position: idx })), ...nextTarget.map((i, idx) => ({ ...i, position: idx }))]);

      // Persist: update moved row's module_id, then rewrite positions in both modules
      await supabase.from("module_items").update({ module_id: targetModuleId }).eq("id", moved.id);
      await Promise.all([
        ...source.map((i, idx) => supabase.from("module_items").update({ position: idx }).eq("id", i.id)),
        ...nextTarget.map((i, idx) => supabase.from("module_items").update({ position: idx }).eq("id", i.id)),
      ]);
      const targetTitle = modules.find(m => m.id === targetModuleId)?.title ?? "module";
      toast({ title: "Item moved", description: `Moved to "${targetTitle}".` });
      load();
    }
  };

  // ----- Move item to another module (dropdown fallback) -----
  const moveItemToModule = async (item: ModuleItem, targetModuleId: string) => {
    if (item.module_id === targetModuleId) return;
    const targetCount = items.filter(i => i.module_id === targetModuleId).length;
    const { error } = await supabase
      .from("module_items")
      .update({ module_id: targetModuleId, position: targetCount })
      .eq("id", item.id);
    if (error) {
      toast({ title: "Move failed", description: error.message, variant: "destructive" });
      return;
    }
    const targetTitle = modules.find(m => m.id === targetModuleId)?.title ?? "module";
    toast({ title: "Item moved", description: `Moved to "${targetTitle}".` });
    load();
  };

  // ----- Reorder item within its module (menu fallback for drag) -----
  const moveItemWithin = async (item: ModuleItem, where: "up" | "down" | "top" | "bottom") => {
    const within = items.filter(i => i.module_id === item.module_id).sort((a, b) => a.position - b.position);
    const idx = within.findIndex(x => x.id === item.id);
    if (idx < 0) return;
    let newIdx = idx;
    if (where === "up") newIdx = Math.max(0, idx - 1);
    if (where === "down") newIdx = Math.min(within.length - 1, idx + 1);
    if (where === "top") newIdx = 0;
    if (where === "bottom") newIdx = within.length - 1;
    if (newIdx === idx) return;
    const reordered = arrayMove(within, idx, newIdx);
    const others = items.filter(i => i.module_id !== item.module_id);
    setItems([...others, ...reordered.map((x, i2) => ({ ...x, position: i2 }))]);
    await Promise.all(reordered.map((x, i2) =>
      supabase.from("module_items").update({ position: i2 }).eq("id", x.id)
    ));
    toast({ title: "Item moved" });
  };

  // ----- Duplicate item -----
  const duplicateItem = async (item: ModuleItem) => {
    const sameModuleCount = items.filter(i => i.module_id === item.module_id).length;
    const { error } = await supabase.from("module_items").insert({
      module_id: item.module_id,
      title: `${item.title} (copy)`,
      item_type: item.item_type,
      content_ref: item.content_ref,
      url: item.url,
      published: false,
      position: sameModuleCount,
    });
    if (error) { toast({ title: "Duplicate failed", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Item duplicated" });
    load();
  };

  // ----- Move module up/down/top/bottom -----
  const moveModule = async (m: Module, where: "up" | "down" | "top" | "bottom") => {
    const idx = modules.findIndex(x => x.id === m.id);
    if (idx < 0) return;
    let newIdx = idx;
    if (where === "up") newIdx = Math.max(0, idx - 1);
    if (where === "down") newIdx = Math.min(modules.length - 1, idx + 1);
    if (where === "top") newIdx = 0;
    if (where === "bottom") newIdx = modules.length - 1;
    if (newIdx === idx) return;
    const next = arrayMove(modules, idx, newIdx);
    setModules(next);
    await Promise.all(next.map((mm, i) =>
      supabase.from("modules").update({ position: i }).eq("id", mm.id)
    ));
  };


  if (loading) return <div className="text-sm text-muted-foreground p-4">Loading modules…</div>;

  const empty = modules.length === 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h2 className="font-heading text-2xl font-bold">Modules</h2>
        <div className="flex items-center gap-2 flex-wrap">
          {isInstructor && (
            <Button
              size="sm"
              onClick={() => setModuleDlg({ open: true })}
              className="bg-purple text-white hover:bg-purple/90"
            >
              <Plus className="h-4 w-4 mr-1" /> Module
            </Button>
          )}
          {!empty && (
            <Button size="sm" variant="outline" onClick={toggleAll}>
              {allCollapsed ? "Expand All" : "Collapse All"}
            </Button>
          )}
          {isInstructor && !empty && (
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                if (!confirm("Publish all modules and items in this course?")) return;
                await supabase.from("modules").update({ published: true }).eq("course_id", courseId);
                const ids = modules.map(m => m.id);
                if (ids.length) await supabase.from("module_items").update({ published: true }).in("module_id", ids);
                toast({ title: "All modules and items published" });
                load();
              }}
            >
              <Eye className="h-4 w-4 mr-1" /> Publish All
            </Button>
          )}
          {isInstructor && (
            <Button size="sm" variant="outline" onClick={() => setProgressOpen(true)}>
              <BarChart3 className="h-4 w-4 mr-1" /> View Progress
            </Button>
          )}
        </div>
      </div>

      {empty ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="mx-auto w-24 h-24 rounded bg-muted flex items-center justify-center mb-4">
              <ClipboardList className="h-10 w-10 text-muted-foreground" />
            </div>
            {isInstructor ? (
              <>
                <p className="text-muted-foreground mb-4">No modules yet.</p>
                <Button onClick={() => setModuleDlg({ open: true })} className="bg-purple text-white hover:bg-purple/90">
                  <Plus className="h-4 w-4" /> Create a new Module
                </Button>
              </>
            ) : (
              <p className="text-muted-foreground">No modules published yet.</p>
            )}
          </CardContent>
        </Card>
      ) : (
        <DndContext sensors={sensors} collisionDetection={pointerWithin} onDragEnd={onDragEnd}>
          <SortableContext items={modules.map(m => m.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {modules.map(m => (
                <SortableModule
                  key={m.id} module={m}
                   items={items.filter(i => i.module_id === m.id).sort((a, b) => a.position - b.position)}
                  allModules={modules}
                  collapsed={collapsed.has(m.id)}
                  isInstructor={isInstructor}
                  courseId={courseId}
                  fileMap={fileMap}
                  pageMap={pageMap}
                  discussionMap={discussionMap}
                  onOpenFile={(src, name, type, title) => setViewer({ src, name, type, title })}
                  onOpenPage={(p) => setPageView(p)}
                  onToggleCollapse={() => toggleCollapse(m.id)}
                  onTogglePublish={() => togglePublishModule(m)}
                  onEdit={() => setModuleDlg({ open: true, module: m })}
                  onDelete={() => deleteModule(m)}
                  onAddItem={() => setItemDlg({ open: true, moduleId: m.id })}
                  onEditItem={(it: ModuleItem) => setItemDlg({ open: true, moduleId: m.id, item: it })}
                  onDeleteItem={deleteItem}
                  onToggleItemPublish={togglePublishItem}
                  onDuplicateItem={duplicateItem}
                  onMoveItem={moveItemToModule}
                  onMoveItemWithin={moveItemWithin}
                  onMoveModule={(where: "up" | "down" | "top" | "bottom") => moveModule(m, where)}
                  onRenameModule={(t: string) => renameModule(m.id, t)}
                  onRenameItem={(id: string, t: string) => renameItem(id, t)}
                />

              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}


      <ModuleDialog
        open={moduleDlg.open}
        module={moduleDlg.module}
        courseId={courseId}
        nextPosition={modules.length}
        onClose={() => setModuleDlg({ open: false })}
        onSaved={load}
      />
      <ItemDialog
        open={itemDlg.open}
        moduleId={itemDlg.moduleId}
        moduleTitle={modules.find(m => m.id === itemDlg.moduleId)?.title}
        item={itemDlg.item}
        courseId={courseId}
        nextPosition={itemDlg.moduleId ? items.filter(i => i.module_id === itemDlg.moduleId).length : 0}
        onClose={() => setItemDlg({ open: false })}
        onSaved={load}
      />
      {isInstructor && (
        <ProgressDialog
          open={progressOpen}
          courseId={courseId}
          modules={modules}
          items={items}
          onClose={() => setProgressOpen(false)}
        />
      )}
      <ContentViewer
        open={!!viewer}
        onClose={() => setViewer(null)}
        source={viewer?.src ?? null}
        fileName={viewer?.name}
        fileType={viewer?.type}
        title={viewer?.title}
      />
      <Dialog open={!!pageView} onOpenChange={(o) => !o && setPageView(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{pageView?.title}</DialogTitle>
          </DialogHeader>
          <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: pageView?.body || "<p class='text-muted-foreground'>Empty page.</p>" }} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ============ Sortable Module ============
const SortableModule = ({
  module: m, items, allModules, collapsed, isInstructor, courseId,
  fileMap, pageMap, discussionMap, onOpenFile, onOpenPage,
  onToggleCollapse, onTogglePublish, onEdit, onDelete, onAddItem,
  onEditItem, onDeleteItem, onToggleItemPublish, onDuplicateItem, onMoveItem, onMoveItemWithin, onMoveModule,
  onRenameModule, onRenameItem,
}: any) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: m.id,
    data: { type: "module", moduleId: m.id },
  });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  // Droppable zone for the module body — receives cross-module item drops (empty modules + end of list)
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `module-drop-${m.id}`,
    data: { type: "module-dropzone", moduleId: m.id },
  });

  const otherModules = (allModules as Module[]).filter(x => x.id !== m.id);
  const idx = (allModules as Module[]).findIndex(x => x.id === m.id);
  const isFirst = idx === 0;
  const isLast = idx === (allModules as Module[]).length - 1;

  return (
    <Card ref={setNodeRef} style={style}>
      <div className="px-3 py-2 border-b border-border bg-muted/40 flex items-center gap-2">
        {isInstructor && (
          <button type="button" {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing touch-none p-1 hover:bg-muted rounded" title="Drag to reorder module">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
            <button type="button" onClick={onToggleCollapse} className="p-1 hover:bg-muted rounded" aria-label="Toggle module">
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        <div className="font-semibold flex-1 min-w-0">
          <InlineTitle value={m.title} disabled={!isInstructor} label="module title" onSave={(t) => onRenameModule?.(t)} />
        </div>
        {isInstructor && !m.published && (
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground border border-border rounded px-1.5 py-0.5">Unpublished</span>
        )}
        {isInstructor && (
          <>
            <button onClick={onTogglePublish} className="p-1.5 hover:bg-muted rounded" title={m.published ? "Published — click to unpublish" : "Unpublished — click to publish"}>
              {m.published
                ? <CheckCircle2 className="h-4 w-4 text-green-600 fill-green-600/10" />
                : <EyeOff className="h-4 w-4 text-muted-foreground" />}
            </button>
            <button type="button" onClick={onAddItem} className="p-1.5 hover:bg-muted rounded" title={`Add item to ${m.title}`} aria-label={`Add item to ${m.title}`}>
              <Plus className="h-4 w-4 text-muted-foreground" />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" className="p-1.5 hover:bg-muted rounded" aria-label="Module options">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}><Pencil className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>
                <DropdownMenuItem onClick={onTogglePublish}>
                  {m.published ? <><EyeOff className="h-4 w-4 mr-2" /> Unpublish</> : <><Eye className="h-4 w-4 mr-2" /> Publish</>}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled={isFirst} onClick={() => onMoveModule("top")}>
                  <ChevronsUp className="h-4 w-4 mr-2" /> Move to top
                </DropdownMenuItem>
                <DropdownMenuItem disabled={isFirst} onClick={() => onMoveModule("up")}>
                  <ArrowUp className="h-4 w-4 mr-2" /> Move up
                </DropdownMenuItem>
                <DropdownMenuItem disabled={isLast} onClick={() => onMoveModule("down")}>
                  <ArrowDown className="h-4 w-4 mr-2" /> Move down
                </DropdownMenuItem>
                <DropdownMenuItem disabled={isLast} onClick={() => onMoveModule("bottom")}>
                  <ChevronsDown className="h-4 w-4 mr-2" /> Move to bottom
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onDelete} className="text-destructive"><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
      </div>

      {!collapsed && (
        <CardContent className="p-0">
          <div ref={setDropRef} className={`min-h-10 ${isOver ? "bg-purple/5 ring-2 ring-purple/40 ring-inset" : ""}`}>
            <SortableContext items={items.map((i: ModuleItem) => i.id)} strategy={verticalListSortingStrategy}>
              {items.length === 0 ? (
                <div className="p-4 text-sm text-muted-foreground italic">
                  {isInstructor ? "No items — drag an item here or click Add item." : "No items in this module."}
                </div>
              ) : (
                items.map((i: ModuleItem, idx2: number) => (
                  <SortableItem
                    key={i.id} item={i} courseId={courseId} isInstructor={isInstructor}
                    otherModules={otherModules}
                    fileMap={fileMap}
                    pageMap={pageMap}
                    discussionMap={discussionMap}
                    onOpenFile={onOpenFile}
                    onOpenPage={onOpenPage}
                    isFirst={idx2 === 0}
                    isLast={idx2 === items.length - 1}
                    onTogglePublish={() => onToggleItemPublish(i)}
                    onEdit={() => onEditItem(i)}
                    onDelete={() => onDeleteItem(i)}
                    onDuplicate={() => onDuplicateItem(i)}
                    onMoveTo={(targetId: string) => onMoveItem(i, targetId)}
                    onMoveWithin={(where: "up" | "down" | "top" | "bottom") => onMoveItemWithin(i, where)}
                  />

                ))
              )}
            </SortableContext>
          </div>
          {isInstructor && (
            <div className="border-t border-border bg-muted/20 px-3 py-2 flex gap-2">
              <Button size="sm" variant="ghost" onClick={onAddItem}>
                <Plus className="h-4 w-4" /> Add item
              </Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};


// ============ Sortable Item ============
const SortableItem = ({ item: i, courseId, isInstructor, otherModules, fileMap, pageMap, discussionMap, onOpenFile, onOpenPage, isFirst, isLast, onTogglePublish, onEdit, onDelete, onDuplicate, onMoveTo, onMoveWithin }: any) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: i.id,
    data: { type: "item", moduleId: i.module_id },
  });
  const indent = Math.max(0, Math.min(5, Number(i.indent ?? 0)));
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1, paddingLeft: `${12 + indent * 24}px` };

  const isHeader = i.item_type === "header";

  const openItem = () => {
    const t = i.item_type;
    const moduleReturnPath = `${location.pathname}${location.search || `?course=${courseId}&tab=modules`}`;
    if (t === "assignment" && i.content_ref) return navigate(`/portal/courses/${courseId}/assignments/${i.content_ref}`, { state: { from: moduleReturnPath } });
    if (t === "quiz" && i.content_ref) return navigate(`/portal/courses/${courseId}/quizzes/${i.content_ref}`, { state: { from: moduleReturnPath } });
    if (t === "file") {
      const f = fileMap?.[i.content_ref];
      const fileUrl = f?.url || i.url || i.file_url;
      if (!fileUrl) return toast({ title: "File not found", variant: "destructive" });
      const parts = fileUrl.split("/course-files/");
      if (parts.length === 2) {
        return onOpenFile?.({ bucket: "course-files", path: decodeURIComponent(parts[1].split("?")[0]) }, f?.name || i.title, f?.type || "", i.title);
      }
      return onOpenFile?.({ url: fileUrl }, f?.name || i.title, f?.type || "", i.title);
    }
    if (t === "page") {
      const p = pageMap?.[i.content_ref];
      return onOpenPage?.(p ?? { title: i.title, body: "" });
    }
    if (t === "discussion") {
      const d = discussionMap?.[i.content_ref];
      return onOpenPage?.(d ?? { title: i.title, body: "" });
    }
    // link / video / external_tool / anything with a url — always preview inline
    // so students stay on the course page instead of leaving to a new tab.
    const url: string | undefined = i.url;
    if (url) {
      return onOpenFile?.({ url }, i.title, "", i.title);
    }
    toast({ title: "Nothing to open for this item" });
  };

  return (
    <div
      ref={setNodeRef} style={style}
      className={`flex items-center gap-2 pr-3 py-2 border-b border-border last:border-0 hover:bg-muted/30 ${!i.published ? "opacity-60" : ""}`}
    >
      {isInstructor && (
        <button type="button" {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing touch-none p-1 hover:bg-muted rounded" title="Drag to reorder item">
          <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      )}
      {!isHeader && itemIcon(i.item_type)}
      {isHeader ? (
        <div className="flex-1 text-sm font-bold uppercase tracking-wide text-muted-foreground select-none">{i.title}</div>
      ) : (
        <button type="button" onClick={openItem} className="flex-1 text-left text-sm hover:underline">
          {i.title}
          {i.description ? <div className="text-xs text-muted-foreground font-normal mt-0.5 line-clamp-1">{i.description}</div> : null}
        </button>
      )}
      {isInstructor && !i.published && (
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground border border-border rounded px-1 py-0.5">Hidden</span>
      )}
      {isInstructor && (
        <>
          <button type="button" onClick={onTogglePublish} className="p-1 hover:bg-muted rounded" title={i.published ? "Published — click to unpublish" : "Unpublished — click to publish"}>
            {i.published
              ? <CheckCircle2 className="h-4 w-4 text-green-600 fill-green-600/10" />
              : <EyeOff className="h-4 w-4 text-muted-foreground" />}
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className="p-1 hover:bg-muted rounded" aria-label={`Options for ${i.title}`}><MoreVertical className="h-3.5 w-3.5" /></button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-h-80 overflow-auto">
              <DropdownMenuItem onClick={onEdit}><Pencil className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>
              <DropdownMenuItem onClick={onDuplicate}><Copy className="h-4 w-4 mr-2" /> Duplicate</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled={isFirst} onClick={() => onMoveWithin("top")}>
                <ChevronsUp className="h-4 w-4 mr-2" /> Move to top
              </DropdownMenuItem>
              <DropdownMenuItem disabled={isFirst} onClick={() => onMoveWithin("up")}>
                <ArrowUp className="h-4 w-4 mr-2" /> Move up
              </DropdownMenuItem>
              <DropdownMenuItem disabled={isLast} onClick={() => onMoveWithin("down")}>
                <ArrowDown className="h-4 w-4 mr-2" /> Move down
              </DropdownMenuItem>
              <DropdownMenuItem disabled={isLast} onClick={() => onMoveWithin("bottom")}>
                <ChevronsDown className="h-4 w-4 mr-2" /> Move to bottom
              </DropdownMenuItem>
              {otherModules && otherModules.length > 0 && (
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <ArrowRightLeft className="h-4 w-4 mr-2" /> Move to…
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="max-h-72 overflow-auto">
                    {otherModules.map((mod: Module) => (
                      <DropdownMenuItem key={mod.id} onClick={() => onMoveTo(mod.id)}>
                        {mod.title}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-destructive"><Trash2 className="h-4 w-4 mr-2" /> Remove</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )}
    </div>
  );
};

// ============ Module Dialog ============
const ModuleDialog = ({ open, module: m, courseId, nextPosition, onClose, onSaved }: any) => {
  const [title, setTitle] = useState("");
  const [published, setPublished] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle(m?.title ?? "");
      setPublished(m?.published ?? false);
    }
  }, [open, m]);

  const save = async () => {
    if (!title.trim()) return;
    setSaving(true);
    if (m) {
      await supabase.from("modules").update({ title, published }).eq("id", m.id);
    } else {
      await supabase.from("modules").insert({ course_id: courseId, title, published, position: nextPosition });
    }
    setSaving(false);
    toast({ title: m ? "Module updated" : "Module created" });
    onSaved();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>{m ? "Edit Module" : "Add Module"}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Module Name</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} autoFocus placeholder="e.g. Week 1 — Introduction" />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
            Published (visible to students)
          </label>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={saving || !title.trim()}>{saving ? "Saving…" : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ============ Item Dialog ============
const CREATE_NEW = "__create_new__";
const ItemDialog = ({ open, moduleId, moduleTitle, item, courseId, nextPosition, onClose, onSaved }: any) => {
  const [type, setType] = useState("assignment");
  const [title, setTitle] = useState("");
  const [contentRef, setContentRef] = useState<string>("");
  const [url, setUrl] = useState("");
  const [published, setPublished] = useState(true);
  const [indent, setIndent] = useState<number>(0);
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [fileSource, setFileSource] = useState<"existing" | "upload" | "drive" | "url">("existing");
  const [driveUrl, setDriveUrl] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPct, setUploadPct] = useState(0);

  // pickers
  const [assignments, setAssignments] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [pages, setPages] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [discussions, setDiscussions] = useState<any[]>([]);

  const reloadPickers = async () => {
    const [a, q, p, f, d] = await Promise.all([
      supabase.from("assignments").select("id, title").eq("course_id", courseId).order("title"),
      supabase.from("quizzes").select("id, title").eq("course_id", courseId).order("title"),
      supabase.from("lms_pages").select("id, title").eq("course_id", courseId).order("title"),
      supabase.from("lms_files").select("id, name, file_name").eq("course_id", courseId).order("created_at", { ascending: false }),
      supabase.from("discussions").select("id, title").eq("course_id", courseId).order("title"),
    ]);
    setAssignments(a.data ?? []); setQuizzes(q.data ?? []);
    setPages(p.data ?? []);
    setFiles((f.data ?? []).map((row: any) => ({ id: row.id, name: row.name || row.file_name || "Untitled file" })));
    setDiscussions(d.data ?? []);
  };

  useEffect(() => {
    if (!open) return;
    if (item) {
      setType(item.item_type); setTitle(item.title);
      setContentRef(item.content_ref ?? ""); setUrl(item.url ?? "");
      setPublished(item.published); setIndent(Number(item.indent ?? 0));
      setDescription(item.description ?? "");
    } else {
      setType("assignment"); setTitle(""); setContentRef(""); setUrl(""); setPublished(true); setIndent(0);
      setDescription("");
    }
    setFileSource("existing"); setDriveUrl(""); setUploadFile(null); setUploadPct(0);
    reloadPickers();
  }, [open, item, courseId]);

  // auto-fill title when picking existing content
  const onPickContent = (id: string, label: string) => {
    setContentRef(id);
    if (!title) setTitle(label);
  };

  // Extract a Google Drive file id from typical share URLs
  const parseDriveId = (u: string): string | null => {
    const m1 = u.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (m1) return m1[1];
    const m2 = u.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (m2) return m2[1];
    return null;
  };

  // Create an lms_files row for Google Drive / external URL, return its id
  const createExternalFile = async (): Promise<string | null> => {
    const displayName = title.trim() || (fileSource === "drive" ? "Google Drive file" : "External file");
    if (fileSource === "drive") {
      const driveId = parseDriveId(driveUrl);
      const previewUrl = driveId
        ? `https://drive.google.com/file/d/${driveId}/preview`
        : driveUrl;
      const { data, error } = await supabase.from("lms_files").insert({
        course_id: courseId, name: displayName, file_name: displayName,
        storage_provider: "google_drive", drive_file_id: driveId,
        external_url: driveUrl, file_url: previewUrl, file_type: "gdrive",
      }).select().single();
      if (error) { toast({ title: "Could not attach Drive file", description: error.message, variant: "destructive" }); return null; }
      return data.id;
    }
    if (fileSource === "url") {
      const { data, error } = await supabase.from("lms_files").insert({
        course_id: courseId, name: displayName, file_name: displayName,
        storage_provider: "external", external_url: driveUrl, file_url: driveUrl,
        file_type: (driveUrl.split(".").pop() || "url").toLowerCase(),
      }).select().single();
      if (error) { toast({ title: "Could not attach URL", description: error.message, variant: "destructive" }); return null; }
      return data.id;
    }
    if (fileSource === "upload" && uploadFile) {
      const { uploadViaXhr } = await import("@/pages/portal/teach/uploadViaXhr");
      const ext = uploadFile.name.split(".").pop() ?? "";
      const safeName = uploadFile.name.replace(/[^\w.\-]+/g, '_').replace(/_+/g, '_');
      const path = `${courseId}/${Date.now()}_${safeName}`;
      const { error: upErr } = await uploadViaXhr("course-files", path, uploadFile, { onProgress: setUploadPct });
      if (upErr) { toast({ title: "Upload failed", description: upErr.message, variant: "destructive" }); return null; }
      const { data: { publicUrl } } = supabase.storage.from("course-files").getPublicUrl(path);
      const { data, error } = await supabase.from("lms_files").insert({
        course_id: courseId, name: uploadFile.name, file_name: uploadFile.name,
        storage_provider: "supabase", storage_path: path, file_url: publicUrl,
        file_type: ext, file_size: uploadFile.size, size_bytes: uploadFile.size,
        mime_type: uploadFile.type, folder: "Uploaded Media",
      }).select().single();
      if (error) { toast({ title: "Could not save file record", description: error.message, variant: "destructive" }); return null; }
      return data.id;
    }
    return null;
  };

  // inline create for assignment/quiz/page
  const createNewAndAttach = async (): Promise<string | null> => {
    const displayTitle = title.trim() || `New ${type}`;
    if (type === "assignment") {
      const { data, error } = await supabase.from("assignments")
        .insert({ course_id: courseId, title: displayTitle, submission_type: "assignment", group_name: "Assignments", points: 100, published: false })
        .select().single();
      if (error) { toast({ title: "Could not create assignment", description: error.message, variant: "destructive" }); return null; }
      return data.id;
    }
    if (type === "quiz") {
      const { data, error } = await supabase.from("quizzes")
        .insert({ course_id: courseId, title: displayTitle, published: false })
        .select().single();
      if (error) { toast({ title: "Could not create quiz", description: error.message, variant: "destructive" }); return null; }
      return data.id;
    }
    if (type === "page") {
      const { data, error } = await supabase.from("lms_pages")
        .insert({ course_id: courseId, title: displayTitle, body_html: "", published: false })
        .select().single();
      if (error) { toast({ title: "Could not create page", description: error.message, variant: "destructive" }); return null; }
      return data.id;
    }
    if (type === "discussion") {
      const { data: userRes } = await supabase.auth.getUser();
      const authorId = userRes.user?.id;
      if (!authorId) { toast({ title: "Sign in required", description: "Please sign in again before creating a discussion.", variant: "destructive" }); return null; }
      const { data, error } = await supabase.from("discussions")
        .insert({ course_id: courseId, title: displayTitle, body: "", author_id: authorId })
        .select().single();
      if (error) { toast({ title: "Could not create discussion", description: error.message, variant: "destructive" }); return null; }
      return data.id;
    }
    return null;
  };

  const save = async () => {
    if (!title.trim() && type !== "header") return;
    if (type === "header" && !title.trim()) return;
    setSaving(true);

    let finalContentRef: string | null = null;
    if (["assignment", "quiz", "page", "discussion"].includes(type)) {
      if (contentRef === CREATE_NEW) {
        const newId = await createNewAndAttach();
        if (!newId) { setSaving(false); return; }
        finalContentRef = newId;
      } else {
        finalContentRef = contentRef || null;
      }
    } else if (type === "file") {
      if (fileSource === "existing") {
        finalContentRef = contentRef || null;
      } else {
        const newId = await createExternalFile();
        if (!newId) { setSaving(false); return; }
        finalContentRef = newId;
      }
    }

    const payload: any = {
      module_id: moduleId, title: title.trim(), item_type: type, published, indent,
      description: description.trim() || null,
      content_ref: finalContentRef,
      url: ["link", "video", "external_tool"].includes(type) ? (url || null) : null,
    };
    const { error } = item
      ? await supabase.from("module_items").update(payload).eq("id", item.id)
      : await supabase.from("module_items").insert({ ...payload, position: nextPosition });
    setSaving(false);
    if (error) {
      toast({ title: "Could not save item", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: item ? "Item updated" : "Item added" });
    onSaved();
    onClose();
  };

  const needsPicker = ["assignment", "quiz", "page", "discussion"].includes(type);
  const pickerOptions =
    type === "assignment" ? assignments.map(a => ({ id: a.id, label: a.title })) :
    type === "quiz"       ? quizzes.map(q => ({ id: q.id, label: q.title })) :
    type === "page"       ? pages.map(p => ({ id: p.id, label: p.title })) :
    type === "discussion" ? discussions.map(d => ({ id: d.id, label: d.title })) : [];
  const canCreateInline = ["assignment", "quiz", "page", "discussion"].includes(type);
  const selectedType = ITEM_TYPES.find(t => t.value === type);
  const typeLabel = selectedType?.label ?? "Item";
  const fileReady =
    type !== "file" ||
    (fileSource === "existing" && !!contentRef) ||
    (fileSource === "upload" && !!uploadFile) ||
    ((fileSource === "drive" || fileSource === "url") && !!driveUrl.trim());

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {item ? "Edit Item" : `Add Item to ${moduleTitle || "Module"}`}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Label className="whitespace-nowrap">Add</Label>
            <Select value={type} onValueChange={(v) => { setType(v); setContentRef(""); }}>
              <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                {ITEM_TYPES.map(t => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {moduleTitle && (
              <span className="text-sm text-muted-foreground truncate">to {moduleTitle}</span>
            )}
          </div>

          {needsPicker && (
            <div>
              <div className="text-xs text-muted-foreground mb-1">
                Select the {typeLabel.toLowerCase()} you want to associate with {moduleTitle || "this module"}{canCreateInline ? `, or add a new one by selecting "Create ${typeLabel}"` : ""}.
              </div>
              <PickerSelect
                label={typeLabel}
                value={contentRef}
                options={pickerOptions}
                onChange={onPickContent}
                canCreate={canCreateInline}
                createLabel={`[ Create ${typeLabel} ]`}
              />
            </div>
          )}

          {type === "file" && (
            <div className="space-y-2">
              <Label>File Source</Label>
              <div className="flex flex-wrap gap-1 border rounded p-1 bg-muted/30">
                {[
                  { k: "existing", l: "📁 Course Files" },
                  { k: "upload",   l: "⬆️ Upload from Computer" },
                  { k: "drive",    l: "🟢 Google Drive Link" },
                  { k: "url",      l: "🔗 External URL" },
                ].map(o => (
                  <button
                    key={o.k}
                    type="button"
                    onClick={() => { setFileSource(o.k as any); setContentRef(""); setDriveUrl(""); setUploadFile(null); }}
                    className={`text-xs px-2 py-1 rounded ${fileSource === o.k ? "bg-purple text-white" : "hover:bg-muted"}`}
                  >
                    {o.l}
                  </button>
                ))}
              </div>

              {fileSource === "existing" && (
                <PickerSelect
                  label="File"
                  value={contentRef}
                  options={files.map(f => ({ id: f.id, label: f.name }))}
                  onChange={onPickContent}
                  canCreate={false}
                  createLabel=""
                />
              )}

              {fileSource === "upload" && (
                <div className="space-y-1">
                  <Input
                    type="file"
                    onChange={(e) => {
                      const f = e.target.files?.[0] ?? null;
                      setUploadFile(f);
                      if (f && !title) setTitle(f.name);
                    }}
                  />
                  {uploadFile && (
                    <div className="text-xs text-muted-foreground">
                      {uploadFile.name} · {(uploadFile.size / 1024).toFixed(0)} KB
                    </div>
                  )}
                  {saving && uploadPct > 0 && uploadPct < 100 && (
                    <div className="h-1 bg-muted rounded overflow-hidden">
                      <div className="h-full bg-purple" style={{ width: `${uploadPct}%` }} />
                    </div>
                  )}
                </div>
              )}

              {fileSource === "drive" && (
                <div className="space-y-1">
                  <Input
                    value={driveUrl}
                    onChange={(e) => setDriveUrl(e.target.value)}
                    placeholder="https://drive.google.com/file/d/…/view"
                  />
                  <div className="text-xs text-muted-foreground">
                    Paste a Google Drive share link. Make sure sharing is set to <b>Anyone with the link</b> so students can view it.
                  </div>
                </div>
              )}

              {fileSource === "url" && (
                <div className="space-y-1">
                  <Input
                    value={driveUrl}
                    onChange={(e) => setDriveUrl(e.target.value)}
                    placeholder="https://example.com/handout.pdf"
                  />
                  <div className="text-xs text-muted-foreground">
                    Any public URL — PDF, image, video, or webpage.
                  </div>
                </div>
              )}
            </div>
          )}


          {(type === "link" || type === "video" || type === "external_tool") && (
            <div>
              <Label>{type === "external_tool" ? "External Tool URL" : "URL"}</Label>
              <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" />
            </div>
          )}

          <div>
            <Label>Display Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={type === "header" ? "Section heading text" : "Title shown to students"} />
          </div>

          <div>
            <Label>Indentation</Label>
            <Select value={String(indent)} onValueChange={(v) => setIndent(Number(v))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Don't Indent</SelectItem>
                <SelectItem value="1">Indent 1 Level</SelectItem>
                <SelectItem value="2">Indent 2 Levels</SelectItem>
                <SelectItem value="3">Indent 3 Levels</SelectItem>
                <SelectItem value="4">Indent 4 Levels</SelectItem>
                <SelectItem value="5">Indent 5 Levels</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Description / Notes (optional)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add context, instructions, or notes that appear under the item title…"
              rows={5}
              className="min-h-[120px] resize-y"
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
            Published
          </label>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={saving || !title.trim() || !fileReady}>{saving ? "Saving…" : item ? "Save" : "Add Item"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const PickerSelect = ({ label, value, options, onChange, canCreate, createLabel }: any) => (
  <Select value={value} onValueChange={(v) => {
    if (v === CREATE_NEW) { onChange(CREATE_NEW, ""); return; }
    const opt = options.find((o: any) => o.id === v);
    onChange(v, opt?.label ?? "");
  }}>
    <SelectTrigger><SelectValue placeholder={`Choose a ${label.toLowerCase()}…`} /></SelectTrigger>
    <SelectContent className="max-h-[320px] overflow-y-auto">
      {canCreate && (
        <SelectItem value={CREATE_NEW} className="font-semibold">{createLabel}</SelectItem>
      )}
      {options.length === 0 && !canCreate && (
        <div className="px-2 py-1.5 text-xs text-muted-foreground italic">No existing {label.toLowerCase()}s.</div>
      )}
      {options.map((o: any) => <SelectItem key={o.id} value={o.id}>{o.label}</SelectItem>)}
    </SelectContent>
  </Select>
);

// ============ Progress Dialog ============
const ProgressDialog = ({ open, courseId, modules, items, onClose }: any) => {
  const [students, setStudents] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    (async () => {
      setLoading(true);
      const { data: enr } = await supabase
        .from("enrollments")
        .select("user_id, profiles:user_id ( id, full_name, email )")
        .eq("course_id", courseId);
      setStudents((enr ?? []).map((e: any) => e.profiles).filter(Boolean));

      const assignIds = items.filter((i: ModuleItem) => i.item_type === "assignment" && i.content_ref).map((i: ModuleItem) => i.content_ref);
      const quizIds = items.filter((i: ModuleItem) => i.item_type === "quiz" && i.content_ref).map((i: ModuleItem) => i.content_ref);

      const [subs, atts] = await Promise.all([
        assignIds.length
          ? supabase.from("submissions").select("user_id, assignment_id").in("assignment_id", assignIds)
          : Promise.resolve({ data: [] as any[] }),
        quizIds.length
          ? supabase.from("quiz_attempts").select("user_id, quiz_id, submitted_at").in("quiz_id", quizIds)
          : Promise.resolve({ data: [] as any[] }),
      ]);
      setSubmissions((subs as any).data ?? []);
      setAttempts((atts as any).data ?? []);
      setLoading(false);
    })();
  }, [open, courseId, items]);

  const completableItems = useMemo(() =>
    items.filter((i: ModuleItem) => i.published && ["assignment", "quiz"].includes(i.item_type) && i.content_ref),
  [items]);

  const completionFor = (userId: string) => {
    if (!completableItems.length) return { done: 0, total: 0, pct: 0 };
    let done = 0;
    completableItems.forEach((i: ModuleItem) => {
      if (i.item_type === "assignment") {
        if (submissions.some(s => s.user_id === userId && s.assignment_id === i.content_ref)) done++;
      } else if (i.item_type === "quiz") {
        if (attempts.some(a => a.user_id === userId && a.quiz_id === i.content_ref && a.submitted_at)) done++;
      }
    });
    return { done, total: completableItems.length, pct: Math.round((done / completableItems.length) * 100) };
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Student Progress</span>
            <button onClick={onClose}><X className="h-4 w-4" /></button>
          </DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="py-8 text-center text-muted-foreground text-sm">Loading…</div>
        ) : students.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground text-sm">No students enrolled yet.</div>
        ) : (
          <div className="max-h-[60vh] overflow-y-auto">
            <div className="text-xs text-muted-foreground mb-2">
              Tracking {completableItems.length} published assignment{completableItems.length === 1 ? "" : "s"} and quiz{completableItems.length === 1 ? "" : "zes"} across all modules.
            </div>
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground border-b">
                <tr><th className="text-left py-2">Student</th><th className="text-right py-2">Completed</th><th className="text-right py-2 w-32">Progress</th></tr>
              </thead>
              <tbody>
                {students.map((s: any) => {
                  const c = completionFor(s.id);
                  return (
                    <tr key={s.id} className="border-b last:border-0">
                      <td className="py-2">
                        <div className="font-medium">{s.full_name || s.email}</div>
                        {s.full_name && <div className="text-xs text-muted-foreground">{s.email}</div>}
                      </td>
                      <td className="py-2 text-right tabular-nums">{c.done} / {c.total}</td>
                      <td className="py-2">
                        <div className="flex items-center gap-2 justify-end">
                          <div className="w-20 h-1.5 bg-muted rounded overflow-hidden">
                            <div className="h-full bg-purple" style={{ width: `${c.pct}%` }} />
                          </div>
                          <span className="text-xs tabular-nums w-10 text-right">{c.pct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ModulesTabAuthor;
