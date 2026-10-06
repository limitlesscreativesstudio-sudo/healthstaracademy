// Exams (Midterm / Final) only count toward course point totals once published.
export const isExamTitle = (title?: string | null) =>
  /\b(midterm|final)\b|\bexam\b/i.test(String(title ?? ''));

export const quizCountsTowardTotal = (q: { title?: string | null; published?: boolean | null }) =>
  !isExamTitle(q.title) || q.published === true;
