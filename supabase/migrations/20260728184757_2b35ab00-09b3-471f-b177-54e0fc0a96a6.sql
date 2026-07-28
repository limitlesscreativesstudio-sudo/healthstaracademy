CREATE TABLE IF NOT EXISTS public.portal_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL DEFAULT '(no subject)',
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  created_by UUID NOT NULL,
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.portal_conversation_participants (
  conversation_id UUID NOT NULL REFERENCES public.portal_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  last_read_at TIMESTAMPTZ,
  archived BOOLEAN NOT NULL DEFAULT false,
  starred BOOLEAN NOT NULL DEFAULT false,
  PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.portal_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.portal_conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pcp_user ON public.portal_conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_pm_convo ON public.portal_messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pc_last ON public.portal_conversations(last_message_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.portal_conversations TO authenticated;
GRANT ALL ON public.portal_conversations TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portal_conversation_participants TO authenticated;
GRANT ALL ON public.portal_conversation_participants TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portal_messages TO authenticated;
GRANT ALL ON public.portal_messages TO service_role;

ALTER TABLE public.portal_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_messages ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_conversation_participant(_convo UUID, _user UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.portal_conversation_participants
    WHERE conversation_id = _convo AND user_id = _user
  );
$$;

CREATE POLICY "participants view conversations"
ON public.portal_conversations FOR SELECT TO authenticated
USING (public.is_conversation_participant(id, auth.uid()));

CREATE POLICY "authed create conversations"
ON public.portal_conversations FOR INSERT TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "creator update conversations"
ON public.portal_conversations FOR UPDATE TO authenticated
USING (auth.uid() = created_by);

CREATE POLICY "own participant rows"
ON public.portal_conversation_participants FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.is_conversation_participant(conversation_id, auth.uid()));

CREATE POLICY "insert participants when in convo"
ON public.portal_conversation_participants FOR INSERT TO authenticated
WITH CHECK (
  user_id = auth.uid()
  OR EXISTS (SELECT 1 FROM public.portal_conversations c WHERE c.id = conversation_id AND c.created_by = auth.uid())
);

CREATE POLICY "update own participant row"
ON public.portal_conversation_participants FOR UPDATE TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "delete own participant row"
ON public.portal_conversation_participants FOR DELETE TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "participants view messages"
ON public.portal_messages FOR SELECT TO authenticated
USING (public.is_conversation_participant(conversation_id, auth.uid()));

CREATE POLICY "participants send messages"
ON public.portal_messages FOR INSERT TO authenticated
WITH CHECK (
  sender_id = auth.uid()
  AND public.is_conversation_participant(conversation_id, auth.uid())
);

CREATE OR REPLACE FUNCTION public.bump_conversation_last_message()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.portal_conversations
    SET last_message_at = NEW.created_at
    WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_bump_convo ON public.portal_messages;
CREATE TRIGGER trg_bump_convo
AFTER INSERT ON public.portal_messages
FOR EACH ROW EXECUTE FUNCTION public.bump_conversation_last_message();