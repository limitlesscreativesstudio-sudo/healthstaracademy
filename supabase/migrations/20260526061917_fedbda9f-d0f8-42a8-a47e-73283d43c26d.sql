-- Add evidence fields to skill signoffs
ALTER TABLE public.student_skill_signoffs
  ADD COLUMN IF NOT EXISTS photo_url text,
  ADD COLUMN IF NOT EXISTS video_url text,
  ADD COLUMN IF NOT EXISTS evaluator_signature text,
  ADD COLUMN IF NOT EXISTS evaluator_name text;

-- Clinical attendance (clock-in / clock-out)
CREATE TABLE IF NOT EXISTS public.clinical_attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_user_id uuid NOT NULL,
  course_id uuid NOT NULL,
  clinical_site text NOT NULL,
  shift_date date NOT NULL DEFAULT (now() AT TIME ZONE 'America/Los_Angeles')::date,
  clock_in_at timestamptz,
  clock_out_at timestamptz,
  clock_in_lat numeric,
  clock_in_lng numeric,
  clock_out_lat numeric,
  clock_out_lng numeric,
  hours_worked numeric,
  verified boolean NOT NULL DEFAULT false,
  verified_by uuid,
  verified_at timestamptz,
  notes text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.clinical_attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students view own attendance"
  ON public.clinical_attendance FOR SELECT TO authenticated
  USING (student_user_id = auth.uid() OR is_instructor_of(course_id) OR is_admin());

CREATE POLICY "Students clock in own"
  ON public.clinical_attendance FOR INSERT TO authenticated
  WITH CHECK (student_user_id = auth.uid() AND is_enrolled_in(course_id));

CREATE POLICY "Students update own unverified attendance"
  ON public.clinical_attendance FOR UPDATE TO authenticated
  USING (student_user_id = auth.uid() AND verified = false)
  WITH CHECK (student_user_id = auth.uid() AND verified = false);

CREATE POLICY "Instructors manage attendance"
  ON public.clinical_attendance FOR ALL TO authenticated
  USING (is_instructor_of(course_id) OR is_admin())
  WITH CHECK (is_instructor_of(course_id) OR is_admin());

CREATE TRIGGER update_clinical_attendance_updated_at
  BEFORE UPDATE ON public.clinical_attendance
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_attendance_student ON public.clinical_attendance(student_user_id, shift_date);
CREATE INDEX IF NOT EXISTS idx_attendance_course ON public.clinical_attendance(course_id, shift_date);

-- Storage bucket for skill evidence
INSERT INTO storage.buckets (id, name, public)
VALUES ('skill-evidence', 'skill-evidence', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Students upload own skill evidence"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'skill-evidence' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Students view own skill evidence"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'skill-evidence' AND (auth.uid()::text = (storage.foldername(name))[1] OR is_admin() OR has_role(auth.uid(), 'instructor'::app_role)));

CREATE POLICY "Instructors update skill evidence"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'skill-evidence' AND (is_admin() OR has_role(auth.uid(), 'instructor'::app_role)));