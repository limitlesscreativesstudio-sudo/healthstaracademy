
DROP POLICY IF EXISTS "Course assets writable by instructors" ON storage.objects;

CREATE POLICY "Students view own student record"
ON public.students
FOR SELECT
TO authenticated
USING (portal_user_id = auth.uid());
