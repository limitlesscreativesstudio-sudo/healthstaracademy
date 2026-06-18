DROP POLICY IF EXISTS "Students update own attempt answers" ON public.quiz_attempts;

CREATE POLICY "Students update own attempt answers"
ON public.quiz_attempts
FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid() AND submitted_at IS NULL
)
WITH CHECK (
  user_id = auth.uid()
  AND submitted_at IS NULL
  AND score IS NULL
  AND max_score IS NULL
);