CREATE TABLE IF NOT EXISTS public.cohort_deadline_reminders (
  id uuid primary key default gen_random_uuid(),
  cohort_id uuid not null references public.cohorts(id) on delete cascade,
  milestone_days integer not null,
  email text not null,
  sent_at timestamptz not null default now(),
  unique (cohort_id, milestone_days, email)
);

GRANT SELECT ON public.cohort_deadline_reminders TO authenticated;
GRANT ALL ON public.cohort_deadline_reminders TO service_role;

ALTER TABLE public.cohort_deadline_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and instructors can view deadline reminder log"
ON public.cohort_deadline_reminders FOR SELECT TO authenticated
USING (public.is_admin() OR public.has_role(auth.uid(), 'instructor'));

CREATE OR REPLACE FUNCTION public.user_id_by_email(_email text)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM auth.users WHERE lower(email) = lower(_email) LIMIT 1
$$;

REVOKE ALL ON FUNCTION public.user_id_by_email(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.user_id_by_email(text) TO service_role;