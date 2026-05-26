-- 1. Master skill catalog
CREATE TABLE public.cna_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  cdph_module text,
  required_for_certification boolean NOT NULL DEFAULT true,
  position integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.cna_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone signed in can view active skills"
  ON public.cna_skills FOR SELECT TO authenticated
  USING (active OR public.is_admin() OR public.has_role(auth.uid(), 'instructor'));

CREATE POLICY "Admins and instructors manage skills"
  ON public.cna_skills FOR ALL TO authenticated
  USING (public.is_admin() OR public.has_role(auth.uid(), 'instructor'))
  WITH CHECK (public.is_admin() OR public.has_role(auth.uid(), 'instructor'));

CREATE TRIGGER trg_cna_skills_updated BEFORE UPDATE ON public.cna_skills
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Per-student skill sign-offs
CREATE TABLE public.student_skill_signoffs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_user_id uuid NOT NULL,
  course_id uuid NOT NULL,
  skill_id uuid NOT NULL REFERENCES public.cna_skills(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'not_started',
  clinical_site text,
  attempts integer NOT NULL DEFAULT 0,
  signed_off_by uuid,
  signed_off_at timestamptz,
  notes text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_user_id, skill_id, course_id)
);
ALTER TABLE public.student_skill_signoffs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students view own signoffs"
  ON public.student_skill_signoffs FOR SELECT TO authenticated
  USING (student_user_id = auth.uid() OR public.is_instructor_of(course_id) OR public.is_admin());

CREATE POLICY "Instructors manage signoffs"
  ON public.student_skill_signoffs FOR ALL TO authenticated
  USING (public.is_instructor_of(course_id) OR public.is_admin())
  WITH CHECK (public.is_instructor_of(course_id) OR public.is_admin());

CREATE TRIGGER trg_signoffs_updated BEFORE UPDATE ON public.student_skill_signoffs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_signoffs_student ON public.student_skill_signoffs(student_user_id, course_id);
CREATE INDEX idx_signoffs_course ON public.student_skill_signoffs(course_id, status);

-- 3. Clinical hours log
CREATE TABLE public.clinical_hours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_user_id uuid NOT NULL,
  course_id uuid NOT NULL,
  shift_date date NOT NULL,
  clinical_site text NOT NULL,
  hours numeric(5,2) NOT NULL,
  supervisor_name text DEFAULT '',
  activity_summary text DEFAULT '',
  verified boolean NOT NULL DEFAULT false,
  verified_by uuid,
  verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.clinical_hours ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students view own clinical hours"
  ON public.clinical_hours FOR SELECT TO authenticated
  USING (student_user_id = auth.uid() OR public.is_instructor_of(course_id) OR public.is_admin());

CREATE POLICY "Students log own hours"
  ON public.clinical_hours FOR INSERT TO authenticated
  WITH CHECK (student_user_id = auth.uid() AND public.is_enrolled_in(course_id));

CREATE POLICY "Students update own unverified hours"
  ON public.clinical_hours FOR UPDATE TO authenticated
  USING (student_user_id = auth.uid() AND verified = false)
  WITH CHECK (student_user_id = auth.uid() AND verified = false);

CREATE POLICY "Instructors manage clinical hours"
  ON public.clinical_hours FOR ALL TO authenticated
  USING (public.is_instructor_of(course_id) OR public.is_admin())
  WITH CHECK (public.is_instructor_of(course_id) OR public.is_admin());

CREATE TRIGGER trg_clinical_hours_updated BEFORE UPDATE ON public.clinical_hours
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_clinical_student ON public.clinical_hours(student_user_id, course_id);
CREATE INDEX idx_clinical_course ON public.clinical_hours(course_id, shift_date);

-- 4. Seed CDPH-aligned skill catalog (core competencies per module)
INSERT INTO public.cna_skills (category, name, cdph_module, position) VALUES
  ('Vital Signs', 'Measure and record radial pulse', 'Module 10: Vital Signs', 10),
  ('Vital Signs', 'Measure and record respirations', 'Module 10: Vital Signs', 20),
  ('Vital Signs', 'Measure and record blood pressure (manual)', 'Module 10: Vital Signs', 30),
  ('Vital Signs', 'Measure and record temperature', 'Module 10: Vital Signs', 40),
  ('Infection Control', 'Hand hygiene (handwashing)', 'Module 6: Medical and Surgical Asepsis', 50),
  ('Infection Control', 'Donning and doffing PPE', 'Module 6: Medical and Surgical Asepsis', 60),
  ('Patient Care', 'Provide mouth care', 'Module 8: Patient Care Skills', 70),
  ('Patient Care', 'Provide denture care', 'Module 8: Patient Care Skills', 80),
  ('Patient Care', 'Provide perineal care for a female resident', 'Module 8: Patient Care Skills', 90),
  ('Patient Care', 'Provide catheter care for a female resident', 'Module 8: Patient Care Skills', 100),
  ('Patient Care', 'Provide foot care on one foot', 'Module 8: Patient Care Skills', 110),
  ('Patient Care', 'Dress a resident with one weak arm (affected/weak side)', 'Module 8: Patient Care Skills', 120),
  ('Patient Care', 'Feed a resident who cannot feed self', 'Module 11: Nutrition', 130),
  ('Patient Care', 'Provide modified bed bath (face and one arm, hand, and underarm)', 'Module 8: Patient Care Skills', 140),
  ('Patient Care', 'Assist with use of bedpan', 'Module 9: Patient Care Procedures', 150),
  ('Body Mechanics', 'Transfer from bed to wheelchair using a transfer belt', 'Module 5: Body Mechanics', 160),
  ('Body Mechanics', 'Ambulate using transfer belt', 'Module 5: Body Mechanics', 170),
  ('Body Mechanics', 'Position resident on side', 'Module 5: Body Mechanics', 180),
  ('Body Mechanics', 'Range of motion (ROM) for one knee and one ankle', 'Module 14: Rehabilitative Nursing', 190),
  ('Body Mechanics', 'Range of motion (ROM) for one shoulder', 'Module 14: Rehabilitative Nursing', 200),
  ('Measurement', 'Measure and record urinary output', 'Module 7: Weights and Measures', 210),
  ('Measurement', 'Measure and record weight of an ambulatory resident', 'Module 7: Weights and Measures', 220),
  ('Communication', 'Communicate with a resident who has a hearing impairment', 'Module 3: Communication/Interpersonal Skills', 230),
  ('Rights & Ethics', 'Provide privacy and maintain resident rights during care', 'Module 2: Patient/Resident Rights', 240),
  ('Emergency', 'Respond to a choking conscious adult', 'Module 12: Emergency Procedures', 250),
  ('Emergency', 'Respond to a fall in progress', 'Module 4: Prevention and Management of Catastrophe', 260),
  ('Charting', 'Document care accurately on resident chart', 'Module 15: Observation and Charting', 270);