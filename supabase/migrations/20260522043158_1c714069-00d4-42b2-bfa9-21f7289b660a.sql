
-- Assignments
CREATE TABLE public.assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL,
  module_item_id uuid,
  title text NOT NULL,
  instructions text DEFAULT '',
  due_at timestamptz,
  points numeric NOT NULL DEFAULT 100,
  submission_type text NOT NULL DEFAULT 'text', -- 'text' | 'file' | 'both'
  published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Instructors manage assignments" ON public.assignments
  FOR ALL TO authenticated
  USING (is_instructor_of(course_id) OR is_admin())
  WITH CHECK (is_instructor_of(course_id) OR is_admin());
CREATE POLICY "Enrolled view published assignments" ON public.assignments
  FOR SELECT TO authenticated
  USING (is_admin() OR is_instructor_of(course_id) OR (published AND is_enrolled_in(course_id)));
CREATE TRIGGER trg_assignments_updated BEFORE UPDATE ON public.assignments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Submissions
CREATE TABLE public.submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  body text DEFAULT '',
  file_url text,
  file_name text,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (assignment_id, user_id)
);
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students manage own submissions" ON public.submissions
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Instructors view submissions" ON public.submissions
  FOR SELECT TO authenticated
  USING (is_admin() OR EXISTS (
    SELECT 1 FROM public.assignments a
    WHERE a.id = submissions.assignment_id AND is_instructor_of(a.course_id)
  ));
CREATE TRIGGER trg_submissions_updated BEFORE UPDATE ON public.submissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Grades (for assignments or quizzes)
CREATE TABLE public.grades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL,
  user_id uuid NOT NULL,
  assignment_id uuid REFERENCES public.assignments(id) ON DELETE CASCADE,
  quiz_attempt_id uuid,
  score numeric NOT NULL DEFAULT 0,
  max_score numeric NOT NULL DEFAULT 100,
  feedback text DEFAULT '',
  graded_by uuid,
  graded_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Instructors manage grades" ON public.grades
  FOR ALL TO authenticated
  USING (is_instructor_of(course_id) OR is_admin())
  WITH CHECK (is_instructor_of(course_id) OR is_admin());
CREATE POLICY "Students view own grades" ON public.grades
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE TRIGGER trg_grades_updated BEFORE UPDATE ON public.grades
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Quizzes
CREATE TABLE public.quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL,
  module_item_id uuid,
  title text NOT NULL,
  instructions text DEFAULT '',
  due_at timestamptz,
  time_limit_minutes integer,
  attempts_allowed integer NOT NULL DEFAULT 1,
  total_points numeric NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Instructors manage quizzes" ON public.quizzes
  FOR ALL TO authenticated
  USING (is_instructor_of(course_id) OR is_admin())
  WITH CHECK (is_instructor_of(course_id) OR is_admin());
CREATE POLICY "Enrolled view published quizzes" ON public.quizzes
  FOR SELECT TO authenticated
  USING (is_admin() OR is_instructor_of(course_id) OR (published AND is_enrolled_in(course_id)));
CREATE TRIGGER trg_quizzes_updated BEFORE UPDATE ON public.quizzes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Quiz questions
CREATE TABLE public.quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 0,
  question_type text NOT NULL DEFAULT 'multiple_choice', -- multiple_choice | true_false | short_answer
  prompt text NOT NULL,
  options jsonb NOT NULL DEFAULT '[]'::jsonb,
  correct_answer jsonb,
  points numeric NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Instructors manage quiz questions" ON public.quiz_questions
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.quizzes q WHERE q.id = quiz_questions.quiz_id AND (is_instructor_of(q.course_id) OR is_admin())))
  WITH CHECK (EXISTS (SELECT 1 FROM public.quizzes q WHERE q.id = quiz_questions.quiz_id AND (is_instructor_of(q.course_id) OR is_admin())));
CREATE POLICY "Enrolled view quiz questions" ON public.quiz_questions
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.quizzes q
    WHERE q.id = quiz_questions.quiz_id
      AND (is_admin() OR is_instructor_of(q.course_id) OR (q.published AND is_enrolled_in(q.course_id)))
  ));

-- Quiz attempts
CREATE TABLE public.quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  score numeric,
  max_score numeric,
  started_at timestamptz NOT NULL DEFAULT now(),
  submitted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students manage own attempts" ON public.quiz_attempts
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Instructors view attempts" ON public.quiz_attempts
  FOR SELECT TO authenticated
  USING (is_admin() OR EXISTS (
    SELECT 1 FROM public.quizzes q
    WHERE q.id = quiz_attempts.quiz_id AND is_instructor_of(q.course_id)
  ));

CREATE INDEX idx_assignments_course ON public.assignments(course_id);
CREATE INDEX idx_submissions_assignment ON public.submissions(assignment_id);
CREATE INDEX idx_submissions_user ON public.submissions(user_id);
CREATE INDEX idx_grades_course_user ON public.grades(course_id, user_id);
CREATE INDEX idx_quizzes_course ON public.quizzes(course_id);
CREATE INDEX idx_quiz_questions_quiz ON public.quiz_questions(quiz_id, position);
CREATE INDEX idx_quiz_attempts_user ON public.quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_quiz ON public.quiz_attempts(quiz_id);
