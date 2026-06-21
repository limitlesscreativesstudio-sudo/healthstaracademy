
-- 1. skill_signoffs: restrict SELECT
DROP POLICY IF EXISTS "signoffs read auth" ON public.skill_signoffs;
CREATE POLICY "signoffs read own or staff" ON public.skill_signoffs
  FOR SELECT TO authenticated
  USING (
    student_id = auth.uid()
    OR has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'instructor'::app_role)
  );

-- 2. audit_log: remove the open INSERT policy. The write_audit_log() trigger is
-- SECURITY DEFINER owned by postgres, which bypasses RLS, so triggers continue to work.
DROP POLICY IF EXISTS "audit insert all" ON public.audit_log;

-- 3. job_pipeline: allow instructors to view
CREATE POLICY "Instructors view job pipeline" ON public.job_pipeline
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'instructor'::app_role));
