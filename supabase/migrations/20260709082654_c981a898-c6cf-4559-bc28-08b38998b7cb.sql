
-- Dedupe any existing rows first (keep newest)
DELETE FROM public.grades g USING public.grades g2
WHERE g.assignment_id IS NOT NULL
  AND g.assignment_id = g2.assignment_id
  AND g.user_id = g2.user_id
  AND g.graded_at < g2.graded_at;

ALTER TABLE public.grades
  ADD CONSTRAINT grades_assignment_user_key UNIQUE (assignment_id, user_id);
