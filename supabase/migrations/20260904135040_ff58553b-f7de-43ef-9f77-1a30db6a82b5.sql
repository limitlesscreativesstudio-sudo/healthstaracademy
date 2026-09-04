ALTER TABLE public.quiz_attempts
  ADD COLUMN IF NOT EXISTS grading_status text NOT NULL DEFAULT 'not_submitted',
  ADD COLUMN IF NOT EXISTS question_scores jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS instructor_feedback text,
  ADD COLUMN IF NOT EXISTS graded_by uuid,
  ADD COLUMN IF NOT EXISTS graded_at timestamptz;

ALTER TABLE public.quizzes
  ADD COLUMN IF NOT EXISTS answer_key_status text NOT NULL DEFAULT 'unkeyed';

-- Backfill grading status for existing attempts
UPDATE public.quiz_attempts SET grading_status = 'awaiting' WHERE submitted_at IS NOT NULL;
UPDATE public.quiz_attempts SET grading_status = 'not_submitted' WHERE submitted_at IS NULL;

-- Clear bogus auto-scores so nothing shows a wrong grade
UPDATE public.quiz_attempts SET score = NULL, max_score = NULL WHERE submitted_at IS NOT NULL;
DELETE FROM public.grades g
 WHERE g.quiz_attempt_id IS NOT NULL
   AND EXISTS (SELECT 1 FROM public.quiz_attempts a WHERE a.id = g.quiz_attempt_id AND a.grading_status <> 'released');

-- Flag quizzes whose multiple-choice keys are missing or all identical (never imported)
UPDATE public.quizzes q SET answer_key_status = CASE
  WHEN sub.total = 0 THEN 'unkeyed'
  WHEN sub.nulls > 0 THEN 'unkeyed'
  WHEN sub.mc_total > 1 AND sub.mc_distinct = 1 THEN 'unkeyed'
  ELSE 'keyed'
END
FROM (
  SELECT quiz_id,
         count(*) AS total,
         count(*) FILTER (WHERE correct_answer IS NULL) AS nulls,
         count(*) FILTER (WHERE question_type = 'multiple_choice') AS mc_total,
         count(DISTINCT correct_answer::text) FILTER (WHERE question_type = 'multiple_choice') AS mc_distinct
  FROM public.quiz_questions GROUP BY quiz_id
) sub
WHERE sub.quiz_id = q.id;

-- Students may only read a released score; instructors of the course see everything
DROP POLICY IF EXISTS "Students read own released attempt scores" ON public.quiz_attempts;

CREATE OR REPLACE FUNCTION public.notify_quiz_submission()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_course_id uuid; v_title text; v_student text;
BEGIN
  IF NEW.submitted_at IS NULL OR OLD.submitted_at IS NOT NULL THEN
    RETURN NEW;
  END IF;

  SELECT q.course_id, q.title INTO v_course_id, v_title
  FROM public.quizzes q WHERE q.id = NEW.quiz_id;

  SELECT p.full_name INTO v_student FROM public.profiles p WHERE p.user_id = NEW.user_id;

  INSERT INTO public.notifications (user_id, kind, title, body, link)
  SELECT DISTINCT e.user_id, 'submission',
         COALESCE(v_student, 'A student') || ' submitted: ' || COALESCE(v_title, 'a quiz'),
         'Awaiting grading',
         '/portal/teach/courses/' || v_course_id || '?tab=quizzes'
  FROM public.enrollments e
  WHERE e.course_id = v_course_id AND e.role IN ('teacher','ta');

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_quiz_submission ON public.quiz_attempts;
CREATE TRIGGER trg_notify_quiz_submission
AFTER UPDATE ON public.quiz_attempts
FOR EACH ROW EXECUTE FUNCTION public.notify_quiz_submission();