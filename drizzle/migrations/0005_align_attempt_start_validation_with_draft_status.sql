CREATE OR REPLACE FUNCTION public.prevent_quiz_attempt_score_tamper()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
 IF auth.uid() IS NULL THEN RETURN NEW; END IF;
 IF EXISTS (SELECT 1 FROM public.quizzes q WHERE q.id=NEW.quiz_id AND (public.is_admin() OR public.is_instructor_of(q.course_id))) THEN RETURN NEW; END IF;
 IF TG_OP='INSERT' THEN
  IF NEW.user_id IS DISTINCT FROM auth.uid() OR NEW.submitted_at IS NOT NULL OR NEW.score IS NOT NULL OR NEW.max_score IS NOT NULL OR NEW.grading_status<>'not_submitted' OR NEW.question_scores<>'{}'::jsonb OR NEW.graded_at IS NOT NULL OR NEW.graded_by IS NOT NULL OR NEW.instructor_feedback IS NOT NULL THEN
   RAISE EXCEPTION 'Students may only start ungraded attempts';
  END IF;
 ELSE
  IF OLD.submitted_at IS NOT NULL OR NEW.id IS DISTINCT FROM OLD.id OR NEW.user_id IS DISTINCT FROM OLD.user_id OR NEW.quiz_id IS DISTINCT FROM OLD.quiz_id OR NEW.score IS DISTINCT FROM OLD.score OR NEW.max_score IS DISTINCT FROM OLD.max_score OR NEW.submitted_at IS DISTINCT FROM OLD.submitted_at OR NEW.grading_status IS DISTINCT FROM OLD.grading_status OR NEW.question_scores IS DISTINCT FROM OLD.question_scores OR NEW.graded_by IS DISTINCT FROM OLD.graded_by OR NEW.graded_at IS DISTINCT FROM OLD.graded_at OR NEW.instructor_feedback IS DISTINCT FROM OLD.instructor_feedback OR NEW.started_at IS DISTINCT FROM OLD.started_at OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
   RAISE EXCEPTION 'Students may only save answers on their open attempt';
  END IF;
 END IF;
 RETURN NEW;
END; $$;