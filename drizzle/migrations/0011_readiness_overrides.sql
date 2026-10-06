CREATE TABLE public.readiness_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL,
  student_user_id uuid NOT NULL,
  criterion text NOT NULL,
  met boolean NOT NULL,
  set_by uuid DEFAULT auth.uid(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (course_id, student_user_id, criterion)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.readiness_overrides TO authenticated;
GRANT ALL ON public.readiness_overrides TO service_role;
ALTER TABLE public.readiness_overrides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Instructors manage readiness overrides" ON public.readiness_overrides
  FOR ALL TO authenticated
  USING (public.is_instructor_of(course_id) OR public.is_admin())
  WITH CHECK (public.is_instructor_of(course_id) OR public.is_admin());