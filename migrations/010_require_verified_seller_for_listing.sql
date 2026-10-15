CREATE OR REPLACE FUNCTION public.require_verified_seller_for_listing()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  seller_is_admin BOOLEAN;
  seller_is_chef BOOLEAN;
  seller_fssai_status TEXT;
BEGIN
  IF auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF auth.uid() IS NULL OR NEW.seller_id::text <> auth.uid()::text THEN
    RAISE EXCEPTION 'Listings must be created for the signed-in user.'
      USING ERRCODE = '42501';
  END IF;

  SELECT COALESCE(p.is_admin, FALSE), COALESCE(p.is_chef, FALSE), p.fssai_status
  INTO seller_is_admin, seller_is_chef, seller_fssai_status
  FROM public.profiles p
  WHERE p.id::text = auth.uid()::text;

  IF seller_is_admin THEN
    RETURN NEW;
  END IF;

  IF NOT seller_is_chef OR seller_fssai_status IS DISTINCT FROM 'approved' THEN
    RAISE EXCEPTION 'Only verified sellers can create listings.'
      USING ERRCODE = '42501';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.seller_verifications sv
    WHERE sv.seller_id::text = auth.uid()::text
      AND sv.fssai_status = 'approved'
      AND NULLIF(BTRIM(sv.fssai_document_url), '') IS NOT NULL
      AND COALESCE(cardinality(sv.ingredient_photos), 0) > 0
  ) THEN
    RAISE EXCEPTION 'Approved seller documents are required before creating listings.'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS require_verified_seller_before_listing_insert
  ON public.food_listings;
CREATE TRIGGER require_verified_seller_before_listing_insert
  BEFORE INSERT ON public.food_listings
  FOR EACH ROW
  EXECUTE FUNCTION public.require_verified_seller_for_listing();
