
-- 1. Nested threading on discussion_replies
ALTER TABLE public.discussion_replies
  ADD COLUMN IF NOT EXISTS parent_reply_id UUID REFERENCES public.discussion_replies(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_discussion_replies_parent ON public.discussion_replies(parent_reply_id);

-- 2. Audit log for discussion deletions
CREATE TABLE IF NOT EXISTS public.discussion_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID,
  discussion_id UUID,
  reply_id UUID,
  action TEXT NOT NULL, -- 'delete_discussion' | 'delete_reply'
  actor_id UUID,
  actor_email TEXT,
  snapshot JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.discussion_audit TO authenticated;
GRANT ALL ON public.discussion_audit TO service_role;

ALTER TABLE public.discussion_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and course instructors view audit"
  ON public.discussion_audit FOR SELECT
  TO authenticated
  USING (public.is_admin() OR (course_id IS NOT NULL AND public.is_instructor_of(course_id)));

-- Trigger fns to write audit entries on delete
CREATE OR REPLACE FUNCTION public.audit_discussion_delete()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_email TEXT;
BEGIN
  SELECT email INTO v_email FROM auth.users WHERE id = auth.uid();
  INSERT INTO public.discussion_audit (course_id, discussion_id, action, actor_id, actor_email, snapshot)
  VALUES (OLD.course_id, OLD.id, 'delete_discussion', auth.uid(), v_email, to_jsonb(OLD));
  RETURN OLD;
END; $$;

CREATE OR REPLACE FUNCTION public.audit_reply_delete()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_email TEXT; v_course UUID;
BEGIN
  SELECT email INTO v_email FROM auth.users WHERE id = auth.uid();
  SELECT course_id INTO v_course FROM public.discussions WHERE id = OLD.discussion_id;
  INSERT INTO public.discussion_audit (course_id, discussion_id, reply_id, action, actor_id, actor_email, snapshot)
  VALUES (v_course, OLD.discussion_id, OLD.id, 'delete_reply', auth.uid(), v_email, to_jsonb(OLD));
  RETURN OLD;
END; $$;

DROP TRIGGER IF EXISTS trg_audit_discussion_delete ON public.discussions;
CREATE TRIGGER trg_audit_discussion_delete
  BEFORE DELETE ON public.discussions
  FOR EACH ROW EXECUTE FUNCTION public.audit_discussion_delete();

DROP TRIGGER IF EXISTS trg_audit_reply_delete ON public.discussion_replies;
CREATE TRIGGER trg_audit_reply_delete
  BEFORE DELETE ON public.discussion_replies
  FOR EACH ROW EXECUTE FUNCTION public.audit_reply_delete();
