import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useUnsavedGuard } from "@/hooks/useUnsavedGuard";

const DRAFT_KEY = "test:guard:1";

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
});

describe("useUnsavedGuard", () => {
  it("starts clean and becomes dirty when values diverge from initial", () => {
    const initial = { title: "a", body: "" };
    const { result, rerender } = renderHook(
      ({ values }) => useUnsavedGuard(DRAFT_KEY, values, initial),
      { initialProps: { values: { title: "a", body: "" } } },
    );
    expect(result.current.dirty).toBe(false);
    rerender({ values: { title: "b", body: "" } });
    expect(result.current.dirty).toBe(true);
  });

  it("writes a debounced localStorage draft while dirty and clears it on markSaved", () => {
    const initial = { title: "a", body: "" };
    const { result, rerender } = renderHook(
      ({ values }) => useUnsavedGuard(DRAFT_KEY, values, initial),
      { initialProps: { values: { title: "a", body: "" } } },
    );

    rerender({ values: { title: "b", body: "" } });
    expect(localStorage.getItem(DRAFT_KEY)).toBeNull();

    act(() => { vi.advanceTimersByTime(700); });
    expect(JSON.parse(localStorage.getItem(DRAFT_KEY) || "{}")).toEqual({ title: "b", body: "" });

    act(() => { result.current.markSaved({ title: "b", body: "" }); });
    expect(localStorage.getItem(DRAFT_KEY)).toBeNull();
    expect(result.current.dirty).toBe(false);
    expect(result.current.savedAt).not.toBeNull();
  });

  it("loadDraft restores values that were persisted", () => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ title: "from-disk", body: "x" }));
    const { result } = renderHook(() =>
      useUnsavedGuard(DRAFT_KEY, { title: "a", body: "" }, { title: "a", body: "" }),
    );
    const draft = result.current.loadDraft();
    expect(draft).toEqual({ title: "from-disk", body: "x" });
    act(() => { result.current.clearDraft(); });
    expect(localStorage.getItem(DRAFT_KEY)).toBeNull();
  });

  it("adds a beforeunload listener while dirty and removes it after save", () => {
    const initial = { title: "a", body: "" };
    const addSpy = vi.spyOn(window, "addEventListener");
    const removeSpy = vi.spyOn(window, "removeEventListener");

    const { rerender, result } = renderHook(
      ({ values }) => useUnsavedGuard(DRAFT_KEY, values, initial),
      { initialProps: { values: { title: "a", body: "" } } },
    );

    expect(addSpy.mock.calls.some(([t]) => t === "beforeunload")).toBe(false);

    rerender({ values: { title: "b", body: "" } });
    expect(addSpy.mock.calls.some(([t]) => t === "beforeunload")).toBe(true);

    act(() => { result.current.markSaved({ title: "b", body: "" }); });
    rerender({ values: { title: "b", body: "" } });
    expect(removeSpy.mock.calls.some(([t]) => t === "beforeunload")).toBe(true);
  });

  it("confirmDiscard returns true when clean and respects the user's choice when dirty", () => {
    const initial = { title: "a", body: "" };
    const { result, rerender } = renderHook(
      ({ values }) => useUnsavedGuard(DRAFT_KEY, values, initial),
      { initialProps: { values: { title: "a", body: "" } } },
    );

    expect(result.current.confirmDiscard()).toBe(true);

    rerender({ values: { title: "b", body: "" } });
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);
    expect(result.current.confirmDiscard()).toBe(false);
    confirmSpy.mockReturnValue(true);
    expect(result.current.confirmDiscard()).toBe(true);
    confirmSpy.mockRestore();
  });

  it("does not persist a draft when draftKey is null", () => {
    const { rerender } = renderHook(
      ({ values }) => useUnsavedGuard(null, values, { title: "a" }),
      { initialProps: { values: { title: "a" } } },
    );
    rerender({ values: { title: "b" } });
    act(() => { vi.advanceTimersByTime(1000); });
    expect(localStorage.length).toBe(0);
  });
});
