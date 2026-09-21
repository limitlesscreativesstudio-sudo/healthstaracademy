CREATE TABLE IF NOT EXISTS public.agent_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent text NOT NULL DEFAULT 'agent',
  subject text NOT NULL,
  html text NOT NULL,
  mode text NOT NULL DEFAULT 'digest',
  created_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz
);

GRANT SELECT ON public.agent_notifications TO authenticated;
GRANT ALL ON public.agent_notifications TO service_role;

ALTER TABLE public.agent_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view agent notifications" ON public.agent_notifications;
CREATE POLICY "Admins can view agent notifications"
ON public.agent_notifications FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS agent_notifications_pending_idx
  ON public.agent_notifications (created_at) WHERE sent_at IS NULL;