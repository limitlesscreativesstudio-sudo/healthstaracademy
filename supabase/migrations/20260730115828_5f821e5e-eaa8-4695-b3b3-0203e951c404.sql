ALTER TABLE public.assignments
  ADD COLUMN IF NOT EXISTS available_from timestamptz,
  ADD COLUMN IF NOT EXISTS available_until timestamptz,
  ADD COLUMN IF NOT EXISTS allowed_attempts integer NOT NULL DEFAULT -1,
  ADD COLUMN IF NOT EXISTS display_grade_as text NOT NULL DEFAULT 'points',
  ADD COLUMN IF NOT EXISTS omit_from_final_grade boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS online_entry_options text[] NOT NULL DEFAULT ARRAY['text']::text[],
  ADD COLUMN IF NOT EXISTS is_group_assignment boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS peer_reviews boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS anonymous_grading boolean NOT NULL DEFAULT false;