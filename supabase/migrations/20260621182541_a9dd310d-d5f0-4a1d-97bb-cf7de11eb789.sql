CREATE POLICY "course-files read for authenticated"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'course-files');

CREATE POLICY "course-files insert for instructors/admins"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'course-files'
  AND (public.is_admin() OR public.has_role(auth.uid(), 'instructor'))
);

CREATE POLICY "course-files update for instructors/admins"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'course-files'
  AND (public.is_admin() OR public.has_role(auth.uid(), 'instructor'))
);

CREATE POLICY "course-files delete for instructors/admins"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'course-files'
  AND (public.is_admin() OR public.has_role(auth.uid(), 'instructor'))
);