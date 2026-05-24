
-- 1. Tighten lms_pages SELECT
DROP POLICY IF EXISTS "View pages if enrolled or instructor" ON public.lms_pages;
CREATE POLICY "View pages if visible to viewer"
ON public.lms_pages FOR SELECT
TO authenticated
USING (
  is_admin()
  OR is_instructor_of(course_id)
  OR EXISTS (
    SELECT 1
    FROM public.module_items mi
    JOIN public.modules m ON m.id = mi.module_id
    WHERE mi.content_ref = lms_pages.id
      AND mi.published
      AND m.published
      AND is_enrolled_in(m.course_id)
  )
);

-- 2. Tighten lms_files SELECT
DROP POLICY IF EXISTS "View files if enrolled or instructor" ON public.lms_files;
CREATE POLICY "View files if visible to viewer"
ON public.lms_files FOR SELECT
TO authenticated
USING (
  is_admin()
  OR is_instructor_of(course_id)
  OR EXISTS (
    SELECT 1
    FROM public.module_items mi
    JOIN public.modules m ON m.id = mi.module_id
    WHERE mi.content_ref = lms_files.id
      AND mi.published
      AND m.published
      AND is_enrolled_in(m.course_id)
  )
);

-- 3. Make course-assets bucket private
UPDATE storage.buckets SET public = false WHERE id = 'course-assets';

-- 4. Storage policies for course-assets
DROP POLICY IF EXISTS "Course assets readable by instructors" ON storage.objects;
DROP POLICY IF EXISTS "Course assets readable by enrolled students for visible items" ON storage.objects;
DROP POLICY IF EXISTS "Course assets writable by instructors" ON storage.objects;
DROP POLICY IF EXISTS "Course assets updatable by instructors" ON storage.objects;
DROP POLICY IF EXISTS "Course assets deletable by instructors" ON storage.objects;

CREATE POLICY "Course assets readable by instructors"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'course-assets'
  AND EXISTS (
    SELECT 1 FROM public.lms_files f
    WHERE f.storage_path = storage.objects.name
      AND (public.is_admin() OR public.is_instructor_of(f.course_id))
  )
);

CREATE POLICY "Course assets readable by enrolled students for visible items"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'course-assets'
  AND EXISTS (
    SELECT 1
    FROM public.lms_files f
    JOIN public.module_items mi ON mi.content_ref = f.id
    JOIN public.modules m ON m.id = mi.module_id
    WHERE f.storage_path = storage.objects.name
      AND mi.published AND m.published
      AND public.is_enrolled_in(m.course_id)
  )
);

CREATE POLICY "Course assets writable by instructors"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'course-assets'
  AND (public.is_admin() OR public.has_role(auth.uid(), 'instructor'))
);

CREATE POLICY "Course assets updatable by instructors"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'course-assets'
  AND EXISTS (
    SELECT 1 FROM public.lms_files f
    WHERE f.storage_path = storage.objects.name
      AND (public.is_admin() OR public.is_instructor_of(f.course_id))
  )
);

CREATE POLICY "Course assets deletable by instructors"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'course-assets'
  AND EXISTS (
    SELECT 1 FROM public.lms_files f
    WHERE f.storage_path = storage.objects.name
      AND (public.is_admin() OR public.is_instructor_of(f.course_id))
  )
);
