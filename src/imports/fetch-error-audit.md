Deep Fix — Resolve Persistent "TypeError: Failed to fetch"
Playlist generation is still failing with "TypeError: Failed to fetch" after the previous fix. Conduct a full audit of every network call in the codebase and ensure nothing is calling any external API directly from the browser.

Audit Step 1 — Find Every fetch() Call in the Codebase
Search the entire codebase for every instance of:

fetch(
axios.
openai.
new OpenAI
api.openai.com
api.groq.com
generativelanguage.googleapis.com

List every location found. For each one, confirm whether it is running:

Server-side (inside a Supabase Edge Function) ✓ Safe
Client-side (inside any frontend component, hook, or utility file) ✗ Must be moved


Audit Step 2 — Verify the Edge Function is Actually Being Called
Add this log to the very first line of the Edge Function handler:
typescriptserve(async (req) => {
  console.log("Edge Function hit:", req.method, new Date().toISOString());
Then check Supabase dashboard → Edge Functions → Logs after triggering a generation. If no log appears, the frontend is not reaching the Edge Function at all — meaning supabase.functions.invoke is either misconfigured or not being called.

Audit Step 3 — Verify Supabase Client is Initialized Correctly
Confirm the Supabase client is properly initialized in the frontend with both the project URL and anon key:
javascriptimport { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,      // Must be set
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY  // Must be set
);
If either value is missing or undefined, supabase.functions.invoke will fail silently or throw a fetch error.
Add this check:
javascriptconsole.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log("Supabase Key exists:", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
Both must return valid values. If either is undefined the Supabase client is broken.

Audit Step 4 — Replace supabase.functions.invoke with a Direct fetch Call
If supabase.functions.invoke is not working, bypass it entirely and call the Edge Function directly using fetch:
javascriptasync function generatePlaylist(userPrompt, currentPlaylist, isRefinement) {

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const response = await fetch(
    `${supabaseUrl}/functions/v1/generate-playlist`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({
        userPrompt,
        currentPlaylist: currentPlaylist || null,
        isRefinement: isRefinement || false
      })
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Edge Function call failed");
  }

  return await response.json();
}
This is a more explicit and reliable call that bypasses any Supabase client configuration issues entirely.

Audit Step 5 — Confirm Edge Function is Deployed
In the Supabase dashboard → Edge Functions, confirm:

generate-playlist appears in the list
Its status shows as Active
The last deployment timestamp is recent

If it does not appear or shows as inactive, redeploy:
bashsupabase functions deploy generate-playlist

Audit Step 6 — Confirm CORS Headers are Correct in the Edge Function
The Edge Function must return CORS headers on every response including errors. Verify the Edge Function has this exact structure:
typescriptconst corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

serve(async (req) => {

  // CORS preflight — must be first
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // ... all logic here
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200
    });

  } catch (error) {
    // CORS headers on error response too — this is commonly missed
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500
    });
  }
});
```

The most commonly missed thing is **CORS headers on the error response.** If the Edge Function throws and returns an error without CORS headers, the browser sees it as a failed fetch instead of a handled error.

---

### Audit Step 7 — Check for a Second API Call Location

The most likely reason the error persists after the previous fix is that there are **two places** calling the AI API — the one that was moved to the Edge Function, and a second one that was missed. 

Search specifically for these patterns in frontend files:
```
"openai.com"
"Authorization": `Bearer`
new OpenAI(
openai.chat
If any of these exist in frontend code, move them to the Edge Function immediately.

Final Verification
After all fixes are applied, test in this exact order:

Open browser DevTools → Network tab
Trigger a playlist generation
Look for a request to supabase.co/functions/v1/generate-playlist
It should return 200 with a JSON playlist body
No request should go directly to api.openai.com from the browser

If you see a direct request to api.openai.com in the Network tab, there is still a client-side call that needs to be found and moved.