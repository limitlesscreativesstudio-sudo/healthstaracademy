import { useEffect, useState } from "react";
import { History, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props<T> = {
  /** A draft loader from useUnsavedGuard.loadDraft */
  loadDraft: () => T | null;
  clearDraft: () => void;
  /** Decide whether the loaded draft is actually different from current values. */
  isDifferent: (draft: T) => boolean;
  /** Applied when the user clicks Restore. */
  onRestore: (draft: T) => void;
  label?: string;
};

/**
 * Non-blocking banner that appears at the top of an editor when a
 * localStorage draft from a previous session is detected. Replaces the
 * old window.confirm() prompt with a one-click restore / discard UI.
 */
const DraftRestoreBanner = <T,>({
  loadDraft, clearDraft, isDifferent, onRestore,
  label = "We saved a draft of this editor from your last session.",
}: Props<T>) => {
  const [draft, setDraft] = useState<T | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const found = loadDraft();
    if (found && isDifferent(found)) setDraft(found);
    // run once on mount — loader is stable from the hook
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!draft || dismissed) return null;

  return (
    <div
      role="region"
      aria-label="Draft available"
      className="mb-3 flex items-center justify-between gap-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200"
    >
      <div className="flex items-center gap-2 min-w-0">
        <History className="h-4 w-4 shrink-0" />
        <span className="truncate">{label}</span>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <Button
          size="sm"
          variant="default"
          onClick={() => { onRestore(draft); setDraft(null); }}
        >
          Restore draft
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => { clearDraft(); setDismissed(true); }}
        >
          Discard
        </Button>
        <Button
          size="sm"
          variant="ghost"
          aria-label="Close"
          onClick={() => setDismissed(true)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default DraftRestoreBanner;
