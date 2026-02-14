
-- Recreate admin_students_view with security_invoker = true
-- This ensures the view respects RLS on the underlying students table
DROP VIEW IF EXISTS public.admin_students_view;

CREATE VIEW public.admin_students_view
WITH (security_invoker = true)
AS
SELECT s.id,
    s.first_name,
    s.last_name,
    s.email,
    s.phone,
    s.date_of_birth,
    s.has_diploma,
    s.is_over_18,
    s.has_valid_id,
    s.has_ssn,
    s.can_pass_background,
    s.has_health_proof,
    s.has_transportation,
    s.qualification_status,
    s.qualification_notes,
    s.needs_entrance_exam,
    s.needs_parent_consent,
    s.enrollment_status,
    s.payment_status,
    s.payment_method,
    s.scrub_top_size,
    s.scrub_bottom_size,
    s.shipping_address,
    s.cohort_id,
    s.selected_cohort_date,
    s.orientation_date,
    s.google_sheet_row,
    s.created_at,
    s.updated_at,
    c.name AS cohort_name,
    c.start_date AS cohort_start_date,
    ( SELECT count(*) FROM enrollment_emails e WHERE e.student_id = s.id) AS emails_sent_count,
    ( SELECT max(e.sent_at) FROM enrollment_emails e WHERE e.student_id = s.id) AS last_email_sent
FROM students s
LEFT JOIN cohorts c ON s.cohort_id = c.id;

-- Grant access so the view is queryable
GRANT SELECT ON public.admin_students_view TO authenticated;
GRANT SELECT ON public.admin_students_view TO anon;
