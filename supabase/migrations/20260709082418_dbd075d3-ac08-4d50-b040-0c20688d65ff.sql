
-- Students may upload/update/delete their OWN submission files
CREATE POLICY "submissions insert own" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'submissions'
  AND (storage.foldername(name))[3] = auth.uid()::text
  AND (storage.foldername(name))[1] ~ '^[0-9a-fA-F-]{36}$'
  AND public.is_enrolled_in(((storage.foldername(name))[1])::uuid)
);

CREATE POLICY "submissions update own" ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'submissions'
  AND (storage.foldername(name))[3] = auth.uid()::text
);

CREATE POLICY "submissions delete own or staff" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'submissions'
  AND (
    (storage.foldername(name))[3] = auth.uid()::text
    OR public.is_admin()
    OR ((storage.foldername(name))[1] ~ '^[0-9a-fA-F-]{36}$'
        AND public.is_instructor_of(((storage.foldername(name))[1])::uuid))
  )
);

CREATE POLICY "submissions read own or staff" ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'submissions'
  AND (
    (storage.foldername(name))[3] = auth.uid()::text
    OR public.is_admin()
    OR ((storage.foldername(name))[1] ~ '^[0-9a-fA-F-]{36}$'
        AND public.is_instructor_of(((storage.foldername(name))[1])::uuid))
  )
);
