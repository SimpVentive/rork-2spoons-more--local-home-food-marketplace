ALTER TABLE public.seller_verifications
  ADD COLUMN IF NOT EXISTS ingredient_photos TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS cooking_video_url TEXT;

CREATE OR REPLACE VIEW public.pending_seller_verifications AS
SELECT
  sv.id,
  sv.seller_id,
  p.name,
  p.email,
  p.phone,
  sv.fssai_document_url,
  sv.submitted_at,
  sv.fssai_status,
  sv.ingredient_photos,
  sv.cooking_video_url
FROM public.seller_verifications sv
JOIN public.profiles p ON sv.seller_id::text = p.id::text
WHERE sv.fssai_status = 'pending'
ORDER BY sv.submitted_at DESC;

DROP POLICY IF EXISTS "Sellers can submit their own verification"
  ON public.seller_verifications;
CREATE POLICY "Sellers can submit their own verification"
  ON public.seller_verifications
  FOR INSERT
  WITH CHECK (auth.uid()::text = seller_id::text);

DROP POLICY IF EXISTS "Sellers can update their pending verification"
  ON public.seller_verifications;
CREATE POLICY "Sellers can update their pending verification"
  ON public.seller_verifications
  FOR UPDATE
  USING (auth.uid()::text = seller_id::text AND fssai_status = 'pending')
  WITH CHECK (auth.uid()::text = seller_id::text AND fssai_status = 'pending');

NOTIFY pgrst, 'reload schema';
