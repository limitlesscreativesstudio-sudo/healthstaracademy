
DROP POLICY IF EXISTS "course-files read for authenticated" ON storage.objects;

CREATE POLICY "course-files read for enrolled or staff"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'course-files'
  AND (
    public.is_admin()
    OR (
      (storage.foldername(name))[1] ~ '^[0-9a-fA-F-]{36}$'
      AND (
        public.is_instructor_of(((storage.foldername(name))[1])::uuid)
        OR public.is_enrolled_in(((storage.foldername(name))[1])::uuid)
      )
    )
  )
);
