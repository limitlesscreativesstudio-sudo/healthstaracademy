UPDATE public.lms_files
SET storage_path = '917c5cbd-38e4-4c41-a812-c9e6cafc110b/cdphe276c.pdf',
    file_url = replace(file_url, '5c51a2a9-c7de-42cd-b151-d8f6a3653f1b/cdphe276c.pdf', '917c5cbd-38e4-4c41-a812-c9e6cafc110b/cdphe276c.pdf')
WHERE course_id = '917c5cbd-38e4-4c41-a812-c9e6cafc110b'
  AND storage_path = '5c51a2a9-c7de-42cd-b151-d8f6a3653f1b/cdphe276c.pdf';