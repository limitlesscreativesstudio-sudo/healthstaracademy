SELECT cron.unschedule('portal-doctor-2h');

SELECT cron.schedule(
  'portal-doctor-2h',
  '15 */2 * * *',
  $$
  SELECT net.http_post(
    url := 'https://pguwdjjpeogrxldcrvof.supabase.co/functions/v1/agent-diagnostics',
    headers := '{"Content-Type":"application/json","apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBndXdkampwZW9ncnhsZGNydm9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5NjkyNDUsImV4cCI6MjA4NjU0NTI0NX0.Ls1XUwIs_RNvencZ0pQhozYa4IyngotIZV08HPbtQu4"}'::jsonb,
    body := '{"scheduled": true, "courseId": null}'::jsonb
  );
  $$
);

INSERT INTO public.agent_job_state (job_name, status)
VALUES ('portal-doctor', 'idle')
ON CONFLICT (job_name) DO NOTHING;