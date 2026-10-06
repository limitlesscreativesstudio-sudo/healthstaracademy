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

export interface DayHours { theory: number; clinical: number }

/**
 * Per-day split of attended days, walked in date order. Each present day earns
 * 8 hours toward theory until the requirement is met; after that, present days
 * count as clinical.
 */
export function attendanceDayHours(
  records: { session_date?: string | null; status: string | null | undefined }[],
  theoryRequired: number = REQUIRED_THEORY_HOURS,
  clinicalRequired: number = REQUIRED_CLINICAL_HOURS,
): Record<string, DayHours> {
  const days = Array.from(new Set(records
    .filter(r => isAttended(r.status))
    .map(r => r.session_date ?? '')
    .filter(Boolean))).sort();
  const out: Record<string, DayHours> = {};
  let theory = 0, clinical = 0;
  for (const d of days) {
    const toTheory = Math.min(Math.max(0, theoryRequired - theory), THEORY_HOURS_PER_ATTENDED_DAY);
    theory += toTheory;
    const toClinical = Math.min(Math.max(0, clinicalRequired - clinical), THEORY_HOURS_PER_ATTENDED_DAY - toTheory);
    clinical += toClinical;
    out[d] = { theory: toTheory, clinical: toClinical };
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
  };
}

/** Hours never count past what the program requires. */
export const capTheory = (h: number, req: number = REQUIRED_THEORY_HOURS) => Math.min(h, req);
export const capClinical = (h: number, req: number = REQUIRED_CLINICAL_HOURS) => Math.min(h, req);

/**
 * Absent days classified by phase: an absence before theory hours are complete
 * (roughly the first 7–8 class days) is a missed theory day; after, a missed
 * clinical day.
 */
export function missedDays(
  records: { session_date?: string | null; status: string | null | undefined }[],
  theoryRequired: number = REQUIRED_THEORY_HOURS,
): { theory: number; clinical: number; theoryDates: string[]; clinicalDates: string[] } {
  const byDate = new Map<string, string | null | undefined>();
  records.forEach(r => { if (r.session_date) byDate.set(r.session_date, r.status); });
  const out = { theory: 0, clinical: 0, theoryDates: [] as string[], clinicalDates: [] as string[] };
  let theory = 0;
  for (const d of [...byDate.keys()].sort()) {
    const st = byDate.get(d);
    if (isAttended(st)) { theory = Math.min(theoryRequired, theory + THEORY_HOURS_PER_ATTENDED_DAY); continue; }
    if (attendanceCode(st) !== 'A') continue;
    if (theory < theoryRequired) { out.theory++; out.theoryDates.push(d); }
    else { out.clinical++; out.clinicalDates.push(d); }
  }
  return out;
}

/**
 * Calendar labels for session days: 8h per day in date order; days within the
 * 60 theory hours are class sessions, the day that crosses 60h is split
 * theory/clinical, and every later day is a clinical session.
 */
export function sessionLabels(dates: string[]): Record<string, { title: string; kind: 'theory' | 'mixed' | 'clinical' }> {
  const out: Record<string, { title: string; kind: 'theory' | 'mixed' | 'clinical' }> = {};
  let cum = 0;
  for (const d of [...new Set(dates)].sort()) {
    const before = cum; cum += 8;
    if (cum <= 60) out[d] = { title: 'Class Session', kind: 'theory' };
    else if (before < 60) out[d] = { title: `Theory ${60 - before}h + Clinical ${cum - 60}h`, kind: 'mixed' };
    else out[d] = { title: 'Clinical Session', kind: 'clinical' };
  }
  return out;
}
