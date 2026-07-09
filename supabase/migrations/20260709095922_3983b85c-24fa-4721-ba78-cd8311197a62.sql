
-- Rubrics
CREATE TABLE public.rubrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rubrics TO authenticated;
GRANT ALL ON public.rubrics TO service_role;
ALTER TABLE public.rubrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View rubrics if enrolled or instructor" ON public.rubrics FOR SELECT TO authenticated
  USING (public.is_admin() OR public.is_instructor_of(course_id) OR public.is_enrolled_in(course_id));
CREATE POLICY "Instructors manage rubrics" ON public.rubrics FOR ALL TO authenticated
  USING (public.is_instructor_of(course_id) OR public.is_admin())
  WITH CHECK (public.is_instructor_of(course_id) OR public.is_admin());
CREATE TRIGGER trg_rubrics_updated BEFORE UPDATE ON public.rubrics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Criteria
CREATE TABLE public.rubric_criteria (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rubric_id uuid NOT NULL REFERENCES public.rubrics(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 0,
  title text NOT NULL,
  description text,
  points numeric NOT NULL DEFAULT 5,
  levels jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX rubric_criteria_rubric_idx ON public.rubric_criteria(rubric_id, position);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rubric_criteria TO authenticated;
GRANT ALL ON public.rubric_criteria TO service_role;
ALTER TABLE public.rubric_criteria ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View criteria if can view rubric" ON public.rubric_criteria FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.rubrics r WHERE r.id = rubric_criteria.rubric_id
    AND (public.is_admin() OR public.is_instructor_of(r.course_id) OR public.is_enrolled_in(r.course_id))));
CREATE POLICY "Instructors manage criteria" ON public.rubric_criteria FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.rubrics r WHERE r.id = rubric_criteria.rubric_id
    AND (public.is_admin() OR public.is_instructor_of(r.course_id))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.rubrics r WHERE r.id = rubric_criteria.rubric_id
    AND (public.is_admin() OR public.is_instructor_of(r.course_id))));

-- Attach rubric to assignment
ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS rubric_id uuid REFERENCES public.rubrics(id) ON DELETE SET NULL;

-- Per-submission rubric scores
CREATE TABLE public.rubric_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  criterion_id uuid NOT NULL REFERENCES public.rubric_criteria(id) ON DELETE CASCADE,
  score numeric NOT NULL DEFAULT 0,
  comment text,
  graded_by uuid,
  graded_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(assignment_id, user_id, criterion_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rubric_scores TO authenticated;
GRANT ALL ON public.rubric_scores TO service_role;
ALTER TABLE public.rubric_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View own or instructor rubric scores" ON public.rubric_scores FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.assignments a
    WHERE a.id = rubric_scores.assignment_id AND (public.is_admin() OR public.is_instructor_of(a.course_id))));
CREATE POLICY "Instructors manage rubric scores" ON public.rubric_scores FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.assignments a WHERE a.id = rubric_scores.assignment_id
    AND (public.is_admin() OR public.is_instructor_of(a.course_id))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.assignments a WHERE a.id = rubric_scores.assignment_id
    AND (public.is_admin() OR public.is_instructor_of(a.course_id))));
