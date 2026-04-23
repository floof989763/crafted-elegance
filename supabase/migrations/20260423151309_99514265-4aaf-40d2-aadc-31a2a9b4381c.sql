-- Create public bucket for product/category images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Public can read images
DROP POLICY IF EXISTS "Public read product-images" ON storage.objects;
CREATE POLICY "Public read product-images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-images');

-- Admins can insert
DROP POLICY IF EXISTS "Admins insert product-images" ON storage.objects;
CREATE POLICY "Admins insert product-images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-images'
  AND public.has_role(auth.uid(), 'admin')
);

-- Admins can update
DROP POLICY IF EXISTS "Admins update product-images" ON storage.objects;
CREATE POLICY "Admins update product-images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'product-images'
  AND public.has_role(auth.uid(), 'admin')
);

-- Admins can delete
DROP POLICY IF EXISTS "Admins delete product-images" ON storage.objects;
CREATE POLICY "Admins delete product-images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-images'
  AND public.has_role(auth.uid(), 'admin')
);