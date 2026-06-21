
-- 1. Add color to courses
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS color text DEFAULT '#7B4DB5';

-- 2. Programs table
CREATE TABLE IF NOT EXISTS public.programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text,
  required_theory_hours numeric NOT NULL DEFAULT 0,
  required_clinical_hours numeric NOT NULL DEFAULT 0,
  regulating_body text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.programs TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.programs TO authenticated;
GRANT ALL ON public.programs TO service_role;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "programs read authenticated" ON public.programs
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "programs write admin/instructor" ON public.programs
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'instructor'));
CREATE POLICY "programs update admin/instructor" ON public.programs
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'instructor'));

ALTER TABLE public.cohorts ADD COLUMN IF NOT EXISTS program_id uuid REFERENCES public.programs(id);

-- 3. Hours on clinical_attendance (no plain `attendance` table exists; using clinical_attendance)
ALTER TABLE public.clinical_attendance ADD COLUMN IF NOT EXISTS hours numeric NOT NULL DEFAULT 0;
ALTER TABLE public.clinical_attendance ADD COLUMN IF NOT EXISTS session_type text NOT NULL DEFAULT 'theory';

-- 4. Skill definitions + signoffs
CREATE TABLE IF NOT EXISTS public.skill_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid REFERENCES public.programs(id),
  category text,
  name text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.skill_definitions TO authenticated;
GRANT ALL ON public.skill_definitions TO service_role;
ALTER TABLE public.skill_definitions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "skill_defs read auth" ON public.skill_definitions
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "skill_defs insert ai" ON public.skill_definitions
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'instructor'));
CREATE POLICY "skill_defs update ai" ON public.skill_definitions
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'instructor'));

CREATE TABLE IF NOT EXISTS public.skill_signoffs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  skill_id uuid NOT NULL REFERENCES public.skill_definitions(id) ON DELETE CASCADE,
  signed_off_by uuid REFERENCES public.profiles(id),
  signed_off_at timestamptz NOT NULL DEFAULT now(),
  notes text,
  UNIQUE (student_id, skill_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.skill_signoffs TO authenticated;
GRANT ALL ON public.skill_signoffs TO service_role;
ALTER TABLE public.skill_signoffs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "signoffs read auth" ON public.skill_signoffs
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "signoffs insert ai" ON public.skill_signoffs
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'instructor'));
CREATE POLICY "signoffs update ai" ON public.skill_signoffs
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'instructor'));

-- 5. Audit log (append-only)
CREATE TABLE IF NOT EXISTS public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text,
  record_id text,
  action text,
  changed_by uuid,
  changed_at timestamptz NOT NULL DEFAULT now(),
  old_values jsonb,
  new_values jsonb
);
GRANT SELECT, INSERT ON public.audit_log TO authenticated;
GRANT ALL ON public.audit_log TO service_role;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit select admin" ON public.audit_log
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "audit insert all" ON public.audit_log
  FOR INSERT TO authenticated WITH CHECK (true);
-- No UPDATE or DELETE policies => denied by RLS (append-only)

-- Audit trigger function
CREATE OR REPLACE FUNCTION public.write_audit_log()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_old jsonb;
  v_new jsonb;
  v_id text;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_old := to_jsonb(OLD); v_new := NULL; v_id := (to_jsonb(OLD)->>'id');
  ELSIF TG_OP = 'UPDATE' THEN
    v_old := to_jsonb(OLD); v_new := to_jsonb(NEW); v_id := (to_jsonb(NEW)->>'id');
  ELSE
    v_old := NULL; v_new := to_jsonb(NEW); v_id := (to_jsonb(NEW)->>'id');
  END IF;

  INSERT INTO public.audit_log (table_name, record_id, action, changed_by, old_values, new_values)
  VALUES (TG_TABLE_NAME, v_id, lower(TG_OP), auth.uid(), v_old, v_new);

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS audit_clinical_attendance ON public.clinical_attendance;
CREATE TRIGGER audit_clinical_attendance
  AFTER INSERT OR UPDATE OR DELETE ON public.clinical_attendance
  FOR EACH ROW EXECUTE FUNCTION public.write_audit_log();

DROP TRIGGER IF EXISTS audit_skill_signoffs ON public.skill_signoffs;
CREATE TRIGGER audit_skill_signoffs
  AFTER INSERT OR UPDATE OR DELETE ON public.skill_signoffs
  FOR EACH ROW EXECUTE FUNCTION public.write_audit_log();
