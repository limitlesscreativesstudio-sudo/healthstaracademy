DELETE FROM public.pending_enrollments a
USING public.pending_enrollments b
WHERE a.ctid < b.ctid AND a.course_id = b.course_id AND lower(a.email) = lower(b.email);

CREATE UNIQUE INDEX IF NOT EXISTS pending_enrollments_course_email_key
  ON public.pending_enrollments (course_id, email);