ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS collection_tags text[] NOT NULL DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_products_collection_tags
ON public.products USING gin (collection_tags);