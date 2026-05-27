
-- Folders for course Files tab
CREATE TABLE public.lms_folders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.lms_folders(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_lms_folders_course ON public.lms_folders(course_id);
CREATE INDEX idx_lms_folders_parent ON public.lms_folders(parent_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.lms_folders TO authenticated;
GRANT ALL ON public.lms_folders TO service_role;

ALTER TABLE public.lms_folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Instructors manage folders"
  ON public.lms_folders
  TO authenticated
  USING (is_instructor_of(course_id) OR is_admin())
  WITH CHECK (is_instructor_of(course_id) OR is_admin());

CREATE POLICY "View folders in enrolled courses"
  ON public.lms_folders FOR SELECT
  TO authenticated
  USING (is_admin() OR is_instructor_of(course_id) OR is_enrolled_in(course_id));

CREATE TRIGGER update_lms_folders_updated_at
BEFORE UPDATE ON public.lms_folders
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add folder + updated_at + modified_by to files
ALTER TABLE public.lms_files
  ADD COLUMN folder_id UUID REFERENCES public.lms_folders(id) ON DELETE SET NULL,
  ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ADD COLUMN modified_by UUID;

CREATE INDEX idx_lms_files_folder ON public.lms_files(folder_id);

CREATE TRIGGER update_lms_files_updated_at
BEFORE UPDATE ON public.lms_files
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
