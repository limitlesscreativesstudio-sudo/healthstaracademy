
-- Audit log for course nav visibility/order changes
CREATE TABLE public.course_nav_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL,
  changed_by uuid,
  changed_by_email text,
  old_visibility jsonb,
  new_visibility jsonb,
  old_order jsonb,
  new_order jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.course_nav_audit TO authenticated;
GRANT ALL ON public.course_nav_audit TO service_role;

ALTER TABLE public.course_nav_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Instructors and admins view course nav audit"
ON public.course_nav_audit FOR SELECT TO authenticated
USING (public.is_admin() OR public.is_instructor_of(course_id));

CREATE INDEX idx_course_nav_audit_course ON public.course_nav_audit(course_id, created_at DESC);

-- Trigger function
CREATE OR REPLACE FUNCTION public.log_course_nav_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text;
BEGIN
  IF (NEW.nav_visibility IS DISTINCT FROM OLD.nav_visibility)
     OR (NEW.nav_order IS DISTINCT FROM OLD.nav_order) THEN
    SELECT email INTO v_email FROM auth.users WHERE id = auth.uid();
    INSERT INTO public.course_nav_audit
      (course_id, changed_by, changed_by_email, old_visibility, new_visibility, old_order, new_order)
    VALUES
      (NEW.id, auth.uid(), v_email, OLD.nav_visibility, NEW.nav_visibility, OLD.nav_order, NEW.nav_order);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_log_course_nav_changes ON public.courses;
CREATE TRIGGER trg_log_course_nav_changes
AFTER UPDATE OF nav_visibility, nav_order ON public.courses
FOR EACH ROW EXECUTE FUNCTION public.log_course_nav_changes();
