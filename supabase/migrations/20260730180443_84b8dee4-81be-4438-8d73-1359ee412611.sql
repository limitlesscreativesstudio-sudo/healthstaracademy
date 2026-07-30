select cron.schedule(
  'due-date-reminders-daily',
  '0 16 * * *',
  $$
  SELECT net.http_post(
    url := 'https://pguwdjjpeogrxldcrvof.supabase.co/functions/v1/send-due-reminders',
    headers := '{"Content-Type":"application/json","apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBndXdkampwZW9ncnhsZGNydm9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5NjkyNDUsImV4cCI6MjA4NjU0NTI0NX0.Ls1XUwIs_RNvencZ0pQhozYa4IyngotIZV08HPbtQu4"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);