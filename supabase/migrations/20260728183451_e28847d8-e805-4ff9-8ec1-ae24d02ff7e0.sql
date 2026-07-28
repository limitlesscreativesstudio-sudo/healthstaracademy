
CREATE TABLE IF NOT EXISTS public.user_account_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_prefs JSONB NOT NULL DEFAULT '{}'::jsonb,
  feature_flags JSONB NOT NULL DEFAULT '{}'::jsonb,
  contact_methods JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_account_settings TO authenticated;
GRANT ALL ON public.user_account_settings TO service_role;
ALTER TABLE public.user_account_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own settings read" ON public.user_account_settings FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own settings write" ON public.user_account_settings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own settings update" ON public.user_account_settings FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own settings delete" ON public.user_account_settings FOR DELETE TO authenticated USING (auth.uid() = user_id);
