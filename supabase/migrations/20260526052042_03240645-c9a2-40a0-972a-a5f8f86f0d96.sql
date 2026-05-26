
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS syllabus_html text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS syllabus_show_summary boolean NOT NULL DEFAULT true;
