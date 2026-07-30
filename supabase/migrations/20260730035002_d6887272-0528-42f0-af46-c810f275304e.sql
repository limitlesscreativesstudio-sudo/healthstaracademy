-- 1) Allow reading a course file when an lms_files row links it to a course the user teaches or is enrolled in
CREATE POLICY "course-files read via lms_files membership"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'course-files'
  AND EXISTS (
    SELECT 1 FROM public.lms_files f
    WHERE f.storage_path = storage.objects.name
      AND (public.is_admin() OR public.is_instructor_of(f.course_id) OR public.is_enrolled_in(f.course_id))
  )
);

-- 2) Clone folders from Day sandbox into Weekend sandbox (top-level then children)
WITH src AS (
  SELECT * FROM public.lms_folders WHERE course_id = '5c51a2a9-c7de-42cd-b151-d8f6a3653f1b'
)
INSERT INTO public.lms_folders (course_id, parent_id, name, position, created_by)
SELECT '8b8888ae-60e1-4189-b701-b9b1307cf916', NULL, s.name, s.position, s.created_by
FROM src s
WHERE NOT EXISTS (
  SELECT 1 FROM public.lms_folders d
  WHERE d.course_id = '8b8888ae-60e1-4189-b701-b9b1307cf916' AND d.name = s.name
);

-- 3) Restore parent relationships by name
UPDATE public.lms_folders d
SET parent_id = p.id
FROM public.lms_folders s
  JOIN public.lms_folders sp ON sp.id = s.parent_id
  JOIN public.lms_folders p ON p.name = sp.name AND p.course_id = '8b8888ae-60e1-4189-b701-b9b1307cf916'
WHERE s.course_id = '5c51a2a9-c7de-42cd-b151-d8f6a3653f1b'
  AND d.course_id = '8b8888ae-60e1-4189-b701-b9b1307cf916'
  AND d.name = s.name;

-- 4) Clone file records
INSERT INTO public.lms_files (
  course_id, name, file_name, file_type, file_url, file_size, mime_type, size_bytes,
  storage_provider, storage_path, external_url, drive_file_id, folder, folder_id, uploaded_by, modified_by
)
SELECT '8b8888ae-60e1-4189-b701-b9b1307cf916', f.name, f.file_name, f.file_type, f.file_url, f.file_size,
       f.mime_type, f.size_bytes, f.storage_provider, f.storage_path, f.external_url, f.drive_file_id,
       f.folder,
       (SELECT d.id FROM public.lms_folders d
          JOIN public.lms_folders sf ON sf.id = f.folder_id
         WHERE d.course_id = '8b8888ae-60e1-4189-b701-b9b1307cf916' AND d.name = sf.name LIMIT 1),
       f.uploaded_by, f.modified_by
FROM public.lms_files f
WHERE f.course_id = '5c51a2a9-c7de-42cd-b151-d8f6a3653f1b'
  AND NOT EXISTS (
    SELECT 1 FROM public.lms_files x
    WHERE x.course_id = '8b8888ae-60e1-4189-b701-b9b1307cf916'
      AND x.name = f.name
      AND COALESCE(x.storage_path,'') = COALESCE(f.storage_path,'')
  );