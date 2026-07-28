import { useEffect, useRef, useState } from "react";
import DOMPurify from "dompurify";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading1, Heading2, Heading3, List, ListOrdered, Quote, Code,
  Link as LinkIcon, Image as ImageIcon, Upload, Undo, Redo,
  AlignLeft, AlignCenter, AlignRight, Eraser, Code2, FileText,
} from "lucide-react";

// Convert a Google Drive or Docs URL to its embeddable /preview form.
// Returns null if the URL is not a recognized Drive/Docs link.
const toDrivePreviewUrl = (raw: string): string | null => {
  try {
    const u = new URL(raw);
    if (!/(drive|docs)\.google\.com$/.test(u.hostname)) return null;
    // /file/d/<id>/...
    const fileMatch = u.pathname.match(/\/file\/d\/([^/]+)/);
    if (fileMatch) return `https://drive.google.com/file/d/${fileMatch[1]}/preview`;
    // /document|spreadsheets|presentation/d/<id>/...
    const docMatch = u.pathname.match(/\/(document|spreadsheets|presentation)\/d\/([^/]+)/);
    if (docMatch) return `https://docs.google.com/${docMatch[1]}/d/${docMatch[2]}/preview`;
    // open?id=<id>
    const id = u.searchParams.get("id");
    if (id) return `https://drive.google.com/file/d/${id}/preview`;
    return null;
  } catch { return null; }
};
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { uploadViaXhr } from "@/pages/portal/teach/uploadViaXhr";
import { toast } from "@/hooks/use-toast";

type Props = {
  value: string;
  onChange: (html: string) => void;
  minHeight?: number;
};

const ToolbarBtn = ({
  onClick, title, children, active,
}: { onClick: () => void; title: string; children: React.ReactNode; active?: boolean }) => (
  <button
    type="button"
    title={title}
    onMouseDown={(e) => e.preventDefault()}
    onClick={onClick}
    className={cn(
      "h-8 w-8 inline-flex items-center justify-center rounded hover:bg-muted text-foreground",
      active && "bg-muted",
    )}
  >
    {children}
  </button>
);

const RichTextEditor = ({ value, onChange, minHeight = 420 }: Props) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [mode, setMode] = useState<"rich" | "html">("rich");
  const [htmlDraft, setHtmlDraft] = useState(value);

  // Sync external value into the editor only when it changes from outside
  useEffect(() => {
    if (mode === "rich" && editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
    if (mode === "html") setHtmlDraft(value);
  }, [value, mode]);

  // Remember the last selection inside the editor so toolbar buttons /
  // prompts that steal focus can restore a valid Range before inserting.
  const savedRangeRef = useRef<Range | null>(null);

  const saveSelection = () => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    if (editorRef.current?.contains(range.commonAncestorContainer)) {
      savedRangeRef.current = range.cloneRange();
    }
  };

  // Make sure there is a live Range inside the editor before calling
  // document.execCommand, otherwise insertHTML / createLink no-op.
  const focusEditorWithRange = () => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();
    const sel = window.getSelection();
    if (!sel) return;
    const saved = savedRangeRef.current;
    if (saved && editor.contains(saved.commonAncestorContainer)) {
      sel.removeAllRanges();
      sel.addRange(saved);
      return;
    }
    // Fall back: place caret at the end of the editor.
    const range = document.createRange();
    range.selectNodeContents(editor);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
  };

  const exec = (command: string, arg?: string) => {
    document.execCommand(command, false, arg);
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const formatBlock = (tag: string) => exec("formatBlock", tag);

  const insertLink = () => {
    // Capture the current selection BEFORE the prompt steals focus.
    saveSelection();
    const url = window.prompt("Paste a link (URL, Google Drive, etc.)", "https://");
    if (!url) return;
    const trimmed = url.trim();
    if (!trimmed || trimmed === "https://") return;

    // Restore (or create) a Range inside the editor so the insert lands here.
    focusEditorWithRange();

    const sel = window.getSelection();
    const hasSelection = sel && sel.rangeCount > 0 && !sel.getRangeAt(0).collapsed
      && editorRef.current?.contains(sel.anchorNode);

    if (hasSelection) {
      document.execCommand("createLink", false, trimmed);
      // Force links to open in a new tab
      editorRef.current?.querySelectorAll(`a[href="${CSS.escape(trimmed)}"]`).forEach((a) => {
        a.setAttribute("target", "_blank");
        a.setAttribute("rel", "noopener noreferrer");
      });
    } else {
      // No selection — ask for link text and insert a fresh anchor
      const defaultText = (() => {
        try {
          const u = new URL(trimmed);
          if (u.hostname.includes("drive.google.com") || u.hostname.includes("docs.google.com")) {
            return "Open in Google Drive";
          }
          return u.hostname.replace(/^www\./, "") + (u.pathname !== "/" ? u.pathname : "");
        } catch { return trimmed; }
      })();
      const text = window.prompt("Link text to display", defaultText) || defaultText;
      const safeUrl = trimmed.replace(/"/g, "&quot;");
      const safeText = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
      document.execCommand(
        "insertHTML",
        false,
        `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${safeText}</a>&nbsp;`,
      );
    }
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const insertImage = () => {
    saveSelection();
    const url = window.prompt("Image URL or Google Drive link", "https://");
    if (!url) return;
    const trimmed = url.trim();
    if (!trimmed || trimmed === "https://") return;
    focusEditorWithRange();

    // If it's a Google Drive / Docs link, prefer the embedded iframe preview
    // (works for both images and PDFs without hotlink issues).
    const drivePreview = toDrivePreviewUrl(trimmed);
    if (drivePreview) {
      const html = `
        <div class="my-4 border border-border rounded-md overflow-hidden bg-muted/20" style="width:100%;">
          <iframe
            src="${drivePreview.replace(/"/g, "&quot;")}"
            style="width:100%; height:780px; border:0; display:block;"
            allow="autoplay"
            allowfullscreen
            loading="lazy"
          ></iframe>
        </div>
        <p><br/></p>
      `;
      document.execCommand("insertHTML", false, html);
      if (editorRef.current) onChange(editorRef.current.innerHTML);
      return;
    }
    exec("insertImage", trimmed);
  };

  const insertEmbed = () => {
    saveSelection();
    const url = window.prompt(
      "Paste a PDF link or Google Drive / Docs link to embed the full document",
      "https://",
    );
    if (!url) return;
    const trimmed = url.trim();
    if (!trimmed || trimmed === "https://") return;

    const drivePreview = toDrivePreviewUrl(trimmed);
    const src = drivePreview ?? trimmed;
    const isPdf = /\.pdf(\?|#|$)/i.test(trimmed) || !!drivePreview;
    if (!isPdf && !drivePreview) {
      const ok = window.confirm(
        "This doesn't look like a PDF or Google Drive link. Embed it anyway?",
      );
      if (!ok) return;
    }

    focusEditorWithRange();
    const html = `
      <div class="my-4 border border-border rounded-md overflow-hidden bg-muted/20" style="width:100%;">
        <iframe
          src="${src.replace(/"/g, "&quot;")}"
          style="width:100%; height:780px; border:0; display:block;"
          allow="autoplay"
          allowfullscreen
          loading="lazy"
        ></iframe>
      </div>
      <p><br/></p>
    `;
    document.execCommand("insertHTML", false, html);
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };


  const uploadAndInsertImage = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({ title: "Please choose an image file", variant: "destructive" });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "Image too large", description: "Max 10MB.", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "png";
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      // Use XHR to bypass the Lovable preview fetch proxy that can swallow POST bodies.
      const { error } = await uploadViaXhr("page-images", path, file);
      if (error) throw error;
      const { data } = supabase.storage.from("page-images").getPublicUrl(path);
      // restore focus so insertImage targets the editor
      editorRef.current?.focus();
      exec("insertImage", data.publicUrl);
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const onFileChosen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) uploadAndInsertImage(f);
    e.target.value = "";
  };

  const handleInput = () => {
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const switchMode = (next: "rich" | "html") => {
    if (next === mode) return;
    if (next === "html") {
      setHtmlDraft(editorRef.current?.innerHTML ?? value);
    } else {
      // committing html back to rich
      onChange(htmlDraft);
    }
    setMode(next);
  };

  return (
    <div className="border border-border rounded-md overflow-hidden bg-background">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-muted/30 px-2 py-1">
        <select
          className="h-8 text-sm bg-transparent border border-border rounded px-2 mr-1"
          onChange={(e) => { formatBlock(e.target.value); e.target.value = ""; }}
          defaultValue=""
        >
          <option value="" disabled>Paragraph</option>
          <option value="p">Paragraph</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="h4">Heading 4</option>
          <option value="pre">Preformatted</option>
        </select>

        <select
          className="h-8 text-sm bg-transparent border border-border rounded px-2 mr-1"
          title="Font family"
          onChange={(e) => { if (e.target.value) { exec("fontName", e.target.value); e.target.value = ""; } }}
          defaultValue=""
        >
          <option value="" disabled>Font</option>
          <option value="Inter, sans-serif">Inter</option>
          <option value="Arial, sans-serif">Arial</option>
          <option value="Helvetica, sans-serif">Helvetica</option>
          <option value="Georgia, serif">Georgia</option>
          <option value="'Times New Roman', serif">Times New Roman</option>
          <option value="'Courier New', monospace">Courier New</option>
          <option value="'Trebuchet MS', sans-serif">Trebuchet MS</option>
          <option value="Verdana, sans-serif">Verdana</option>
          <option value="'Comic Sans MS', cursive">Comic Sans MS</option>
        </select>

        <select
          className="h-8 text-sm bg-transparent border border-border rounded px-2 mr-1"
          title="Font size"
          onChange={(e) => {
            const px = e.target.value;
            if (!px) return;
            document.execCommand("fontSize", false, "7");
            const editor = editorRef.current;
            if (editor) {
              editor.querySelectorAll('font[size="7"]').forEach((el) => {
                const span = document.createElement("span");
                span.style.fontSize = `${px}px`;
                span.innerHTML = (el as HTMLElement).innerHTML;
                el.replaceWith(span);
              });
              onChange(editor.innerHTML);
            }
            e.target.value = "";
          }}
          defaultValue=""
        >
          <option value="" disabled>Size</option>
          <option value="12">12px</option>
          <option value="14">14px</option>
          <option value="16">16px</option>
          <option value="18">18px</option>
          <option value="20">20px</option>
          <option value="24">24px</option>
          <option value="28">28px</option>
          <option value="32">32px</option>
          <option value="40">40px</option>
          <option value="48">48px</option>
          <option value="64">64px</option>
        </select>

        <ToolbarBtn title="Bold" onClick={() => exec("bold")}><Bold className="h-4 w-4" /></ToolbarBtn>
        <ToolbarBtn title="Italic" onClick={() => exec("italic")}><Italic className="h-4 w-4" /></ToolbarBtn>
        <ToolbarBtn title="Underline" onClick={() => exec("underline")}><UnderlineIcon className="h-4 w-4" /></ToolbarBtn>
        <ToolbarBtn title="Strikethrough" onClick={() => exec("strikeThrough")}><Strikethrough className="h-4 w-4" /></ToolbarBtn>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <ToolbarBtn title="Heading 1" onClick={() => formatBlock("h1")}><Heading1 className="h-4 w-4" /></ToolbarBtn>
        <ToolbarBtn title="Heading 2" onClick={() => formatBlock("h2")}><Heading2 className="h-4 w-4" /></ToolbarBtn>
        <ToolbarBtn title="Heading 3" onClick={() => formatBlock("h3")}><Heading3 className="h-4 w-4" /></ToolbarBtn>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <ToolbarBtn title="Bulleted list" onClick={() => exec("insertUnorderedList")}><List className="h-4 w-4" /></ToolbarBtn>
        <ToolbarBtn title="Numbered list" onClick={() => exec("insertOrderedList")}><ListOrdered className="h-4 w-4" /></ToolbarBtn>
        <ToolbarBtn title="Quote" onClick={() => formatBlock("blockquote")}><Quote className="h-4 w-4" /></ToolbarBtn>
        <ToolbarBtn title="Code block" onClick={() => formatBlock("pre")}><Code className="h-4 w-4" /></ToolbarBtn>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <ToolbarBtn title="Align left" onClick={() => exec("justifyLeft")}><AlignLeft className="h-4 w-4" /></ToolbarBtn>
        <ToolbarBtn title="Align center" onClick={() => exec("justifyCenter")}><AlignCenter className="h-4 w-4" /></ToolbarBtn>
        <ToolbarBtn title="Align right" onClick={() => exec("justifyRight")}><AlignRight className="h-4 w-4" /></ToolbarBtn>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <ToolbarBtn title="Insert link" onClick={insertLink}><LinkIcon className="h-4 w-4" /></ToolbarBtn>
        <ToolbarBtn title="Embed PDF or Google Drive document" onClick={insertEmbed}><FileText className="h-4 w-4" /></ToolbarBtn>
        <ToolbarBtn title="Insert image by URL" onClick={insertImage}><ImageIcon className="h-4 w-4" /></ToolbarBtn>
        <ToolbarBtn
          title={uploading ? "Uploading…" : "Upload image from your device"}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className={cn("h-4 w-4", uploading && "animate-pulse")} />
        </ToolbarBtn>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onFileChosen}
        />

        <Separator orientation="vertical" className="mx-1 h-6" />

        <ToolbarBtn title="Undo" onClick={() => exec("undo")}><Undo className="h-4 w-4" /></ToolbarBtn>
        <ToolbarBtn title="Redo" onClick={() => exec("redo")}><Redo className="h-4 w-4" /></ToolbarBtn>
        <ToolbarBtn title="Clear formatting" onClick={() => exec("removeFormat")}><Eraser className="h-4 w-4" /></ToolbarBtn>

        <div className="ml-auto flex items-center gap-1 rounded border border-border bg-background p-0.5">
          <Button
            type="button" variant={mode === "rich" ? "secondary" : "ghost"} size="sm"
            className="h-7 px-2 text-xs" onClick={() => switchMode("rich")}
          >
            Rich
          </Button>
          <Button
            type="button" variant={mode === "html" ? "secondary" : "ghost"} size="sm"
            className="h-7 px-2 text-xs" onClick={() => switchMode("html")}
          >
            <Code2 className="h-3.5 w-3.5 mr-1" /> HTML
          </Button>
        </div>
      </div>

      {/* Surface */}
      {mode === "rich" ? (
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={() => { saveSelection(); handleInput(); }}
          onBlur={() => { saveSelection(); handleInput(); }}
          onKeyUp={saveSelection}
          onMouseUp={saveSelection}
          onPaste={(e) => {
            const file = Array.from(e.clipboardData?.files ?? []).find(f => f.type.startsWith("image/"));
            if (file) { e.preventDefault(); uploadAndInsertImage(file); }
          }}
          onDragOver={(e) => { if (e.dataTransfer?.types.includes("Files")) e.preventDefault(); }}
          onDrop={(e) => {
            const file = Array.from(e.dataTransfer?.files ?? []).find(f => f.type.startsWith("image/"));
            if (file) { e.preventDefault(); uploadAndInsertImage(file); }
          }}
          className="prose max-w-none p-4 focus:outline-none"
          style={{ minHeight }}
        />
      ) : (
        <textarea
          value={htmlDraft}
          onChange={(e) => { setHtmlDraft(e.target.value); onChange(e.target.value); }}
          className="w-full p-4 font-mono text-sm focus:outline-none resize-y"
          style={{ minHeight }}
        />
      )}
    </div>
  );
};

export default RichTextEditor;

// Re-export sanitizer for callers that need to render saved HTML safely.
export const sanitizeHtml = (html: string) =>
  DOMPurify.sanitize(html, { ADD_TAGS: ["iframe"], ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "scrolling", "target"] });
