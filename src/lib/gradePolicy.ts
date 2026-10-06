// Exams (Midterm / Final) only count toward course point totals once published.
// Titles vary ("Midterm Examination", "Mid-term Exam (Exam 1)", "Final Exam (50
// Questions)", "... (previous version — graded)"), so matching is fuzzy and only
// ONE published exam per family (midterm / final) counts.
export const examFamily = (title?: string | null): 'midterm' | 'final' | 'exam' | null => {
  const t = String(title ?? '').toLowerCase();
  if (/\bmid[\s\-–—]?term\b|\bexam\s*1\b/.test(t)) return 'midterm';
  if (/\bfinal\b|\bexam\s*2\b/.test(t)) return 'final';
  if (/\bexam(ination)?\b/.test(t)) return 'exam';
  return null;
};

export const isExamTitle = (title?: string | null) => examFamily(title) !== null;

export const quizCountsTowardTotal = (q: { title?: string | null; published?: boolean | null }) =>
  !isExamTitle(q.title) || q.published === true;

/** Filters a course's quizzes to those that count; dedupes similar-titled published exams. */
export function countableQuizzes<T extends { title?: string | null; published?: boolean | null; total_points?: number | null }>(list: T[]): T[] {
  const best = new Map<string, T>();
  const out: T[] = [];
  for (const q of list) {
    const fam = examFamily(q.title);
    if (!fam) { out.push(q); continue; }
    if (q.published !== true) continue;
    const cur = best.get(fam);
    const isPrev = (x: T) => /previous version/i.test(String(x.title ?? ''));
    // Prefer the current (non-"previous version") exam, then the larger one.
    if (!cur || (isPrev(cur) && !isPrev(q)) || (isPrev(cur) === isPrev(q) && Number(q.total_points ?? 0) > Number(cur.total_points ?? 0))) best.set(fam, q);
  }
  return [...out, ...best.values()];
}
