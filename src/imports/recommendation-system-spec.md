Build a backend recommendation system for an AI-powered Spotify playlist generator.



What the system does:

The user provides a natural language playlist prompt (e.g. "songs for a late night drive when you're feeling nostalgic") and their Spotify account data. The system must analyze both and return a curated list of track recommendations.

Inputs the system receives:





User's natural language prompt — free-form text describing mood, activity, energy, vibe, context, or genre



Spotify user data (pulled via Spotify API):





Top tracks (short, medium, long term)



Top artists (short, medium, long term)



Recently played tracks



Saved/liked songs



Existing playlists and their tracks



Audio features of their most-played songs (tempo, energy, valence, danceability, acousticness, etc.)

What the system must do:

Step 1 — Prompt Analysis Parse the natural language prompt to extract:





Mood signals (happy, melancholic, hype, calm, nostalgic, etc.)



Energy level (low / medium / high)



Activity context (working out, studying, driving, partying, etc.)



Temporal/environmental context (morning, night, rainy day, etc.)



Any explicit genre or artist mentions

Step 2 — User Taste Profiling From the Spotify data, build a taste profile:





Preferred genres and subgenres



Typical audio feature ranges (e.g. user tends to like tempo 90–120 BPM, high valence)



Favorite eras/decades



Artist familiarity vs. discovery preference (based on how often they save new vs. known music)



Recency bias (weight recent listening more heavily than long-term)

Step 3 — Matching & Scoring Cross-reference the prompt analysis with the taste profile to:





Define target audio feature ranges for this specific playlist



Score candidate tracks against both the prompt intent and the user's taste DNA



Balance familiarity (tracks/artists the user knows) with discovery (new recommendations)

Step 4 — Track Selection Using Spotify's Recommendations API (/v1/recommendations), fetch candidate tracks using:





Seed artists and seed tracks derived from the taste profile



Target audio features calculated from Steps 1–3



Apply post-fetch filtering to re-rank and trim results based on the scoring model

Step 5 — Playlist Assembly Return a final ordered list of 20–30 tracks that:





Flow well together (smooth transitions in energy, tempo, and mood)



Honor the user's prompt intent



Feel personalized, not generic



Include a mix: ~60% familiar taste, ~40% discovery

Output the system returns:

json

{
  "playlist_title": "AI-generated title based on the prompt",
  "playlist_description": "Short description of the vibe",
  "tracks": [
    {
      "spotify_track_id": "...",
      "track_name": "...",
      "artist": "...",
      "reason": "Why this track was selected"
    }
  ],
  "mood_tags": ["nostalgic", "late night", "mellow"],
  "audio_profile": {
    "avg_tempo": 98,
    "avg_energy": 0.45,
    "avg_valence": 0.38
  }
}

