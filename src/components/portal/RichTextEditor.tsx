import { useEffect, useRef, useState } from "react";
import DOMPurify from "dompurify";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading1, Heading2, Heading3, List, ListOrdered, Quote, Code,
  Link as LinkIcon, Image as ImageIcon, Upload, Undo, Redo,
  AlignLeft, AlignCenter, AlignRight, Eraser, Code2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
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

  const exec = (command: string, arg?: string) => {
    document.execCommand(command, false, arg);
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const formatBlock = (tag: string) => exec("formatBlock", tag);

  const insertLink = () => {
    const url = window.prompt("Enter URL", "https://");
    if (url) exec("createLink", url);
  };

  const insertImage = () => {
    const url = window.prompt("Image URL", "https://");
    if (url) exec("insertImage", url);
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
      const { error } = await supabase.storage.from("page-images").upload(path, file, {
        contentType: file.type, upsert: false,
      });
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
          onInput={handleInput}
          onBlur={handleInput}
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
