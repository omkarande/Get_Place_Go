# AI/ML Code Reference - Get Place Go

> **Last Updated:** January 18, 2026  
> **Purpose:** Quick reference for all AI-related code and modifications

---

## 📁 File Locations

```
supabase/
└── functions/
    ├── vibe-search/           ← SEMANTIC SEARCH AI
    │   └── index.ts           ← 224 lines | Main search logic
    │
    └── generate-itinerary/    ← ITINERARY PLANNING AI
        └── index.ts           ← 194 lines | Trip suggestion logic
```

---

## 1. Vibe Search Function

### File: `supabase/functions/vibe-search/index.ts`

### Purpose
Natural language search that matches user queries to places based on "vibe" (atmosphere, noise level, work-friendliness, etc.)

### Endpoint
```
POST /functions/v1/vibe-search
```

### Request Schema
```typescript
{
  query: string;                    // Required: "quiet cafe for work"
  vibe?: 'work_study' | 'social_dating' | 'food_experience';
  area?: 'baner' | 'koregaon_park';
  limit?: number;                   // Default: 10, Max: 50
}
```

### Response Schema
```typescript
{
  results: Array<{
    place: Place;           // Full place object
    similarity: number;     // 0-1 match score
    explanation: string;    // AI-generated reason
  }>;
  summary: string;          // AI-generated overview
  query: string;            // Echo of original query
}
```

### Code Structure

| Lines | Section | Description |
|-------|---------|-------------|
| 1-18 | Imports & Schema | Zod validation, CORS setup |
| 20-52 | Request Handling | Size limits, validation |
| 53-93 | Database Query | Fetch & filter places |
| 95-157 | AI Processing | Prompt construction, API call |
| 159-206 | Response Building | Parse AI, merge with place data |
| 208-224 | Error Handling | Catch-all error response |

### Key Modification Points

#### Change AI Model (Line 151)
```typescript
model: "google/gemini-3-flash-preview",  // Current
// Options:
// "google/gemini-2.5-pro"        - Higher quality
// "google/gemini-2.5-flash"      - Balanced
// "openai/gpt-5"                 - OpenAI alternative
```

#### Modify System Prompt (Lines 99-111)
```typescript
const systemPrompt = `You are a helpful travel assistant...
// ADD: specific instructions for ranking logic
// ADD: tone guidelines
// ADD: context about Pune neighborhoods
`;
```

#### Modify User Prompt (Lines 113-141)
```typescript
const userPrompt = `User is looking for: "${sanitizedQuery}"
// CHANGE: what place data to send to AI
// CHANGE: desired output format
`;
```

#### Add New Filters (Lines 63-74)
```typescript
// Current filters
if (area) dbQuery = dbQuery.eq("area", area);
if (vibe) dbQuery = dbQuery.eq("primary_vibe", vibe);

// Add new filter:
if (noise_level) dbQuery = dbQuery.eq("noise_level", noise_level);
```

---

## 2. Generate Itinerary Function

### File: `supabase/functions/generate-itinerary/index.ts`

### Purpose
AI-powered itinerary suggestions that create cohesive day trips

### Endpoint
```
POST /functions/v1/generate-itinerary
Authorization: Bearer <jwt_token>  ← REQUIRED
```

### Request Schema
```typescript
{
  title: string;           // Required: "Romantic Date Day"
  description?: string;    // Optional context
  existingPlaces: string[]; // Already added place names
}
```

### Response Schema
```typescript
{
  suggestions: Array<{
    id: string;            // Place UUID
    suggested_time: string; // "10:00"
    reason: string;        // Why this place fits
  }>;
  summary: string;         // AI explanation
}
```

### Code Structure

| Lines | Section | Description |
|-------|---------|-------------|
| 1-17 | Imports & Schema | Zod validation, auth |
| 19-76 | Auth & Validation | JWT check, input validation |
| 78-106 | Database Query | Fetch available places |
| 108-144 | AI Processing | Prompt for trip planning |
| 146-194 | Response | Parse & return suggestions |

### Key Modification Points

#### Add New Itinerary Logic (Lines 111-121)
```typescript
const systemPrompt = `You are a travel planning assistant...
// ADD: time-of-day preferences
// ADD: meal planning logic
// ADD: travel time considerations
`;
```

#### Change Suggestion Count
```typescript
// In userPrompt, modify:
"suggest 3-5 places"  // Change to desired count
```

---

## 3. AI Gateway Configuration

### Endpoint
```
https://ai.gateway.lovable.dev/v1/chat/completions
```

### Headers
```typescript
{
  Authorization: `Bearer ${LOVABLE_API_KEY}`,
  "Content-Type": "application/json"
}
```

### Request Format
```typescript
{
  model: "google/gemini-3-flash-preview",
  messages: [
    { role: "system", content: "..." },
    { role: "user", content: "..." }
  ],
  temperature: 0.7  // 0 = deterministic, 1 = creative
}
```

### Available Models

| Model | Speed | Quality | Best For |
|-------|-------|---------|----------|
| `google/gemini-3-flash-preview` | ⚡⚡⚡ | ★★★ | General queries (current) |
| `google/gemini-2.5-flash-lite` | ⚡⚡⚡⚡ | ★★ | Simple tasks |
| `google/gemini-2.5-flash` | ⚡⚡⚡ | ★★★★ | Balanced |
| `google/gemini-2.5-pro` | ⚡⚡ | ★★★★★ | Complex reasoning |
| `openai/gpt-5` | ⚡⚡ | ★★★★★ | High accuracy |
| `openai/gpt-5-mini` | ⚡⚡⚡ | ★★★★ | Cost-effective quality |

### Error Codes

| Status | Meaning | Action |
|--------|---------|--------|
| 429 | Rate limited | Wait and retry |
| 402 | Credits exhausted | Add credits |
| 500 | Gateway error | Check logs |

---

## 4. Adding a New AI Function

### Step 1: Create Folder
```bash
mkdir supabase/functions/my-new-function
```

### Step 2: Create index.ts
```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RequestSchema = z.object({
  // Define your input schema
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
    
    // Your logic here...
    
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "Your system prompt" },
          { role: "user", content: "Your user prompt" }
        ],
        temperature: 0.7,
      }),
    });

    // Parse and return...
    
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
```

### Step 3: Deploy
Push to git - Edge Functions deploy automatically.

---

## 5. Debugging AI Functions

### Add Logging
```typescript
console.log("Input query:", query);
console.log("AI response raw:", aiContent);
console.error("Parse error:", parseError);
```

### View Logs
Ask Lovable:
```
"Show me the edge function logs for vibe-search"
```

### Test Locally (Limited)
Edge Functions run on Deno, not Node.js. Testing is best done via deployed endpoints.

### Test via cURL
```bash
curl -X POST \
  'https://vysuahkhxsvrroxygvww.supabase.co/functions/v1/vibe-search' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <anon-key>' \
  -d '{"query": "quiet cafe"}'
```

---

## 6. Security Checklist

- ✅ Input validation with Zod
- ✅ Request size limits (10KB)
- ✅ Sanitize user input before AI prompts
- ✅ JWT authentication for user-specific functions
- ✅ Use service role only for DB queries
- ✅ Never expose API keys in responses
- ✅ Rate limiting via AI Gateway

---

## Quick Commands

```bash
# View function files
cat supabase/functions/vibe-search/index.ts

# Search for AI-related code
grep -r "gateway.lovable" supabase/

# Find all prompts
grep -r "systemPrompt\|userPrompt" supabase/
```

---

*For full documentation, see `docs/PROJECT_DOCUMENTATION.md`*
