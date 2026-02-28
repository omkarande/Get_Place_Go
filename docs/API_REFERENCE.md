# API Reference — Get Place Go

> **Last Updated:** February 25, 2026  
> **Runtime:** Deno (Supabase Edge Functions)  
> **AI Provider:** Lovable AI Gateway → Gemini 3 Flash Preview

---

## Table of Contents

1. [Vibe Search](#1-vibe-search)
2. [Generate Itinerary](#2-generate-itinerary)
3. [AI Gateway](#3-ai-gateway-configuration)
4. [Error Handling](#4-error-handling)

---

## 1. Vibe Search

### `POST /functions/v1/vibe-search`

AI-powered natural language place search. Ranks places by how well they match the user's described "vibe."

**Authentication:** Not required (`verify_jwt = false` in config.toml)

### Request

```typescript
// Headers
Content-Type: application/json

// Body
{
  query: string;       // Required, 1-500 chars. e.g., "quiet cafe for working"
  vibe?: "work_study" | "social_dating" | "food_experience";  // Optional filter
  area?: "baner" | "koregaon_park";                            // Optional filter
  limit?: number;      // 1-50, default 10
}
```

**Size Limit:** 10KB max request body

### Response

```typescript
// 200 OK
{
  results: Array<{
    place: Place;           // Full place object from database
    similarity: number;     // 0.0 - 1.0 match score from AI
    explanation: string;    // AI-generated reason for the match
  }>;
  summary: string;          // AI-generated 1-2 sentence overview
  query: string;            // Echo of the original query
}

// Empty results
{
  results: [],
  summary: "No places found yet. The database is being populated...",
  query: "..."
}
```

### Processing Pipeline

1. **Validate** — Zod schema checks input
2. **Query DB** — Fetch active places with optional area/vibe filters
3. **Build Prompt** — System prompt (Pune travel assistant) + User prompt (query + place attributes)
4. **AI Ranking** — Gemini 3 Flash scores each place 0-1 and writes explanations
5. **Parse Response** — Extract JSON from AI output (handles markdown wrapping)
6. **Merge** — Combine AI rankings with full place data
7. **Fallback** — If AI parsing fails, return unranked results with score 0.5

### Frontend Usage

```typescript
const { data, error } = await supabase.functions.invoke('vibe-search', {
  body: { query: "quiet cafe for studying", vibe: "work_study", limit: 12 }
});
```

---

## 2. Generate Itinerary

### `POST /functions/v1/generate-itinerary`

AI-powered itinerary suggestions. Analyzes trip theme and suggests complementary places.

**Authentication:** Required (JWT token in Authorization header)

### Request

```typescript
// Headers
Authorization: Bearer <jwt_token>
Content-Type: application/json

// Body
{
  title: string;             // Required, 1-200 chars. e.g., "Romantic Date Day"
  description?: string;      // Optional, max 1000 chars
  existingPlaces: string[];  // Already-added place names (max 20)
}
```

**Size Limit:** 10KB max request body

### Response

```typescript
// 200 OK
{
  suggestions: Array<{
    id: string;              // Place UUID from database
    suggested_time: string;  // e.g., "10:00"
    reason: string;          // Why this place fits the itinerary
  }>;
  summary: string;           // AI explanation of the suggestions
}

// No places available
{
  suggestions: [],
  summary: "No places available yet!"
}
```

### Processing Pipeline

1. **Auth Check** — Verify JWT via `supabase.auth.getClaims()`
2. **Validate** — Zod schema checks input
3. **Query DB** — Fetch all active places
4. **Filter** — Remove already-added places
5. **Build Prompt** — Trip planning assistant prompt + available places
6. **AI Selection** — Gemini 3 Flash picks 3-5 places with times/reasons
7. **Parse & Return** — Extract JSON suggestions

### Frontend Usage

```typescript
const { data, error } = await supabase.functions.invoke('generate-itinerary', {
  body: {
    title: "Weekend Brunch Crawl",
    description: "Food-focused day in KP",
    existingPlaces: ["Cafe Goodluck"]
  }
});
```

---

## 3. AI Gateway Configuration

### Endpoint
```
https://ai.gateway.lovable.dev/v1/chat/completions
```

### Authentication
```typescript
headers: {
  Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
  "Content-Type": "application/json"
}
```

### Request Format
```typescript
{
  model: "google/gemini-3-flash-preview",
  messages: [
    { role: "system", content: "System prompt..." },
    { role: "user", content: "User prompt..." }
  ],
  temperature: 0.7  // 0 = deterministic, 1 = creative
}
```

### Available Models

| Model | Speed | Quality | Use Case |
|-------|-------|---------|----------|
| `google/gemini-3-flash-preview` | ⚡⚡⚡ | ★★★ | **Current** — general queries |
| `google/gemini-2.5-flash-lite` | ⚡⚡⚡⚡ | ★★ | Simple classification |
| `google/gemini-2.5-flash` | ⚡⚡⚡ | ★★★★ | Balanced quality/speed |
| `google/gemini-2.5-pro` | ⚡⚡ | ★★★★★ | Complex reasoning |
| `openai/gpt-5` | ⚡⚡ | ★★★★★ | High accuracy |
| `openai/gpt-5-mini` | ⚡⚡⚡ | ★★★★ | Cost-effective |

### Environment Secrets

| Secret | Purpose |
|--------|---------|
| `LOVABLE_API_KEY` | AI Gateway authentication |
| `SUPABASE_URL` | Database connection |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side DB access (bypasses RLS) |
| `SUPABASE_ANON_KEY` | Client-side token verification |

---

## 4. Error Handling

### HTTP Status Codes

| Status | Meaning | When |
|--------|---------|------|
| 200 | Success | Normal response |
| 400 | Bad Request | Invalid input (Zod validation failed) |
| 401 | Unauthorized | Missing/invalid JWT (generate-itinerary only) |
| 402 | Payment Required | AI credits exhausted |
| 413 | Payload Too Large | Request body > 10KB |
| 429 | Rate Limited | Too many AI requests |
| 500 | Internal Error | Unexpected server error |

### Error Response Format

```typescript
{
  error: string;           // Human-readable message
  details?: string[];      // Validation error messages (400 only)
}
```

### Input Sanitization

Both functions sanitize user input before sending to AI:
```typescript
const sanitized = query.replace(/[<>{}]/g, "").trim();
```

This prevents basic prompt injection by stripping HTML/template characters.

---

## Quick Test

### Test Vibe Search
```bash
curl -X POST \
  'https://vysuahkhxsvrroxygvww.supabase.co/functions/v1/vibe-search' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer eyJhbGci...' \
  -d '{"query": "quiet cafe for studying"}'
```

### Test Generate Itinerary (requires auth)
```bash
curl -X POST \
  'https://vysuahkhxsvrroxygvww.supabase.co/functions/v1/generate-itinerary' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <user-jwt-token>' \
  -d '{"title": "Weekend Brunch", "existingPlaces": []}'
```
