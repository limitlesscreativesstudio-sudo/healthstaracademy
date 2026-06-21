CREATE TABLE IF NOT EXISTS public.attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  student_id uuid NOT NULL,
  session_date date NOT NULL,
  status text NOT NULL CHECK (status IN ('P','A','L','E')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT attendance_course_student_date_unique UNIQUE (course_id, student_id, session_date)
);

CREATE INDEX IF NOT EXISTS idx_attendance_course_date ON public.attendance(course_id, session_date);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON public.attendance(student_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.attendance TO authenticated;
GRANT ALL ON public.attendance TO service_role;

ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Admins manage all attendance" ON public.attendance FOR ALL TO authenticated
    USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Instructors manage attendance for their courses" ON public.attendance FOR ALL TO authenticated
    USING (public.is_instructor_of(course_id)) WITH CHECK (public.is_instructor_of(course_id));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Students view their own attendance" ON public.attendance FOR SELECT TO authenticated
    USING (student_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DROP TRIGGER IF EXISTS update_attendance_updated_at ON public.attendance;
CREATE TRIGGER update_attendance_updated_at
BEFORE UPDATE ON public.attendance
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();