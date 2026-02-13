
-- Remove overly permissive anon policies (edge functions will use service_role key instead)
DROP POLICY IF EXISTS "Webhooks can insert logs" ON public.webhook_logs;
DROP POLICY IF EXISTS "Webhooks can insert students" ON public.students;
DROP POLICY IF EXISTS "Webhooks can update students" ON public.students;
DROP POLICY IF EXISTS "Webhooks can insert emails" ON public.enrollment_emails;

-- Fix the security definer view by dropping and recreating with SECURITY INVOKER
DROP VIEW IF EXISTS public.admin_students_view;
CREATE VIEW public.admin_students_view WITH (security_invoker = true) AS
SELECT 
  s.*,
  c.name AS cohort_name,
  c.start_date AS cohort_start_date,
  (SELECT COUNT(*) FROM public.enrollment_emails e WHERE e.student_id = s.id) AS emails_sent_count,
  (SELECT MAX(e.sent_at) FROM public.enrollment_emails e WHERE e.student_id = s.id) AS last_email_sent
FROM public.students s
LEFT JOIN public.cohorts c ON s.cohort_id = c.id;
