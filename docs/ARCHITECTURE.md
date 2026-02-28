# System Architecture — Get Place Go

> **Last Updated:** February 25, 2026

---

## Overview

Get Place Go is a **three-tier web application** that uses Agentic AI (RAG) to recommend places in Pune, India based on "vibes" — subjective qualities like noise level, work-friendliness, and romantic ambiance.

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                      │
│  React 18 · Vite · TypeScript · Tailwind · Shadcn/UI    │
│                                                          │
│  Pages: Index, Explore, Vibes, Itineraries, Favorites    │
│  Auth: Email/Password via AuthProvider context           │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTPS (Supabase JS Client)
                       ▼
┌─────────────────────────────────────────────────────────┐
│               BACKEND (Edge Functions)                   │
│          Deno · TypeScript · Zod Validation              │
│                                                          │
│  ┌─────────────────┐    ┌──────────────────────┐        │
│  │  vibe-search    │    │ generate-itinerary    │        │
│  │  (Public)       │    │ (Auth Required)       │        │
│  └────────┬────────┘    └──────────┬───────────┘        │
│           │                        │                     │
│           ▼                        ▼                     │
│    ┌──────────────────────────────────────┐              │
│    │    Lovable AI Gateway (Gemini 3)     │              │
│    │    RAG: DB Data → AI Ranking         │              │
│    └──────────────────────────────────────┘              │
└──────────────────────┬──────────────────────────────────┘
                       │ Service Role Key
                       ▼
┌─────────────────────────────────────────────────────────┐
│                DATABASE (PostgreSQL)                      │
│  Supabase · pgvector · Row-Level Security                │
│                                                          │
│  Tables: places, reviews, favorites, itineraries,        │
│          profiles, search_history                         │
│                                                          │
│  Vector: 1536-dim embeddings on reviews table            │
│  RLS: All tables protected with user-scoped policies     │
└─────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagrams

### 1. Vibe Search Flow

```
User types "quiet cafe for studying"
        │
        ▼
┌─ Frontend (Explore.tsx) ─┐
│ 1. Build search params   │
│ 2. Call vibe-search fn   │
└──────────┬───────────────┘
           ▼
┌─ Edge Function ──────────┐
│ 3. Validate with Zod     │
│ 4. Query places table    │
│    (filter by area/vibe) │
│ 5. Send places + query   │
│    to Gemini 3 Flash     │
│ 6. AI ranks places by    │
│    match score (0-1)     │
│ 7. Return ranked results │
│    + AI explanations     │
└──────────┬───────────────┘
           ▼
┌─ Frontend ───────────────┐
│ 8. Render PlaceCards     │
│    with match % + reason │
└──────────────────────────┘
```

### 2. Itinerary Generation Flow

```
User clicks "AI Suggest" on itinerary
        │
        ▼
┌─ Frontend (ItineraryBuilder.tsx) ─┐
│ 1. Send title + existing places   │
│ 2. Include auth token (JWT)       │
└──────────┬────────────────────────┘
           ▼
┌─ Edge Function ──────────────────┐
│ 3. Verify JWT token              │
│ 4. Fetch all active places       │
│ 5. Filter out already-added ones │
│ 6. AI selects 3-5 places with    │
│    suggested times + reasons     │
└──────────┬───────────────────────┘
           ▼
┌─ Frontend ───────────────────────┐
│ 7. Auto-add suggested places     │
│ 8. User can reorder via drag-drop│
└──────────────────────────────────┘
```

### 3. Authentication Flow

```
┌─ Auth.tsx ───────────────────────┐
│ Email + Password form            │
│ Sign Up → supabase.auth.signUp() │
│ Sign In → signInWithPassword()   │
└──────────┬───────────────────────┘
           ▼
┌─ AuthProvider (useAuth.tsx) ─────┐
│ onAuthStateChange listener       │
│ Provides: user, session, loading │
│ Auto-creates profile via trigger │
│ (handle_new_user DB function)    │
└──────────────────────────────────┘
```

---

## Key Architectural Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Frontend Framework | React + Vite | Fast HMR, TypeScript-first, SPA |
| Styling | Tailwind + Shadcn/UI | Consistent design system, semantic tokens |
| State Management | React hooks + URL params | Simple, no Redux overhead needed |
| Backend | Supabase Edge Functions (Deno) | Serverless, auto-scaling, co-located with DB |
| AI Provider | Lovable AI Gateway → Gemini 3 Flash | No API key management, fast inference |
| AI Pattern | RAG (Retrieval-Augmented Generation) | Grounded in real data, no hallucinated places |
| Database | PostgreSQL + pgvector | Relational + vector similarity search |
| Auth | Supabase Auth (email/password) | Built-in JWT, RLS integration |
| Drag & Drop | @dnd-kit | Accessible, lightweight, React-native |

---

## Security Model

- **Row-Level Security (RLS)** on all tables
- **JWT authentication** for protected edge functions
- **Zod validation** on all edge function inputs
- **Request size limits** (10KB max)
- **Input sanitization** before AI prompts (strip `<>{}`)
- **Service role** only used server-side for DB queries
- **CORS headers** on all edge function responses

---

## File Structure

```
src/
├── App.tsx                    # Route definitions
├── main.tsx                   # Entry point
├── index.css                  # Design system tokens
├── components/
│   ├── home/                  # Landing page components
│   │   ├── HeroSection.tsx
│   │   └── VibeCategories.tsx
│   ├── layout/
│   │   └── Header.tsx         # Global navigation
│   ├── places/
│   │   ├── PlaceCard.tsx      # Place display card
│   │   └── PlaceCardSkeleton.tsx
│   ├── reviews/
│   │   └── ReviewForm.tsx     # User review submission
│   ├── search/
│   │   └── VibeSearch.tsx     # AI search bar + filters
│   ├── itinerary/
│   │   └── SortableItem.tsx   # Drag-drop wrapper
│   └── ui/                    # Shadcn/UI components
├── hooks/
│   ├── useAuth.tsx            # Auth context provider
│   ├── use-toast.ts           # Toast notifications
│   ├── use-mobile.tsx         # Responsive breakpoint
│   └── useScrollAnimation.tsx # Intersection observer
├── lib/
│   ├── types.ts               # Core type definitions
│   └── utils.ts               # cn() utility
├── pages/
│   ├── Index.tsx              # Landing page
│   ├── Explore.tsx            # AI search results
│   ├── Vibes.tsx              # Vibe categories explainer
│   ├── Auth.tsx               # Login/signup
│   ├── Favorites.tsx          # Saved places
│   ├── Itineraries.tsx        # Trip list
│   ├── ItineraryBuilder.tsx   # Single itinerary editor
│   └── NotFound.tsx           # 404 page
└── integrations/supabase/
    ├── client.ts              # Auto-generated client
    └── types.ts               # Auto-generated types

supabase/
├── config.toml                # Edge function config
└── functions/
    ├── vibe-search/index.ts   # AI place search
    └── generate-itinerary/index.ts  # AI trip planner

docs/
├── ARCHITECTURE.md            # ← This file
├── FEATURES.md                # Feature-by-feature guide
├── DATABASE.md                # Schema & RLS docs
├── FRONTEND.md                # Component & design docs
├── API_REFERENCE.md           # Edge function API docs
├── AI_CODE_REFERENCE.md       # AI modification guide
├── RESEARCH_PAPER.md          # Academic paper
└── PROJECT_DOCUMENTATION.md   # Legacy overview
```
