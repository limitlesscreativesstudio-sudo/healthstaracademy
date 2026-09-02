-- 1. Course-mate visibility helper
CREATE OR REPLACE FUNCTION public.shares_course_with(_other uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.enrollments a
    JOIN public.enrollments b ON b.course_id = a.course_id
    WHERE a.user_id = auth.uid() AND b.user_id = _other
  ) OR EXISTS (
    SELECT 1 FROM public.courses c
    JOIN public.enrollments e ON e.course_id = c.id
    WHERE (c.instructor_id = auth.uid() AND e.user_id = _other)
       OR (c.instructor_id = _other AND e.user_id = auth.uid())
  );
$$;

DROP POLICY IF EXISTS "Course mates view profiles" ON public.profiles;
CREATE POLICY "Course mates view profiles"
ON public.profiles FOR SELECT TO authenticated
USING (public.shares_course_with(user_id));

-- 2. Instructors are auto-attached to every course
CREATE OR REPLACE FUNCTION public.attach_instructors_to_course()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.enrollments (course_id, user_id, role)
  SELECT NEW.id, ur.user_id, 'teacher'
  FROM public.user_roles ur
  WHERE ur.role IN ('instructor','admin')
  ON CONFLICT (course_id, user_id) DO NOTHING;

  INSERT INTO public.enrollments (course_id, user_id, role)
  VALUES (NEW.id, NEW.instructor_id, 'teacher')
  ON CONFLICT (course_id, user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_attach_instructors ON public.courses;
CREATE TRIGGER trg_attach_instructors
AFTER INSERT ON public.courses
FOR EACH ROW EXECUTE FUNCTION public.attach_instructors_to_course();

CREATE OR REPLACE FUNCTION public.attach_instructor_to_all_courses()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role IN ('instructor','admin') THEN
    INSERT INTO public.enrollments (course_id, user_id, role)
    SELECT c.id, NEW.user_id, 'teacher'
    FROM public.courses c
    ON CONFLICT (course_id, user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_attach_instructor_all ON public.user_roles;
CREATE TRIGGER trg_attach_instructor_all
AFTER INSERT ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.attach_instructor_to_all_courses();

-- 3. Backfill: every current instructor/admin is a teacher on every course
INSERT INTO public.enrollments (course_id, user_id, role)
SELECT c.id, ur.user_id, 'teacher'
FROM public.courses c
CROSS JOIN (SELECT DISTINCT user_id FROM public.user_roles WHERE role IN ('instructor','admin')) ur
ON CONFLICT (course_id, user_id) DO NOTHING;