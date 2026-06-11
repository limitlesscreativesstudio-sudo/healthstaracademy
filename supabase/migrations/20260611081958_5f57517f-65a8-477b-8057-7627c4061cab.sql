ALTER TABLE public.cohorts
  ADD COLUMN IF NOT EXISTS is_template boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS template_source_id uuid REFERENCES public.cohorts(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS cohorts_is_template_idx ON public.cohorts(is_template) WHERE is_template = true;