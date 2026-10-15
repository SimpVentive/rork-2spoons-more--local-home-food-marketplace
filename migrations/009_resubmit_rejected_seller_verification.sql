DROP POLICY IF EXISTS "Sellers can update their pending verification"
  ON public.seller_verifications;

CREATE OR REPLACE FUNCTION public.resubmit_seller_verification(
  p_seller_id TEXT,
  p_fssai_document_url TEXT,
  p_ingredient_photos TEXT[],
  p_cooking_video_url TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR auth.uid()::text <> p_seller_id THEN
    RAISE EXCEPTION 'You can only resubmit your own verification.'
      USING ERRCODE = '42501';
  END IF;

  UPDATE public.seller_verifications
  SET fssai_document_url = p_fssai_document_url,
      ingredient_photos = COALESCE(p_ingredient_photos, '{}'),
      cooking_video_url = p_cooking_video_url,
      fssai_status = 'pending',
      rejection_reason = NULL,
      reviewed_by = NULL,
      reviewed_at = NULL,
      submitted_at = NOW(),
      updated_at = NOW()
  WHERE seller_id::text = p_seller_id
    AND fssai_status = 'rejected';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Only rejected verifications can be resubmitted.'
      USING ERRCODE = 'P0001';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.resubmit_seller_verification(TEXT, TEXT, TEXT[], TEXT)
  FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.resubmit_seller_verification(TEXT, TEXT, TEXT[], TEXT)
  TO authenticated;

NOTIFY pgrst, 'reload schema';
