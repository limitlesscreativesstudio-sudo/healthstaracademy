-- De-duplicate any existing rows before enforcing the unique constraint
WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY lower(email) ORDER BY updated_at DESC NULLS LAST, created_at DESC NULLS LAST) AS rn
  FROM public.students
)
DELETE FROM public.students s USING ranked r WHERE s.id = r.id AND r.rn > 1;

-- Enforce case-insensitive uniqueness via a unique index on lower(email)
-- and a plain unique constraint on email so ON CONFLICT (email) works.
UPDATE public.students SET email = lower(email) WHERE email <> lower(email);
ALTER TABLE public.students ADD CONSTRAINT students_email_key UNIQUE (email);