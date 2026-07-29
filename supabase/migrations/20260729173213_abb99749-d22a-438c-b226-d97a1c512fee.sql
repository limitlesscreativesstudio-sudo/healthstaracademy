DROP INDEX IF EXISTS public.pending_enrollments_course_email_key;
CREATE UNIQUE INDEX pending_enrollments_course_email_key
  ON public.pending_enrollments (course_id, email);