
-- agent_runs
CREATE TABLE public.agent_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'running',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ,
  summary TEXT,
  cost_credits NUMERIC,
  metadata JSONB DEFAULT '{}'::jsonb
);
GRANT SELECT ON public.agent_runs TO authenticated;
GRANT ALL ON public.agent_runs TO service_role;
ALTER TABLE public.agent_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "agent_runs admin read" ON public.agent_runs FOR SELECT TO authenticated USING (public.is_admin());

-- agent_findings
CREATE TABLE public.agent_findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent TEXT NOT NULL,
  run_id UUID REFERENCES public.agent_runs(id) ON DELETE SET NULL,
  severity TEXT NOT NULL DEFAULT 'info',
  title TEXT NOT NULL,
  detail TEXT,
  suggested_fix TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  target_table TEXT,
  target_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID
);
GRANT SELECT, UPDATE ON public.agent_findings TO authenticated;
GRANT ALL ON public.agent_findings TO service_role;
ALTER TABLE public.agent_findings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "agent_findings admin all" ON public.agent_findings FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- agent_actions
CREATE TABLE public.agent_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID REFERENCES public.agent_runs(id) ON DELETE SET NULL,
  agent TEXT NOT NULL,
  action_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  requires_approval BOOLEAN NOT NULL DEFAULT true,
  approved_by UUID,
  applied_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.agent_actions TO authenticated;
GRANT ALL ON public.agent_actions TO service_role;
ALTER TABLE public.agent_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "agent_actions admin all" ON public.agent_actions FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- agent_conversations
CREATE TABLE public.agent_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent TEXT NOT NULL,
  user_id UUID,
  session_token TEXT,
  title TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.agent_conversations TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.agent_conversations TO anon;
GRANT ALL ON public.agent_conversations TO service_role;
ALTER TABLE public.agent_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "convo own user" ON public.agent_conversations FOR ALL TO authenticated
  USING (user_id = auth.uid() OR public.is_admin()) WITH CHECK (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "convo anon session" ON public.agent_conversations FOR ALL TO anon
  USING (user_id IS NULL AND session_token IS NOT NULL) WITH CHECK (user_id IS NULL AND session_token IS NOT NULL);

-- agent_messages
CREATE TABLE public.agent_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.agent_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  parts JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.agent_messages TO authenticated;
GRANT SELECT, INSERT ON public.agent_messages TO anon;
GRANT ALL ON public.agent_messages TO service_role;
ALTER TABLE public.agent_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "msg via convo auth" ON public.agent_messages FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.agent_conversations c WHERE c.id = conversation_id AND (c.user_id = auth.uid() OR public.is_admin())))
  WITH CHECK (EXISTS (SELECT 1 FROM public.agent_conversations c WHERE c.id = conversation_id AND (c.user_id = auth.uid() OR public.is_admin())));
CREATE POLICY "msg via convo anon" ON public.agent_messages FOR ALL TO anon
  USING (EXISTS (SELECT 1 FROM public.agent_conversations c WHERE c.id = conversation_id AND c.user_id IS NULL))
  WITH CHECK (EXISTS (SELECT 1 FROM public.agent_conversations c WHERE c.id = conversation_id AND c.user_id IS NULL));

CREATE INDEX agent_messages_convo_idx ON public.agent_messages(conversation_id, created_at);

-- gbp_posts
CREATE TABLE public.gbp_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent TEXT NOT NULL DEFAULT 'broadcaster',
  title TEXT,
  body TEXT NOT NULL,
  cta_label TEXT,
  cta_url TEXT,
  image_url TEXT,
  scheduled_for DATE,
  status TEXT NOT NULL DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gbp_posts TO authenticated;
GRANT ALL ON public.gbp_posts TO service_role;
ALTER TABLE public.gbp_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gbp admin all" ON public.gbp_posts FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TRIGGER gbp_posts_updated_at BEFORE UPDATE ON public.gbp_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER agent_convo_updated_at BEFORE UPDATE ON public.agent_conversations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
