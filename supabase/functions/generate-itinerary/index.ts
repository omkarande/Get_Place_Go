import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation schema
const ItineraryRequestSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  description: z.string().max(1000, "Description too long").optional(),
  existingPlaces: z.array(z.string().max(100)).max(20).default([]),
});

const MAX_REQUEST_SIZE = 10000; // 10KB

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    // Verify user token
    const userSupabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await userSupabase.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      console.error("Auth error:", claimsError);
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Request size limit
    const contentLength = req.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > MAX_REQUEST_SIZE) {
      return new Response(
        JSON.stringify({ error: "Request too large" }),
        { status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse and validate input
    const rawBody = await req.json();
    const validationResult = ItineraryRequestSchema.safeParse(rawBody);
    
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ 
          error: "Invalid input", 
          details: validationResult.error.errors.map(e => e.message) 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { title, description, existingPlaces } = validationResult.data;

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Use service role for database queries
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch all available places
    const { data: places, error: placesError } = await supabase
      .from("places")
      .select("*")
      .eq("is_active", true);

    if (placesError) throw placesError;

    if (!places || places.length === 0) {
      return new Response(
        JSON.stringify({ suggestions: [], summary: "No places available yet!" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Filter out already added places
    const availablePlaces = places.filter(
      (p) => !existingPlaces.includes(p.name)
    );

    // Sanitize inputs for AI prompt
    const sanitizedTitle = title.replace(/[<>{}]/g, "").trim();
    const sanitizedDescription = description?.replace(/[<>{}]/g, "").trim() || "";

    const systemPrompt = `You are a travel planning assistant for Pune, India. Help users build amazing day itineraries.

Given an itinerary theme and available places, suggest 3-5 places that would create a cohesive, enjoyable day trip.

Consider:
- Logical ordering (breakfast spots first, dinner last)
- Travel time between areas (Baner and Koregaon Park are ~20 min apart)
- Vibe consistency (don't mix loud party spots with quiet study cafes)
- Variety (mix food experiences, activities, and ambiance)

Be enthusiastic and provide practical suggestions!`;

    const userPrompt = `Itinerary: "${sanitizedTitle}"
${sanitizedDescription ? `Description: ${sanitizedDescription}` : ""}
${existingPlaces.length > 0 ? `Already added: ${existingPlaces.join(", ")}` : "No places added yet."}

Available places to suggest from:
${JSON.stringify(availablePlaces.map(p => ({
  id: p.id,
  name: p.name,
  area: p.area,
  primary_vibe: p.primary_vibe,
  noise_level: p.noise_level,
  tags: p.tags,
  description: p.description
})), null, 2)}

Return JSON:
{
  "suggestions": [
    { "id": "place-uuid", "suggested_time": "10:00", "reason": "Brief reason" }
  ],
  "summary": "A sentence about your suggestions"
}`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error("AI gateway error");
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content || "";

    let result;
    try {
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      result = jsonMatch ? JSON.parse(jsonMatch[0]) : { suggestions: [], summary: "" };
    } catch {
      result = { suggestions: [], summary: "Here are some great places for your trip!" };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("generate-itinerary error:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred processing your request" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
