# Get Place Go - Local Development Guide

> **Version:** 1.0.0  
> **Last Updated:** January 18, 2026  
> **Purpose:** Complete guide for local development setup, database access, and debugging

---

## Table of Contents

1. [Quick Start](#1-quick-start)
2. [Technology Stack Overview](#2-technology-stack-overview)
3. [Project Structure](#3-project-structure)
4. [Local Development Setup](#4-local-development-setup)
5. [Database Access & Management](#5-database-access--management)
6. [Backend Logs & Debugging](#6-backend-logs--debugging)
7. [AI/ML Code Files Reference](#7-aiml-code-files-reference)
8. [Making Manual Changes](#8-making-manual-changes)
9. [Common Tasks & Workflows](#9-common-tasks--workflows)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Quick Start

```bash
# Clone the repository
git clone <your-repo-url>
cd get-place-go

# Install dependencies
npm install

# Start development server
npm run dev

# Open in browser
open http://localhost:5173
```

---

## 2. Technology Stack Overview

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.3.x | UI framework |
| **Vite** | Latest | Build tool & dev server (fast HMR) |
| **TypeScript** | 5.x | Type safety |
| **Tailwind CSS** | 3.x | Utility-first styling |
| **Shadcn/UI** | Latest | Component library (Radix-based) |
| **React Router** | 6.30.x | Client-side routing |
| **TanStack Query** | 5.83.x | Server state management & caching |
| **Zod** | 3.x | Schema validation |

### Backend (Lovable Cloud / Supabase)

| Technology | Purpose |
|------------|---------|
| **PostgreSQL** | Primary database |
| **pgvector** | Vector embeddings for semantic search |
| **Supabase Auth** | User authentication |
| **Supabase Edge Functions** | Serverless backend (Deno/TypeScript) |
| **Row Level Security (RLS)** | Database access control |

### AI/ML

| Technology | Purpose |
|------------|---------|
| **Lovable AI Gateway** | Unified AI model access (no API keys needed) |
| **Google Gemini 3 Flash** | Primary AI model for recommendations |
| **Text Embeddings** | Vector representation (1536 dimensions) |

### Key Dependencies

```json
{
  "@supabase/supabase-js": "^2.90.1",
  "@tanstack/react-query": "^5.83.0",
  "@dnd-kit/core": "^6.3.1",
  "@dnd-kit/sortable": "^10.0.0",
  "react-router-dom": "^6.30.1",
  "lucide-react": "^0.462.0",
  "zod": "^3.25.76",
  "sonner": "^1.7.4"
}
```

---

## 3. Project Structure

```
get-place-go/
├── 📁 src/                          # Frontend source code
│   ├── 📁 components/               # React components
│   │   ├── 📁 ui/                   # Shadcn UI components (auto-generated)
│   │   ├── 📁 home/                 # Homepage-specific components
│   │   ├── 📁 layout/               # Layout components (Header, Footer)
│   │   ├── 📁 places/               # Place-related components
│   │   ├── 📁 search/               # Search UI components
│   │   ├── 📁 reviews/              # Review components
│   │   └── 📁 itinerary/            # Itinerary builder components
│   │
│   ├── 📁 hooks/                    # Custom React hooks
│   │   ├── useAuth.tsx              # Authentication context & hooks
│   │   ├── use-mobile.tsx           # Mobile detection
│   │   ├── use-toast.ts             # Toast notifications
│   │   └── useScrollAnimation.tsx   # Scroll-based animations
│   │
│   ├── 📁 integrations/             # External service integrations
│   │   └── 📁 supabase/
│   │       ├── client.ts            # ⚠️ AUTO-GENERATED - DO NOT EDIT
│   │       └── types.ts             # ⚠️ AUTO-GENERATED - DO NOT EDIT
│   │
│   ├── 📁 lib/                      # Utilities & shared code
│   │   ├── types.ts                 # Application-level types
│   │   └── utils.ts                 # Utility functions (cn, etc.)
│   │
│   ├── 📁 pages/                    # Route page components
│   │   ├── Index.tsx                # Homepage (/)
│   │   ├── Explore.tsx              # Search results (/explore)
│   │   ├── Vibes.tsx                # Vibe discovery (/vibes)
│   │   ├── Auth.tsx                 # Login/Signup (/auth)
│   │   ├── Favorites.tsx            # User favorites (/favorites)
│   │   ├── Itineraries.tsx          # User itineraries (/itineraries)
│   │   ├── ItineraryBuilder.tsx     # Build itinerary (/itineraries/:id)
│   │   └── NotFound.tsx             # 404 page
│   │
│   ├── App.tsx                      # Root component & routing
│   ├── App.css                      # App-level styles
│   ├── main.tsx                     # Entry point
│   └── index.css                    # Global styles & design tokens
│
├── 📁 supabase/                     # 🤖 BACKEND / AI CODE
│   ├── 📁 functions/                # Edge Functions (Deno runtime)
│   │   ├── 📁 vibe-search/          # 🔍 Semantic vibe search AI
│   │   │   └── index.ts             # Main search logic
│   │   └── 📁 generate-itinerary/   # 📅 AI itinerary generation
│   │       └── index.ts             # Itinerary AI logic
│   └── config.toml                  # ⚠️ AUTO-GENERATED - DO NOT EDIT
│
├── 📁 docs/                         # Documentation
│   ├── PROJECT_DOCUMENTATION.md     # Full project docs
│   └── LOCAL_DEVELOPMENT_GUIDE.md   # This file
│
├── 📁 public/                       # Static assets
│   ├── favicon.ico
│   ├── placeholder.svg
│   └── robots.txt
│
├── .env                             # ⚠️ AUTO-GENERATED - DO NOT EDIT
├── index.html                       # HTML entry point
├── tailwind.config.ts               # Tailwind configuration
├── vite.config.ts                   # Vite configuration
└── package.json                     # ⚠️ DO NOT EDIT DIRECTLY
```

### Legend

| Icon | Meaning |
|------|---------|
| 🤖 | Contains AI/ML code |
| 🔍 | Search-related |
| 📅 | Itinerary-related |
| ⚠️ | Auto-generated, do not edit manually |

---

## 4. Local Development Setup

### Prerequisites

- **Node.js** 18+ (recommended: use nvm)
- **npm** or **bun** package manager
- **Git**
- **VS Code** (recommended IDE)

### Step 1: Clone & Install

```bash
# Clone the repository
git clone <your-repo-url>
cd get-place-go

# Install dependencies
npm install
# OR using bun (faster)
bun install
```

### Step 2: Environment Variables

The `.env` file is **auto-generated** by Lovable Cloud. For local development, these variables are pre-configured:

```env
VITE_SUPABASE_URL=https://vysuahkhxsvrroxygvww.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJI...
VITE_SUPABASE_PROJECT_ID=vysuahkhxsvrroxygvww
```

⚠️ **DO NOT commit actual API keys to git!**

### Step 3: Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Step 4: VS Code Extensions (Recommended)

Install these extensions for the best DX:

```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "usernamehw.errorlens"
  ]
}
```

---

## 5. Database Access & Management

### 5.1 Understanding the Database

The database is hosted on **Lovable Cloud** (Supabase under the hood). You can access it through:

1. **Lovable Cloud Dashboard** (in-app)
2. **Supabase Client** (in code)
3. **Direct SQL** (via Edge Functions)

### 5.2 Database Tables

| Table | Description | RLS |
|-------|-------------|-----|
| `places` | All places/venues | SELECT: public, INSERT: authenticated |
| `reviews` | User & external reviews (with embeddings) | Full access for own reviews |
| `profiles` | User profiles | Own profile only |
| `favorites` | User saved places | Own favorites only |
| `itineraries` | User trip plans | Own + public itineraries |
| `search_history` | User search logs | Own history only |

### 5.3 Viewing Data in Code

```typescript
import { supabase } from '@/integrations/supabase/client';

// Fetch all places
const { data, error } = await supabase
  .from('places')
  .select('*')
  .eq('is_active', true);

// Fetch with joins
const { data } = await supabase
  .from('reviews')
  .select(`
    *,
    places:place_id (name, area)
  `)
  .limit(10);
```

### 5.4 Making Database Changes

#### Option A: Using Lovable Chat (Recommended)

Ask Lovable to run migrations:
```
"Add a 'opening_hours' column to the places table as JSONB"
```

#### Option B: Manual SQL in Edge Functions

Create an edge function for one-time data operations:

```typescript
// supabase/functions/admin-update/index.ts
const { data, error } = await supabase
  .from('places')
  .update({ is_active: true })
  .eq('area', 'baner');
```

### 5.5 Enums Reference

```sql
-- Areas (expandable for future cities)
area: 'baner' | 'koregaon_park'

-- Noise levels
noise_level: 'silent' | 'quiet' | 'moderate' | 'lively' | 'loud'

-- Price ranges
price_range: 'budget' | 'moderate' | 'premium' | 'luxury'

-- Vibe categories
vibe_category: 'work_study' | 'social_dating' | 'food_experience'
```

---

## 6. Backend Logs & Debugging

### 6.1 Where to Find Logs

#### Frontend Console Logs
- Open browser DevTools → Console tab
- Filter by source to find specific logs

#### Edge Function Logs
Access via Lovable Cloud dashboard or ask:
```
"Show me the edge function logs for vibe-search"
```

### 6.2 Edge Function Debugging

#### Add Logging to Functions

```typescript
// In supabase/functions/vibe-search/index.ts
console.log("Query received:", query);
console.log("Places found:", places.length);
console.error("AI response error:", error);
```

#### View Logs in Lovable
```
"Check the logs for the vibe-search edge function"
```

### 6.3 Database Logs

Query the postgres logs:
```sql
SELECT 
  timestamp,
  event_message,
  parsed.error_severity 
FROM postgres_logs
CROSS JOIN unnest(metadata) as m
CROSS JOIN unnest(m.parsed) as parsed
WHERE error_severity = 'ERROR'
ORDER BY timestamp DESC
LIMIT 20;
```

### 6.4 Network Debugging

In browser DevTools → Network tab:
- Filter by `supabase` or `functions` to see API calls
- Check request/response payloads
- Look for error status codes (4xx, 5xx)

### 6.5 Common Debug Patterns

```typescript
// Debug React Query
const { data, error, isLoading, isFetching } = useQuery({
  queryKey: ['places'],
  queryFn: async () => {
    console.log('Fetching places...');
    const result = await supabase.from('places').select('*');
    console.log('Result:', result);
    return result;
  }
});

// Debug Auth issues
const { user, session } = useAuth();
console.log('Current user:', user?.id);
console.log('Session expires:', session?.expires_at);
```

---

## 7. AI/ML Code Files Reference

### 📁 AI Code Location

All AI/ML code is in: **`supabase/functions/`**

```
supabase/functions/
├── 📁 vibe-search/              # 🔍 SEMANTIC SEARCH AI
│   └── index.ts                 # ~225 lines
│
└── 📁 generate-itinerary/       # 📅 ITINERARY AI
    └── index.ts                 # ~195 lines
```

### 7.1 `vibe-search/index.ts` - Semantic Search

**Purpose:** Find places matching user's natural language query

**Key Components:**
- Input validation (Zod schema)
- Database filtering
- AI prompt construction
- Lovable AI Gateway call
- Response parsing & ranking

**AI Model:** `google/gemini-3-flash-preview`

**Endpoint:** `POST /functions/v1/vibe-search`

```typescript
// Request format
{
  query: string;        // "quiet cafe for work"
  vibe?: string;        // Optional filter
  area?: string;        // Optional filter
  limit?: number;       // Default: 10
}

// Response format
{
  results: [{
    place: PlaceObject,
    similarity: 0.95,
    explanation: "Why this matches..."
  }],
  summary: "AI summary of results"
}
```

### 7.2 `generate-itinerary/index.ts` - Itinerary AI

**Purpose:** Suggest places for day trip itineraries

**Key Components:**
- JWT authentication
- User context handling
- AI prompt for trip planning
- Logical ordering (breakfast → dinner)

**AI Model:** `google/gemini-3-flash-preview`

**Endpoint:** `POST /functions/v1/generate-itinerary`

```typescript
// Request format (requires auth)
{
  title: string;
  description?: string;
  existingPlaces: string[];
}

// Response format
{
  suggestions: [{
    id: "place-uuid",
    suggested_time: "10:00",
    reason: "Perfect for morning coffee..."
  }],
  summary: "AI summary"
}
```

### 7.3 How to Modify AI Logic

1. **Edit the prompt** in the `systemPrompt` or `userPrompt` variables
2. **Change the model** by updating the `model` parameter
3. **Add new logic** before/after the AI call
4. **Deploy automatically** - Edge Functions deploy on git push

### 7.4 Available AI Models

```typescript
// Fast & cheap (good for simple tasks)
"google/gemini-3-flash-preview"
"google/gemini-2.5-flash-lite"

// High quality (complex reasoning)
"google/gemini-2.5-pro"
"openai/gpt-5"
"openai/gpt-5.2"

// Balanced
"google/gemini-2.5-flash"
"openai/gpt-5-mini"
```

---

## 8. Making Manual Changes

### 8.1 Adding a New Place (Database)

Ask Lovable:
```
"Add a new place to the database:
- Name: Blue Tokai Coffee
- Area: Baner
- Address: 123 Main Road, Baner, Pune
- Vibe: work_study
- Noise level: quiet
- Has WiFi: true"
```

Or via code:
```typescript
const { error } = await supabase.from('places').insert({
  name: 'Blue Tokai Coffee',
  slug: 'blue-tokai-baner',
  area: 'baner',
  address: '123 Main Road, Baner, Pune',
  primary_vibe: 'work_study',
  noise_level: 'quiet',
  has_wifi: true,
  is_active: true
});
```

### 8.2 Updating AI Prompts

Edit `supabase/functions/vibe-search/index.ts`:

```typescript
// Line ~99-111: System prompt
const systemPrompt = `You are a helpful travel assistant...
// ADD YOUR CUSTOM INSTRUCTIONS HERE
`;

// Line ~113-141: User prompt template
const userPrompt = `User is looking for: "${sanitizedQuery}"
// MODIFY HOW CONTEXT IS SENT TO AI
`;
```

### 8.3 Adding New UI Components

```bash
# Using shadcn CLI
npx shadcn@latest add [component-name]

# Example
npx shadcn@latest add calendar
npx shadcn@latest add alert
```

### 8.4 Adding New Pages

1. Create file in `src/pages/NewPage.tsx`
2. Add route in `src/App.tsx`:

```typescript
import NewPage from './pages/NewPage';

// In Routes
<Route path="/new-page" element={<NewPage />} />
```

3. Add navigation link in `Header.tsx`

---

## 9. Common Tasks & Workflows

### 9.1 Add a New Vibe Category

1. **Ask Lovable to update the enum:**
   ```
   "Add 'outdoor_adventure' to the vibe_category enum"
   ```

2. **Update TypeScript types** (auto-generated after migration)

3. **Update UI** in `VibeCategories.tsx`

### 9.2 Modify Search Filters

Edit `src/components/search/VibeSearch.tsx`

### 9.3 Change Design Tokens

Edit `src/index.css`:
```css
:root {
  --primary: 142 76% 36%;  /* Green shade */
  --accent: 24 95% 53%;    /* Orange accent */
}
```

### 9.4 Run Tests

```bash
npm run test
```

---

## 10. Troubleshooting

### "CORS Error" on API calls
- Edge Functions have CORS enabled by default
- Check if the function is deployed

### "RLS Policy Error" (403)
- User needs to be authenticated
- Check if RLS policies match the operation

### "AI Gateway Error" (500)
- Check `LOVABLE_API_KEY` is set
- Check rate limits (429 status)

### "Type errors after schema change"
- Types are auto-generated
- Ask Lovable to refresh types or wait for rebuild

### Edge Function not updating
- Push to git to trigger deployment
- Check Lovable Cloud logs for deploy errors

---

## Quick Reference Card

| Task | Command/Action |
|------|----------------|
| Start dev server | `npm run dev` |
| Build for production | `npm run build` |
| Run tests | `npm run test` |
| Add shadcn component | `npx shadcn@latest add [name]` |
| View DB data | Use Lovable Cloud dashboard |
| Check edge logs | Ask Lovable "show edge function logs" |
| Deploy edge functions | Auto on git push |
| Add new dependency | Ask Lovable (package.json is read-only) |

---

*Happy coding! 🚀*
