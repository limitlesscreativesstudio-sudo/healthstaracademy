-- Normalize invalid limits
UPDATE public.quizzes SET attempts_allowed = 1 WHERE attempts_allowed IS NULL OR attempts_allowed < 1;

ALTER TABLE public.quizzes ALTER COLUMN attempts_allowed SET DEFAULT 1;

CREATE OR REPLACE FUNCTION public.enforce_quiz_attempt_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _course_id uuid;
  _allowed integer;
  _used integer;
BEGIN
  SELECT course_id, GREATEST(COALESCE(attempts_allowed, 1), 1)
    INTO _course_id, _allowed
  FROM public.quizzes WHERE id = NEW.quiz_id;

  IF _course_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Instructors/admins are never limited (quiz previews).
  IF public.is_admin() OR public.is_instructor_of(_course_id) THEN
    RETURN NEW;
  END IF;

  SELECT count(*) INTO _used
  FROM public.quiz_attempts
  WHERE quiz_id = NEW.quiz_id
    AND user_id = NEW.user_id
    AND submitted_at IS NOT NULL;

  IF _used >= _allowed THEN
    RAISE EXCEPTION 'Attempt limit reached for this quiz (% of % allowed). Ask your instructor to allow another attempt.', _used, _allowed
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_quiz_attempt_limit_trg ON public.quiz_attempts;
CREATE TRIGGER enforce_quiz_attempt_limit_trg
BEFORE INSERT ON public.quiz_attempts
FOR EACH ROW EXECUTE FUNCTION public.enforce_quiz_attempt_limit();