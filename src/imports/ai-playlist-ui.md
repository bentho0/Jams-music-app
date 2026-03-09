Build the UI for displaying the generated AI playlist. This is a single screen that appears after the recommendation system has returned its results. 



What this screen shows:

The user has submitted their prompt, and the AI has returned a playlist. This screen presents that playlist in a clean, immersive, music-first interface.



Core UI Sections:



1. Playlist Header





AI-generated playlist title (large, prominent)



AI-generated description/vibe summary (1–2 lines, subdued text)



Mood tags displayed as small pills/chips (e.g. late night, nostalgic, mellow)



Number of songs in the playlist and the time duration of the playlist



A hero visual — either a blurred mosaic of the top track album covers, or a single dominant gradient that reflects the mood (dark/cool for melancholic, warm/bright for energetic, etc.)



Play on Spotify button (primary CTA) — opens the playlist directly in Spotify



Regenerate button — lets the user re-run the AI with the same prompt



2. Track List Each track row contains:





Track number



Album art thumbnail (small, square, rounded corners)



Track name (primary text)



Artist name (secondary text)



Duration



Hover state: highlight row, show a play preview icon



A small familiarity indicator — distinguish between tracks the user already knows vs. new discoveries (e.g., a small ✦ New badge on discovery tracks)





3. Prompt Recap Bar





A small, non-intrusive bar near the bottom that echoes the user's original prompt in quotes



e.g., "songs for a late-night drive when you're feeling nostalgic"



Option to Edit Prompt — returns user to the input screen



Visual Design Direction:





Dark-mode first — deep blacks, dark grays, with accent colors



Spacing: generous padding, music-app feel (think Spotify meets a premium AI product)



Subtle glassmorphism or frosted card effect for the playlist header section



Mobile-responsive — the track list should stack cleanly on smaller screens





States to design:





Empty/Error: Friendly message if generation fails, with retry option 



Saving: Button feedback when the user saves to Spotify



Saved: Confirmation state — button changes to ✓ Saved

