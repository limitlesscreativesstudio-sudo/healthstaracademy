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

export interface DayHours { theory: number; clinical: number; kind?: 'theory' | 'makeup' | 'clinical' | 'friday'; day?: number }

// Approved shortened clinical sessions that are exceptions to the normal
// post-theory Friday exclusion. Keep these explicit so historical hours remain
// reproducible across calendars, progress, certificates, and grade reporting.
const CLINICAL_HOUR_EXCEPTIONS: Record<string, number> = {
  '2026-09-11': 4,
};

// Day-track schedule from the Modules layout: Days 1–8 are theory
// (Day 1 = 7h, Days 2–7 = 8h, Day 8 = 5h → 60h). Day 9 is a theory make-up
// day (0h unless theory hours are still owed). Day 10 onward is clinical at
// 8h/day (Day 22 tops out at the 100h requirement). No Friday sessions once
// clinical starts.
export const THEORY_DAY_HOURS = [7, 8, 8, 8, 8, 8, 8, 5];

/**
 * Per-day split of attended days, walked in date order following the
 * schedule above.
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
  let theory = 0, clinical = 0, idx = 0, n = 0;
  let makeupPending = false;
  for (const d of days) {
    const isFri = new Date(d + 'T12:00:00').getDay() === 5;
    if (theory < theoryRequired) {
      const h = Math.min(THEORY_DAY_HOURS[idx] ?? THEORY_HOURS_PER_ATTENDED_DAY, theoryRequired - theory);
      const viaMakeup = idx >= THEORY_DAY_HOURS.length;
      idx++; theory += h; n++;
      out[d] = { theory: h, clinical: 0, kind: viaMakeup ? 'makeup' : 'theory', day: n };
      if (theory >= theoryRequired && !viaMakeup) makeupPending = true;
      continue;
    }
    if (makeupPending) { makeupPending = false; n++; out[d] = { theory: 0, clinical: 0, kind: 'makeup', day: n }; continue; }
    const exceptionalClinicalHours = CLINICAL_HOUR_EXCEPTIONS[d];
    if (exceptionalClinicalHours !== undefined) {
      const c = Math.min(exceptionalClinicalHours, Math.max(0, clinicalRequired - clinical));
      clinical += c; n++;
      out[d] = { theory: 0, clinical: c, kind: 'clinical', day: n };
      continue;
    }
    if (isFri) { out[d] = { theory: 0, clinical: 0, kind: 'friday' }; continue; }
    const c = Math.min(THEORY_HOURS_PER_ATTENDED_DAY, Math.max(0, clinicalRequired - clinical));
    clinical += c; n++;
    out[d] = { theory: 0, clinical: c, kind: 'clinical', day: n };
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
    presentDays: v.filter(x => x.kind !== 'friday').length,
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

/** Calendar labels for session days, following attendanceDayHours. */
export function sessionLabels(dates: string[]): Record<string, { title: string; kind: 'theory' | 'mixed' | 'clinical' | 'makeup' }> {
  const map = attendanceDayHours(dates.map(session_date => ({ session_date, status: 'P' })));
  const out: Record<string, { title: string; kind: 'theory' | 'mixed' | 'clinical' | 'makeup' }> = {};
  for (const [d, h] of Object.entries(map)) {
    if (h.kind === 'friday') continue;
    const p = h.day ? `Day ${h.day} · ` : '';
    if (h.kind === 'makeup') out[d] = { title: `${p}Theory Make-Up Day`, kind: 'makeup' };
    else if (h.kind === 'theory') out[d] = { title: `${p}Theory ${h.theory}h`, kind: 'theory' };
    else out[d] = { title: `${p}Clinical ${h.clinical}h`, kind: 'clinical' };
  }
  return out;
}
