ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS program text NOT NULL DEFAULT 'CNA';
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS status_note text;
ALTER TABLE public.courses ADD CONSTRAINT courses_program_check CHECK (program IN ('CNA','HHA'));
ALTER TABLE public.modules ADD COLUMN IF NOT EXISTS theory_hours numeric;
ALTER TABLE public.modules ADD COLUMN IF NOT EXISTS clinical_hours numeric;

CREATE OR REPLACE FUNCTION public.guard_unpublished_hha_course()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.program = 'HHA' AND NEW.status <> 'published' AND NEW.cohort_id IS NOT NULL THEN
    RAISE EXCEPTION 'HHA course is a draft and cannot be assigned to a cohort';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER guard_unpublished_hha_course BEFORE INSERT OR UPDATE ON public.courses
FOR EACH ROW EXECUTE FUNCTION public.guard_unpublished_hha_course();

CREATE OR REPLACE FUNCTION public.guard_hha_enrollment()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.role = 'student' AND EXISTS (SELECT 1 FROM public.courses c WHERE c.id = NEW.course_id AND c.program = 'HHA' AND c.status <> 'published') THEN
    RAISE EXCEPTION 'HHA course is a draft; students cannot be enrolled until an admin publishes it';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER guard_hha_enrollment BEFORE INSERT OR UPDATE ON public.enrollments
FOR EACH ROW EXECUTE FUNCTION public.guard_hha_enrollment();