That log message tells you exactly what's wrong. The Spotify search is finding no matches for any track and falling back to AI data only — which is why you get no album art, no duration, and no preview. The tracks exist but Spotify can't find them.
The search query itself is the problem. Give this prompt to Figma Make:

🔧 Fix — Spotify Search Returning No Matches for Any Track
The Spotify search is failing to match tracks and falling back to AI-only data for every song, causing missing album art, duration, and preview URLs. The issue is in the search query construction. Do not change any UI.

Why It's Failing
The current search is likely using strict field filters like track: and artist: which are too rigid. Spotify's search rejects these when there are minor spelling differences, featuring artists in the name, or special characters.
For example:
// This fails — too strict
track:SICKO MODE artist:Travis Scott

// This works — flexible
SICKO MODE Travis Scott

Fix the Spotify Search Function
Replace the entire Spotify search function with this more robust version:
javascriptasync function searchSpotify(trackName, artist, token) {

  // Strategy 1 — Flexible natural query (most reliable)
  const strategies = [

    // Natural search — most likely to match
    `${trackName} ${artist}`,

    // Track name only — catches cases where artist name differs slightly
    `${trackName}`,

    // Clean version — remove featuring artists and special characters
    `${cleanTrackName(trackName)} ${cleanArtistName(artist)}`,
  ];

  for (const query of strategies) {
    const result = await attemptSpotifySearch(query, token);
    if (result) {
      console.log(`✓ Spotify match found using query: "${query}"`);
      return result;
    }
    console.log(`✗ No match for query: "${query}" — trying next strategy`);
  }

  console.warn(`Fallback (no Spotify match): "${trackName}" by ${artist}`);
  return null;
}

async function attemptSpotifySearch(query, token) {
  try {
    const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=5`;

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
      console.error("Spotify search HTTP error:", response.status);
      return null;
    }

    const data = await response.json();
    const tracks = data?.tracks?.items;

    if (!tracks || tracks.length === 0) return null;

    // Return first valid result that has album art
    const validTrack = tracks.find(t =>
      t.album?.images?.length > 0 &&
      t.duration_ms > 0
    );

    return validTrack || tracks[0];

  } catch (error) {
    console.error("Spotify search error:", error);
    return null;
  }
}

Add the Cleaning Helper Functions
Special characters, parentheses, and featuring tags break Spotify's search. Strip them:
javascriptfunction cleanTrackName(name) {
  return name
    .replace(/\(feat\..*?\)/gi, "")   // Remove (feat. Artist)
    .replace(/\(ft\..*?\)/gi, "")     // Remove (ft. Artist)
    .replace(/\[.*?\]/g, "")          // Remove [anything in brackets]
    .replace(/\(.*?remix.*?\)/gi, "") // Remove (remix tags)
    .replace(/[^\w\s]/gi, " ")        // Remove special characters
    .replace(/\s+/g, " ")             // Collapse multiple spaces
    .trim();
}

function cleanArtistName(name) {
  return name
    .replace(/&.*/, "")               // Remove everything after & (featured artists)
    .replace(/,.*/, "")               // Remove everything after comma
    .replace(/[^\w\s]/gi, " ")        // Remove special characters
    .replace(/\s+/g, " ")
    .trim();
}
```

Examples of what this fixes:
```
"SICKO MODE (feat. Drake)" → "SICKO MODE"
"Travis Scott & Drake"     → "Travis Scott"
"God's Plan"               → "Gods Plan"
"R.I.P."                   → "RIP"

Move Spotify Search to the Edge Function
If Spotify search is currently running in the frontend, this is also a CORS issue — same as the OpenAI problem. Move it into the same generate-playlist Edge Function:
typescript// Inside your Supabase Edge Function
// After getting AI track list, search each track on Spotify server-side

async function searchSpotifyServerSide(trackName, artist, token) {

  const strategies = [
    `${trackName} ${artist}`,
    `${trackName}`,
    `${cleanTrackName(trackName)} ${cleanArtistName(artist)}`
  ];

  for (const query of strategies) {
    const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=5`;

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${spotifyToken}` }
    });

    const data = await response.json();
    const tracks = data?.tracks?.items;

    if (tracks && tracks.length > 0) {
      const best = tracks.find(t =>
        t.album?.images?.length > 0 && t.duration_ms > 0
      ) || tracks[0];

      return {
        track_name: best.name,
        artist: best.artists?.[0]?.name,
        album: best.album?.name,
        album_art: best.album?.images?.[1]?.url || best.album?.images?.[0]?.url,
        duration_ms: best.duration_ms,
        duration_formatted: formatDuration(best.duration_ms),
        preview_url: best.preview_url || null,
        spotify_uri: best.uri,
        spotify_id: best.id,
        spotify_url: best.external_urls?.spotify
      };
    }
  }

  // Genuine fallback — no Spotify data available
  return {
    track_name: trackName,
    artist: artist,
    album: null,
    album_art: null,
    duration_ms: 0,
    duration_formatted: "0:00",
    preview_url: null,
    spotify_uri: null,
    spotify_id: null,
    spotify_url: null
  };
}

Get a Fresh Spotify Token Inside the Edge Function
Make sure the token is being fetched fresh server-side using client credentials — not passed from the frontend:
typescriptasync function getSpotifyToken() {
  const clientId = Deno.env.get("SPOTIFY_CLIENT_ID");
  const clientSecret = Deno.env.get("SPOTIFY_CLIENT_SECRET");

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
    throw new Error("Spotify token failed: " + JSON.stringify(data));
  }

  console.log("Spotify token fetched successfully");
  return data.access_token;
}
Confirm these are set in Supabase secrets:

SPOTIFY_CLIENT_ID
SPOTIFY_CLIENT_SECRET


The Full Fixed Flow Inside the Edge Function
typescriptserve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { userPrompt, isRefinement } = await req.json();

    // Step 1 — Get Spotify token
    const spotifyToken = await getSpotifyToken();

    // Step 2 — Generate track list from OpenAI
    const aiPlaylist = await callOpenAI(userPrompt, isRefinement);

    // Step 3 — Search each track on Spotify
    const enrichedTracks = await Promise.all(
      aiPlaylist.tracks.map(track =>
        searchSpotifyServerSide(
          track.track_name || track.track,
          track.artist,
          spotifyToken
        )
      )
    );

    // Step 4 — Filter out complete failures, keep partial matches
    const validTracks = enrichedTracks.filter(t => t.track_name);

    // Step 5 — Return enriched playlist
    return new Response(
      JSON.stringify({ ...aiPlaylist, tracks: validTracks }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Edge Function error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

What This Fixes
ProblemCauseFix"SICKO MODE" not foundStrict track: filter rejecting valid matchesNatural query without field filtersSpecial characters breaking search' and . in track namescleanTrackName() helperFeatured artists causing mismatchFull artist string not matchingcleanArtistName() helperAll tracks falling backSingle search strategy failing3-strategy fallback waterfallCORS blocking Spotify searchCalled from browserMoved fully into Edge Function