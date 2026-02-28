-- Fix function search paths for security
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.search_places_by_vibe(
  query_embedding vector(1536),
  match_count INT DEFAULT 10,
  filter_area area DEFAULT NULL,
  filter_vibe vibe_category DEFAULT NULL
)
RETURNS TABLE (
  place_id UUID,
  place_name TEXT,
  similarity FLOAT
) 
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT ON (p.id)
    p.id AS place_id,
    p.name AS place_name,
    1 - (r.embedding <=> query_embedding) AS similarity
  FROM public.reviews r
  JOIN public.places p ON r.place_id = p.id
  WHERE 
    r.embedding IS NOT NULL
    AND (filter_area IS NULL OR p.area = filter_area)
    AND (filter_vibe IS NULL OR p.primary_vibe = filter_vibe)
  ORDER BY p.id, r.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;