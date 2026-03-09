Fix — Playlist Data Received But Not Displaying Correctly
The playlist is generating successfully (12 tracks confirmed in console) but album art, duration, and other track data are not showing in the UI. The data pipeline is working — this is purely a frontend rendering issue. Do not change any backend or Edge Function code.

Step 1 — Log the Exact Track Object Shape
Immediately after this existing log:
[Jams] Playlist received — title: Pumped Up Beats | tracks: 12
Add this log to see the exact shape of the data arriving at the UI:
javascriptconsole.log("Full playlist object:", JSON.stringify(playlist, null, 2));
console.log("First track full object:", JSON.stringify(playlist.tracks[0], null, 2));
This will reveal the exact field names the data is coming in as. Copy and paste the output here so we can see what the track object actually looks like before fixing the field mappings.

Step 2 — Audit the Track Row Component
Find the component that renders each track row and log what it receives:
javascriptfunction TrackRow({ track, index }) {

  // Add this log
  console.log(`Track ${index + 1} received:`, track);

  return (
    // existing JSX
  );
}
Check every field being read in the JSX against what the log shows. The mismatch between field names in the data and field names in the UI is almost certainly the cause.

Step 3 — Fix All Field Name References in the Track Row
Based on what the Spotify search returns, update every field reference in the track row component to match exactly:
javascriptfunction TrackRow({ track, index }) {
  return (
    <div className="track-row">

      {/* Track number */}
      <span>{index + 1}</span>

      {/* Album art */}
      {track.album_art ? (
        <img
          src={track.album_art}
          alt={track.track_name}
          width={48}
          height={48}
          style={{ borderRadius: 4, objectFit: "cover" }}
          onError={(e) => { e.target.style.display = "none"; }}
        />
      ) : (
        <div style={{
          width: 48, height: 48,
          borderRadius: 4,
          background: "#2a2a2a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 20
        }}>
          🎵
        </div>
      )}

      {/* Track name and artist */}
      <div>
        <p style={{ margin: 0, fontWeight: 600 }}>
          {track.track_name}
        </p>
        <p style={{ margin: 0, opacity: 0.6, fontSize: 13 }}>
          {track.artist}
        </p>
      </div>

      {/* Duration */}
      <span style={{ opacity: 0.5, fontSize: 13 }}>
        {track.duration_formatted || "—"}
      </span>

      {/* Preview player */}
      {track.preview_url ? (
        <audio controls src={track.preview_url} style={{ height: 32 }} />
      ) : (
        <span style={{ opacity: 0.3, fontSize: 11 }}>No preview</span>
      )}

    </div>
  );
}

Step 4 — Fix the Playlist Header Fields
Apply the same audit to the playlist header. Confirm these fields are being read correctly:
javascript// Playlist header component
function PlaylistHeader({ playlist }) {

  console.log("Playlist header data:", playlist);

  return (
    <div>
      <h1>{playlist.playlist_title}</h1>
      <p>{playlist.playlist_description}</p>

      {/* Mood tags */}
      <div>
        {playlist.mood_tags?.map((tag, i) => (
          <span key={i} className="mood-tag">{tag}</span>
        ))}
      </div>

      {/* Track count */}
      <span>{playlist.tracks?.length} tracks</span>
    </div>
  );
}

Step 5 — Confirm State is Being Set Correctly
Find where the playlist response is stored in state after the API call and confirm it's being set with the full object:
javascriptconst response = await generatePlaylist(userPrompt);

// Add this log before setting state
console.log("Setting playlist state with:", response);

// Confirm the state setter is receiving the full object
setPlaylist(response);          // Not response.data or response.playlist
setTracks(response.tracks);     // Not response.data.tracks
A common mistake is wrapping the response incorrectly:
javascript// Wrong
setPlaylist(response.data);
setPlaylist(response.playlist);
setPlaylist({ data: response });

// Correct
setPlaylist(response);