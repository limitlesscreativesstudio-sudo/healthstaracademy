-- 1. Permanent retention of student academic records
CREATE OR REPLACE FUNCTION public.block_record_deletion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF current_user IN ('service_role', 'postgres', 'supabase_admin') THEN
    RETURN OLD;
  END IF;
  RAISE EXCEPTION 'Student records are retained for 4 years for CDPH review and cannot be deleted. Correct the record instead.'
    USING ERRCODE = 'check_violation';
END;
$$;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'quiz_attempts','grades','attendance','submissions','clinical_hours',
    'clinical_attendance','student_skill_signoffs','rubric_scores','students'
  ] LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_retain_%1$s ON public.%1$I', t);
    EXECUTE format('CREATE TRIGGER trg_retain_%1$s BEFORE DELETE ON public.%1$I FOR EACH ROW EXECUTE FUNCTION public.block_record_deletion()', t);
  END LOOP;

  FOREACH t IN ARRAY ARRAY[
    'quiz_attempts','grades','attendance','submissions','clinical_hours',
    'clinical_attendance','student_skill_signoffs','rubric_scores','students','enrollments'
  ] LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_audit_%1$s ON public.%1$I', t);
    EXECUTE format('CREATE TRIGGER trg_audit_%1$s AFTER INSERT OR UPDATE OR DELETE ON public.%1$I FOR EACH ROW EXECUTE FUNCTION public.write_audit_log()', t);
  END LOOP;
END $$;

-- 2. One open finding per issue (no duplicate admin alerts)
DELETE FROM public.agent_findings f
USING public.agent_findings k
WHERE f.status = 'open' AND k.status = 'open'
  AND f.agent = k.agent AND f.title = k.title
  AND COALESCE(f.target_id,'') = COALESCE(k.target_id,'')
  AND f.created_at < k.created_at;

CREATE UNIQUE INDEX IF NOT EXISTS agent_findings_open_unique
  ON public.agent_findings (agent, title, COALESCE(target_id, ''))
  WHERE status = 'open';