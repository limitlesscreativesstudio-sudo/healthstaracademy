
-- 1. Skill evidence: scope instructor access to their own courses
DROP POLICY IF EXISTS "Students view own skill evidence" ON storage.objects;
DROP POLICY IF EXISTS "Instructors update skill evidence" ON storage.objects;

CREATE POLICY "Skill evidence viewable by owner or course instructor"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'skill-evidence'
  AND (
    (auth.uid())::text = (storage.foldername(name))[1]
    OR public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.enrollments e
      JOIN public.courses c ON c.id = e.course_id
      WHERE e.user_id::text = (storage.foldername(name))[1]
        AND c.instructor_id = auth.uid()
    )
  )
);

CREATE POLICY "Skill evidence editable by course instructor"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'skill-evidence'
  AND (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.enrollments e
      JOIN public.courses c ON c.id = e.course_id
      WHERE e.user_id::text = (storage.foldername(name))[1]
        AND c.instructor_id = auth.uid()
    )
  )
);

-- 2. page-images: remove broad listing policy. Bucket stays public so getPublicUrl still serves files via CDN.
DROP POLICY IF EXISTS "Public read page images" ON storage.objects;
