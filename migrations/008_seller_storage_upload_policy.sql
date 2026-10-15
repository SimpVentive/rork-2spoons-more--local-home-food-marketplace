DROP POLICY IF EXISTS "Sellers can upload their own verification media"
  ON storage.objects;
CREATE POLICY "Sellers can upload their own verification media"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id IN ('seller-documents', 'seller-photos', 'seller-videos')
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Admins can view seller verification media"
  ON storage.objects;
CREATE POLICY "Admins can view seller verification media"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id IN ('seller-documents', 'seller-photos', 'seller-videos')
    AND EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id::text = auth.uid()::text
        AND p.is_admin IS TRUE
    )
  );
