ALTER TABLE public.cohorts ADD COLUMN IF NOT EXISTS paid_in_full_link text DEFAULT '';
ALTER TABLE public.cohorts ADD COLUMN IF NOT EXISTS payment_plan_link text DEFAULT '';
ALTER TABLE public.cohorts ADD COLUMN IF NOT EXISTS program_type text DEFAULT 'daytime';