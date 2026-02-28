# Features Guide — Get Place Go

> **Last Updated:** February 25, 2026

---

## Table of Contents

1. [Landing Page](#1-landing-page)
2. [Vibe Search (AI)](#2-vibe-search-ai)
3. [Vibe Categories](#3-vibe-categories)
4. [Authentication](#4-authentication)
5. [Favorites](#5-favorites)
6. [Itinerary Builder](#6-itinerary-builder)
7. [AI Itinerary Suggestions](#7-ai-itinerary-suggestions)
8. [Review System](#8-review-system)
9. [Responsive Design](#9-responsive-design)

---

## 1. Landing Page

**Route:** `/` — **File:** `src/pages/Index.tsx`

### What It Does
- Displays a hero section with animated floating icons and stats (50+ places, 2 areas, 3 vibe categories)
- Shows the VibeSearch bar for immediate AI search
- Presents three vibe category cards (Work & Study, Social & Dating, Food & Experience)
- Footer with scroll-reveal animation

### How It Works
- `HeroSection.tsx` renders the animated hero with CSS keyframe `float` animation
- `VibeSearch.tsx` is the shared search component (reused on `/explore`)
- `VibeCategories.tsx` renders clickable category cards
- Searching navigates to `/explore?q=...&vibe=...&area=...`
- Clicking a category navigates to `/explore?vibe=category`

### Key Components
| Component | File | Purpose |
|-----------|------|---------|
| HeroSection | `src/components/home/HeroSection.tsx` | Animated hero with gradient background |
| VibeSearch | `src/components/search/VibeSearch.tsx` | Search bar + filter pills + quick prompts |
| VibeCategories | `src/components/home/VibeCategories.tsx` | Category cards with examples |
| ScrollReveal | `src/components/ui/scroll-reveal.tsx` | Intersection Observer animation wrapper |

---

## 2. Vibe Search (AI)

**Route:** `/explore` — **File:** `src/pages/Explore.tsx`

### What It Does
- User types a natural language query like "quiet cafe for studying"
- AI ranks places from the database by relevance
- Returns match percentage, AI explanation, and summary
- Supports filtering by vibe category and area

### How It Works

1. **Frontend** (`Explore.tsx`):
   - Reads `q`, `vibe`, `area` from URL search params
   - Calls `supabase.functions.invoke('vibe-search', { body })` 
   - Displays skeleton cards while loading
   - Renders PlaceCards with match scores

2. **Edge Function** (`supabase/functions/vibe-search/index.ts`):
   - Validates input with Zod schema
   - Queries `places` table with optional area/vibe filters
   - Sends places + user query to Gemini 3 Flash via Lovable AI Gateway
   - AI returns `ranked_places[]` with `match_score` and `explanation`
   - Merges AI rankings with full place data

3. **AI Prompt Design**:
   - System prompt: Travel assistant for Pune specializing in vibes
   - User prompt: Contains query + all place attributes (noise, wifi, romantic, etc.)
   - Output: JSON with ranked places and summary
   - Fallback: If AI response can't be parsed, returns unranked results

### Search Filters
| Filter | Type | Values |
|--------|------|--------|
| Vibe | `VibeCategory` | `work_study`, `social_dating`, `food_experience` |
| Area | `Area` | `baner`, `koregaon_park` |

### Quick Prompts
Pre-set search queries users can click:
- "Quiet cafe to study" → work_study
- "Romantic dinner spot" → social_dating
- "Best breakfast in Baner" → food_experience
- "Group hangout place" → social_dating

---

## 3. Vibe Categories

**Route:** `/vibes` — **File:** `src/pages/Vibes.tsx`

### What It Does
- Educational page explaining how vibe detection works (3-step process)
- Detailed cards for each vibe category with features and "perfect for" tags
- Includes the ReviewForm for users to submit reviews
- CTA to start exploring

### Categories Explained
| Category | Key Signals | Perfect For |
|----------|-------------|-------------|
| Work & Study | Quiet, WiFi, power outlets, good coffee | Remote workers, students, freelancers |
| Social & Dating | Romantic, group-friendly, aesthetic, conversation-friendly | Date nights, celebrations, meetups |
| Food & Experience | Quality cuisine, highly rated, unique, specialty items | Foodies, explorers, food bloggers |

---

## 4. Authentication

**Route:** `/auth` — **File:** `src/pages/Auth.tsx`

### What It Does
- Email/password sign up and sign in
- Form validation with Zod (email format, 6+ char password)
- Auto-redirects to home if already authenticated
- Supports `?mode=signup` URL param

### How It Works
- `AuthProvider` (`src/hooks/useAuth.tsx`) wraps entire app
- Uses `supabase.auth.onAuthStateChange` for real-time auth state
- On signup, a database trigger (`handle_new_user`) auto-creates a profile
- Provides: `user`, `session`, `loading`, `signUp`, `signIn`, `signOut`

### Protected Features
These features redirect to `/auth` if not signed in:
- Favorites (viewing/saving)
- Itineraries (creating/editing)
- Review submission

---

## 5. Favorites

**Route:** `/favorites` — **File:** `src/pages/Favorites.tsx`

### What It Does
- Displays grid of user's saved places
- Heart icon toggle on PlaceCards to add/remove
- "Clear All" with confirmation dialog
- Empty state with CTA to explore

### How It Works
- Reads from `favorites` table filtered by `user_id`
- Fetches associated place details via separate query
- Uses optimistic UI updates for instant feedback
- RLS policy: Users can only manage their own favorites

### Favoriting from Explore
- `Explore.tsx` loads user's favorites on mount
- `handleFavorite()` toggles favorite status via insert/delete
- Non-authenticated users are redirected to `/auth`

---

## 6. Itinerary Builder

**Routes:** `/itineraries` and `/itineraries/:id`

### What It Does
- **List View** (`Itineraries.tsx`): Shows all user itineraries, create new ones
- **Builder View** (`ItineraryBuilder.tsx`): 
  - Add/remove places from a searchable dialog
  - Drag-and-drop reorder with `@dnd-kit`
  - Set time slots (08:00 - 21:00) per place
  - Save itinerary to database
  - AI-powered place suggestions

### How It Works
- Itineraries stored with `places[]` (UUIDs) and `schedule{}` (JSON with time/notes per place)
- Drag-and-drop uses `DndContext` + `SortableContext` + `verticalListSortingStrategy`
- `SortableItem.tsx` wraps each place card with sortable behavior
- Save writes updated `places` array and `schedule` JSON to database

### Data Structure
```typescript
// Itinerary in database
{
  id: "uuid",
  title: "Weekend Brunch Crawl",
  description: "A foodie adventure...",
  places: ["place-uuid-1", "place-uuid-2"],  // Ordered array
  schedule: {
    "place-uuid-1": { time_slot: "10:00", notes: "Start here" },
    "place-uuid-2": { time_slot: "12:00", notes: "Lunch spot" }
  },
  user_id: "auth-uuid",
  is_public: false
}
```

---

## 7. AI Itinerary Suggestions

**Triggered from:** Itinerary Builder page → "AI Suggest" button

### What It Does
- Analyzes the itinerary title/description
- Considers already-added places
- Suggests 3-5 complementary places with time slots and reasons

### How It Works
1. Frontend sends `{ title, description, existingPlaces[] }` to `generate-itinerary`
2. Edge function requires JWT authentication
3. Fetches all active places, filters out already-added ones
4. Sends available places + itinerary context to Gemini 3 Flash
5. AI returns `suggestions[]` with `id`, `suggested_time`, `reason`
6. Frontend auto-adds suggested places to the itinerary

### AI Considerations
The AI prompt instructs:
- Logical ordering (breakfast → lunch → dinner)
- Travel time between Baner and Koregaon Park (~20 min)
- Vibe consistency (don't mix loud with quiet)
- Variety (food + activities + ambiance)

---

## 8. Review System

**Component:** `src/components/reviews/ReviewForm.tsx` (accessible from `/vibes` page)

### What It Does
- Modal dialog for submitting place reviews
- Searchable place selector with map preview
- Vibe tag selection (Work, Social, Food, Other/custom)
- 5-star rating (optional)
- Free-text review content (500 char max)

### How It Works
- Fetches all active places for the selector
- Shows Google Maps embed if place has lat/lng coordinates
- Submits to `reviews` table with `user_id`, `place_id`, `content`, `rating`, `detected_vibes`
- Reviews feed into the RAG system — embeddings can be generated from review content
- Custom vibes are appended to review content as `[Custom Vibe: ...]`

---

## 9. Responsive Design

### Breakpoints
- Mobile: < 768px (single column, hamburger menu)
- Tablet: 640px-1024px (2-column grids)
- Desktop: > 1024px (3-column grids, full nav)

### Mobile-Specific Behavior
- Header collapses to hamburger menu with slide-down nav
- PlaceCard grid goes single-column
- Search bar stacks vertically
- Filter pills wrap naturally with `flex-wrap`

### Dark Mode
- Full dark mode support via CSS custom properties
- Toggled by system preference (uses `next-themes` but set to system)
- All colors defined in both `:root` and `.dark` in `index.css`
