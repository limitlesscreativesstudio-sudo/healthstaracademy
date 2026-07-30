CREATE TABLE public.outcomes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  category text,
  mastery_threshold numeric NOT NULL DEFAULT 3,
  points_possible numeric NOT NULL DEFAULT 5,
  position integer NOT NULL DEFAULT 0,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.outcomes TO authenticated;
GRANT ALL ON public.outcomes TO service_role;
ALTER TABLE public.outcomes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Course members can view outcomes"
ON public.outcomes FOR SELECT TO authenticated
USING (public.is_admin() OR public.is_instructor_of(course_id) OR public.is_enrolled_in(course_id));

CREATE POLICY "Instructors manage outcomes"
ON public.outcomes FOR ALL TO authenticated
USING (public.is_admin() OR public.is_instructor_of(course_id))
WITH CHECK (public.is_admin() OR public.is_instructor_of(course_id));

CREATE TRIGGER update_outcomes_updated_at
BEFORE UPDATE ON public.outcomes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.outcome_criteria (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  outcome_id uuid NOT NULL REFERENCES public.outcomes(id) ON DELETE CASCADE,
  criterion_id uuid NOT NULL REFERENCES public.rubric_criteria(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (outcome_id, criterion_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.outcome_criteria TO authenticated;
GRANT ALL ON public.outcome_criteria TO service_role;
ALTER TABLE public.outcome_criteria ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Course members can view outcome links"
ON public.outcome_criteria FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.outcomes o
  WHERE o.id = outcome_id
    AND (public.is_admin() OR public.is_instructor_of(o.course_id) OR public.is_enrolled_in(o.course_id))
));

CREATE POLICY "Instructors manage outcome links"
ON public.outcome_criteria FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.outcomes o
  WHERE o.id = outcome_id AND (public.is_admin() OR public.is_instructor_of(o.course_id))
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.outcomes o
  WHERE o.id = outcome_id AND (public.is_admin() OR public.is_instructor_of(o.course_id))
));