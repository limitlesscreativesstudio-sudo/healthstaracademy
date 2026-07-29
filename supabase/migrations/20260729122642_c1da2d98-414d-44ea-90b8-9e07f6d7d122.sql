DROP POLICY IF EXISTS "insert participants when in convo" ON public.portal_conversation_participants;

CREATE POLICY "creator adds participants"
ON public.portal_conversation_participants FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.portal_conversations c
    WHERE c.id = conversation_id AND c.created_by = auth.uid()
  )
);