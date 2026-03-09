🔧 Fix — Track Duration, Album Art, and Preview URL Not Displaying
Playlist tracks are generating but showing 0 seconds duration, no album art, and no preview audio. This is a Spotify search data mapping issue. Do not change any UI — only fix the data pipeline.

Audit Step 1 — Log the Raw Spotify Search Response
Find the Spotify track search function and add full logging immediately after the response returns:
javascriptasync function searchSpotify(trackName, artist) {

  const query = `track:${trackName} artist:${artist}`;
  const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=1`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${spotifyToken}` }
  });

  const data = await response.json();

  // ADD THIS LOG
  console.log("Spotify raw result for:", trackName, data);
  console.log("First track object:", data?.tracks?.items?.[0]);

  return data?.tracks?.items?.[0] || null;
}
Check the console after generating. The full Spotify track object should contain all fields. If it's null or incomplete, the search itself is failing.

Audit Step 2 — Fix the Data Mapping
After getting the Spotify track object, all fields must be explicitly mapped. This is the most common cause — the fields exist in the response but are being read from the wrong path.
Replace your current track mapping with this complete version:
javascriptfunction mapSpotifyTrack(spotifyTrack, aiTrack) {

  if (!spotifyTrack) {
    // Spotify search returned nothing — return AI data only, no art or preview
    return {
      track_name: aiTrack.track_name || aiTrack.track,
      artist: aiTrack.artist,
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

  return {
    track_name: spotifyTrack.name,
    artist: spotifyTrack.artists?.[0]?.name,
    all_artists: spotifyTrack.artists?.map(a => a.name).join(", "),
    album: spotifyTrack.album?.name,

    // Album art — always use index [1] for medium size (300x300)
    // [0] is 640px, [1] is 300px, [2] is 64px
    album_art: spotifyTrack.album?.images?.[1]?.url
      || spotifyTrack.album?.images?.[0]?.url
      || null,

    // Duration — Spotify returns milliseconds
    duration_ms: spotifyTrack.duration_ms,
    duration_formatted: formatDuration(spotifyTrack.duration_ms),

    // Preview — 30 second MP3 clip, can be null for some tracks
    preview_url: spotifyTrack.preview_url || null,

    // Spotify identifiers
    spotify_uri: spotifyTrack.uri,
    spotify_id: spotifyTrack.id,
    spotify_url: spotifyTrack.external_urls?.spotify
  };
}

Audit Step 3 — Fix Duration Formatting
Add this helper function if it doesn't exist or is broken:
javascriptfunction formatDuration(ms) {
  if (!ms || ms === 0) return "0:00";

  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  // Pad seconds to always show two digits e.g. 3:04 not 3:4
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
Common mistake: dividing by 1000 twice, or passing seconds instead of milliseconds into the formatter.

Audit Step 4 — Fix Album Art Display
In the track row UI component, confirm the album art image is reading from the correct field:
javascript// Wrong — common mistakes
<img src={track.image} />
<img src={track.artwork} />
<img src={track.cover} />
<img src={track.album_image} />

// Correct
<img src={track.album_art} />
Also add a fallback for when album art is null:
javascript<img
  src={track.album_art || "/placeholder-album.png"}
  alt={`${track.track_name} album art`}
  onError={(e) => {
    e.target.src = "/placeholder-album.png";
  }}
/>
If no placeholder image exists in the project, use a grey background div as fallback:
javascript{track.album_art ? (
  <img src={track.album_art} alt={track.track_name} />
) : (
  <div style={{
    width: 48,
    height: 48,
    borderRadius: 4,
    background: "#2a2a2a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  }}>
    🎵
  </div>
)}

Audit Step 5 — Fix Preview URL (Audio Player)
preview_url is a direct MP3 link from Spotify. It can be null for some tracks — this is normal and not a bug. Handle it explicitly:
javascript// In your audio player component
{track.preview_url ? (
  <audio controls src={track.preview_url}>
    Your browser does not support audio preview.
  </audio>
) : (
  <span style={{ opacity: 0.4, fontSize: 12 }}>
    No preview available
  </span>
)}
Also log it to confirm it's coming through:
javascriptconsole.log("Preview URL for", track.track_name, ":", track.preview_url);
Note: Spotify has been progressively removing preview URLs from their API for many tracks. If preview_url is null even after the fix, it means Spotify simply doesn't provide a preview for that track — not a bug in your code.

Audit Step 6 — Confirm Spotify Token is Valid
All three fields (album art, duration, preview) come from Spotify's search. If all three are missing together, the Spotify search is likely failing silently due to an expired or invalid token.
Add this token check:
javascriptasync function getSpotifyToken() {
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `Basic ${btoa(`${clientId}:${clientSecret}`)}`
    },
    body: "grant_type=client_credentials"
  });

  const data = await response.json();

  // Log token status
  console.log("Spotify token status:", response.status);
  console.log("Token received:", !!data.access_token);
  console.log("Token expires in:", data.expires_in, "seconds");

  if (!data.access_token) {
    throw new Error("Spotify token fetch failed: " + JSON.stringify(data));
  }

  return data.access_token;
}
If token fetch is returning an error, check that SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET are correctly set in your Supabase secrets.

What the Final Track Object Should Look Like
After all fixes, log the final track object before it reaches the UI:
javascriptconsole.log("Final track object:", {
  track_name: "Nights",
  artist: "Frank Ocean",
  album: "Blonde",
  album_art: "https://i.scdn.co/image/...",  // ← Should be a URL
  duration_ms: 307640,                        // ← Should be a number
  duration_formatted: "5:07",                 // ← Should be MM:SS
  preview_url: "https://p.scdn.co/mp3-preview/...", // ← URL or null
  spotify_uri: "spotify:track:7eqoqGkKwgOaWNNHx90uEZ"
});
If any field is undefined, null when it shouldn't be, or 0, trace back through the mapping to find where it's being lost.

Summary of What's Being Fixed
ProblemRoot CauseFixDuration shows 0:00duration_ms not mapped or formatter brokenExplicit mapping + formatDuration helperNo album artWrong field name or images array pathalbum.images[1].url with fallbackNo previewpreview_url not mapped or null not handledExplicit mapping + null state in UI