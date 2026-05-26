
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS start_at timestamptz,
  ADD COLUMN IF NOT EXISTS end_at timestamptz,
  ADD COLUMN IF NOT EXISTS time_zone text DEFAULT 'America/Los_Angeles',
  ADD COLUMN IF NOT EXISTS license text DEFAULT 'private',
  ADD COLUMN IF NOT EXISTS visibility text NOT NULL DEFAULT 'course',
  ADD COLUMN IF NOT EXISTS default_view text NOT NULL DEFAULT 'modules',
  ADD COLUMN IF NOT EXISTS nav_visibility jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS nav_order jsonb NOT NULL DEFAULT '[]'::jsonb;

CREATE TABLE IF NOT EXISTS public.course_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  name text NOT NULL,
  start_at timestamptz,
  end_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.course_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Instructors manage sections"
  ON public.course_sections FOR ALL TO authenticated
  USING (is_instructor_of(course_id) OR is_admin())
  WITH CHECK (is_instructor_of(course_id) OR is_admin());

CREATE POLICY "Enrolled view sections"
  ON public.course_sections FOR SELECT TO authenticated
  USING (is_admin() OR is_instructor_of(course_id) OR is_enrolled_in(course_id));

CREATE TRIGGER trg_course_sections_updated
  BEFORE UPDATE ON public.course_sections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.enrollments
  ADD COLUMN IF NOT EXISTS section_id uuid REFERENCES public.course_sections(id) ON DELETE SET NULL;
