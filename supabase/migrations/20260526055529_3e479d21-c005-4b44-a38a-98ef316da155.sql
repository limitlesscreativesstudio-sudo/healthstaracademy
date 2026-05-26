
ALTER TABLE public.cohorts
  ADD COLUMN IF NOT EXISTS clinical_site text DEFAULT '',
  ADD COLUMN IF NOT EXISTS enrollment_deadline date,
  ADD COLUMN IF NOT EXISTS min_to_run integer,
  ADD COLUMN IF NOT EXISTS notes text DEFAULT '';

UPDATE public.cohorts SET min_to_run = 15 WHERE program_type = 'weekend' AND min_to_run IS NULL;
