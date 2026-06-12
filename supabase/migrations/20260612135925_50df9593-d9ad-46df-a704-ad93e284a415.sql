
CREATE TABLE public.auth_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  email TEXT,
  event_type TEXT NOT NULL,
  path TEXT,
  required_role TEXT,
  user_role TEXT,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.auth_audit_log TO authenticated;
GRANT ALL ON public.auth_audit_log TO service_role;

ALTER TABLE public.auth_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all audit logs"
  ON public.auth_audit_log FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert their own audit entries"
  ON public.auth_audit_log FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE INDEX idx_auth_audit_log_created_at ON public.auth_audit_log (created_at DESC);
CREATE INDEX idx_auth_audit_log_event_type ON public.auth_audit_log (event_type);
CREATE INDEX idx_auth_audit_log_user_id ON public.auth_audit_log (user_id);
