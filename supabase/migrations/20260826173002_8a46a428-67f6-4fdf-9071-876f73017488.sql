select cron.unschedule('onboarding-reminders-daily') where exists (
  select 1 from cron.job where jobname = 'onboarding-reminders-daily'
);

select cron.schedule(
  'onboarding-reminders-daily',
  '0 9 * * *',
  $$
  select net.http_post(
    url := 'https://pguwdjjpeogrxldcrvof.supabase.co/functions/v1/onboarding-reminders',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBndXdkampwZW9ncnhsZGNydm9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5NjkyNDUsImV4cCI6MjA4NjU0NTI0NX0.Ls1XUwIs_RNvencZ0pQhozYa4IyngotIZV08HPbtQu4"}'::jsonb,
    body := '{"source": "cron"}'::jsonb
  );
  $$
);