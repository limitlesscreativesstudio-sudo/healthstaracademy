
CREATE TABLE public.career_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  org TEXT NOT NULL,
  location TEXT NOT NULL,
  type TEXT NOT NULL,
  wage TEXT,
  posted TEXT,
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  url TEXT NOT NULL,
  is_partner BOOLEAN NOT NULL DEFAULT false,
  source TEXT NOT NULL DEFAULT 'ai-refresh',
  active BOOLEAN NOT NULL DEFAULT true,
  last_refreshed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.career_jobs TO authenticated;
GRANT SELECT ON public.career_jobs TO anon;
GRANT ALL ON public.career_jobs TO service_role;

ALTER TABLE public.career_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active career jobs"
  ON public.career_jobs FOR SELECT
  USING (active = true);

CREATE POLICY "Admins can manage career jobs"
  ON public.career_jobs FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE INDEX idx_career_jobs_active ON public.career_jobs(active, last_refreshed_at DESC);
