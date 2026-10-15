DROP FUNCTION IF EXISTS public.refresh_review_rating_aggregates(uuid, uuid);
DROP FUNCTION IF EXISTS public.refresh_review_rating_aggregates(text, uuid);

CREATE OR REPLACE FUNCTION public.refresh_review_rating_aggregates(
  target_seller_id text,
  target_listing_id text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF target_seller_id IS NOT NULL THEN
    UPDATE public.profiles
    SET rating = COALESCE(
          (SELECT AVG(r.rating) FROM public.reviews r WHERE r.seller_id = target_seller_id),
          0
        ),
        review_count = (
          SELECT COUNT(*)::integer FROM public.reviews r WHERE r.seller_id = target_seller_id
        )
    WHERE id = target_seller_id;

    UPDATE public.food_listings
    SET seller_rating = COALESCE(
      (SELECT p.rating FROM public.profiles p WHERE p.id = target_seller_id),
      0
    )
    WHERE seller_id = target_seller_id;
  END IF;

  IF target_listing_id IS NOT NULL THEN
    UPDATE public.food_listings
    SET rating = COALESCE(
          (SELECT AVG(r.rating) FROM public.reviews r WHERE r.listing_id = target_listing_id),
          0
        ),
        review_count = (
              SELECT COUNT(*)::integer FROM public.reviews r WHERE r.listing_id = target_listing_id
        )
            WHERE id::text = target_listing_id;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.refresh_review_rating_aggregates(text, text) FROM PUBLIC;

CREATE OR REPLACE FUNCTION public.sync_review_rating_aggregates()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP <> 'INSERT' THEN
    PERFORM public.refresh_review_rating_aggregates(OLD.seller_id, NULL);
    PERFORM public.refresh_review_rating_aggregates(NULL, OLD.listing_id);
  END IF;

  IF TG_OP <> 'DELETE' THEN
    PERFORM public.refresh_review_rating_aggregates(NEW.seller_id, NULL);
    PERFORM public.refresh_review_rating_aggregates(NULL, NEW.listing_id);
  END IF;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS sync_review_rating_aggregates_trigger ON public.reviews;
CREATE TRIGGER sync_review_rating_aggregates_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.sync_review_rating_aggregates();

CREATE OR REPLACE FUNCTION public.create_review_for_rated_order()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.is_rated IS TRUE AND OLD.is_rated IS DISTINCT FROM TRUE AND NEW.rating IS NOT NULL THEN
    INSERT INTO public.reviews (
      order_id,
      listing_id,
      buyer_id,
      seller_id,
      rating,
      comment,
      buyer_name,
      buyer_image,
      seller_name,
      dish_name
    )
    SELECT
      NEW.id::text,
      NEW.listing_id::text,
      NEW.buyer_id,
      NEW.seller_id,
      NEW.rating,
      COALESCE(NEW.review_comment, ''),
      NEW.buyer_name,
      p.avatar_url,
      NEW.seller_name,
      NEW.dish_name
    FROM public.profiles p
    WHERE p.id = NEW.buyer_id
      AND NOT EXISTS (
        SELECT 1 FROM public.reviews r WHERE r.order_id = NEW.id::text
      );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS create_review_for_rated_order_trigger ON public.orders;
CREATE TRIGGER create_review_for_rated_order_trigger
AFTER UPDATE OF is_rated ON public.orders
FOR EACH ROW
WHEN (NEW.is_rated IS TRUE AND OLD.is_rated IS DISTINCT FROM TRUE)
EXECUTE FUNCTION public.create_review_for_rated_order();

INSERT INTO public.reviews (
  order_id,
  listing_id,
  buyer_id,
  seller_id,
  rating,
  comment,
  buyer_name,
  buyer_image,
  seller_name,
  dish_name
)
SELECT
  o.id::text,
  o.listing_id::text,
  o.buyer_id,
  o.seller_id,
  o.rating,
  COALESCE(o.review_comment, ''),
  o.buyer_name,
  p.avatar_url,
  o.seller_name,
  o.dish_name
FROM public.orders o
JOIN public.profiles p ON p.id = o.buyer_id
WHERE o.is_rated IS TRUE
  AND o.rating IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.reviews r WHERE r.order_id = o.id::text
  );

DO $$
DECLARE
  seller_record record;
  listing_record record;
BEGIN
  FOR seller_record IN SELECT id FROM public.profiles LOOP
    PERFORM public.refresh_review_rating_aggregates(seller_record.id::text, NULL);
  END LOOP;

  FOR listing_record IN SELECT id, seller_id FROM public.food_listings LOOP
    PERFORM public.refresh_review_rating_aggregates(NULL, listing_record.id::text);
  END LOOP;
END;
$$;