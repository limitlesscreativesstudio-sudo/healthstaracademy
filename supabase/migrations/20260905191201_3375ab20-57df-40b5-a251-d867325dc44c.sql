CREATE POLICY "Instructors can read diagnostics findings"
ON public.agent_findings FOR SELECT TO authenticated
USING (agent = 'diagnostics' AND (public.is_admin() OR public.has_role(auth.uid(), 'instructor')));

CREATE POLICY "Instructors can clear diagnostics findings"
ON public.agent_findings FOR UPDATE TO authenticated
USING (agent = 'diagnostics' AND (public.is_admin() OR public.has_role(auth.uid(), 'instructor')))
WITH CHECK (agent = 'diagnostics' AND (public.is_admin() OR public.has_role(auth.uid(), 'instructor')));

SELECT cron.unschedule('portal-doctor-2h') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'portal-doctor-2h');

SELECT cron.schedule(
  'portal-doctor-2h',
  '15 */2 * * *',
  $$
  SELECT net.http_post(
    url := 'https://pguwdjjpeogrxldcrvof.supabase.co/functions/v1/agent-diagnostics',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := '{"courseId": null}'::jsonb
  );
  $$
);