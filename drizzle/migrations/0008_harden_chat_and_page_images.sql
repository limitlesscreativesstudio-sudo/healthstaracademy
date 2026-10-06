DROP POLICY IF EXISTS "convo anon session" ON public.agent_conversations;
DROP POLICY IF EXISTS "msg via convo anon" ON public.agent_messages;
REVOKE ALL ON public.agent_conversations FROM anon;
REVOKE ALL ON public.agent_messages FROM anon;

DROP POLICY IF EXISTS "Authenticated upload page images" ON storage.objects;
CREATE POLICY "Staff upload page images" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'page-images' AND (public.is_admin() OR public.has_role(auth.uid(), 'instructor')));