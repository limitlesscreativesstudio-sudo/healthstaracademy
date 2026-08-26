CREATE TABLE public.student_onboarding_progress (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  steps jsonb NOT NULL DEFAULT '{}'::jsonb,
  dismissed boolean NOT NULL DEFAULT false,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.student_onboarding_progress TO authenticated;
GRANT ALL ON public.student_onboarding_progress TO service_role;
ALTER TABLE public.student_onboarding_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students manage their own onboarding progress"
  ON public.student_onboarding_progress FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Staff can view onboarding progress"
  ON public.student_onboarding_progress FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'instructor'));

CREATE TRIGGER trg_onboarding_progress_updated_at
  BEFORE UPDATE ON public.student_onboarding_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.onboarding_reminder_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  milestone_days integer NOT NULL,
  channel text NOT NULL DEFAULT 'in_app',
  pending_steps jsonb,
  sent_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, milestone_days, channel)
);

GRANT SELECT ON public.onboarding_reminder_log TO authenticated;
GRANT ALL ON public.onboarding_reminder_log TO service_role;
ALTER TABLE public.onboarding_reminder_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view onboarding reminder log"
  ON public.onboarding_reminder_log FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.agent_job_state (
  job_name text PRIMARY KEY,
  status text NOT NULL DEFAULT 'active',
  lease_until timestamptz,
  last_run_at timestamptz,
  last_error text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.agent_job_state TO authenticated;
GRANT ALL ON public.agent_job_state TO service_role;
ALTER TABLE public.agent_job_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view job state"
  ON public.agent_job_state FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.agent_job_state (job_name, status) VALUES ('onboarding-reminders', 'active')
ON CONFLICT (job_name) DO NOTHING;