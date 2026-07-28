ALTER TABLE public.lms_folders
  ADD COLUMN IF NOT EXISTS position integer NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_lms_folders_course_position
  ON public.lms_folders(course_id, parent_id, position, name);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.lms_folders TO authenticated;
GRANT ALL ON public.lms_folders TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lms_files TO authenticated;
GRANT ALL ON public.lms_files TO service_role;