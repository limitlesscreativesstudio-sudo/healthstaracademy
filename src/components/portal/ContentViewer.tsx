/**
 * Universal ContentViewer — renders any LMS asset inline:
 *   - PDF                → native <iframe>
 *   - PPTX/PPT/DOCX/DOC/XLSX/XLS → Microsoft Office Online embed
 *   - MP4/MOV/WEBM       → <video>
 *   - MP3/WAV/M4A        → <audio>
 *   - Images             → <img> with zoom
 *   - YouTube / Vimeo    → embedded iframe
 *   - Everything else    → download card
 *
 * Accepts either a direct URL or a { bucket, path } pair — in the second case
 * a fresh signed URL is generated on open (needed because our storage buckets
 * are private, and Office Online must be able to fetch the file).
 */
import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { X, Download, ExternalLink, Loader2, AlertCircle } from "lucide-react";

export type ContentSource =
  | { url: string; bucket?: never; path?: never }
  | { bucket: string; path: string; url?: never };

interface Props {
  open: boolean;
  onClose: () => void;
  source: ContentSource | null;
  fileName?: string;
  fileType?: string; // extension (pdf, pptx…) or mime — best-effort
  title?: string;
}

type Kind = "pdf" | "office" | "video" | "audio" | "image" | "youtube" | "vimeo" | "html" | "other";

const extOf = (s: string) => (s.split(/[?#]/)[0].split(".").pop() ?? "").toLowerCase();

const detectKind = (url: string, fileName?: string, fileType?: string): Kind => {
  const ft = (fileType ?? "").toLowerCase();
  const ext = extOf(fileName || url);
  if (/youtu\.?be/.test(url)) return "youtube";
  if (/vimeo\.com/.test(url)) return "vimeo";
  if (ext === "pdf" || ft.includes("pdf")) return "pdf";
  if (["pptx", "ppt", "docx", "doc", "xlsx", "xls"].includes(ext)) return "office";
  if (["mp4", "mov", "webm", "m4v", "ogg"].includes(ext) || ft.startsWith("video/")) return "video";
  if (["mp3", "wav", "m4a", "aac", "flac"].includes(ext) || ft.startsWith("audio/")) return "audio";
  if (["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"].includes(ext) || ft.startsWith("image/")) return "image";
  if (["html", "htm"].includes(ext)) return "html";
  return "other";
};

const youtubeEmbed = (url: string) => {
  const m = url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : url;
};
const vimeoEmbed = (url: string) => {
  const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return m ? `https://player.vimeo.com/video/${m[1]}` : url;
};
const officeEmbed = (url: string) =>
  `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;

const ContentViewer: React.FC<Props> = ({ open, onClose, source, fileName, fileType, title }) => {
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [officeFailed, setOfficeFailed] = useState(false);

  useEffect(() => {
    if (!open || !source) return;
    setErr(null);
    setOfficeFailed(false);
    if ("url" in source && source.url) {
      setResolvedUrl(source.url);
      return;
    }
    if ("bucket" in source && source.bucket && source.path) {
      setLoading(true);
      supabase.storage
        .from(source.bucket)
        .createSignedUrl(source.path, 60 * 60 * 6) // 6h — enough for a viewing session
        .then(({ data, error }) => {
          if (error || !data?.signedUrl) {
            setErr(error?.message ?? "Could not generate viewing link");
            setResolvedUrl(null);
          } else {
            setResolvedUrl(data.signedUrl);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [open, source]);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);

  const kind = useMemo(
    () => (resolvedUrl ? detectKind(resolvedUrl, fileName, fileType) : "other"),
    [resolvedUrl, fileName, fileType],
  );

  if (!open) return null;

  const displayName = title || fileName || "Preview";

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] bg-black/80 flex flex-col animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-label={displayName}
    >
      {/* Header */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex items-center gap-3 px-4 py-3 bg-neutral-900 text-white border-b border-white/10"
      >
        <div className="flex-1 min-w-0">
          <div className="truncate font-medium">{displayName}</div>
          {fileName && title && (
            <div className="truncate text-xs text-white/60">{fileName}</div>
          )}
        </div>
        {resolvedUrl && (
          <>
            <a
              href={resolvedUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 transition"
            >
              <ExternalLink className="h-4 w-4" /> Open
            </a>
            <a
              href={resolvedUrl}
              download={fileName}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 transition"
            >
              <Download className="h-4 w-4" /> Download
            </a>
          </>
        )}
        <button
          onClick={onClose}
          aria-label="Close"
          className="p-1.5 rounded-md hover:bg-white/10 transition"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Body */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex-1 bg-neutral-950 overflow-auto flex items-stretch justify-center"
      >
        {loading && (
          <div className="flex flex-col items-center justify-center gap-2 text-white/70 m-auto">
            <Loader2 className="h-6 w-6 animate-spin" />
            <div className="text-sm">Preparing preview…</div>
          </div>
        )}

        {!loading && err && (
          <div className="m-auto max-w-md text-center text-white p-6 rounded-lg bg-neutral-900 border border-white/10">
            <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-3" />
            <div className="font-semibold mb-1">Couldn't load this file</div>
            <div className="text-sm text-white/70">{err}</div>
          </div>
        )}

        {!loading && resolvedUrl && !err && (
          <>
            {kind === "pdf" && (
              <iframe
                src={resolvedUrl}
                className="w-full h-full border-0 bg-white"
                title={displayName}
              />
            )}

            {kind === "office" && !officeFailed && (
              <iframe
                src={officeEmbed(resolvedUrl)}
                className="w-full h-full border-0 bg-white"
                title={displayName}
                onError={() => setOfficeFailed(true)}
              />
            )}

            {kind === "office" && officeFailed && (
              <FallbackDownload url={resolvedUrl} fileName={fileName} />
            )}

            {kind === "video" && (
              <video
                src={resolvedUrl}
                controls
                autoPlay
                className="max-w-full max-h-full m-auto bg-black"
              />
            )}

            {kind === "audio" && (
              <div className="m-auto p-8 bg-neutral-900 rounded-lg">
                <audio src={resolvedUrl} controls autoPlay className="min-w-[320px]" />
              </div>
            )}

            {kind === "image" && (
              <img
                src={resolvedUrl}
                alt={displayName}
                className="max-w-full max-h-full m-auto object-contain"
              />
            )}

            {kind === "youtube" && (
              <iframe
                src={youtubeEmbed(resolvedUrl)}
                className="w-full h-full border-0"
                title={displayName}
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            )}

            {kind === "vimeo" && (
              <iframe
                src={vimeoEmbed(resolvedUrl)}
                className="w-full h-full border-0"
                title={displayName}
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            )}

            {kind === "html" && (
              <iframe src={resolvedUrl} className="w-full h-full border-0 bg-white" title={displayName} />
            )}

            {kind === "other" && <FallbackDownload url={resolvedUrl} fileName={fileName} />}
          </>
        )}
      </div>

      {kind === "office" && !officeFailed && !loading && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-neutral-900 text-white/60 text-xs px-4 py-2 border-t border-white/10 text-center"
        >
          Rendered by Microsoft Office Online. If the preview doesn't load,{" "}
          <button onClick={() => setOfficeFailed(true)} className="underline hover:text-white">
            switch to download
          </button>
          .
        </div>
      )}
    </div>
  );
};

const FallbackDownload: React.FC<{ url: string; fileName?: string }> = ({ url, fileName }) => (
  <div className="m-auto max-w-md text-center text-white p-8 rounded-lg bg-neutral-900 border border-white/10">
    <Download className="h-10 w-10 text-white/60 mx-auto mb-3" />
    <div className="font-semibold mb-1">Preview not available</div>
    <div className="text-sm text-white/70 mb-4">
      This file type can't be shown inline. Download it to view.
    </div>
    <Button asChild>
      <a href={url} download={fileName} target="_blank" rel="noreferrer">
        <Download className="h-4 w-4 mr-2" /> Download {fileName ?? "file"}
      </a>
    </Button>
  </div>
);

export default ContentViewer;
