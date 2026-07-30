import { useEffect, useRef, useState } from "react";
import { Check, Pencil, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  onSave: (next: string) => Promise<void> | void;
  className?: string;
  inputClassName?: string;
  disabled?: boolean;
  label?: string;
  as?: "span" | "div" | "h2" | "h3";
};

/** Click-to-edit title used across the portal tabs. */
export default function InlineTitle({
  value,
  onSave,
  className,
  inputClassName,
  disabled,
  label = "title",
  as: Tag = "span",
}: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => setDraft(value), [value]);
  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  const commit = async () => {
    const next = draft.trim();
    if (!next || next === value) {
      setDraft(value);
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      await onSave(next);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  if (disabled) return <Tag className={className}>{value}</Tag>;

  if (editing) {
    return (
      <span className="flex items-center gap-1 min-w-0 flex-1" onClick={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          value={draft}
          disabled={saving}
          aria-label={`Edit ${label}`}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); void commit(); }
            if (e.key === "Escape") { e.preventDefault(); setDraft(value); setEditing(false); }
          }}
          onBlur={() => void commit()}
          className={cn(
            "flex-1 min-w-0 rounded border border-input bg-background px-2 py-1 text-sm",
            inputClassName,
          )}
        />
        <button
          type="button"
          aria-label="Save title"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => void commit()}
          className="p-1 rounded hover:bg-muted text-muted-foreground"
        >
          <Check className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          aria-label="Cancel editing title"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => { setDraft(value); setEditing(false); }}
          className="p-1 rounded hover:bg-muted text-muted-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </span>
    );
  }

  return (
    <span className="group/title inline-flex items-center gap-1 min-w-0 max-w-full">
      <Tag className={cn("truncate", className)}>{value}</Tag>
      <button
        type="button"
        aria-label={`Rename ${label}`}
        title={`Rename ${label}`}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditing(true); }}
        className="p-1 rounded hover:bg-muted text-muted-foreground opacity-0 group-hover/title:opacity-100 focus:opacity-100 shrink-0"
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>
    </span>
  );
}
