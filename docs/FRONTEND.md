# Frontend Guide — Get Place Go

> **Last Updated:** February 25, 2026

---

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3 | UI framework |
| Vite | — | Build tool & dev server |
| TypeScript | — | Type safety |
| Tailwind CSS | — | Utility-first styling |
| Shadcn/UI | — | Component library (Radix-based) |
| TanStack Query | 5.x | Server state management |
| React Router DOM | 6.x | Client-side routing |
| @dnd-kit | — | Drag and drop |
| Zod | 3.x | Form validation |
| React Hook Form | 7.x | Form state management |
| Lucide React | — | Icon library |

---

## Routing

Defined in `src/App.tsx`:

| Route | Page Component | Auth Required | Description |
|-------|---------------|---------------|-------------|
| `/` | `Index` | No | Landing page |
| `/auth` | `Auth` | No | Login/signup |
| `/explore` | `Explore` | No | AI search results |
| `/vibes` | `Vibes` | No | Category explainer |
| `/itineraries` | `Itineraries` | Yes | Trip list |
| `/itineraries/:id` | `ItineraryBuilder` | Yes | Trip editor |
| `/favorites` | `Favorites` | Yes | Saved places |
| `*` | `NotFound` | No | 404 page |

---

## Design System

### Typography
- **Display font:** Space Grotesk (headings)
- **Body font:** Inter (body text)
- Applied via `font-display` and `font-sans` Tailwind classes

### Color Palette (Light Mode)

| Token | HSL | Usage |
|-------|-----|-------|
| `--primary` | `16 85% 58%` | Coral-orange (buttons, CTAs) |
| `--secondary` | `175 50% 35%` | Deep teal (accents) |
| `--accent` | `145 55% 42%` | Lush green (badges) |
| `--background` | `30 25% 98%` | Warm off-white |
| `--foreground` | `220 25% 12%` | Near-black text |
| `--muted` | `35 30% 94%` | Soft sand |
| `--destructive` | `0 84% 60%` | Red (errors, unfavorite) |
| `--vibe-work` | `215 75% 55%` | Blue (work category) |
| `--vibe-social` | `340 75% 55%` | Pink (social category) |
| `--vibe-food` | `35 85% 55%` | Amber (food category) |

### Custom Utilities

| Class | Effect |
|-------|--------|
| `gradient-primary` | Coral → amber gradient |
| `gradient-secondary` | Teal → blue gradient |
| `shadow-soft` | Subtle elevation |
| `shadow-medium` | Card hover shadow |
| `shadow-glow` | Primary color glow |
| `glass` | Glassmorphism (backdrop-blur) |
| `text-gradient` | Gradient text clip |
| `animate-float` | Gentle floating animation |
| `animate-pulse-glow` | Pulsing glow effect |
| `animate-fade-in` | Fade in + slide up |

### Dark Mode
- Full support via `.dark` class on root
- All tokens redefined in `index.css` `.dark {}` block
- Colors adjust for contrast while maintaining brand identity

---

## Component Architecture

### Layout Components

#### `Header` (`src/components/layout/Header.tsx`)
- Fixed top navigation bar with glassmorphism
- Logo → home link
- Desktop: Explore, Vibes, Itineraries links + auth dropdown
- Mobile: Hamburger menu with slide-down nav
- Auth state: Shows user email or Sign In/Get Started buttons

#### `ScrollReveal` (`src/components/ui/scroll-reveal.tsx`)
- Wraps content in Intersection Observer
- Animates on scroll: fade + directional slide (up/down/left/right)
- Configurable delay for staggered animations
- Uses `useScrollAnimation` hook

### Feature Components

#### `VibeSearch` (`src/components/search/VibeSearch.tsx`)
- Main search input with sparkle icon button
- Filter pills: 3 vibe categories + 2 area filters (toggle on/off)
- Quick prompt links below search bar
- Props: `onSearch(query, filters)`, `isLoading`
- Used on both Index and Explore pages

#### `PlaceCard` (`src/components/places/PlaceCard.tsx`)
- Card with cover image (or gradient placeholder)
- Match percentage badge (top-left, from AI)
- Favorite heart button (top-right)
- Price range badge (bottom-right)
- Place name, address, rating stars
- Vibe badge, noise level, WiFi, power outlet badges
- AI explanation (italic, border-left accent)
- Tags (bottom, max 3 shown)

#### `PlaceCardSkeleton` (`src/components/places/PlaceCardSkeleton.tsx`)
- Skeleton loading state matching PlaceCard layout
- Used during search loading

#### `ReviewForm` (`src/components/reviews/ReviewForm.tsx`)
- Dialog modal triggered by "Write a Review" button
- Place search with dropdown + Google Maps embed preview
- Vibe tag selector (multi-select with custom option)
- Star rating (hover + click)
- Text area with character count (500 max)
- Requires authentication to submit

#### `SortableItem` (`src/components/itinerary/SortableItem.tsx`)
- Wraps children in `@dnd-kit` sortable container
- Provides drag handle, transform, and transition
- Reduces opacity when dragging

---

## Hooks

### `useAuth` (`src/hooks/useAuth.tsx`)
```typescript
const { user, session, loading, signUp, signIn, signOut } = useAuth();
```
- Context provider wrapping entire app
- Listens to `onAuthStateChange` for real-time updates
- `signUp` includes email redirect URL
- `signIn` uses password authentication

### `useScrollAnimation` (`src/hooks/useScrollAnimation.tsx`)
```typescript
const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });
```
- IntersectionObserver-based visibility detection
- Configurable threshold, rootMargin, triggerOnce
- Used by ScrollReveal component

### `use-mobile` (`src/hooks/use-mobile.tsx`)
- Returns `isMobile` boolean based on viewport width

### `use-toast` (`src/hooks/use-toast.ts`)
- Toast notification system (Radix-based)
- Variants: default, destructive

---

## Type System

Core types defined in `src/lib/types.ts`:

### Enums (mirroring database)
```typescript
type NoiseLevel = 'silent' | 'quiet' | 'moderate' | 'lively' | 'loud';
type VibeCategory = 'work_study' | 'social_dating' | 'food_experience';
type PriceRange = 'budget' | 'moderate' | 'premium' | 'luxury';
type Area = 'baner' | 'koregaon_park';
```

### Interfaces
- `Place` — Full place object (20+ fields)
- `Review` — Review with vibes and sentiment
- `Profile` — User profile with preferences
- `SearchFilters` — Search filter options
- `VibeSearchResult` — Place + similarity + explanation
- `AIRecommendation` — Grouped search results

### Display Maps
- `VIBE_INFO` — Emoji + label + color per vibe category
- `AREA_INFO` — Label + description per area
- `NOISE_LABELS` — Emoji + label per noise level
- `PRICE_LABELS` — ₹ symbols per price range

---

## State Management

The app uses **no global state library** (no Redux, Zustand, etc.). State is managed via:

1. **React Context** — Auth state (`AuthProvider`)
2. **URL Search Params** — Search query, filters (persisted in URL)
3. **Component State** — Local `useState` for UI state
4. **TanStack Query** — Available but currently used minimally (QueryClientProvider is set up)
5. **Supabase Client** — Direct database calls in components

---

## Build & Dev

```bash
# Development
npm run dev          # Vite dev server (HMR)

# Build
npm run build        # Production build

# Test
npm run test         # Vitest test runner

# Lint
npm run lint         # ESLint
```

### Key Config Files
| File | Purpose |
|------|---------|
| `vite.config.ts` | Vite build config + path aliases |
| `tailwind.config.ts` | Theme extensions, animations, colors |
| `tsconfig.app.json` | TypeScript compiler options |
| `components.json` | Shadcn/UI configuration |
| `vitest.config.ts` | Test runner config |
