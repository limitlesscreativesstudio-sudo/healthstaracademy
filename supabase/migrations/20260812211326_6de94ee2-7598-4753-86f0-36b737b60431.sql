ALTER TABLE public.enrollments DROP CONSTRAINT IF EXISTS enrollments_role_check;
ALTER TABLE public.enrollments ADD CONSTRAINT enrollments_role_check
  CHECK (role = ANY (ARRAY['student'::text,'ta'::text,'teacher'::text,'observer'::text,'designer'::text]));

CREATE OR REPLACE FUNCTION public.is_instructor_of(_course_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.courses WHERE id = _course_id AND instructor_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.enrollments
    WHERE course_id = _course_id AND user_id = auth.uid() AND role = 'teacher'
  )
$$;

DROP POLICY IF EXISTS "Courses viewable by enrolled, instructor, admin" ON public.courses;
CREATE POLICY "Courses viewable by enrolled, instructor, admin"
ON public.courses FOR SELECT
USING (
  public.is_admin()
  OR instructor_id = auth.uid()
  OR public.is_instructor_of(id)
  OR (status = 'published' AND public.is_enrolled_in(id))
);

DROP POLICY IF EXISTS "Instructors update own courses" ON public.courses;
CREATE POLICY "Instructors update own courses"
ON public.courses FOR UPDATE
USING (instructor_id = auth.uid() OR public.is_instructor_of(id) OR public.is_admin());