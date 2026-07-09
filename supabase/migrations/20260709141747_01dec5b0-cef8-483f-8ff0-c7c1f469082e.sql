
CREATE TABLE public.blog_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent TEXT NOT NULL DEFAULT 'scribe',
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  meta_description TEXT,
  tldr TEXT,
  hero_image_url TEXT,
  target_keyword TEXT,
  target_city TEXT,
  category TEXT,
  read_time TEXT,
  body_markdown TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','scheduled','published','archived')),
  scheduled_for TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.blog_drafts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_drafts TO authenticated;
GRANT ALL ON public.blog_drafts TO service_role;

ALTER TABLE public.blog_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published posts"
  ON public.blog_drafts FOR SELECT
  USING (status = 'published');

CREATE POLICY "Admins full access"
  ON public.blog_drafts FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE TRIGGER update_blog_drafts_updated_at
  BEFORE UPDATE ON public.blog_drafts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_blog_drafts_status_published_at ON public.blog_drafts(status, published_at DESC);
