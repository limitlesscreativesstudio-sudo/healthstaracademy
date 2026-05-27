import { Check, CircleDot, Loader2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  dirty: boolean;
  saving?: boolean;
  savedAt?: number | null;
  className?: string;
  /** Optional explicit error message — overrides other states. */
  error?: string | null;
};

/**
 * Compact status pill shown in every LMS editor header so authors always
 * know whether their work is saved, unsaved, or actively saving.
 */
const SaveStatus = ({ dirty, saving, savedAt, error, className }: Props) => {
  let Icon = Check;
  let label = "All changes saved";
  let tone = "text-muted-foreground bg-muted/40 border-border";

  if (error) {
    Icon = AlertTriangle;
    label = error;
    tone = "text-destructive bg-destructive/10 border-destructive/30";
  } else if (saving) {
    Icon = Loader2;
    label = "Saving…";
    tone = "text-muted-foreground bg-muted/40 border-border";
  } else if (dirty) {
    Icon = CircleDot;
    label = "Unsaved changes";
    tone = "text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-950/40 dark:border-amber-900";
  } else if (savedAt) {
    Icon = Check;
    label = `Saved ${new Date(savedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
    tone = "text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-900";
  }

  return (
    <span
      role="status"
      aria-live="polite"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap",
        tone,
        className,
      )}
    >
      <Icon className={cn("h-3.5 w-3.5", saving && "animate-spin")} />
      {label}
    </span>
  );
};

export default SaveStatus;
