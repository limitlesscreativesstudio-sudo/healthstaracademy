
ALTER TABLE public.blog_drafts ADD COLUMN IF NOT EXISTS hero_image_alt TEXT;

CREATE TABLE IF NOT EXISTS public.agent_config (
  agent TEXT PRIMARY KEY,
  auto_publish BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.agent_config TO authenticated;
GRANT ALL ON public.agent_config TO service_role;
ALTER TABLE public.agent_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "agent_config admin all" ON public.agent_config FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

INSERT INTO public.agent_config (agent, auto_publish) VALUES ('scribe', false)
  ON CONFLICT (agent) DO NOTHING;

CREATE POLICY "blog-images public read" ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'blog-images');
CREATE POLICY "blog-images admin manage" ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'blog-images' AND public.is_admin())
  WITH CHECK (bucket_id = 'blog-images' AND public.is_admin());
