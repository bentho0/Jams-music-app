 Replace Edit Prompt Section with AI Refinement Input
Find the existing "Edit Prompt" section at the bottom of the playlist screen and replace it entirely with an AI natural language input field that allows users to refine and adjust their current playlist conversationally. Do not change any other part of the playlist screen.

Step 1 — Remove the Existing Edit Prompt Section
Find and completely remove:

The current "Edit Prompt" bar, button, or section at the bottom of the playlist screen
Any associated state or logic tied to it
Do not remove anything else on the page


Step 2 — Build the AI Refinement Input Bar
Replace it with a sticky input bar that sits at the bottom of the playlist screen at all times. It should feel like a chat input — always visible, always ready.
Visual structure (left to right):
[ ✨ ]  [ Refine your playlist... ]  [ → ]

Left: A small sparkle or AI icon (✨) to signal this is AI-powered
Middle: Text input field with placeholder text
Right: Submit arrow button

Placeholder text (cycles or stays static — your choice):
Refine your playlist...
Or use rotating placeholders for inspiration:
"Make it more melancholic..."
"Remove the hip hop tracks..."
"Push the energy higher..."
"Add more 90s songs..."
"Replace the last track..."

Step 3 — Input Bar Styling

Sticky — stays fixed at the bottom of the viewport as the user scrolls the track list
Background: match the existing app's card/surface color with a slight blur (backdrop-filter) so it feels elevated above the content
Full width minus 32px padding (16px each side)
Sits 16px from the bottom of the viewport
Height: 56px
Border radius: 28px (fully rounded pill shape)
Submit button: filled circle, same accent color used elsewhere in the app
On focus: input border subtly highlights using the app's accent color
On mobile: input bar sits just above the device's bottom safe area


Step 4 — Wire Up the Refinement Logic
When the user submits a refinement prompt, send it to the AI along with the current playlist as context:
javascriptasync function refinePlaylist(userRefinementPrompt, currentPlaylist) {

  const response = await fetch("/api/refine-playlist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({

      refinement_prompt: userRefinementPrompt,

      current_playlist: {
        title: currentPlaylist.playlist_title,
        tracks: currentPlaylist.tracks.map(t => ({
          track_name: t.track_name,
          artist: t.artist,
          position: t.position
        }))
      }
    })
  });

  const refined = await response.json();
  return refined;
}
```

---

### Step 5 — AI Refinement System Prompt

Add this as the system prompt for the refinement API call:
```
You are refining an existing AI-generated playlist based on the user's 
natural language instruction. 

You will receive:
1. The user's refinement request
2. The current playlist track list

Your job is to make targeted changes only. Do not regenerate the entire 
playlist from scratch unless the user explicitly asks for it.

Types of changes you should handle:

MOOD SHIFTS — "make it more melancholic", "push the energy higher"
→ Replace 30–50% of tracks to shift the overall mood while keeping 
  the best-fitting existing tracks

GENRE CHANGES — "remove the hip hop", "add more R&B"
→ Identify and replace only the tracks that don't fit the new direction

ERA REQUESTS — "more 90s songs", "keep it modern"
→ Replace tracks that fall outside the requested era

SPECIFIC TRACK CHANGES — "replace the 4th song", "remove Drake"
→ Make only that specific change, leave everything else untouched

ENERGY CHANGES — "slow it down", "make it more upbeat"
→ Replace tracks that conflict with the new energy level

ADDITION REQUESTS — "add more female artists", "include some jazz"
→ Swap in tracks that satisfy the request without breaking the 
  existing vibe

RULES:
- Always return the full updated playlist in the same JSON format
- Minimum 10 tracks at all times
- Never repeat tracks from the current playlist unless keeping them
- Preserve tracks that already fit the refinement request
- Make the smallest change necessary to satisfy the user's request
- Never explain your changes in the response — only return the JSON
```

---

### Step 6 — Loading State During Refinement

While the AI is processing the refinement:

- The input bar submit button changes to a **loading spinner**
- The existing track list shows a **subtle pulse animation** on each row — same skeleton style used elsewhere
- The input field becomes **disabled** (no new submissions until current one completes)
- The playlist title and header remain fully visible — only the track rows pulse

Do not show a full page loader. Keep the existing content visible while the update processes.

---

### Step 7 — Update the Playlist After Refinement

When the refined playlist returns:

1. **Smoothly update** the track list — do not flash or hard reload the page
2. Tracks that **stayed the same** remain in place with no animation
3. Tracks that are **new** fade in with a subtle entrance (opacity 0 → 1, 300ms)
4. Tracks that were **removed** fade out before the new ones appear (opacity 1 → 0, 200ms)
5. The playlist title and description update if the AI changed them
6. Mood tags update if changed
7. The input field **clears** and becomes active again ready for the next refinement

---

### Step 8 — Refinement History (Subtle)

Keep a small internal log of refinement prompts used in the session. Display them as a **collapsible history** just above the input bar:
```
Recent adjustments:
"Make it more melancholic" · "Remove the hip hop" · "Add 90s songs"
```

- Only show if at least one refinement has been made
- Each past prompt is clickable — clicking it re-applies that refinement
- Collapsed by default, expandable with a small chevron
- Disappears if user starts a completely new playlist

---

### Step 9 — Empty & Error States

**If the user submits an empty input:**
- Shake the input bar subtly (2px left-right, 300ms)
- Do not show an error message — the shake is enough

**If the refinement API call fails:**
- Input bar returns to normal state
- Small inline error appears above the input:
```
Couldn't update the playlist — try again

Auto-dismisses after 4 seconds
Playlist remains unchanged


Step 10 — Mobile Keyboard Behavior
On mobile, when the user taps the input field:

The keyboard pushes the input bar up naturally
The playlist content scrolls so the track list remains visible above the input
The input bar does not overlap any track content when the keyboard is open
On keyboard dismiss, the input bar returns to its default bottom position


What Must Not Change:

Playlist title, description, and mood tags display
Track list layout and styling
"Save This Playlist →" button and Tunemymusic flow
"Share Playlist" button and share modal
Post-Tunemymusic return toast
Any other existing feature or UI element

What Is Being Replaced:

The existing "Edit Prompt" section at the bottom — removed entirely

What Is Being Added:

Sticky AI refinement input bar at the bottom
Refinement API call with current playlist as context
AI refinement system prompt
Loading state on track rows during refinement
Smooth track update animations
Collapsible refinement history
Empty input shake animation
Error state handling
Mobile keyboard behavior