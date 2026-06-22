ALTER TABLE public.lms_pages ADD COLUMN IF NOT EXISTS position integer NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS lms_pages_course_position_idx ON public.lms_pages(course_id, position);