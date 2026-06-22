
DROP POLICY IF EXISTS "course-files update for instructors/admins" ON storage.objects;
DROP POLICY IF EXISTS "course-files delete for instructors/admins" ON storage.objects;
DROP POLICY IF EXISTS "course-files insert for instructors/admins" ON storage.objects;

CREATE POLICY "course-files insert for owning instructor or admin"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'course-files' AND (
    public.is_admin() OR (
      (storage.foldername(name))[1] ~ '^[0-9a-fA-F-]{36}$'
      AND public.is_instructor_of(((storage.foldername(name))[1])::uuid)
    )
  )
);

CREATE POLICY "course-files update for owning instructor or admin"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'course-files' AND (
    public.is_admin() OR (
      (storage.foldername(name))[1] ~ '^[0-9a-fA-F-]{36}$'
      AND public.is_instructor_of(((storage.foldername(name))[1])::uuid)
    )
  )
);

CREATE POLICY "course-files delete for owning instructor or admin"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'course-files' AND (
    public.is_admin() OR (
      (storage.foldername(name))[1] ~ '^[0-9a-fA-F-]{36}$'
      AND public.is_instructor_of(((storage.foldername(name))[1])::uuid)
    )
  )
);
