ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS home_page_type text NOT NULL DEFAULT 'modules',
  ADD COLUMN IF NOT EXISTS front_page_html text NOT NULL DEFAULT '';