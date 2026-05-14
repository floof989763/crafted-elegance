
-- New columns
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS courier_name text,
  ADD COLUMN IF NOT EXISTS estimated_delivery date,
  ADD COLUMN IF NOT EXISTS status_history jsonb NOT NULL DEFAULT '[]'::jsonb;

-- Trigger: decrement product stock when order_items rows are inserted
CREATE OR REPLACE FUNCTION public.decrement_product_stock()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.product_id IS NOT NULL THEN
    UPDATE public.products
       SET stock = GREATEST(stock - NEW.quantity, 0),
           updated_at = now()
     WHERE id = NEW.product_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_decrement_product_stock ON public.order_items;
CREATE TRIGGER trg_decrement_product_stock
AFTER INSERT ON public.order_items
FOR EACH ROW EXECUTE FUNCTION public.decrement_product_stock();

-- Trigger: append to status_history whenever orders.status changes (or on insert)
CREATE OR REPLACE FUNCTION public.append_order_status_history()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.status_history := COALESCE(NEW.status_history, '[]'::jsonb) ||
      jsonb_build_array(jsonb_build_object('status', NEW.status, 'at', now()));
  ELSIF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
    NEW.status_history := COALESCE(OLD.status_history, '[]'::jsonb) ||
      jsonb_build_array(jsonb_build_object('status', NEW.status, 'at', now()));
    NEW.updated_at := now();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_append_order_status_history ON public.orders;
CREATE TRIGGER trg_append_order_status_history
BEFORE INSERT OR UPDATE OF status ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.append_order_status_history();

-- Allow logged-in users to view their own order_items via tracking page
-- (already covered by existing policy "Users see own order items")
