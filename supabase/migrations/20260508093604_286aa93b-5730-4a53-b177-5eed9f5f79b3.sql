ALTER TABLE public.products ALTER COLUMN currency SET DEFAULT 'inr';
UPDATE public.products SET currency = 'inr' WHERE currency = 'usd';