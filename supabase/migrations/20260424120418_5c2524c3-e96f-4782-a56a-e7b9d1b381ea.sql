
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'site_content_key_unique'
  ) THEN
    ALTER TABLE public.site_content ADD CONSTRAINT site_content_key_unique UNIQUE (key);
  END IF;
END $$;
