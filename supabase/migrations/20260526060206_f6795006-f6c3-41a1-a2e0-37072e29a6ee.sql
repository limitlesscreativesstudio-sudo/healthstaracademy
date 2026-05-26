
ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS portal_user_id uuid,
  ADD COLUMN IF NOT EXISTS provisioned_at timestamptz;

ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS cohort_id uuid;

CREATE INDEX IF NOT EXISTS idx_courses_cohort_id ON public.courses(cohort_id);
CREATE INDEX IF NOT EXISTS idx_students_portal_user_id ON public.students(portal_user_id);
