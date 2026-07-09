
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS image_url text;

-- Storage policies: allow authenticated instructors/admins to write course cover images
-- into the existing public 'page-images' bucket under the course-images/ prefix.
DROP POLICY IF EXISTS "Instructors upload course cover images" ON storage.objects;
CREATE POLICY "Instructors upload course cover images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'page-images'
  AND (storage.foldername(name))[1] = 'course-images'
  AND (public.is_admin() OR public.has_role(auth.uid(), 'instructor'))
);

DROP POLICY IF EXISTS "Instructors update course cover images" ON storage.objects;
CREATE POLICY "Instructors update course cover images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'page-images'
  AND (storage.foldername(name))[1] = 'course-images'
  AND (public.is_admin() OR public.has_role(auth.uid(), 'instructor'))
);

DROP POLICY IF EXISTS "Instructors delete course cover images" ON storage.objects;
CREATE POLICY "Instructors delete course cover images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'page-images'
  AND (storage.foldername(name))[1] = 'course-images'
  AND (public.is_admin() OR public.has_role(auth.uid(), 'instructor'))
);
