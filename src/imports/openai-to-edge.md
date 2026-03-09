Same fix applies — just swap Groq for OpenAI in the Edge Function. Give this prompt to Figma Make:

🔧 Fix — Move OpenAI API Call to Supabase Edge Function
The playlist generation is failing with "TypeError: Failed to fetch" because the OpenAI API is being called directly from the browser. Move all OpenAI API calls to a Supabase Edge Function. Do not change any UI.

Step 1 — Create a Supabase Edge Function called generate-playlist
typescript// supabase/functions/generate-playlist/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { userPrompt, currentPlaylist, isRefinement } = await req.json();

    const apiKey = Deno.env.get("OPENAI_API_KEY");

    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not set in Supabase secrets");
    }

    const systemPrompt = isRefinement
      ? getRefinementPrompt()
      : getGenerationPrompt();

    // Call OpenAI API server-side
    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.9,
          max_tokens: 2000,
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI error: ${errorData.error?.message || response.status}`);
    }

    const data = await response.json();
    const raw = data.choices[0].message.content;
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const playlist = JSON.parse(cleaned);

    return new Response(JSON.stringify(playlist), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});

Step 2 — Update the Frontend to Call the Edge Function
Find every place in the frontend where OpenAI is called directly and replace with:
javascriptasync function generatePlaylist(userPrompt, currentPlaylist, isRefinement) {

  const { data, error } = await supabase.functions.invoke("generate-playlist", {
    body: {
      userPrompt,
      currentPlaylist: currentPlaylist || null,
      isRefinement: isRefinement || false
    }
  });

  if (error) throw new Error(error.message);
  return data;
}
This single function handles both fresh generation and refinement — the isRefinement flag tells the Edge Function which system prompt to use.

Step 3 — Verify OPENAI_API_KEY in Supabase Secrets

Go to Supabase → Project Settings → Edge Functions → Secrets
Confirm OPENAI_API_KEY exists and is correct
If incorrect — delete it, re-add it with the right key
Your key must start with sk-


Step 4 — Deploy the Edge Function
bashsupabase functions deploy generate-playlist
```

Or via Supabase dashboard → **Edge Functions** → **Deploy**

---

### Why This Fixes It
```
Before (broken):
Browser → OpenAI API ❌
(OpenAI blocks direct browser requests — CORS error)

After (fixed):
Browser → Supabase Edge Function → OpenAI API ✓
(Server-to-server call — no CORS restriction)