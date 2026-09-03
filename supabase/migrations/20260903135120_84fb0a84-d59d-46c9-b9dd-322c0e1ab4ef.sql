CREATE POLICY "Instructors update attempts in their courses"
ON public.quiz_attempts
FOR UPDATE
TO authenticated
USING (
  public.is_admin() OR EXISTS (
    SELECT 1 FROM public.quizzes q
    WHERE q.id = quiz_attempts.quiz_id AND public.is_instructor_of(q.course_id)
  )
)
WITH CHECK (
  public.is_admin() OR EXISTS (
    SELECT 1 FROM public.quizzes q
    WHERE q.id = quiz_attempts.quiz_id AND public.is_instructor_of(q.course_id)
  )
);