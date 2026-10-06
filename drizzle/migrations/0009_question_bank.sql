CREATE TABLE public.question_bank (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_key text NOT NULL,
  module_number integer,
  kind text NOT NULL DEFAULT 'quiz',
  scenario text,
  prompt text NOT NULL,
  question_type text NOT NULL DEFAULT 'multiple_choice',
  options jsonb NOT NULL DEFAULT '[]'::jsonb,
  correct_answer jsonb NOT NULL,
  source_doc text,
  verified boolean NOT NULL DEFAULT true,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX question_bank_key_idx ON public.question_bank(bank_key) WHERE active AND verified;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.question_bank TO authenticated;
GRANT ALL ON public.question_bank TO service_role;
ALTER TABLE public.question_bank ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff manage question bank" ON public.question_bank FOR ALL TO authenticated
  USING (public.is_admin() OR public.has_role(auth.uid(),'instructor'))
  WITH CHECK (public.is_admin() OR public.has_role(auth.uid(),'instructor'));
ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS bank_key text;
COMMENT ON COLUMN public.quizzes.bank_key IS 'When set, duplicate-course draws this quiz''s questions at random from question_bank rows with the same bank_key.';
CREATE TABLE public.question_swap_backup_20261006 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid, quiz_id uuid, old_row jsonb, changed_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.question_swap_backup_20261006 TO service_role;
ALTER TABLE public.question_swap_backup_20261006 ENABLE ROW LEVEL SECURITY;