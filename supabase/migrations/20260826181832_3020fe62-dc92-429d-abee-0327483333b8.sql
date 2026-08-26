DROP POLICY IF EXISTS "Enrolled view published quizzes" ON public.quizzes;
CREATE POLICY "Enrolled view quizzes" ON public.quizzes FOR SELECT TO authenticated
USING (public.is_admin() OR public.is_instructor_of(course_id) OR public.is_enrolled_in(course_id));

DROP POLICY IF EXISTS "Students start own attempts" ON public.quiz_attempts;
CREATE POLICY "Students start own attempts" ON public.quiz_attempts FOR INSERT TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.quizzes q
    WHERE q.id = quiz_attempts.quiz_id
      AND (public.is_admin() OR public.is_instructor_of(q.course_id) OR (q.published AND public.is_enrolled_in(q.course_id)))
  )
);