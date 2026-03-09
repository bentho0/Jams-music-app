Fix — Edge Function Timing Out Due to Sequential API Calls
The Edge Function is timing out because OpenAI and Spotify searches are taking too long. Fix by running Spotify searches in parallel and increasing the timeout limit. Do not change any UI.

Why It's Timing Out
Currently the Edge Function is doing this:
Call OpenAI → wait
Search Spotify for track 1 → wait
Search Spotify for track 2 → wait
Search Spotify for track 3 → wait
... 12 searches sequentially
12 sequential Spotify searches plus one OpenAI call easily exceeds the default timeout. Fix it by running all Spotify searches simultaneously.

Fix 1 — Run All Spotify Searches in Parallel
Find the Spotify enrichment block and confirm it uses Promise.all — not a for loop:
typescript// WRONG — sequential, too slow
for (const track of aiTracks) {
  const result = await searchSpotify(track.name, track.artist, token);
  enriched.push(result);
}

// CORRECT — parallel, all 12 run at the same time
const enrichedTracks = await Promise.all(
  aiTracks.map(track =>
    searchSpotify(track.track_name || track.track, track.artist, token)
  )
);
This alone reduces Spotify search time from ~12 seconds to ~2 seconds.

Fix 2 — Increase the Edge Function Timeout
At the very top of the Edge Function file, add this timeout configuration:
typescript// Increase timeout to 60 seconds
export const config = {
  runtime: "edge",
  maxDuration: 60
};
Or if using Deno serve, set it in the function config in supabase/config.toml:
toml[functions.generate-playlist]
verify_jwt = false
And in the Supabase dashboard:

Go to Edge Functions → generate-playlist → Settings
Set timeout to 60 seconds (default is usually 10–20s)


Fix 3 — Add a Timeout Per Spotify Search
Prevent a single slow Spotify search from blocking everything else:
typescriptasync function searchSpotifyWithTimeout(
  trackName: string,
  artist: string,
  token: string,
  timeoutMs: number = 5000
) {
  const timeoutPromise = new Promise<null>((resolve) =>
    setTimeout(() => resolve(null), timeoutMs)
  );

  const searchPromise = searchSpotify(trackName, artist, token);

  // Race — whichever finishes first wins
  const result = await Promise.race([searchPromise, timeoutPromise]);

  if (!result) {
    console.warn(`Timeout searching for: "${trackName}" by ${artist}`);
  }

  return result;
}
Then use this in the enrichment step:
typescriptconst enrichedTracks = await Promise.all(
  aiTracks.map(track =>
    searchSpotifyWithTimeout(
      track.track_name || track.track,
      track.artist,
      spotifyToken,
      5000  // 5 second max per track search
    )
  )
);
This ensures one slow search never blocks the entire response.

Fix 4 — Run OpenAI and Spotify Token Fetch in Parallel
These two calls don't depend on each other — run them simultaneously:
typescript// WRONG — sequential
const spotifyToken = await getSpotifyToken();
const aiPlaylist = await callOpenAI(userPrompt, isRefinement);

// CORRECT — parallel
const [spotifyToken, aiPlaylist] = await Promise.all([
  getSpotifyToken(),
  callOpenAI(userPrompt, isRefinement)
]);
This saves 1–2 seconds on every request.

Fix 5 — Reduce OpenAI Response Size
The AI is generating detailed reason fields for every track which adds tokens and time. Make the AI response leaner by updating the system prompt output format to only request essential fields:
typescriptconst leanOutputInstruction = `
Return ONLY this JSON structure, nothing else:
{
  "playlist_title": "...",
  "playlist_description": "...",
  "mood_tags": ["...", "...", "..."],
  "tracks": [
    {
      "track": "Song Name",
      "artist": "Artist Name"
    }
  ]
}
Minimum 10 tracks. No extra fields. No markdown. No explanation.
`;
Fewer tokens = faster OpenAI response.

Fix 6 — Add a Loading Message for Cold Starts
Cold starts are real — the first request after inactivity always takes longer. Handle this gracefully in the frontend:
javascript// Show progressive loading messages while waiting
const loadingMessages = [
  "Analyzing your vibe...",
  "Curating tracks...",
  "Searching Spotify...",
  "Almost ready..."
];

let messageIndex = 0;
const messageInterval = setInterval(() => {
  if (messageIndex < loadingMessages.length - 1) {
    setLoadingMessage(loadingMessages[++messageIndex]);
  }
}, 3000);

try {
  const playlist = await generatePlaylist(userPrompt);
  clearInterval(messageInterval);
  setPlaylist(playlist);
} catch (error) {
  clearInterval(messageInterval);
  setError(error.message);
}
This gives users feedback during the wait instead of a blank screen that looks broken.

Fix 7 — Add Retry Logic for Timeouts
If the request times out, automatically retry once before showing an error:
javascriptasync function generatePlaylistWithRetry(userPrompt, maxRetries = 2) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Generation attempt ${attempt}/${maxRetries}`);
      const result = await generatePlaylist(userPrompt);
      return result;
    } catch (error) {
      const isTimeout = error.message.includes("timed out") ||
                        error.message.includes("cold-starting");

      if (isTimeout && attempt < maxRetries) {
        console.log("Timeout detected — retrying automatically...");
        setLoadingMessage("Taking a moment longer — retrying...");
        await new Promise(resolve => setTimeout(resolve, 2000));
        continue;
      }

      throw error;
    }
  }
}

Expected Timeline After Fixes
StepBeforeAfterSpotify token + OpenAI call~4s sequential~2s parallel12 Spotify searches~12s sequential~2s parallelTotal response time~16s (times out)~4–6s (succeeds)