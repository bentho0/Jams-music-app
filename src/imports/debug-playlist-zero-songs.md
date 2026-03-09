🐛 Debug — Playlist Generation Returning Zero Songs
The playlist generation is broken and returning zero songs. Do not add any new features. Do not change any UI. Only diagnose and fix the issue causing empty playlists.

Step 1 — Check the AI API Response First
Add a console log immediately after the AI API call returns, before any processing happens:
javascriptconst rawResponse = await callAI(systemPrompt, userPrompt);
console.log("RAW AI RESPONSE:", rawResponse);
Check:

Is the API returning anything at all?
Is it returning valid JSON or raw text?
Is it returning the correct structure with a tracks array?
Is the tracks array populated or empty?

The most likely cause: The refinement system prompt added in the last update changed the AI prompt structure and the response format no longer matches what the parser expects.

Step 2 — Check the JSON Parsing
Add a log at every parsing step:
javascript// Log before cleaning
console.log("BEFORE CLEAN:", rawResponse);

// Log after cleaning markdown fences
const cleaned = rawResponse.replace(/```json|```/g, "").trim();
console.log("AFTER CLEAN:", cleaned);

// Log after parsing
const parsed = JSON.parse(cleaned);
console.log("PARSED RESULT:", parsed);
console.log("TRACKS ARRAY:", parsed.tracks);
console.log("TRACK COUNT:", parsed.tracks?.length);
Check if parsing is failing silently and returning an empty object instead of throwing an error.

Step 3 — Check the Spotify Search Step
After the AI returns tracks, each one is searched on Spotify. Log this step:
javascriptfor (const track of parsed.tracks) {
  console.log(`Searching Spotify for: ${track.track} - ${track.artist}`);
  const spotifyResult = await searchSpotify(track.track, track.artist);
  console.log(`Spotify result:`, spotifyResult);
}
Check:

Is Spotify search returning results?
Is the search failing silently and filtering out all tracks?
Is the fallback handling dropping all tracks when none are found?


Step 4 — Check the Track Mapping
The AI response uses track and artist field names. The rest of the app may expect track_name. Check every place where track fields are read and ensure field names are consistent:
javascript// AI returns this structure:
{
  "track": "Song Name",      // ← field is called "track"
  "artist": "Artist Name"
}

// But the app may be expecting:
{
  "track_name": "Song Name", // ← field is called "track_name"
  "artist": "Artist Name"
}
If there is a mismatch, normalize the field names immediately after parsing:
javascriptconst normalizedTracks = parsed.tracks.map(t => ({
  ...t,
  track_name: t.track_name || t.track || t.name || "",
  artist: t.artist || t.artist_name || ""
}));

Step 5 — Check if the Refinement Prompt Broke the Original Generation
The refinement system prompt added recently may have overwritten or conflicted with the original playlist generation prompt. Verify:

Is the original generation call still using the correct system prompt?
Is the refinement prompt accidentally being sent on the first generation call?
Are the two API calls (generate vs refine) using separate, distinct prompts?

Add a log to confirm which prompt is being sent:
javascriptconsole.log("USING PROMPT TYPE:", isRefinement ? "REFINEMENT" : "GENERATION");
console.log("SYSTEM PROMPT PREVIEW:", systemPrompt.slice(0, 200));

Step 6 — Check the Minimum Track Enforcement
The system prompt requires a minimum of 10 tracks. If the AI is returning fewer and the app is then filtering them down to zero, add a safety check:
javascriptif (!parsed.tracks || parsed.tracks.length === 0) {
  throw new Error("AI returned zero tracks — retrying");
}

// If fewer than 10 tracks returned, log a warning but still proceed
if (parsed.tracks.length < 10) {
  console.warn(`Only ${parsed.tracks.length} tracks returned — below minimum`);
}

Step 7 — Add a Full End-to-End Log
Wrap the entire generation function in a single diagnostic log block:
javascriptasync function generatePlaylist(userPrompt) {
  try {
    console.log("=== GENERATION START ===");
    console.log("User prompt:", userPrompt);

    const aiResponse = await callAI(systemPrompt, userPrompt);
    console.log("AI response received:", aiResponse);

    const cleaned = aiResponse.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    console.log("Parsed tracks:", parsed.tracks?.length);

    const matched = await matchTracksOnSpotify(parsed.tracks);
    console.log("Spotify matched tracks:", matched.length);

    console.log("=== GENERATION END ===");
    return { ...parsed, tracks: matched };

  } catch (error) {
    console.error("=== GENERATION FAILED ===", error);
    throw error;
  }
}

Step 8 — Most Likely Fixes Based on Common Causes
Apply these fixes in order until the issue is resolved:
Fix A — Field name mismatch (most likely cause):
javascriptconst normalizedTracks = parsed.tracks.map(t => ({
  track_name: t.track_name || t.track || t.name,
  artist: t.artist || t.artist_name,
  year: t.year,
  tier: t.tier,
  mood_fit: t.mood_fit
}));
Fix B — JSON parsing failing on markdown fences:
javascriptconst cleaned = rawResponse
  .replace(/```json/g, "")
  .replace(/```/g, "")
  .trim();
Fix C — Spotify search filtering out all tracks:
javascript// If Spotify match fails, keep the track with just the AI data
const matched = await Promise.all(
  parsed.tracks.map(async (track) => {
    const spotifyData = await searchSpotify(track.track_name, track.artist);
    return spotifyData || {
      track_name: track.track_name || track.track,
      artist: track.artist,
      spotify_uri: null,
      album_art: null
    };
  })
);
Fix D — Refinement prompt overwriting generation:
javascript// Ensure two completely separate functions exist
function getGenerationPrompt() { return originalSystemPrompt; }
function getRefinementPrompt() { return refinementSystemPrompt; }

// Never mix them
const systemPrompt = isRefinement
  ? getRefinementPrompt()
  : getGenerationPrompt();

What Must Not Change:

Any UI or visual element
Any feature outside of playlist generation
The refinement input bar
The share or save functionality

What Needs To Be Fixed:

Playlist generation must return a minimum of 10 tracks
The full generation pipeline from AI call to track display must work end to end
Both the initial generation and the refinement flow must work independently without interfering with each other