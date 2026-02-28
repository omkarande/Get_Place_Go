-- Enable pgvector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- =============================================
-- VIBE ONTOLOGY: Core categories for place classification
-- =============================================
CREATE TYPE public.noise_level AS ENUM ('silent', 'quiet', 'moderate', 'lively', 'loud');
CREATE TYPE public.vibe_category AS ENUM ('work_study', 'social_dating', 'food_experience');
CREATE TYPE public.price_range AS ENUM ('budget', 'moderate', 'premium', 'luxury');
CREATE TYPE public.area AS ENUM ('baner', 'koregaon_park');

-- =============================================
-- USER PROFILES TABLE
-- =============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  preferred_vibes vibe_category[] DEFAULT '{}',
  preferred_areas area[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =============================================
-- PLACES TABLE: Core location data
-- =============================================
CREATE TABLE public.places (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  area area NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  google_place_id TEXT UNIQUE,
  
  -- Vibe attributes (computed from reviews + manual curation)
  noise_level noise_level DEFAULT 'moderate',
  is_work_friendly BOOLEAN DEFAULT false,
  has_wifi BOOLEAN DEFAULT false,
  has_power_outlets BOOLEAN DEFAULT false,
  is_pet_friendly BOOLEAN DEFAULT false,
  is_romantic BOOLEAN DEFAULT false,
  is_group_friendly BOOLEAN DEFAULT false,
  aesthetic_score INTEGER DEFAULT 5 CHECK (aesthetic_score >= 1 AND aesthetic_score <= 10),
  
  -- Categorization
  primary_vibe vibe_category,
  price_range price_range DEFAULT 'moderate',
  cuisine_type TEXT[],
  tags TEXT[] DEFAULT '{}',
  
  -- Media
  cover_image_url TEXT,
  images TEXT[] DEFAULT '{}',
  
  -- Metadata
  average_rating DECIMAL(2, 1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =============================================
-- REVIEWS TABLE: User and scraped reviews
-- =============================================
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id UUID REFERENCES public.places(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Review content
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  
  -- Vibe indicators (extracted via AI)
  detected_vibes vibe_category[] DEFAULT '{}',
  sentiment_score DECIMAL(3, 2) DEFAULT 0, -- -1 to 1
  
  -- Source tracking
  source TEXT DEFAULT 'user', -- 'user', 'google', 'zomato', 'swiggy'
  external_id TEXT,
  
  -- Vector embedding for semantic search
  embedding vector(1536),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =============================================
-- USER SEARCH HISTORY: For personalization
-- =============================================
CREATE TABLE public.search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  query TEXT NOT NULL,
  filters JSONB DEFAULT '{}',
  results_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =============================================
-- USER FAVORITES: Saved places
-- =============================================
CREATE TABLE public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  place_id UUID REFERENCES public.places(id) ON DELETE CASCADE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, place_id)
);

-- =============================================
-- ITINERARIES: AI-generated trip plans
-- =============================================
CREATE TABLE public.itineraries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  places UUID[] DEFAULT '{}',
  schedule JSONB DEFAULT '{}', -- Time slots with place assignments
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX idx_places_area ON public.places(area);
CREATE INDEX idx_places_primary_vibe ON public.places(primary_vibe);
CREATE INDEX idx_places_noise_level ON public.places(noise_level);
CREATE INDEX idx_places_is_work_friendly ON public.places(is_work_friendly);
CREATE INDEX idx_places_tags ON public.places USING GIN(tags);
CREATE INDEX idx_reviews_place_id ON public.reviews(place_id);
CREATE INDEX idx_reviews_embedding ON public.reviews USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX idx_search_history_user ON public.search_history(user_id);
CREATE INDEX idx_favorites_user ON public.favorites(user_id);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

-- Profiles: Users can only manage their own profile
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Places: Public read, admin write (for now, anyone can add)
ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Places are viewable by everyone" ON public.places
  FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can add places" ON public.places
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Reviews: Public read, users manage own reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are viewable by everyone" ON public.reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can create reviews" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews" ON public.reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews" ON public.reviews
  FOR DELETE USING (auth.uid() = user_id);

-- Search History: Private to user
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own search history" ON public.search_history
  FOR ALL USING (auth.uid() = user_id);

-- Favorites: Private to user
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own favorites" ON public.favorites
  FOR ALL USING (auth.uid() = user_id);

-- Itineraries: Owner or public
ALTER TABLE public.itineraries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view public itineraries or own" ON public.itineraries
  FOR SELECT USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can manage own itineraries" ON public.itineraries
  FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- TRIGGERS FOR AUTO-UPDATE TIMESTAMPS
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_places_updated_at
  BEFORE UPDATE ON public.places
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_itineraries_updated_at
  BEFORE UPDATE ON public.itineraries
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================
-- FUNCTION: Create profile on user signup
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- FUNCTION: Vector similarity search for vibes
-- =============================================
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
) AS $$
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
$$ LANGUAGE plpgsql;