CREATE POLICY "Instructors record offline attempts"
ON public.quiz_attempts
FOR INSERT
TO authenticated
WITH CHECK (
  is_admin() OR EXISTS (
    SELECT 1 FROM public.quizzes q
    WHERE q.id = quiz_attempts.quiz_id AND is_instructor_of(q.course_id)
  )
);