-- 1. Allow the pre_qualified status the enrollment webhook uses
ALTER TABLE public.students DROP CONSTRAINT IF EXISTS students_enrollment_status_check;
ALTER TABLE public.students ADD CONSTRAINT students_enrollment_status_check
CHECK (enrollment_status = ANY (ARRAY[
  'pre_qualification','pre_qualified','qualified','application_sent','documents_received',
  'livescan_sent','livescan_complete','tuition_sent','payment_complete','orientation_scheduled',
  'scrubs_requested','scrubs_received','welcome_sent','enrolled','disqualified'
]));

-- 2. Backfill applicants that were silently dropped
INSERT INTO public.students (
  first_name, last_name, email, phone, date_of_birth, shipping_address,
  is_over_18, has_diploma, has_valid_id, has_ssn, can_pass_background,
  has_health_proof, has_transportation, can_pay_fee, selected_cohort_date,
  qualification_status, qualification_notes, needs_entrance_exam,
  needs_parent_consent, enrollment_status, created_at
)
SELECT DISTINCT ON (lower(w.payload->>'email'))
  btrim(w.payload->>'first_name'),
  btrim(w.payload->>'last_name'),
  lower(btrim(w.payload->>'email')),
  nullif(w.payload->>'phone',''),
  nullif(w.payload->>'date_of_birth','')::date,
  nullif(w.payload->>'address',''),
  (w.payload->>'is_over_18')::boolean,
  (w.payload->>'has_diploma')::boolean,
  (w.payload->>'has_valid_id')::boolean,
  (w.payload->>'has_ssn')::boolean,
  (w.payload->>'can_pass_background')::boolean,
  (w.payload->>'has_health_proof')::boolean,
  coalesce((w.payload->>'has_transportation')::boolean, true),
  coalesce((w.payload->>'can_pay_fee')::boolean, true),
  nullif(w.payload->>'selected_cohort_date','')::date,
  'qualified',
  nullif(concat_ws('; ',
    CASE WHEN (w.payload->>'has_diploma')::boolean IS FALSE THEN 'Needs entrance exam (no diploma)' END,
    CASE WHEN (w.payload->>'is_over_18')::boolean IS FALSE THEN 'Needs parent consent (under 18)' END,
    CASE WHEN (w.payload->>'can_pay_fee')::boolean IS FALSE THEN 'Cannot pay the $175 application fee up front — discuss payment options' END
  ), ''),
  (w.payload->>'has_diploma')::boolean IS FALSE,
  (w.payload->>'is_over_18')::boolean IS FALSE,
  'pre_qualified',
  w.created_at
FROM public.webhook_logs w
WHERE w.event_type = 'pre_qualification'
  AND w.payload->>'email' IS NOT NULL
  AND (w.payload->>'has_valid_id')::boolean IS TRUE
  AND (w.payload->>'has_ssn')::boolean IS TRUE
  AND (w.payload->>'can_pass_background')::boolean IS TRUE
  AND (w.payload->>'has_health_proof')::boolean IS TRUE
  AND NOT EXISTS (
    SELECT 1 FROM public.students s WHERE s.email = lower(btrim(w.payload->>'email'))
  )
ORDER BY lower(w.payload->>'email'), w.created_at DESC;

-- 3. Instructors keep a relationship with their students: profile visibility
CREATE OR REPLACE FUNCTION public.shares_course_as_instructor(_student_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.enrollments se
    WHERE se.user_id = _student_user_id
      AND (
        EXISTS (
          SELECT 1 FROM public.enrollments ie
          WHERE ie.course_id = se.course_id
            AND ie.user_id = auth.uid()
            AND ie.role IN ('teacher','instructor','ta')
        )
        OR EXISTS (
          SELECT 1 FROM public.courses c
          WHERE c.id = se.course_id AND c.instructor_id = auth.uid()
        )
      )
  )
$$;

DROP POLICY IF EXISTS "Instructors view profiles of their students" ON public.profiles;
CREATE POLICY "Instructors view profiles of their students"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  public.is_admin()
  OR (public.has_role(auth.uid(), 'instructor') AND public.shares_course_as_instructor(user_id))
);