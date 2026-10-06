export type AttendanceCode = 'P' | 'A' | 'L' | 'E';

const ATTENDED = new Set(['p', 'present', 'l', 'late']);

// Day-track theory sessions run 6:00 AM–3:00 PM with one non-instructional
// hour, so each attended class day earns 8 theory hours.
export const THEORY_HOURS_PER_ATTENDED_DAY = 8;

export const isAttended = (status: string | null | undefined) =>
  ATTENDED.has((status ?? '').trim().toLowerCase());

export const attendanceCode = (status: string | null | undefined): AttendanceCode => {
  const value = (status ?? '').trim().toLowerCase();
  if (value === 'a' || value === 'absent') return 'A';
  if (value === 'l' || value === 'late') return 'L';
  if (value === 'e' || value === 'excused') return 'E';
  return 'P';
};
// CDPH CNA requirements: 60 theory hours, then 100 clinical hours.
export const REQUIRED_THEORY_HOURS = 60;
export const REQUIRED_CLINICAL_HOURS = 100;

export interface HoursSplit { theory: number; clinical: number; presentDays: number; makeupDays: number }

/** Fridays (by calendar date) are make-up days once clinical starts. */
export const isFriday = (isoDate: string) =>
  !!isoDate && new Date(`${isoDate.slice(0, 10)}T12:00:00Z`).getUTCDay() === 5;

export interface DayHours { theory: number; clinical: number; makeup: boolean }

/**
 * Per-day split of attended days, walked in date order. Each present day earns
 * 8 hours toward theory until the requirement is met; after that, present days
 * count as clinical — except Fridays, which are make-up days and earn no
 * clinical hours.
 */
export function attendanceDayHours(
  records: { session_date?: string | null; status: string | null | undefined }[],
  theoryRequired: number = REQUIRED_THEORY_HOURS,
): Record<string, DayHours> {
  const days = Array.from(new Set(records
    .filter(r => isAttended(r.status))
    .map(r => r.session_date ?? '')
    .filter(Boolean))).sort();
  const out: Record<string, DayHours> = {};
  let theory = 0;
  for (const d of days) {
    const toTheory = Math.min(Math.max(0, theoryRequired - theory), THEORY_HOURS_PER_ATTENDED_DAY);
    theory += toTheory;
    const overflow = THEORY_HOURS_PER_ATTENDED_DAY - toTheory;
    const makeup = overflow > 0 && isFriday(d);
    out[d] = { theory: toTheory, clinical: makeup ? 0 : overflow, makeup };
  }
  return out;
}

export function splitAttendanceHours(
  records: { session_date?: string | null; status: string | null | undefined }[],
  theoryRequired: number = REQUIRED_THEORY_HOURS,
): HoursSplit {
  const map = attendanceDayHours(records, theoryRequired);
  const v = Object.values(map);
  return {
    theory: v.reduce((n, x) => n + x.theory, 0),
    clinical: v.reduce((n, x) => n + x.clinical, 0),
    presentDays: v.length,
    makeupDays: v.filter(x => x.makeup).length,
  };
}
