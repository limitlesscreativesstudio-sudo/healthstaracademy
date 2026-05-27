import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import {
  Upload, Download, Trash2, Link as LinkIcon, FileText, FileImage,
  FileVideo, FileAudio, File as FileIcon, Loader2, ExternalLink, Copy,
} from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type LmsFile = {
  id: string;
  course_id: string;
  name: string;
  mime_type: string | null;
  size_bytes: number | null;
  storage_provider: string;
  storage_path: string | null;
  drive_file_id: string | null;
  external_url: string | null;
  created_at: string;
};

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
  if (!bytes && bytes !== 0) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let v = bytes;
  while (v >= 1024 && i < units.length - 1) { v /= 1024; i++; }
  return `${v.toFixed(v < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
};

const FilesTab = ({ courseId, isInstructor }: { courseId: string; isInstructor: boolean }) => {
  const [files, setFiles] = useState<LmsFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [driveUrl, setDriveUrl] = useState("");
  const [driveTitle, setDriveTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("lms_files")
      .select("*")
      .eq("course_id", courseId)
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Could not load files", description: error.message, variant: "destructive" });
    }
    setFiles((data as LmsFile[]) ?? []);
    setLoading(false);
  }, [courseId]);

  useEffect(() => { load(); }, [load]);

  const uploadMany = async (incoming: FileList | File[]) => {
    const list = Array.from(incoming);
    if (!list.length) return;
    setUploading(true);
    setProgress({ done: 0, total: list.length });
    let okCount = 0;

    for (let i = 0; i < list.length; i++) {
      const f = list[i];
      try {
        // Sanitize the filename — Supabase storage rejects some chars.
        const safe = f.name.replace(/[^\w.\-]+/g, "_");
        const path = `${courseId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safe}`;
        const { error: upErr } = await supabase.storage
          .from("course-assets")
          .upload(path, f, { contentType: f.type || "application/octet-stream", upsert: false });
        if (upErr) throw upErr;

        const { error: insErr } = await supabase.from("lms_files").insert({
          course_id: courseId,
          name: f.name,
          mime_type: f.type || null,
          size_bytes: f.size,
          storage_provider: "cloud",
          storage_path: path,
        });
        if (insErr) throw insErr;
        okCount++;
      } catch (e: any) {
        toast({
          title: `Failed: ${f.name}`,
          description: e?.message ?? "Upload error",
          variant: "destructive",
        });
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

  const addDriveLink = async () => {
    const url = driveUrl.trim();
    const title = driveTitle.trim() || url;
    if (!url) return;
    setBusy(true);
    try {
      const driveMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
      const { error } = await supabase.from("lms_files").insert({
        course_id: courseId,
        name: title,
        storage_provider: driveMatch ? "drive" : "external",
        drive_file_id: driveMatch ? driveMatch[1] : null,
        external_url: driveMatch ? null : url,
      });
      if (error) throw error;
      toast({ title: "Link added" });
      setDriveUrl(""); setDriveTitle("");
      load();
    } catch (e: any) {
      toast({ title: "Could not add link", description: e.message, variant: "destructive" });
    } finally { setBusy(false); }
  };

  const externalUrlFor = (f: LmsFile) => {
    if (f.storage_provider === "drive" && f.drive_file_id) {
      return `https://drive.google.com/file/d/${f.drive_file_id}/view`;
    }
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
      if (f.storage_path) {
        await supabase.storage.from("course-assets").remove([f.storage_path]);
      }
      const { error } = await supabase.from("lms_files").delete().eq("id", f.id);
      if (error) throw error;
      toast({ title: "File deleted" });
      setFiles((prev) => prev.filter((x) => x.id !== f.id));
    } catch (e: any) {
      toast({ title: "Delete failed", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Files</h1>
        <p className="text-sm text-muted-foreground">
          Upload course materials so students can download or preview them.
        </p>
      </div>

      {isInstructor && (
        <Card
          onDragOver={(e) => { e.preventDefault(); }}
          onDrop={onDrop}
          className="border-2 border-dashed p-6 flex flex-col items-center justify-center text-center gap-3 bg-muted/20"
        >
          <Upload className="h-8 w-8 text-muted-foreground" />
          <div>
            <p className="font-medium">Drag files here or click to upload</p>
            <p className="text-xs text-muted-foreground">
              Multiple files supported. For very large files use the Google Drive link option below.
            </p>
          </div>
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            variant="default"
          >
            {uploading ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Uploading{progress ? ` ${progress.done}/${progress.total}` : "…"}</>
            ) : (
              <><Upload className="h-4 w-4 mr-2" />Choose files</>
            )}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={onPickFiles}
          />
        </Card>
      )}

      {isInstructor && (
        <Card className="p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <LinkIcon className="h-4 w-4" /> Add a Google Drive or external link
          </div>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_auto] gap-2">
            <Input
              placeholder="Display name (e.g. Student Handbook)"
              value={driveTitle}
              onChange={(e) => setDriveTitle(e.target.value)}
            />
            <Input
              placeholder="https://drive.google.com/file/d/…/view"
              value={driveUrl}
              onChange={(e) => setDriveUrl(e.target.value)}
            />
            <Button onClick={addDriveLink} disabled={busy || !driveUrl.trim()}>
              Add link
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            For Drive links, make sure the file is set to "Anyone with the link can view".
          </p>
        </Card>
      )}

      <Card className="overflow-hidden">
        <div className="px-4 py-3 border-b bg-muted/30 text-sm font-medium">
          {loading ? "Loading…" : `${files.length} file${files.length === 1 ? "" : "s"}`}
        </div>
        {!loading && files.length === 0 && (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No files yet{isInstructor ? " — upload some above." : "."}
          </div>
        )}
        <ul className="divide-y">
          {files.map((f) => {
            const Icon = iconFor(f.mime_type, f.name);
            const isLink = f.storage_provider !== "cloud";
            return (
              <li key={f.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30">
                <Icon className="h-5 w-5 text-muted-foreground shrink-0" />
                <button
                  className="flex-1 min-w-0 text-left"
                  onClick={() => openFile(f)}
                  title={f.name}
                >
                  <div className="truncate font-medium">{f.name}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {isLink ? (f.storage_provider === "drive" ? "Google Drive" : "External link") : `${f.mime_type ?? "file"} · ${formatSize(f.size_bytes)}`}
                    {" · "}{new Date(f.created_at).toLocaleDateString()}
                  </div>
                </button>
                <Button variant="ghost" size="sm" onClick={() => openFile(f)} title="Open">
                  <ExternalLink className="h-4 w-4" />
                </Button>
                {!isLink && (
                  <Button variant="ghost" size="sm" onClick={() => downloadFile(f)} title="Download">
                    <Download className="h-4 w-4" />
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => copyLink(f)} title="Copy link">
                  <Copy className="h-4 w-4" />
                </Button>
                {isInstructor && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" title="Delete">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete this file?</AlertDialogTitle>
                        <AlertDialogDescription>
                          "{f.name}" will be permanently removed. If it's used inside a module, that item will stop working.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteFile(f)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
};

export default FilesTab;
