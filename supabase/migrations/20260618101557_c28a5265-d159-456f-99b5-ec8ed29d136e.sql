DROP POLICY IF EXISTS "Users can insert their own audit entries" ON public.auth_audit_log;

CREATE POLICY "Authenticated users insert own audit entries"
  ON public.auth_audit_log FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND (email IS NULL OR lower(email) = lower(coalesce(auth.email(), '')))
  );