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