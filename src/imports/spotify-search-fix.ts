Fix — Spotify Search Not Executing Inside Edge Function
The playlist generates correctly but all Spotify fields (album_art, duration_ms, spotify_track_id, album) are empty. The Spotify search step is not running inside the Edge Function. Do not change any UI.

What the Console Confirms
Every track object has:

spotify_track_id: "" — Spotify search never ran
album_art: "" — never populated
duration_ms: 0 — never populated
album: "" — never populated

The AI track generation works. The Spotify enrichment step is broken or missing entirely.

Step 1 — Find Where the Empty Track Object is Being Built
Inside the Edge Function, find where track objects are constructed. It currently looks something like this:
typescript// This is what's happening — Spotify search result is being ignored
const tracks = aiPlaylist.tracks.map(track => ({
  spotify_track_id: "",   // ← never filled
  track_name: track.track_name || track.track,
  artist: track.artist,
  album: "",              // ← never filled
  album_art: "",          // ← never filled
  duration_ms: 0,         // ← never filled
  duration_formatted: "0:00",
  preview_url: null,
  spotify_url: null,
  reason: track.reason || "",
  is_new: false
}));
This is building the object from AI data only and never calling Spotify search. Fix it by replacing with the full enrichment flow below.

Step 2 — Replace with Full Spotify Enrichment Flow
Replace the entire track mapping block in the Edge Function with this:
typescript// Get Spotify token first
const spotifyToken = await getSpotifyToken();
console.log("Spotify token acquired:", !!spotifyToken);

// Enrich each track with Spotify data
const enrichedTracks = await Promise.all(
  aiPlaylist.tracks.map(async (track, index) => {

    const trackName = track.track_name || track.track || "";
    const artistName = track.artist || "";

    console.log(`[${index + 1}] Searching Spotify for: "${trackName}" by ${artistName}`);

    const spotifyData = await searchSpotify(trackName, artistName, spotifyToken);

    if (spotifyData) {
      console.log(`[${index + 1}] ✓ Match found: ${spotifyData.name}`);
      return {
        spotify_track_id: spotifyData.id || "",
        track_name: spotifyData.name,
        artist: spotifyData.artists?.[0]?.name || artistName,
        album: spotifyData.album?.name || "",
        album_art: spotifyData.album?.images?.[1]?.url
                || spotifyData.album?.images?.[0]?.url
                || "",
        duration_ms: spotifyData.duration_ms || 0,
        duration_formatted: formatDuration(spotifyData.duration_ms),
        preview_url: spotifyData.preview_url || null,
        spotify_url: spotifyData.external_urls?.spotify || null,
        spotify_uri: spotifyData.uri || null,
        reason: track.reason || "",
        is_new: track.is_new || false
      };
    }

    // Genuine fallback — Spotify had no match
    console.warn(`[${index + 1}] ✗ No Spotify match for: "${trackName}" by ${artistName}`);
    return {
      spotify_track_id: "",
      track_name: trackName,
      artist: artistName,
      album: "",
      album_art: "",
      duration_ms: 0,
      duration_formatted: "0:00",
      preview_url: null,
      spotify_url: null,
      spotify_uri: null,
      reason: track.reason || "",
      is_new: false
    };
  })
);

console.log("Enrichment complete. Tracks with album art:",
  enrichedTracks.filter(t => t.album_art !== "").length,
  "/", enrichedTracks.length
);

Step 3 — Add the Spotify Search Function Inside the Edge Function
Make sure this function exists inside the Edge Function file — not in the frontend:
typescriptasync function searchSpotify(trackName: string, artist: string, token: string) {

  const strategies = [
    `${trackName} ${artist}`,
    trackName,
    `${cleanString(trackName)} ${cleanString(artist)}`
  ];

  for (const query of strategies) {
    try {
      const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=5`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        console.error("Spotify search failed:", response.status);
        continue;
      }

      const data = await response.json();
      const items = data?.tracks?.items;

      if (items && items.length > 0) {
        // Prefer tracks with album art and duration
        return items.find((t: any) =>
          t.album?.images?.length > 0 && t.duration_ms > 0
        ) || items[0];
      }

    } catch (err) {
      console.error("Search error for query:", query, err);
    }
  }

  return null;
}

function cleanString(str: string): string {
  return str
    .replace(/\(feat\..*?\)/gi, "")
    .replace(/\(ft\..*?\)/gi, "")
    .replace(/\[.*?\]/g, "")
    .replace(/[^\w\s]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function formatDuration(ms: number): string {
  if (!ms || ms === 0) return "0:00";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

Step 4 — Add the Spotify Token Function Inside the Edge Function
typescriptasync function getSpotifyToken(): Promise<string> {
  const clientId = Deno.env.get("SPOTIFY_CLIENT_ID");
  const clientSecret = Deno.env.get("SPOTIFY_CLIENT_SECRET");

  if (!clientId || !clientSecret) {
    throw new Error("SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET not set in Supabase secrets");
  }

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `Basic ${btoa(`${clientId}:${clientSecret}`)}`
    },
    body: "grant_type=client_credentials"
  });

  const data = await response.json();

  if (!data.access_token) {
    throw new Error("Spotify token error: " + JSON.stringify(data));
  }

  return data.access_token;
}

Step 5 — Confirm Supabase Secrets Are Set
Go to Supabase → Project Settings → Edge Functions → Secrets and confirm all three exist:
Secret NameWhat It Should BeOPENAI_API_KEYYour OpenAI key starting with sk-SPOTIFY_CLIENT_IDFrom Spotify Developer DashboardSPOTIFY_CLIENT_SECRETFrom Spotify Developer Dashboard
If either Spotify secret is missing that's why the token fetch fails silently and the search never runs.

Step 6 — Redeploy the Edge Function
After making all changes:
bashsupabase functions deploy generate-playlist
```

---

### What to Expect in Supabase Logs After Fix
```
Spotify token acquired: true
[1] Searching Spotify for: "Juicy" by The Notorious B.I.G.
[1] ✓ Match found: Juicy
[2] Searching Spotify for: "Alright" by Kendrick Lamar
[2] ✓ Match found: Alright
...
Enrichment complete. Tracks with album art: 12 / 12
Instead of the current silent skip with empty fields.