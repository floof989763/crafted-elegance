
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS low_stock_threshold integer NOT NULL DEFAULT 3;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS dispatched_at timestamptz,
  ADD COLUMN IF NOT EXISTS delivered_at timestamptz;

CREATE OR REPLACE FUNCTION public.stamp_order_shipping_timestamps()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF NEW.dispatched_at IS NULL AND NEW.status IN ('dispatched','shipped','out_for_delivery','delivered') THEN
      NEW.dispatched_at := now();
    END IF;
    IF NEW.delivered_at IS NULL AND NEW.status = 'delivered' THEN
      NEW.delivered_at := now();
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_stamp_order_shipping_timestamps ON public.orders;
CREATE TRIGGER trg_stamp_order_shipping_timestamps
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.stamp_order_shipping_timestamps();
