import { useEffect, useRef, useState, useCallback } from "react";

/**
 * Protects in-progress work in LMS editors:
 *  - Tracks dirty state vs the initial snapshot
 *  - Persists a localStorage draft while dirty so a refresh / crash doesn't lose work
 *  - Warns on browser navigation (beforeunload) while dirty
 *  - Exposes confirmDiscard() for Cancel / dialog-close handlers
 *
 * `values` should be a stable-shaped object (e.g. { title, body }). It's compared
 * via JSON.stringify against the initial snapshot.
 */
export function useUnsavedGuard<T extends Record<string, unknown>>(
  draftKey: string | null,
  values: T,
  initial: T,
) {
  const initialRef = useRef<string>(JSON.stringify(initial));
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const current = JSON.stringify(values);
  const dirty = current !== initialRef.current;

  // Reset the baseline (call this after a successful save with the just-saved values).
  const markSaved = useCallback((next?: T) => {
    initialRef.current = JSON.stringify(next ?? values);
    setSavedAt(Date.now());
    if (draftKey) {
      try { localStorage.removeItem(draftKey); } catch { /* ignore */ }
    }
  }, [values, draftKey]);

  // Autosave a local draft while dirty (debounced).
  useEffect(() => {
    if (!draftKey) return;
    if (!dirty) return;
    const t = setTimeout(() => {
      try { localStorage.setItem(draftKey, current); } catch { /* quota etc. */ }
    }, 600);
    return () => clearTimeout(t);
  }, [current, dirty, draftKey]);

  // Warn before the tab/window closes while dirty.
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const confirmDiscard = useCallback(() => {
    if (!dirty) return true;
    return window.confirm("You have unsaved changes. Discard them?");
  }, [dirty]);

  const loadDraft = useCallback((): T | null => {
    if (!draftKey) return null;
    try {
      const raw = localStorage.getItem(draftKey);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch { return null; }
  }, [draftKey]);

  const clearDraft = useCallback(() => {
    if (!draftKey) return;
    try { localStorage.removeItem(draftKey); } catch { /* ignore */ }
  }, [draftKey]);

  return { dirty, savedAt, markSaved, confirmDiscard, loadDraft, clearDraft };
}
