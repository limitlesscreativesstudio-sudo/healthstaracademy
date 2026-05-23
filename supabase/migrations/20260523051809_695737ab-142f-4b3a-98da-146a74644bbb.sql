
-- 1. Quiz attempts: lock score/max_score/submitted_at from students
DROP POLICY IF EXISTS "Students manage own attempts" ON public.quiz_attempts;

CREATE POLICY "Students view own attempts"
ON public.quiz_attempts FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Students start own attempts"
ON public.quiz_attempts FOR INSERT TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND score IS NULL
  AND max_score IS NULL
  AND submitted_at IS NULL
);

CREATE OR REPLACE FUNCTION public.prevent_quiz_attempt_score_tamper()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.quizzes q
    WHERE q.id = NEW.quiz_id
      AND (public.is_admin() OR public.is_instructor_of(q.course_id))
  ) THEN
    RETURN NEW;
  END IF;

  IF NEW.user_id = auth.uid() THEN
    IF NEW.score IS DISTINCT FROM OLD.score
       OR NEW.max_score IS DISTINCT FROM OLD.max_score
       OR NEW.submitted_at IS DISTINCT FROM OLD.submitted_at THEN
      RAISE EXCEPTION 'Students cannot modify score, max_score, or submitted_at';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS quiz_attempts_prevent_tamper ON public.quiz_attempts;
CREATE TRIGGER quiz_attempts_prevent_tamper
BEFORE UPDATE ON public.quiz_attempts
FOR EACH ROW EXECUTE FUNCTION public.prevent_quiz_attempt_score_tamper();

CREATE POLICY "Students update own attempt answers"
ON public.quiz_attempts FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Students delete own unstarted attempts"
ON public.quiz_attempts FOR DELETE TO authenticated
USING (user_id = auth.uid() AND submitted_at IS NULL);

-- 2. Hide correct_answer from students
DROP POLICY IF EXISTS "Enrolled view quiz questions" ON public.quiz_questions;

CREATE POLICY "Instructors view quiz questions"
ON public.quiz_questions FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.quizzes q
    WHERE q.id = quiz_questions.quiz_id
      AND (public.is_admin() OR public.is_instructor_of(q.course_id))
  )
);

CREATE OR REPLACE FUNCTION public.get_quiz_questions_for_student(_quiz_id uuid)
RETURNS TABLE (
  id uuid,
  quiz_id uuid,
  "position" integer,
  question_type text,
  prompt text,
  options jsonb,
  points numeric
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT qq.id, qq.quiz_id, qq."position", qq.question_type, qq.prompt, qq.options, qq.points
  FROM public.quiz_questions qq
  JOIN public.quizzes q ON q.id = qq.quiz_id
  WHERE qq.quiz_id = _quiz_id
    AND (
      public.is_admin()
      OR public.is_instructor_of(q.course_id)
      OR (q.published AND public.is_enrolled_in(q.course_id))
    )
  ORDER BY qq."position";
$$;

GRANT EXECUTE ON FUNCTION public.get_quiz_questions_for_student(uuid) TO authenticated;

-- 3. course-assets storage bucket
DROP POLICY IF EXISTS "Course assets publicly readable" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload course assets" ON storage.objects;

CREATE POLICY "Course assets list for enrolled or instructor"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'course-assets'
  AND (
    (
      (storage.foldername(name))[1] ~* '^[0-9a-f-]{36}$'
      AND public.is_instructor_of(((storage.foldername(name))[1])::uuid)
    )
    OR (
      (storage.foldername(name))[1] = 'submissions'
      AND EXISTS (
        SELECT 1 FROM public.assignments a
        WHERE a.id::text = (storage.foldername(name))[2]
          AND (
            public.is_instructor_of(a.course_id)
            OR public.is_enrolled_in(a.course_id)
          )
      )
    )
    OR public.is_admin()
  )
);

CREATE POLICY "Course assets upload scoped"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'course-assets'
  AND (
    (
      (storage.foldername(name))[1] ~* '^[0-9a-f-]{36}$'
      AND public.is_instructor_of(((storage.foldername(name))[1])::uuid)
    )
    OR (
      (storage.foldername(name))[1] = 'submissions'
      AND EXISTS (
        SELECT 1 FROM public.assignments a
        WHERE a.id::text = (storage.foldername(name))[2]
          AND public.is_enrolled_in(a.course_id)
      )
    )
    OR public.is_admin()
  )
);
