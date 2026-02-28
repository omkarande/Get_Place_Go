# Database Schema & Security — Get Place Go

> **Last Updated:** February 25, 2026  
> **Engine:** PostgreSQL (via Supabase/Lovable Cloud)  
> **Extensions:** pgvector (vector similarity search)

---

## Table of Contents

1. [Schema Overview](#schema-overview)
2. [Table Definitions](#table-definitions)
3. [Enums](#enums)
4. [Row-Level Security (RLS)](#row-level-security-rls)
5. [Database Functions & Triggers](#database-functions--triggers)
6. [Vector Search](#vector-search)

---

## Schema Overview

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   profiles   │     │    places    │     │   reviews    │
│ (user data)  │     │ (locations)  │◄────│ (user + AI)  │
│              │     │              │     │ + embeddings │
└──────┬───────┘     └──────┬───────┘     └──────────────┘
       │                    │
       │              ┌─────┴─────┐
       │              │           │
       ▼              ▼           ▼
┌──────────────┐ ┌──────────┐ ┌──────────────┐
│  favorites   │ │itineraries│ │search_history│
│ (saved)      │ │(trips)    │ │ (analytics)  │
└──────────────┘ └──────────┘ └──────────────┘
```

---

## Table Definitions

### `places` — Core location data

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | No | `gen_random_uuid()` | Primary key |
| `name` | text | No | — | Place name |
| `slug` | text | No | — | URL-friendly name (unique) |
| `description` | text | Yes | — | About this place |
| `address` | text | No | — | Full street address |
| `area` | enum `area` | No | — | `baner` or `koregaon_park` |
| `latitude` | numeric | Yes | — | GPS coordinate |
| `longitude` | numeric | Yes | — | GPS coordinate |
| `google_place_id` | text | Yes | — | Google Maps integration |
| `noise_level` | enum `noise_level` | Yes | `moderate` | Sound level |
| `is_work_friendly` | boolean | Yes | `false` | Good for remote work |
| `has_wifi` | boolean | Yes | `false` | WiFi available |
| `has_power_outlets` | boolean | Yes | `false` | Charging spots |
| `is_pet_friendly` | boolean | Yes | `false` | Pets allowed |
| `is_romantic` | boolean | Yes | `false` | Date-worthy |
| `is_group_friendly` | boolean | Yes | `false` | Good for groups |
| `aesthetic_score` | integer | Yes | `5` | Visual appeal (1-10) |
| `primary_vibe` | enum `vibe_category` | Yes | — | Main category |
| `price_range` | enum `price_range` | Yes | `moderate` | Cost level |
| `cuisine_type` | text[] | Yes | — | Food types |
| `tags` | text[] | Yes | `{}` | Searchable tags |
| `cover_image_url` | text | Yes | — | Hero image URL |
| `images` | text[] | Yes | `{}` | Additional image URLs |
| `average_rating` | numeric | Yes | `0` | Computed average |
| `review_count` | integer | Yes | `0` | Total reviews |
| `is_active` | boolean | Yes | `true` | Soft delete flag |
| `created_at` | timestamptz | No | `now()` | Created timestamp |
| `updated_at` | timestamptz | No | `now()` | Last modified |

---

### `reviews` — User and scraped reviews with vector embeddings

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | No | `gen_random_uuid()` | Primary key |
| `place_id` | uuid | No | — | FK → `places.id` |
| `user_id` | uuid | Yes | — | Auth user (null for scraped) |
| `content` | text | No | — | Review text |
| `rating` | integer | Yes | — | 1-5 star rating |
| `detected_vibes` | vibe_category[] | Yes | `{}` | AI-detected vibes |
| `sentiment_score` | numeric | Yes | `0` | AI sentiment (-1 to 1) |
| `embedding` | vector(1536) | Yes | — | Text embedding for RAG |
| `source` | text | Yes | `user` | `user` or `google` etc. |
| `external_id` | text | Yes | — | ID from external source |
| `created_at` | timestamptz | No | `now()` | Created timestamp |
| `updated_at` | timestamptz | No | `now()` | Last modified |

---

### `profiles` — Extended user information

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | No | `gen_random_uuid()` | Primary key |
| `user_id` | uuid | No | — | Auth user ID (unique) |
| `display_name` | text | Yes | — | Shown in UI |
| `avatar_url` | text | Yes | — | Profile picture |
| `preferred_vibes` | vibe_category[] | Yes | `{}` | User preferences |
| `preferred_areas` | area[] | Yes | `{}` | Favorite neighborhoods |
| `created_at` | timestamptz | No | `now()` | Created timestamp |
| `updated_at` | timestamptz | No | `now()` | Last modified |

---

### `favorites` — User's saved places

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | No | `gen_random_uuid()` | Primary key |
| `user_id` | uuid | No | — | Auth user ID |
| `place_id` | uuid | No | — | FK → `places.id` |
| `notes` | text | Yes | — | Personal notes |
| `created_at` | timestamptz | No | `now()` | When favorited |

---

### `itineraries` — User trip plans

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | No | `gen_random_uuid()` | Primary key |
| `user_id` | uuid | No | — | Auth user ID |
| `title` | text | No | — | Trip name |
| `description` | text | Yes | — | Trip description |
| `places` | uuid[] | Yes | `{}` | Ordered place IDs |
| `schedule` | jsonb | Yes | `{}` | `{placeId: {time_slot, notes}}` |
| `is_public` | boolean | Yes | `false` | Shareable flag |
| `created_at` | timestamptz | No | `now()` | Created timestamp |
| `updated_at` | timestamptz | No | `now()` | Last modified |

---

### `search_history` — Analytics/logging

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | No | `gen_random_uuid()` | Primary key |
| `user_id` | uuid | No | — | Auth user ID |
| `query` | text | No | — | Search query text |
| `filters` | jsonb | Yes | `{}` | Applied filters |
| `results_count` | integer | Yes | `0` | Number of results |
| `created_at` | timestamptz | No | `now()` | When searched |

---

## Enums

| Enum | Values |
|------|--------|
| `area` | `baner`, `koregaon_park` |
| `noise_level` | `silent`, `quiet`, `moderate`, `lively`, `loud` |
| `price_range` | `budget`, `moderate`, `premium`, `luxury` |
| `vibe_category` | `work_study`, `social_dating`, `food_experience` |

---

## Row-Level Security (RLS)

All tables have RLS enabled. Policies summary:

### `places`
| Policy | Command | Rule |
|--------|---------|------|
| Places are viewable by everyone | SELECT | `is_active = true` |
| Authenticated users can add places | INSERT | `auth.uid() IS NOT NULL` |
| _(No UPDATE/DELETE policies)_ | — | Places are admin-managed |

### `reviews`
| Policy | Command | Rule |
|--------|---------|------|
| Reviews are viewable by everyone | SELECT | `true` |
| Users can create reviews | INSERT | `auth.uid() = user_id` |
| Users can update own reviews | UPDATE | `auth.uid() = user_id` |
| Users can delete own reviews | DELETE | `auth.uid() = user_id` |

### `favorites`
| Policy | Command | Rule |
|--------|---------|------|
| Users can manage own favorites | ALL | `auth.uid() = user_id` |

### `itineraries`
| Policy | Command | Rule |
|--------|---------|------|
| Users can manage own itineraries | ALL | `auth.uid() = user_id` |
| Users can view public itineraries or own | SELECT | `is_public = true OR auth.uid() = user_id` |

### `profiles`
| Policy | Command | Rule |
|--------|---------|------|
| Authenticated users can view profiles | SELECT | `auth.uid() IS NOT NULL` |
| Users can insert own profile | INSERT | `auth.uid() = user_id` |
| Users can update own profile | UPDATE | `auth.uid() = user_id` |

### `search_history`
| Policy | Command | Rule |
|--------|---------|------|
| Users can manage own search history | ALL | `auth.uid() = user_id` |

---

## Database Functions & Triggers

### `handle_new_user()` — Auto-create profile on signup
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```
- Triggered on `auth.users` INSERT
- Creates a `profiles` row with `display_name` from metadata or email

### `handle_updated_at()` — Auto-update timestamps
```sql
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### `search_places_by_vibe()` — Vector similarity search
```sql
CREATE OR REPLACE FUNCTION public.search_places_by_vibe(
  query_embedding vector,
  match_count integer DEFAULT 10,
  filter_area area DEFAULT NULL,
  filter_vibe vibe_category DEFAULT NULL
) RETURNS TABLE(place_id uuid, place_name text, similarity double precision)
```
- Uses cosine distance (`<=>`) on review embeddings
- Joins with places table for filtering
- Returns distinct places ranked by similarity
- Currently available but not used by the edge functions (they use direct AI ranking instead)

---

## Vector Search

The `reviews` table has a `vector(1536)` column for text embeddings:

- **Dimension:** 1536 (compatible with OpenAI text-embedding-ada-002)
- **Purpose:** Enable semantic similarity search on review content
- **Current Usage:** The `search_places_by_vibe` function exists but the current vibe-search edge function uses direct AI ranking instead
- **Future Use:** Can be leveraged for hybrid search (vector + AI reranking)
