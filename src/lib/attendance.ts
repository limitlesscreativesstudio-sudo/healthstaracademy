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

export interface HoursSplit { theory: number; clinical: number; presentDays: number }

/**
 * Split attended class days into theory vs clinical hours.
 * Days are walked in date order; each present day earns 8 hours. Hours count
 * toward theory until the theory requirement is met; every hour after that
 * (including the overflow of the day that crosses the line) counts as clinical.
 */
export function splitAttendanceHours(
  records: { session_date?: string | null; status: string | null | undefined }[],
  theoryRequired: number = REQUIRED_THEORY_HOURS,
): HoursSplit {
  const days = records
    .filter(r => isAttended(r.status))
    .map(r => r.session_date ?? '')
    .sort();
  let theory = 0, clinical = 0;
  for (const _ of days) {
    const remaining = Math.max(0, theoryRequired - theory);
    const toTheory = Math.min(remaining, THEORY_HOURS_PER_ATTENDED_DAY);
    theory += toTheory;
    clinical += THEORY_HOURS_PER_ATTENDED_DAY - toTheory;
  }
  return { theory, clinical, presentDays: days.length };
}
