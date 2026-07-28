
-- 1) portal_conversation_participants: restrict INSERT to creator/admin
DROP POLICY IF EXISTS "insert participants when in convo" ON public.portal_conversation_participants;
CREATE POLICY "insert participants creator or admin"
ON public.portal_conversation_participants
FOR INSERT TO authenticated
WITH CHECK (
  public.is_admin()
  OR EXISTS (
    SELECT 1 FROM public.portal_conversations c
    WHERE c.id = portal_conversation_participants.conversation_id
      AND c.created_by = auth.uid()
  )
);

-- 2) agent_conversations / agent_messages: anon must prove session_token via header
DROP POLICY IF EXISTS "convo anon session" ON public.agent_conversations;
CREATE POLICY "convo anon session"
ON public.agent_conversations
FOR ALL TO anon
USING (
  user_id IS NULL
  AND session_token IS NOT NULL
  AND session_token = current_setting('request.headers', true)::json->>'x-session-token'
)
WITH CHECK (
  user_id IS NULL
  AND session_token IS NOT NULL
  AND session_token = current_setting('request.headers', true)::json->>'x-session-token'
);

DROP POLICY IF EXISTS "msg via convo anon" ON public.agent_messages;
CREATE POLICY "msg via convo anon"
ON public.agent_messages
FOR ALL TO anon
USING (
  EXISTS (
    SELECT 1 FROM public.agent_conversations c
    WHERE c.id = agent_messages.conversation_id
      AND c.user_id IS NULL
      AND c.session_token IS NOT NULL
      AND c.session_token = current_setting('request.headers', true)::json->>'x-session-token'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.agent_conversations c
    WHERE c.id = agent_messages.conversation_id
      AND c.user_id IS NULL
      AND c.session_token IS NOT NULL
      AND c.session_token = current_setting('request.headers', true)::json->>'x-session-token'
  )
);

-- 3) profiles: remove broad read; only owner + admin (admin already covered by existing policy)
DROP POLICY IF EXISTS "Profiles viewable by authenticated" ON public.profiles;
CREATE POLICY "Users view own profile"
ON public.profiles
FOR SELECT TO authenticated
USING (auth.uid() = user_id);
