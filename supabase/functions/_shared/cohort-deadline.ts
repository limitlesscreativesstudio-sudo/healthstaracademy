// SINGLE SOURCE OF TRUTH for enrollment deadlines (backend mirror of
// src/data/cohortSchedule.ts). The cohort's stored `enrollment_deadline`
// always wins; the legacy "start minus 14 days" rule is a fallback only.
// Deadlines expire at 11:59 PM on the deadline date.

export const DEFAULT_APPLY_BY_OFFSET_DAYS = 14;
export const DEADLINE_TIME_LABEL = "11:59 PM";

export const addDays = (iso: string, n: number) => {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

/** Stored deadline wins; otherwise start - 14 days. */
export function resolveApplyByISO(startISO: string, storedDeadline?: string | null): string {
  return storedDeadline
    ? String(storedDeadline).slice(0, 10)
    : addDays(String(startISO).slice(0, 10), -DEFAULT_APPLY_BY_OFFSET_DAYS);
}

/** "August 23, 2026 at 11:59 PM" (weekday optional). */
export function formatDeadlineLabel(iso: string, withWeekday = true): string {
  const date = new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
    ...(withWeekday ? { weekday: "long" as const } : {}),
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  return `${date} at ${DEADLINE_TIME_LABEL}`;
}

export const daysBetween = (fromISO: string, toISO: string) =>
  Math.round(
    (new Date(toISO + "T00:00:00").getTime() - new Date(fromISO + "T00:00:00").getTime()) / 86400000,
  );
