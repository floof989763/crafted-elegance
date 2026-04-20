INSERT INTO public.categories (name, slug, sort_order, description) VALUES
  ('Frames', 'frames', 8, 'Hand-carved wooden picture frames in walnut, teak and sheesham.')
ON CONFLICT (slug) DO NOTHING;