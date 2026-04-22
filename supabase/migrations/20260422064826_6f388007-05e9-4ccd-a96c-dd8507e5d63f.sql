
-- =========================================
-- REVIEWS
-- =========================================
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  reviewer_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT NOT NULL,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (product_id, user_id)
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved reviews are public" ON public.reviews
  FOR SELECT USING (is_approved = true);

CREATE POLICY "Users see their own reviews" ON public.reviews
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins see all reviews" ON public.reviews
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users insert own review" ON public.reviews
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = user_id
    AND length(trim(comment)) BETWEEN 1 AND 2000
    AND length(trim(reviewer_name)) BETWEEN 1 AND 120
  );

CREATE POLICY "Users update own pending review" ON public.reviews
  FOR UPDATE TO authenticated USING (auth.uid() = user_id AND is_approved = false);

CREATE POLICY "Users delete own review" ON public.reviews
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins manage reviews" ON public.reviews
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE TRIGGER reviews_updated_at BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_reviews_product ON public.reviews(product_id, is_approved);

-- =========================================
-- CARTS
-- =========================================
CREATE TABLE public.carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  session_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_carts_user ON public.carts(user_id) WHERE user_id IS NOT NULL;
CREATE UNIQUE INDEX idx_carts_session ON public.carts(session_id) WHERE session_id IS NOT NULL;

ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own cart" ON public.carts
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own cart" ON public.carts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own cart" ON public.carts
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own cart" ON public.carts
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins see all carts" ON public.carts
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));

CREATE TABLE public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (cart_id, product_id)
);

ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own cart items" ON public.cart_items
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.carts c WHERE c.id = cart_id AND c.user_id = auth.uid())
  );
CREATE POLICY "Users insert own cart items" ON public.cart_items
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.carts c WHERE c.id = cart_id AND c.user_id = auth.uid())
  );
CREATE POLICY "Users update own cart items" ON public.cart_items
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.carts c WHERE c.id = cart_id AND c.user_id = auth.uid())
  );
CREATE POLICY "Users delete own cart items" ON public.cart_items
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.carts c WHERE c.id = cart_id AND c.user_id = auth.uid())
  );
CREATE POLICY "Admins see all cart items" ON public.cart_items
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));

-- =========================================
-- ORDERS — extend existing
-- =========================================
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_method TEXT NOT NULL DEFAULT 'cod',
  ADD COLUMN IF NOT EXISTS customer_name TEXT,
  ADD COLUMN IF NOT EXISTS customer_phone TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS tracking_number TEXT;

ALTER TABLE public.orders ALTER COLUMN currency SET DEFAULT 'inr';

-- Allow guest order creation with strict validation
CREATE POLICY "Anyone can create order" ON public.orders
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    length(trim(email)) BETWEEN 3 AND 255
    AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND length(trim(coalesce(customer_name, ''))) BETWEEN 1 AND 200
    AND total_cents > 0
    AND payment_method IN ('stripe', 'cod')
    AND status IN ('pending', 'awaiting_payment')
  );

CREATE POLICY "Anyone can insert order items" ON public.order_items
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    quantity > 0
    AND unit_price_cents > 0
    AND length(trim(product_name)) BETWEEN 1 AND 300
  );

-- =========================================
-- SHIPPING ADDRESSES
-- =========================================
CREATE TABLE public.shipping_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  label TEXT,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'India',
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.shipping_addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own addresses" ON public.shipping_addresses
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins read addresses" ON public.shipping_addresses
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));

CREATE TRIGGER shipping_addresses_updated_at BEFORE UPDATE ON public.shipping_addresses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================
-- SITE CONTENT (editable text blocks)
-- =========================================
CREATE TABLE public.site_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site content public read" ON public.site_content
  FOR SELECT USING (true);
CREATE POLICY "Admins manage site content" ON public.site_content
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE TRIGGER site_content_updated_at BEFORE UPDATE ON public.site_content
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================
-- JOURNAL ENTRIES
-- =========================================
CREATE TABLE public.journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  cover_image TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published journal public" ON public.journal_entries
  FOR SELECT USING (is_published = true);
CREATE POLICY "Admins manage journal" ON public.journal_entries
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE TRIGGER journal_updated_at BEFORE UPDATE ON public.journal_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================
-- Seed initial site content
-- =========================================
INSERT INTO public.site_content (key, value) VALUES
  ('hero', '{"eyebrow":"Atelier of Wood","headline":"The Woods","subhead":"Heirloom wooden objects, carved by hand in Saharanpur."}'::jsonb),
  ('about_intro', '{"title":"The Atelier","body":"Five generations of woodcraft, distilled into objects worthy of inheritance."}'::jsonb),
  ('contact_info', '{"address":"Nakhasa Bazar, Saharanpur, Uttar Pradesh","phone":"+91 70557 62173","email":"mohumar20052004@gmail.com","hours":"Mon–Sat, 10am–7pm IST"}'::jsonb)
ON CONFLICT (key) DO NOTHING;
