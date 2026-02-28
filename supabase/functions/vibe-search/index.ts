import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SCRAPEGRAPH_BASE = "https://api.scrapegraphai.com/v1";

const VALID_NOISE_LEVELS = ["silent", "quiet", "moderate", "lively", "loud"];
const VALID_PRICE_RANGES = ["budget", "moderate", "premium", "luxury"];
const VALID_VIBES = ["work_study", "social_dating", "food_experience", "nightlife", "fitness_wellness", "arts_culture", "outdoor_adventure", "shopping", "family_kids"];

const SearchRequestSchema = z.object({
  query: z.string().min(1, "Query is required").max(500, "Query too long"),
  vibe: z.enum(["work_study", "social_dating", "food_experience", "nightlife", "fitness_wellness", "arts_culture", "outdoor_adventure", "shopping", "family_kids"]).optional(),
  area: z.enum(["baner", "koregaon_park", "viman_nagar", "hinjewadi", "kothrud", "aundh", "wakad", "hadapsar", "deccan", "camp", "kalyani_nagar", "magarpatta", "pimpri_chinchwad", "pune_all"]).optional(),
  limit: z.number().int().min(1).max(50).default(10),
});

const MAX_REQUEST_SIZE = 10000;

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function sanitizeEnum<T extends string>(value: any, validValues: T[], fallback: T): T {
  if (typeof value === "string") {
    const lower = value.toLowerCase().trim().replace(/\s+/g, "_");
    if (validValues.includes(lower as T)) return lower as T;
  }
  return fallback;
}

const scrapeOutputSchema = {
  type: "object",
  properties: {
    places: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          address: { type: "string" },
          description: { type: "string" },
          cuisine_type: { type: "array", items: { type: "string" } },
          price_range: { type: "string", enum: ["budget", "moderate", "premium", "luxury"] },
          average_rating: { type: "number" },
          has_wifi: { type: "boolean" },
          is_pet_friendly: { type: "boolean" },
          is_work_friendly: { type: "boolean" },
          is_romantic: { type: "boolean" },
          is_group_friendly: { type: "boolean" },
          noise_level: { type: "string", enum: ["silent", "quiet", "moderate", "lively", "loud"] },
          tags: { type: "array", items: { type: "string" } },
          primary_vibe: { type: "string", enum: ["work_study", "social_dating", "food_experience"] },
        },
        required: ["name", "address"],
      },
    },
  },
};

function extractPlaces(data: any): any[] {
  // Try parsing result if it's a string (JSON)
  let result = data?.result;
  if (typeof result === "string") {
    try {
      const jsonMatch = result.match(/\[[\s\S]*\]/);
      if (jsonMatch) result = JSON.parse(jsonMatch[0]);
    } catch { /* ignore */ }
  }
  
  if (Array.isArray(data)) return data;
  if (Array.isArray(result)) return result;
  if (data?.places && Array.isArray(data.places)) return data.places;
  if (result?.places && Array.isArray(result.places)) return result.places;
  if (data?.data?.result?.places && Array.isArray(data.data.result.places)) return data.data.result.places;
  if (data?.data?.result && Array.isArray(data.data.result)) return data.data.result;
  if (data?.data?.places && Array.isArray(data.data.places)) return data.data.places;
  
  // Check any array key in result
  if (result && typeof result === "object" && !Array.isArray(result)) {
    for (const key of Object.keys(result)) {
      if (Array.isArray(result[key]) && result[key].length > 0) return result[key];
    }
  }
  
  // Try markdown_content for JSON arrays
  if (data?.markdown_content && typeof data.markdown_content === "string") {
    try {
      const jsonMatch = data.markdown_content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch { /* ignore */ }
  }
  
  return [];
}

async function pollForResult(requestId: string, action: string, apiKey: string) {
  const maxAttempts = 18; // ~90 seconds
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((r) => setTimeout(r, 5000));
    console.log(`Polling attempt ${i + 1}/${maxAttempts} for ${requestId}`);
    const res = await fetch(`${SCRAPEGRAPH_BASE}/${action}/${requestId}`, {
      headers: { "SGAI-APIKEY": apiKey },
    });
    const data = await res.json();
    console.log(`Poll status: ${data.status}`);
    if (data.status === "completed" || data.status === "failed") return data;
  }
  return { status: "timeout", error: "Scraping timed out" };
}

async function scrapeAndInsertPlaces(
  query: string,
  area: string | undefined,
  supabase: any,
  apiKey: string
): Promise<any[]> {
  const areaMap: Record<string, string> = {
    baner: "Baner", koregaon_park: "Koregaon Park", viman_nagar: "Viman Nagar",
    hinjewadi: "Hinjewadi", kothrud: "Kothrud", aundh: "Aundh", wakad: "Wakad",
    hadapsar: "Hadapsar", deccan: "Deccan", camp: "Camp", kalyani_nagar: "Kalyani Nagar",
    magarpatta: "Magarpatta", pimpri_chinchwad: "Pimpri Chinchwad",
  };
  const areaStr = area && area !== "pune_all" ? (areaMap[area] || area) : "Pune";
  const searchPrompt = `Find the top places, spots, venues, restaurants, cafes, gyms, parks, clubs, malls, temples, museums, and attractions in ${areaStr}, Pune, India that match: "${query}". Include all types of places, not just food. For each place return: name, full address, short description, cuisine types as a list (if applicable), price range (budget/moderate/premium/luxury), average rating out of 5, noise level (quiet/moderate/lively), and whether it is work friendly, pet friendly, romantic, or group friendly. Return results as a JSON array of objects with keys: name, address, description, cuisine_type, price_range, average_rating, noise_level, is_work_friendly, is_pet_friendly, is_romantic, is_group_friendly, tags.`;

  console.log(`ScrapeGraph searchscraper query: ${query}`);

  try {
    const scrapeRes = await fetch(`${SCRAPEGRAPH_BASE}/searchscraper`, {
      method: "POST",
      headers: {
        "SGAI-APIKEY": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_prompt: searchPrompt,
      }),
    });

    let scrapeData = await scrapeRes.json();
    console.log(`ScrapeGraph response status: ${scrapeRes.status}, keys: ${JSON.stringify(Object.keys(scrapeData))}`);

    if (!scrapeRes.ok) {
      console.error("ScrapeGraph API error:", JSON.stringify(scrapeData));
      return [];
    }

    // Poll if async
    if (scrapeData.request_id && (scrapeData.status === "queued" || scrapeData.status === "pending")) {
      console.log(`Job queued: ${scrapeData.request_id}, polling...`);
      scrapeData = await pollForResult(scrapeData.request_id, "searchscraper", apiKey);
    }

    if (scrapeData.status === "failed" || scrapeData.status === "timeout") {
      console.error("Scrape failed:", scrapeData.error);
      return [];
    }

    // Debug: log the actual result structure
    console.log(`scrapeData.result type: ${typeof scrapeData.result}, isArray: ${Array.isArray(scrapeData.result)}`);
    console.log(`scrapeData.result preview: ${JSON.stringify(scrapeData.result).slice(0, 500)}`);
    if (scrapeData.result && typeof scrapeData.result === 'object' && !Array.isArray(scrapeData.result)) {
      console.log(`scrapeData.result keys: ${JSON.stringify(Object.keys(scrapeData.result))}`);
    }
    
    const scrapedPlaces = extractPlaces(scrapeData);
    console.log(`Extracted ${scrapedPlaces.length} places from scrape`);

    const insertedPlaces: any[] = [];
    const dbArea = area && area !== "pune_all" ? area : "baner";

    for (const place of scrapedPlaces) {
      if (!place.name || !place.address) continue;

      const slug = slugify(place.name) + "-" + slugify(dbArea);

      const record = {
        name: place.name,
        slug,
        address: place.address,
        area: dbArea,
        description: place.description || null,
        cuisine_type: Array.isArray(place.cuisine_type) ? place.cuisine_type : [],
        price_range: sanitizeEnum(place.price_range, VALID_PRICE_RANGES, "moderate"),
        average_rating: typeof place.average_rating === "number" ? place.average_rating : 0,
        has_wifi: place.has_wifi === true,
        is_pet_friendly: place.is_pet_friendly === true,
        is_work_friendly: place.is_work_friendly === true,
        is_romantic: place.is_romantic === true,
        is_group_friendly: place.is_group_friendly === true,
        noise_level: sanitizeEnum(place.noise_level, VALID_NOISE_LEVELS, "moderate"),
        tags: Array.isArray(place.tags) ? place.tags : [],
        primary_vibe: sanitizeEnum(place.primary_vibe, VALID_VIBES, "food_experience"),
        is_active: true,
      };

      const { data, error } = await supabase
        .from("places")
        .upsert(record, { onConflict: "slug" })
        .select()
        .single();

      if (error) {
        console.error(`Failed to insert ${place.name}:`, error.message);
      } else if (data) {
        insertedPlaces.push(data);
      }
    }

    console.log(`Inserted/updated ${insertedPlaces.length} places into DB`);
    return insertedPlaces;
  } catch (err) {
    console.error("Scrape error:", err);
    return [];
  }
}

// Vibe-aware keyword mappings for smarter scoring without AI
const VIBE_KEYWORDS: Record<string, string[]> = {
  work_study: ["cafe", "coffee", "study", "work", "quiet", "wifi", "library", "coworking", "laptop"],
  social_dating: ["romantic", "date", "couple", "lounge", "bar", "rooftop", "candlelight", "fine dining"],
  food_experience: ["restaurant", "food", "eat", "cuisine", "biryani", "cafe", "bakery", "street food", "thali"],
  nightlife: ["club", "pub", "bar", "nightlife", "dance", "dj", "lounge", "brewery", "drinks"],
  fitness_wellness: ["gym", "yoga", "fitness", "spa", "wellness", "swim", "sports", "health"],
  arts_culture: ["museum", "art", "gallery", "theater", "theatre", "heritage", "culture", "temple", "history"],
  outdoor_adventure: ["trek", "park", "garden", "hiking", "nature", "outdoor", "adventure", "lake", "hill"],
  shopping: ["mall", "shop", "market", "store", "shopping", "boutique", "bazaar"],
  family_kids: ["family", "kids", "children", "amusement", "park", "fun", "play", "picnic"],
};

function keywordScore(places: any[], query: string, vibe?: string) {
  const queryLower = query.toLowerCase();
  const keywords = queryLower.split(/\s+/).filter(w => w.length > 2);

  // Detect implicit vibe from query if not explicitly set
  let detectedVibe = vibe;
  if (!detectedVibe) {
    let bestVibeScore = 0;
    for (const [v, kws] of Object.entries(VIBE_KEYWORDS)) {
      const vibeScore = kws.filter(kw => queryLower.includes(kw)).length;
      if (vibeScore > bestVibeScore) {
        bestVibeScore = vibeScore;
        detectedVibe = v;
      }
    }
  }

  const scored = places.map((p) => {
    let score = 0;
    const name = (p.name || "").toLowerCase();
    const desc = (p.description || "").toLowerCase();
    const tags = (p.tags || []).join(" ").toLowerCase();
    const searchable = `${name} ${desc} ${tags} ${p.primary_vibe || ""} ${p.area || ""}`;

    // Keyword matching (weighted)
    for (const kw of keywords) {
      if (name.includes(kw)) score += 0.3; // Name match is strongest
      else if (tags.includes(kw)) score += 0.2;
      else if (desc.includes(kw)) score += 0.15;
    }

    // Vibe match
    if (detectedVibe && p.primary_vibe === detectedVibe) score += 0.25;

    // Attribute-based scoring from detected vibe
    if (detectedVibe === "work_study") {
      if (p.is_work_friendly) score += 0.15;
      if (p.has_wifi) score += 0.1;
      if (p.noise_level === "quiet" || p.noise_level === "silent") score += 0.1;
    } else if (detectedVibe === "social_dating") {
      if (p.is_romantic) score += 0.2;
      if (p.aesthetic_score && p.aesthetic_score >= 7) score += 0.1;
    } else if (detectedVibe === "nightlife") {
      if (p.noise_level === "lively" || p.noise_level === "loud") score += 0.1;
      if (p.is_group_friendly) score += 0.1;
    } else if (detectedVibe === "family_kids") {
      if (p.is_group_friendly) score += 0.15;
      if (p.noise_level === "moderate" || p.noise_level === "lively") score += 0.05;
    }

    // Rating boost
    if (p.average_rating && p.average_rating > 0) {
      score += (p.average_rating / 5) * 0.15;
    }

    // Generate a descriptive explanation
    const reasons: string[] = [];
    const matchedKws = keywords.filter(kw => searchable.includes(kw));
    if (matchedKws.length > 0) reasons.push(`Matches "${matchedKws.join('", "')}"`);
    if (detectedVibe && p.primary_vibe === detectedVibe) reasons.push(`${detectedVibe.replace(/_/g, " ")} vibe`);
    if (p.average_rating && p.average_rating > 3) reasons.push(`Rated ${p.average_rating}/5`);
    if (p.is_work_friendly && detectedVibe === "work_study") reasons.push("Work-friendly");
    if (p.has_wifi && detectedVibe === "work_study") reasons.push("Has WiFi");
    if (p.is_romantic && detectedVibe === "social_dating") reasons.push("Romantic ambiance");

    return {
      place: p,
      similarity: Math.min(Math.round(score * 100) / 100, 1),
      explanation: reasons.length > 0 ? reasons.join(" · ") : "Available in your area",
    };
  });

  scored.sort((a, b) => b.similarity - a.similarity);

  const vibeLabel = detectedVibe ? detectedVibe.replace(/_/g, " ") : "your search";
  return {
    results: scored,
    summary: `Found ${scored.length} places matching "${query}". Ranked by relevance to ${vibeLabel}.`,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const SCRAPEGRAPH_API_KEY = Deno.env.get("SCRAPEGRAPH_API_KEY");

    const contentLength = req.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > MAX_REQUEST_SIZE) {
      return new Response(
        JSON.stringify({ error: "Request too large" }),
        { status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const rawBody = await req.json();
    const validationResult = SearchRequestSchema.safeParse(rawBody);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ error: "Invalid input", details: validationResult.error.errors.map((e) => e.message) }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { query, vibe, area, limit } = validationResult.data;

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Run DB query and scrape in parallel
    let dbQuery = supabase.from("places").select("*").eq("is_active", true).limit(limit);
    if (area && area !== "pune_all") dbQuery = dbQuery.eq("area", area);
    if (vibe) dbQuery = dbQuery.eq("primary_vibe", vibe);

    const dbPromise = dbQuery;
    const scrapePromise = SCRAPEGRAPH_API_KEY
      ? scrapeAndInsertPlaces(query, area, supabase, SCRAPEGRAPH_API_KEY)
      : Promise.resolve([]);

    const [{ data: existingPlaces, error: placesError }, scrapedPlaces] = await Promise.all([
      dbPromise,
      scrapePromise,
    ]);

    if (placesError) {
      console.error("Database error:", placesError);
      throw new Error("Failed to fetch places");
    }

    // Merge: add scraped places not already in existing results
    const existingIds = new Set((existingPlaces || []).map((p: any) => p.id));
    const allPlaces = [...(existingPlaces || [])];
    for (const sp of scrapedPlaces) {
      if (!existingIds.has(sp.id)) {
        allPlaces.push(sp);
        existingIds.add(sp.id);
      }
    }

    console.log(`Total places: ${allPlaces.length} (${existingPlaces?.length || 0} DB + ${scrapedPlaces.length} scraped)`);

    if (allPlaces.length === 0) {
      return new Response(
        JSON.stringify({
          results: [],
          summary: "No places found. Try a different search query!",
          query,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Keyword-based ranking (no AI credits used)
    const sanitizedQuery = query.replace(/[<>{}]/g, "").trim();
    const { results: rankedResults, summary } = keywordScore(allPlaces, sanitizedQuery, vibe);

    return new Response(
      JSON.stringify({
        results: rankedResults.slice(0, limit),
        summary,
        query,
        scraped_count: scrapedPlaces.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("vibe-search error:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred processing your request" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});