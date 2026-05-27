import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import {
  Upload, Download, Trash2, Link as LinkIcon, FileText, FileImage,
  FileVideo, FileAudio, File as FileIcon, Loader2, ExternalLink, Copy,
  Folder, FolderOpen, FolderPlus, ChevronRight, ChevronDown, Search,
  MoreVertical, Home, Move,
} from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub,
  DropdownMenuSubContent, DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";

type LmsFile = {
  id: string;
  course_id: string;
  folder_id: string | null;
  name: string;
  mime_type: string | null;
  size_bytes: number | null;
  storage_provider: string;
  storage_path: string | null;
  drive_file_id: string | null;
  external_url: string | null;
  created_at: string;
  updated_at: string | null;
  modified_by: string | null;
};

type LmsFolder = {
  id: string;
  course_id: string;
  parent_id: string | null;
  name: string;
  created_at: string;
  updated_at: string;
};

type Row =
  | { kind: "folder"; folder: LmsFolder }
  | { kind: "file"; file: LmsFile };

const iconFor = (mime?: string | null, name?: string) => {
  const m = (mime || "").toLowerCase();
  const n = (name || "").toLowerCase();
  if (m.startsWith("image/")) return FileImage;
  if (m.startsWith("video/")) return FileVideo;
  if (m.startsWith("audio/")) return FileAudio;
  if (m.includes("pdf") || n.endsWith(".pdf")) return FileText;
  if (m.includes("word") || /\.(docx?|rtf|txt)$/.test(n)) return FileText;
  return FileIcon;
};

const formatSize = (bytes?: number | null) => {
  if (bytes == null) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let v = bytes;
  while (v >= 1024 && i < units.length - 1) { v /= 1024; i++; }
  return `${v.toFixed(v < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
};

const formatDate = (s?: string | null) =>
  s ? new Date(s).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "—";

const FilesTab = ({ courseId, isInstructor }: { courseId: string; isInstructor: boolean }) => {
  const [files, setFiles] = useState<LmsFile[]>([]);
  const [folders, setFolders] = useState<LmsFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [showDriveDialog, setShowDriveDialog] = useState(false);
  const [driveUrl, setDriveUrl] = useState("");
  const [driveTitle, setDriveTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [renameTarget, setRenameTarget] = useState<Row | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [filesRes, foldersRes] = await Promise.all([
      supabase.from("lms_files").select("*").eq("course_id", courseId),
      supabase.from("lms_folders").select("*").eq("course_id", courseId),
    ]);
    if (filesRes.error) toast({ title: "Could not load files", description: filesRes.error.message, variant: "destructive" });
    if (foldersRes.error) toast({ title: "Could not load folders", description: foldersRes.error.message, variant: "destructive" });
    setFiles((filesRes.data as LmsFile[]) ?? []);
    setFolders((foldersRes.data as LmsFolder[]) ?? []);
    setLoading(false);
  }, [courseId]);

  useEffect(() => { load(); }, [load]);

  // Index folders by parent
  const folderChildren = useMemo(() => {
    const m = new Map<string | null, LmsFolder[]>();
    folders.forEach((f) => {
      const list = m.get(f.parent_id) ?? [];
      list.push(f);
      m.set(f.parent_id, list);
    });
    m.forEach((v) => v.sort((a, b) => a.name.localeCompare(b.name)));
    return m;
  }, [folders]);

  const folderById = useMemo(() => {
    const m = new Map<string, LmsFolder>();
    folders.forEach((f) => m.set(f.id, f));
    return m;
  }, [folders]);

  // Breadcrumb path for current folder
  const breadcrumbs = useMemo(() => {
    const path: LmsFolder[] = [];
    let cur = currentFolderId ? folderById.get(currentFolderId) : null;
    while (cur) {
      path.unshift(cur);
      cur = cur.parent_id ? folderById.get(cur.parent_id) ?? null : null;
    }
    return path;
  }, [currentFolderId, folderById]);

  // Rows shown in main pane
  const rows = useMemo<Row[]>(() => {
    const q = search.trim().toLowerCase();
    let folderRows: Row[];
    let fileRows: Row[];

    if (q) {
      folderRows = folders
        .filter((f) => f.name.toLowerCase().includes(q))
        .map((folder) => ({ kind: "folder" as const, folder }));
      fileRows = files
        .filter((f) => f.name.toLowerCase().includes(q))
        .map((file) => ({ kind: "file" as const, file }));
    } else {
      folderRows = (folderChildren.get(currentFolderId) ?? [])
        .map((folder) => ({ kind: "folder" as const, folder }));
      fileRows = files
        .filter((f) => (f.folder_id ?? null) === currentFolderId)
        .map((file) => ({ kind: "file" as const, file }));
    }

    folderRows.sort((a, b) =>
      (a as any).folder.name.localeCompare((b as any).folder.name)
    );
    fileRows.sort((a, b) =>
      (a as any).file.name.localeCompare((b as any).file.name)
    );
    return [...folderRows, ...fileRows];
  }, [folders, files, folderChildren, currentFolderId, search]);

  const totalSize = useMemo(
    () => files.reduce((sum, f) => sum + (f.size_bytes ?? 0), 0),
    [files]
  );
  const QUOTA = 500 * 1024 * 1024; // 500 MB visual quota, matches Canvas screenshot
  const usedPct = Math.min(100, Math.round((totalSize / QUOTA) * 100));

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  // --- Upload ---
  const uploadMany = async (incoming: FileList | File[]) => {
    const list = Array.from(incoming);
    if (!list.length) return;
    setUploading(true);
    setProgress({ done: 0, total: list.length });
    let okCount = 0;

    for (let i = 0; i < list.length; i++) {
      const f = list[i];
      try {
        const safe = f.name.replace(/[^\w.\-]+/g, "_");
        const path = `${courseId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safe}`;
        const { error: upErr } = await supabase.storage
          .from("course-assets")
          .upload(path, f, { contentType: f.type || "application/octet-stream", upsert: false });
        if (upErr) throw upErr;
        const { error: insErr } = await supabase.from("lms_files").insert({
          course_id: courseId,
          folder_id: currentFolderId,
          name: f.name,
          mime_type: f.type || null,
          size_bytes: f.size,
          storage_provider: "cloud",
          storage_path: path,
        });
        if (insErr) throw insErr;
        okCount++;
      } catch (e: any) {
        toast({ title: `Failed: ${f.name}`, description: e?.message ?? "Upload error", variant: "destructive" });
      }
      setProgress({ done: i + 1, total: list.length });
    }

    setUploading(false);
    setProgress(null);
    if (okCount > 0) {
      toast({ title: `Uploaded ${okCount} file${okCount === 1 ? "" : "s"}` });
      load();
    }
  };

  const onPickFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) uploadMany(e.target.files);
    e.target.value = "";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isInstructor) return;
    const dropped = e.dataTransfer?.files;
    if (dropped?.length) uploadMany(dropped);
  };

  // --- Folders ---
  const createFolder = async () => {
    const name = newFolderName.trim();
    if (!name) return;
    setBusy(true);
    try {
      const { error } = await supabase.from("lms_folders").insert({
        course_id: courseId,
        parent_id: currentFolderId,
        name,
      });
      if (error) throw error;
      toast({ title: "Folder created" });
      setNewFolderName("");
      setShowNewFolder(false);
      if (currentFolderId) {
        setExpanded((p) => new Set(p).add(currentFolderId));
      }
      load();
    } catch (e: any) {
      toast({ title: "Could not create folder", description: e.message, variant: "destructive" });
    } finally { setBusy(false); }
  };

  // --- Drive / External link ---
  const addDriveLink = async () => {
    const url = driveUrl.trim();
    const title = driveTitle.trim() || url;
    if (!url) return;
    setBusy(true);
    try {
      const driveMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
      const { error } = await supabase.from("lms_files").insert({
        course_id: courseId,
        folder_id: currentFolderId,
        name: title,
        storage_provider: driveMatch ? "drive" : "external",
        drive_file_id: driveMatch ? driveMatch[1] : null,
        external_url: driveMatch ? null : url,
      });
      if (error) throw error;
      toast({ title: "Link added" });
      setDriveUrl(""); setDriveTitle(""); setShowDriveDialog(false);
      load();
    } catch (e: any) {
      toast({ title: "Could not add link", description: e.message, variant: "destructive" });
    } finally { setBusy(false); }
  };

  const externalUrlFor = (f: LmsFile) => {
    if (f.storage_provider === "drive" && f.drive_file_id)
      return `https://drive.google.com/file/d/${f.drive_file_id}/view`;
    if (f.external_url) return f.external_url;
    return null;
  };

  const openFile = async (f: LmsFile) => {
    const ext = externalUrlFor(f);
    if (ext) { window.open(ext, "_blank", "noopener,noreferrer"); return; }
    if (!f.storage_path) return;
    const { data, error } = await supabase.storage
      .from("course-assets")
      .createSignedUrl(f.storage_path, 60 * 60);
    if (error || !data?.signedUrl) {
      toast({ title: "Could not open file", description: error?.message, variant: "destructive" });
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  };

  const downloadFile = async (f: LmsFile) => {
    const ext = externalUrlFor(f);
    if (ext) { window.open(ext, "_blank", "noopener,noreferrer"); return; }
    if (!f.storage_path) return;
    const { data, error } = await supabase.storage
      .from("course-assets")
      .createSignedUrl(f.storage_path, 60 * 60, { download: f.name });
    if (error || !data?.signedUrl) {
      toast({ title: "Could not download", description: error?.message, variant: "destructive" });
      return;
    }
    window.location.href = data.signedUrl;
  };

  const copyLink = async (f: LmsFile) => {
    const ext = externalUrlFor(f);
    let link = ext;
    if (!link && f.storage_path) {
      const { data } = await supabase.storage
        .from("course-assets")
        .createSignedUrl(f.storage_path, 60 * 60 * 24);
      link = data?.signedUrl ?? null;
    }
    if (!link) { toast({ title: "No link available", variant: "destructive" }); return; }
    try {
      await navigator.clipboard.writeText(link);
      toast({ title: "Link copied" });
    } catch {
      toast({ title: "Copy failed", description: link, variant: "destructive" });
    }
  };

  const deleteFile = async (f: LmsFile) => {
    try {
      if (f.storage_path) await supabase.storage.from("course-assets").remove([f.storage_path]);
      const { error } = await supabase.from("lms_files").delete().eq("id", f.id);
      if (error) throw error;
      toast({ title: "File deleted" });
      setFiles((prev) => prev.filter((x) => x.id !== f.id));
    } catch (e: any) {
      toast({ title: "Delete failed", description: e.message, variant: "destructive" });
    }
  };

  const deleteFolder = async (folder: LmsFolder) => {
    try {
      // Collect all descendant folder IDs
      const all = new Set<string>([folder.id]);
      let changed = true;
      while (changed) {
        changed = false;
        folders.forEach((f) => {
          if (f.parent_id && all.has(f.parent_id) && !all.has(f.id)) {
            all.add(f.id);
            changed = true;
          }
        });
      }
      // Remove storage objects for files inside any of those folders
      const orphanFiles = files.filter((f) => f.folder_id && all.has(f.folder_id) && f.storage_path);
      if (orphanFiles.length) {
        await supabase.storage.from("course-assets").remove(orphanFiles.map((f) => f.storage_path!));
      }
      const { error } = await supabase.from("lms_folders").delete().eq("id", folder.id);
      if (error) throw error;
      toast({ title: "Folder deleted" });
      if (currentFolderId && all.has(currentFolderId)) {
        setCurrentFolderId(folder.parent_id);
      }
      load();
    } catch (e: any) {
      toast({ title: "Could not delete folder", description: e.message, variant: "destructive" });
    }
  };

  const moveFile = async (file: LmsFile, targetFolderId: string | null) => {
    if ((file.folder_id ?? null) === targetFolderId) return;
    const { error } = await supabase.from("lms_files")
      .update({ folder_id: targetFolderId })
      .eq("id", file.id);
    if (error) { toast({ title: "Move failed", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Moved" });
    load();
  };

  const moveFolder = async (folder: LmsFolder, targetParentId: string | null) => {
    if (targetParentId === folder.id) return;
    if ((folder.parent_id ?? null) === targetParentId) return;
    // Prevent moving into own descendant
    const descendants = new Set<string>([folder.id]);
    let changed = true;
    while (changed) {
      changed = false;
      folders.forEach((f) => {
        if (f.parent_id && descendants.has(f.parent_id) && !descendants.has(f.id)) {
          descendants.add(f.id); changed = true;
        }
      });
    }
    if (targetParentId && descendants.has(targetParentId)) {
      toast({ title: "Cannot move folder into itself", variant: "destructive" }); return;
    }
    const { error } = await supabase.from("lms_folders")
      .update({ parent_id: targetParentId })
      .eq("id", folder.id);
    if (error) { toast({ title: "Move failed", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Moved" });
    load();
  };

  const renameItem = async () => {
    const name = renameValue.trim();
    if (!name || !renameTarget) return;
    setBusy(true);
    try {
      if (renameTarget.kind === "folder") {
        const { error } = await supabase.from("lms_folders")
          .update({ name }).eq("id", renameTarget.folder.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("lms_files")
          .update({ name }).eq("id", renameTarget.file.id);
        if (error) throw error;
      }
      toast({ title: "Renamed" });
      setRenameTarget(null); setRenameValue("");
      load();
    } catch (e: any) {
      toast({ title: "Rename failed", description: e.message, variant: "destructive" });
    } finally { setBusy(false); }
  };

  // --- Folder tree (left sidebar) ---
  const FolderNode = ({ folder, depth }: { folder: LmsFolder; depth: number }) => {
    const children = folderChildren.get(folder.id) ?? [];
    const hasChildren = children.length > 0;
    const isOpen = expanded.has(folder.id);
    const isActive = currentFolderId === folder.id;
    return (
      <div>
        <button
          onClick={() => { setCurrentFolderId(folder.id); if (hasChildren && !isOpen) toggleExpand(folder.id); }}
          className={`w-full flex items-center gap-1 px-2 py-1.5 text-sm rounded hover:bg-muted/60 ${isActive ? "bg-muted font-medium" : ""}`}
          style={{ paddingLeft: depth * 12 + 4 }}
        >
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => { e.stopPropagation(); if (hasChildren) toggleExpand(folder.id); }}
            className="w-4 h-4 flex items-center justify-center shrink-0"
          >
            {hasChildren ? (isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />) : null}
          </span>
          {isOpen ? <FolderOpen className="h-4 w-4 text-amber-500 shrink-0" /> : <Folder className="h-4 w-4 text-amber-500 shrink-0" />}
          <span className="truncate text-left">{folder.name}</span>
        </button>
        {isOpen && hasChildren && (
          <div>
            {children.map((c) => <FolderNode key={c.id} folder={c} depth={depth + 1} />)}
          </div>
        )}
      </div>
    );
  };

  // Recursive move target menu
  const MoveMenu = ({ onPick, excludeFolderId }: { onPick: (id: string | null) => void; excludeFolderId?: string }) => {
    const renderLevel = (parentId: string | null): JSX.Element[] => {
      const list = folderChildren.get(parentId) ?? [];
      return list
        .filter((f) => f.id !== excludeFolderId)
        .map((f) => {
          const children = (folderChildren.get(f.id) ?? []).filter((c) => c.id !== excludeFolderId);
          if (children.length === 0) {
            return (
              <DropdownMenuItem key={f.id} onClick={() => onPick(f.id)}>
                <Folder className="h-4 w-4 mr-2 text-amber-500" />{f.name}
              </DropdownMenuItem>
            );
          }
          return (
            <DropdownMenuSub key={f.id}>
              <DropdownMenuSubTrigger>
                <Folder className="h-4 w-4 mr-2 text-amber-500" />{f.name}
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => onPick(f.id)}>
                  Move here
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {renderLevel(f.id)}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          );
        });
    };
    return (
      <>
        <DropdownMenuItem onClick={() => onPick(null)}>
          <Home className="h-4 w-4 mr-2" />Course root
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {renderLevel(null)}
      </>
    );
  };

  const rootFolders = folderChildren.get(null) ?? [];

  return (
    <div className="flex flex-col h-full min-h-[600px]">
      {/* Top bar: breadcrumbs + search + actions */}
      <div className="flex items-center gap-3 flex-wrap pb-3 border-b">
        <div className="flex items-center gap-1 text-sm min-w-0 flex-1">
          <button
            onClick={() => setCurrentFolderId(null)}
            className="hover:underline font-medium text-foreground"
          >
            Files
          </button>
          {breadcrumbs.map((b) => (
            <span key={b.id} className="flex items-center gap-1 min-w-0">
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <button
                onClick={() => setCurrentFolderId(b.id)}
                className="hover:underline truncate"
              >
                {b.name}
              </button>
            </span>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for files"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 w-64"
          />
        </div>

        {isInstructor && (
          <>
            <Button variant="outline" size="sm" onClick={() => setShowNewFolder(true)}>
              <FolderPlus className="h-4 w-4 mr-1.5" /> Folder
            </Button>
            <Button size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
              {uploading ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Upload className="h-4 w-4 mr-1.5" />}
              {uploading ? `Uploading ${progress?.done}/${progress?.total}` : "Upload"}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9"><MoreVertical className="h-4 w-4" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowDriveDialog(true)}>
                  <LinkIcon className="h-4 w-4 mr-2" /> Add Google Drive / external link
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <input ref={fileInputRef} type="file" multiple className="hidden" onChange={onPickFiles} />
          </>
        )}
      </div>

      {/* Body: tree + main pane */}
      <div
        className="flex-1 flex min-h-0"
        onDragOver={(e) => { if (isInstructor) e.preventDefault(); }}
        onDrop={onDrop}
      >
        {/* Sidebar tree */}
        <aside className="w-64 shrink-0 border-r overflow-y-auto py-2 pr-2">
          <button
            onClick={() => setCurrentFolderId(null)}
            className={`w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-muted/60 ${currentFolderId === null ? "bg-muted font-medium" : ""}`}
          >
            <Home className="h-4 w-4 text-muted-foreground" />
            <span className="truncate">Course files</span>
          </button>
          <div className="mt-1">
            {rootFolders.map((f) => <FolderNode key={f.id} folder={f} depth={1} />)}
          </div>
          {folders.length === 0 && (
            <p className="px-2 py-3 text-xs text-muted-foreground">
              No folders yet{isInstructor ? ". Click \"Folder\" to create one." : "."}
            </p>
          )}
        </aside>

        {/* Main list */}
        <div className="flex-1 overflow-auto min-w-0">
          <div className="px-4 py-2 text-xs text-muted-foreground">
            {loading ? "Loading…" : `${rows.length} item${rows.length === 1 ? "" : "s"}${search ? " matching search" : ""}`}
          </div>

          <div className="grid grid-cols-[1fr_140px_140px_120px_100px_44px] gap-2 px-4 py-2 border-y bg-muted/30 text-xs font-medium text-muted-foreground sticky top-0">
            <div>Name</div>
            <div>Date Created</div>
            <div>Date Modified</div>
            <div>Modified By</div>
            <div className="text-right">Size</div>
            <div></div>
          </div>

          {!loading && rows.length === 0 && (
            <div className="p-10 text-center text-sm text-muted-foreground">
              {search
                ? "No files or folders match your search."
                : isInstructor
                ? "This folder is empty. Drag files here or click Upload."
                : "This folder is empty."}
            </div>
          )}

          <ul>
            {rows.map((r) => {
              if (r.kind === "folder") {
                const f = r.folder;
                return (
                  <li
                    key={`folder-${f.id}`}
                    className="grid grid-cols-[1fr_140px_140px_120px_100px_44px] gap-2 px-4 py-2 border-b hover:bg-muted/30 items-center text-sm"
                  >
                    <button
                      onClick={() => { setCurrentFolderId(f.id); setSearch(""); }}
                      className="flex items-center gap-2 min-w-0 text-left"
                    >
                      <Folder className="h-4 w-4 text-amber-500 shrink-0" />
                      <span className="truncate font-medium">{f.name}</span>
                    </button>
                    <div className="text-muted-foreground">{formatDate(f.created_at)}</div>
                    <div className="text-muted-foreground">{formatDate(f.updated_at)}</div>
                    <div className="text-muted-foreground">—</div>
                    <div className="text-right text-muted-foreground">—</div>
                    <div className="text-right">
                      {isInstructor && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7"><MoreVertical className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setRenameTarget(r); setRenameValue(f.name); }}>Rename</DropdownMenuItem>
                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger><Move className="h-4 w-4 mr-2" />Move to…</DropdownMenuSubTrigger>
                              <DropdownMenuSubContent>
                                <MoveMenu excludeFolderId={f.id} onPick={(pid) => moveFolder(f, pid)} />
                              </DropdownMenuSubContent>
                            </DropdownMenuSub>
                            <DropdownMenuSeparator />
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                                  <Trash2 className="h-4 w-4 mr-2" />Delete folder
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete "{f.name}"?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Everything inside this folder (including subfolders and files) will be permanently removed.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteFolder(f)}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </li>
                );
              }

              const file = r.file;
              const Icon = iconFor(file.mime_type, file.name);
              const isLink = file.storage_provider !== "cloud";
              return (
                <li
                  key={`file-${file.id}`}
                  className="grid grid-cols-[1fr_140px_140px_120px_100px_44px] gap-2 px-4 py-2 border-b hover:bg-muted/30 items-center text-sm"
                >
                  <button
                    onClick={() => openFile(file)}
                    className="flex items-center gap-2 min-w-0 text-left"
                    title={file.name}
                  >
                    <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="truncate text-primary hover:underline">{file.name}</span>
                    {isLink && <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0" />}
                  </button>
                  <div className="text-muted-foreground">{formatDate(file.created_at)}</div>
                  <div className="text-muted-foreground">{formatDate(file.updated_at ?? file.created_at)}</div>
                  <div className="text-muted-foreground truncate">—</div>
                  <div className="text-right text-muted-foreground">
                    {isLink ? (file.storage_provider === "drive" ? "Drive" : "Link") : formatSize(file.size_bytes)}
                  </div>
                  <div className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7"><MoreVertical className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openFile(file)}><ExternalLink className="h-4 w-4 mr-2" />Open</DropdownMenuItem>
                        {!isLink && <DropdownMenuItem onClick={() => downloadFile(file)}><Download className="h-4 w-4 mr-2" />Download</DropdownMenuItem>}
                        <DropdownMenuItem onClick={() => copyLink(file)}><Copy className="h-4 w-4 mr-2" />Copy link</DropdownMenuItem>
                        {isInstructor && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => { setRenameTarget(r); setRenameValue(file.name); }}>Rename</DropdownMenuItem>
                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger><Move className="h-4 w-4 mr-2" />Move to…</DropdownMenuSubTrigger>
                              <DropdownMenuSubContent>
                                <MoveMenu onPick={(pid) => moveFile(file, pid)} />
                              </DropdownMenuSubContent>
                            </DropdownMenuSub>
                            <DropdownMenuSeparator />
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                                  <Trash2 className="h-4 w-4 mr-2" />Delete
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete this file?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    "{file.name}" will be permanently removed. If it's used inside a module, that item will stop working.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteFile(file)}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Storage bar */}
      <div className="flex items-center gap-3 border-t px-4 py-2 text-xs text-muted-foreground">
        <div className="h-2 bg-muted rounded-full flex-1 max-w-xs overflow-hidden">
          <div className="h-full bg-primary" style={{ width: `${usedPct}%` }} />
        </div>
        <span>{usedPct}% of {formatSize(QUOTA)} used</span>
      </div>

      {/* New folder dialog */}
      <Dialog open={showNewFolder} onOpenChange={setShowNewFolder}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              New folder{breadcrumbs.length > 0 ? ` in ${breadcrumbs[breadcrumbs.length - 1].name}` : ""}
            </DialogTitle>
          </DialogHeader>
          <Input
            autoFocus
            placeholder="Folder name"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") createFolder(); }}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewFolder(false)}>Cancel</Button>
            <Button onClick={createFolder} disabled={busy || !newFolderName.trim()}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Drive link dialog */}
      <Dialog open={showDriveDialog} onOpenChange={setShowDriveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Google Drive or external link</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Display name (e.g. Student Handbook)"
              value={driveTitle} onChange={(e) => setDriveTitle(e.target.value)} />
            <Input placeholder="https://drive.google.com/file/d/…/view"
              value={driveUrl} onChange={(e) => setDriveUrl(e.target.value)} />
            <p className="text-xs text-muted-foreground">
              For Drive links, make sure the file is set to "Anyone with the link can view".
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDriveDialog(false)}>Cancel</Button>
            <Button onClick={addDriveLink} disabled={busy || !driveUrl.trim()}>Add link</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename dialog */}
      <Dialog open={!!renameTarget} onOpenChange={(o) => { if (!o) { setRenameTarget(null); setRenameValue(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename {renameTarget?.kind === "folder" ? "folder" : "file"}</DialogTitle>
          </DialogHeader>
          <Input
            autoFocus
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") renameItem(); }}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameTarget(null)}>Cancel</Button>
            <Button onClick={renameItem} disabled={busy || !renameValue.trim()}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FilesTab;
