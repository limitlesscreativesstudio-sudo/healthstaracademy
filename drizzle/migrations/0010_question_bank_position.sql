ALTER TABLE public.question_bank ADD COLUMN IF NOT EXISTS position integer NOT NULL DEFAULT 0;
ALTER TABLE public.question_bank ADD COLUMN IF NOT EXISTS points numeric NOT NULL DEFAULT 1;