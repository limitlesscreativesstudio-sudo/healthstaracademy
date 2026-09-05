export type AttendanceCode = 'P' | 'A' | 'L' | 'E';

const ATTENDED = new Set(['p', 'present', 'l', 'late']);

export const isAttended = (status: string | null | undefined) =>
  ATTENDED.has((status ?? '').trim().toLowerCase());

export const attendanceCode = (status: string | null | undefined): AttendanceCode => {
  const value = (status ?? '').trim().toLowerCase();
  if (value === 'a' || value === 'absent') return 'A';
  if (value === 'l' || value === 'late') return 'L';
  if (value === 'e' || value === 'excused') return 'E';
  return 'P';
};