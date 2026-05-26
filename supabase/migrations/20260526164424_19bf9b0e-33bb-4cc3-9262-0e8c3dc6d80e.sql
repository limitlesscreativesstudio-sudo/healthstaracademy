
INSERT INTO storage.buckets (id, name, public)
VALUES ('page-images', 'page-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read page images"
ON storage.objects FOR SELECT
USING (bucket_id = 'page-images');

CREATE POLICY "Authenticated upload page images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'page-images');

CREATE POLICY "Owners update page images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'page-images' AND owner = auth.uid());

CREATE POLICY "Owners delete page images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'page-images' AND owner = auth.uid());
