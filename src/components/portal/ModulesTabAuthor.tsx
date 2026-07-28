import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
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
  ChevronsUp, ChevronsDown, Type, CheckCircle2, Copy,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
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
};

const ITEM_TYPES = [
  { value: "assignment", label: "Assignment", icon: ClipboardList },
  { value: "quiz",       label: "Quiz",       icon: GraduationCap },
  { value: "page",       label: "Page",       icon: FileText },
  { value: "file",       label: "File",       icon: FileIcon },
  { value: "link",       label: "External URL", icon: LinkIcon },
  { value: "video",      label: "Video URL",  icon: Video },
  { value: "header",     label: "Text Header (non-clickable title)", icon: Type },
];

const itemIcon = (t: string) => {
  const def = ITEM_TYPES.find(x => x.value === t);
  const I = def?.icon ?? FileText;
  return <I className="h-4 w-4 text-purple" />;
};

const ModulesTabAuthor = ({ courseId, isInstructor }: { courseId: string; isInstructor: boolean }) => {
  const [modules, setModules] = useState<Module[]>([]);
  const [items, setItems] = useState<ModuleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [allCollapsed, setAllCollapsed] = useState(false);

  // dialogs
  const [moduleDlg, setModuleDlg] = useState<{ open: boolean; module?: Module }>({ open: false });
  const [itemDlg, setItemDlg] = useState<{ open: boolean; moduleId?: string; item?: ModuleItem }>({ open: false });
  const [progressOpen, setProgressOpen] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const load = async () => {
    setLoading(true);
    let modQuery = supabase.from("modules").select("*").eq("course_id", courseId).order("position");
    if (!isInstructor) modQuery = modQuery.eq("published", true);
    const { data: mods } = await modQuery;
    setModules(mods ?? []);
    const ids = (mods ?? []).map(m => m.id);
    if (ids.length) {
      let itQuery = supabase.from("module_items").select("*").in("module_id", ids).order("position");
      if (!isInstructor) itQuery = itQuery.eq("published", true);
      const { data: its } = await itQuery;
      setItems(its ?? []);
    } else {
      setItems([]);
    }
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
      const insertIdx = targetItemId
        ? target.findIndex(i => i.id === targetItemId)
        : target.length;
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
        <div className="flex items-center gap-2">
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
              <Eye className="h-4 w-4" /> Publish All
            </Button>
          )}
          {isInstructor && (
            <>
              <Button size="sm" variant="outline" onClick={() => setProgressOpen(true)}>
                <BarChart3 className="h-4 w-4" /> View Progress
              </Button>
              <Button size="sm" onClick={() => setModuleDlg({ open: true })}>
                <Plus className="h-4 w-4" /> Module
              </Button>
            </>
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
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={modules.map(m => m.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {modules.map(m => (
                <SortableModule
                  key={m.id} module={m}
                  items={items.filter(i => i.module_id === m.id)}
                  allModules={modules}
                  collapsed={collapsed.has(m.id)}
                  isInstructor={isInstructor}
                  courseId={courseId}
                  onToggleCollapse={() => toggleCollapse(m.id)}
                  onTogglePublish={() => togglePublishModule(m)}
                  onEdit={() => setModuleDlg({ open: true, module: m })}
                  onDelete={() => deleteModule(m)}
                  onAddItem={() => setItemDlg({ open: true, moduleId: m.id })}
                  onEditItem={(it: ModuleItem) => setItemDlg({ open: true, moduleId: m.id, item: it })}
                  onDeleteItem={deleteItem}
                  onToggleItemPublish={togglePublishItem}
                  onMoveItem={moveItemToModule}
                  onMoveModule={(where: "up" | "down" | "top" | "bottom") => moveModule(m, where)}
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
    </div>
  );
};

// ============ Sortable Module ============
const SortableModule = ({
  module: m, items, allModules, collapsed, isInstructor, courseId,
  onToggleCollapse, onTogglePublish, onEdit, onDelete, onAddItem,
  onEditItem, onDeleteItem, onToggleItemPublish, onMoveItem, onMoveModule,
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
          <button {...attributes} {...listeners} className="cursor-grab p-1 hover:bg-muted rounded" title="Drag to reorder module">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
        <button onClick={onToggleCollapse} className="p-1 hover:bg-muted rounded" aria-label="Toggle module">
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        <div className="font-semibold flex-1 truncate">{m.title}</div>
        {isInstructor && !m.published && (
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground border border-border rounded px-1.5 py-0.5">Unpublished</span>
        )}
        {isInstructor && (
          <>
            <button onClick={onTogglePublish} className="p-1.5 hover:bg-muted rounded" title={m.published ? "Unpublish" : "Publish"}>
              {m.published ? <Eye className="h-4 w-4 text-green-600" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1.5 hover:bg-muted rounded" aria-label="Module options">
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
          <div ref={setDropRef} className={isOver ? "bg-purple/5 ring-2 ring-purple/40 ring-inset" : ""}>
            <SortableContext items={items.map((i: ModuleItem) => i.id)} strategy={verticalListSortingStrategy}>
              {items.length === 0 ? (
                <div className="p-4 text-sm text-muted-foreground italic">
                  {isInstructor ? "No items — drag an item here or click Add item." : "No items in this module."}
                </div>
              ) : (
                items.map((i: ModuleItem) => (
                  <SortableItem
                    key={i.id} item={i} courseId={courseId} isInstructor={isInstructor}
                    otherModules={otherModules}
                    onTogglePublish={() => onToggleItemPublish(i)}
                    onEdit={() => onEditItem(i)}
                    onDelete={() => onDeleteItem(i)}
                    onMoveTo={(targetId: string) => onMoveItem(i, targetId)}
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
const SortableItem = ({ item: i, courseId, isInstructor, otherModules, onTogglePublish, onEdit, onDelete, onMoveTo }: any) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: i.id,
    data: { type: "item", moduleId: i.module_id },
  });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };


  const isHeader = i.item_type === "header";
  const to = `/portal/courses/${courseId}/modules/${i.id}`;

  return (
    <div
      ref={setNodeRef} style={style}
      className={`flex items-center gap-2 px-3 py-2 border-b border-border last:border-0 hover:bg-muted/30 ${!i.published ? "opacity-60" : ""}`}
    >
      {isInstructor && (
        <button {...attributes} {...listeners} className="cursor-grab p-1 hover:bg-muted rounded">
          <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      )}
      {!isHeader && itemIcon(i.item_type)}
      {isHeader ? (
        <div className="flex-1 text-sm font-bold uppercase tracking-wide text-muted-foreground select-none">{i.title}</div>
      ) : (
        <Link to={to} className="flex-1 text-sm hover:underline">{i.title}</Link>
      )}
      {isInstructor && !i.published && (
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground border border-border rounded px-1 py-0.5">Hidden</span>
      )}
      {isInstructor && (
        <>
          <button onClick={onTogglePublish} className="p-1 hover:bg-muted rounded" title={i.published ? "Unpublish" : "Publish"}>
            {i.published ? <Eye className="h-3.5 w-3.5 text-green-600" /> : <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />}
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1 hover:bg-muted rounded"><MoreVertical className="h-3.5 w-3.5" /></button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-h-80 overflow-auto">
              <DropdownMenuItem onClick={onEdit}><Pencil className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>
              {otherModules && otherModules.length > 0 && (
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <ArrowRightLeft className="h-4 w-4 mr-2" /> Move to module
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
const ItemDialog = ({ open, moduleId, item, courseId, nextPosition, onClose, onSaved }: any) => {
  const [type, setType] = useState("page");
  const [title, setTitle] = useState("");
  const [contentRef, setContentRef] = useState<string>("");
  const [url, setUrl] = useState("");
  const [published, setPublished] = useState(true);
  const [saving, setSaving] = useState(false);

  // pickers
  const [assignments, setAssignments] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [pages, setPages] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);

  useEffect(() => {
    if (!open) return;
    if (item) {
      setType(item.item_type); setTitle(item.title);
      setContentRef(item.content_ref ?? ""); setUrl(item.url ?? "");
      setPublished(item.published);
    } else {
      setType("page"); setTitle(""); setContentRef(""); setUrl(""); setPublished(true);
    }
    (async () => {
      const [a, q, p, f] = await Promise.all([
        supabase.from("assignments").select("id, title").eq("course_id", courseId).order("title"),
        supabase.from("quizzes").select("id, title").eq("course_id", courseId).order("title"),
        supabase.from("lms_pages").select("id, title").eq("course_id", courseId).order("title"),
        supabase.from("lms_files").select("id, name").eq("course_id", courseId).order("name"),
      ]);
      setAssignments(a.data ?? []); setQuizzes(q.data ?? []);
      setPages(p.data ?? []); setFiles(f.data ?? []);
    })();
  }, [open, item, courseId]);

  // auto-fill title when picking existing content
  const onPickContent = (id: string, label: string) => {
    setContentRef(id);
    if (!title) setTitle(label);
  };

  const save = async () => {
    if (!title.trim()) return;
    setSaving(true);
    const payload: any = {
      module_id: moduleId, title: title.trim(), item_type: type, published,
      content_ref: ["assignment", "quiz", "page", "file"].includes(type) ? (contentRef || null) : null,
      url: ["link", "video"].includes(type) ? (url || null) : null,
    };
    if (item) {
      await supabase.from("module_items").update(payload).eq("id", item.id);
    } else {
      payload.position = nextPosition;
      await supabase.from("module_items").insert(payload);
    }
    setSaving(false);
    toast({ title: item ? "Item updated" : "Item added" });
    onSaved();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>{item ? "Edit Item" : "Add Item to Module"}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Type</Label>
            <Select value={type} onValueChange={(v) => { setType(v); setContentRef(""); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {ITEM_TYPES.map(t => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {type === "assignment" && (
            <PickerSelect label="Assignment" value={contentRef} options={assignments.map(a => ({ id: a.id, label: a.title }))} onChange={onPickContent} emptyHint="Create assignments first in the Assignments tab." />
          )}
          {type === "quiz" && (
            <PickerSelect label="Quiz" value={contentRef} options={quizzes.map(q => ({ id: q.id, label: q.title }))} onChange={onPickContent} emptyHint="Create quizzes first in the Quizzes tab." />
          )}
          {type === "page" && (
            <PickerSelect label="Page" value={contentRef} options={pages.map(p => ({ id: p.id, label: p.title }))} onChange={onPickContent} emptyHint="No pages yet. Create one in the Pages tab." />
          )}
          {type === "file" && (
            <PickerSelect label="File" value={contentRef} options={files.map(f => ({ id: f.id, label: f.name }))} onChange={onPickContent} emptyHint="No files yet. Upload one in the Files tab." />
          )}
          {(type === "link" || type === "video") && (
            <div>
              <Label>URL</Label>
              <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" />
            </div>
          )}

          <div>
            <Label>Display Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={type === "header" ? "Section heading text" : "Title shown to students"} />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
            Published
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

const PickerSelect = ({ label, value, options, onChange, emptyHint }: any) => (
  <div>
    <Label>{label}</Label>
    {options.length === 0 ? (
      <div className="text-xs text-muted-foreground italic mt-1">{emptyHint}</div>
    ) : (
      <Select value={value} onValueChange={(v) => {
        const opt = options.find((o: any) => o.id === v);
        onChange(v, opt?.label ?? "");
      }}>
        <SelectTrigger><SelectValue placeholder={`Choose a ${label.toLowerCase()}…`} /></SelectTrigger>
        <SelectContent>
          {options.map((o: any) => <SelectItem key={o.id} value={o.id}>{o.label}</SelectItem>)}
        </SelectContent>
      </Select>
    )}
  </div>
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
