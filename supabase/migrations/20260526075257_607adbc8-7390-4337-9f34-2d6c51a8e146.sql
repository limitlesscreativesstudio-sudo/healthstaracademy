REVOKE EXECUTE ON FUNCTION public.fanout_announcement_notifications() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.notify_submission_received() FROM anon, authenticated, public;