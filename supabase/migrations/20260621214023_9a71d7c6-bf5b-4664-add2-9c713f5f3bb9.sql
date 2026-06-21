
ALTER TABLE public.module_items
  ADD COLUMN IF NOT EXISTS file_url text,
  ADD COLUMN IF NOT EXISTS file_name text,
  ADD COLUMN IF NOT EXISTS file_type text;

ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS syllabus_url text,
  ADD COLUMN IF NOT EXISTS syllabus_name text;
