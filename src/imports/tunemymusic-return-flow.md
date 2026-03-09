 Implement Post-Tunemymusic Return Experience
Add the user return flow that triggers when a user comes back to the app after being sent to Tunemymusic. This is a new feature to be added on top of the existing playlist screen. Do not change any existing UI, layout, or functionality — only add the new components described below.

Step 1 — Detect When User Returns to the Tab
Use the browser's visibilitychange event to detect when the user switches back to your app's tab. This should only trigger if the Tunemymusic tab was opened — not on every tab switch.
javascript// Set a flag when Tunemymusic is opened
let tunemymusicOpened = false;

function openTunemymusic(playlist) {
  tunemymusicOpened = true;
  // ... existing Tunemymusic redirect logic
}

// Listen for user returning to the tab
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible" && tunemymusicOpened) {
    tunemymusicOpened = false; // Reset the flag
    showReturnToast();         // Trigger the toast
  }
});
```

---

### Step 2 — Build the Check-in Toast

Create a toast component that appears at the **bottom center** of the screen when the user returns. It should:

- Slide up from the bottom with a smooth animation (200ms ease-in)
- Sit above any existing bottom padding
- Not block or overlay the playlist content significantly
- Auto-dismiss after **8 seconds** if the user does not interact with it
- Be manually dismissible via an **× icon** in the top right corner

**Toast content:**
```
Did your playlist save successfully?

[ ✓ Yes, it worked ]     [ ✗ I had trouble ]
```

**Toast styling:**
- Background: match the existing modal/card background color in the app
- Two buttons side by side: success button on the left, trouble button on the right
- Success button: green, same green used elsewhere in the app
- Trouble button: outlined/ghost style, no fill
- Dismiss × icon: top right corner, small, low opacity

**Toast dimensions:**
- Width: 420px on desktop, full width minus 32px margin on mobile
- Sits 24px from the bottom of the viewport

---

### Step 3 — Success Path ("✓ Yes, it worked")

When the user clicks the success button:

1. The toast slides out and is replaced by a **success state toast** in the same position:
```
🎵 Amazing — enjoy the playlist!

[ Generate New Playlist ]    [ Tweak This One ]
```

2. This success toast does **not** auto-dismiss — it stays until the user takes an action or dismisses it manually

3. **"Generate New Playlist"** — clears the current playlist and returns the user to the prompt input screen with an empty field

4. **"Tweak This One"** — returns the user to the prompt input screen with their **original prompt pre-filled** in the input field, ready to edit and regenerate

---

### Step 4 — Trouble Path ("✗ I had trouble")

When the user clicks the trouble button:

1. The check-in toast expands inline into a **help panel** — same container, no new modal

2. The help panel content:
```
No worries — here's what to try:

-  Make sure you selected "Free Text" as 
   the source on Tunemymusic

-  Your track list is still in your clipboard
   — try pasting again

-  If Tunemymusic isn't working, use the 
   Copy Track List option below

[ Re-open Tunemymusic ]    [ Copy Track List Again ]

"Re-open Tunemymusic" — runs the same Tunemymusic redirect function again, copies track list to clipboard again, opens Tunemymusic in a new tab again
"Copy Track List Again" — silently copies the track list to clipboard and changes the button text to "✓ Copied!" for 2 seconds then resets
Help panel also has an × dismiss button in the top right


Step 5 — No Response Path (Auto-dismiss)
If the user does not interact with the check-in toast:

After 8 seconds, the toast slides back down and disappears
A countdown is not shown to the user — the dismiss is silent
The playlist screen returns to its normal state exactly as the user left it
No data is lost, no state changes


Step 6 — Toast Animation Specs
ActionAnimationToast appearsSlide up from bottom, 200ms ease-inToast auto-dismissesSlide down to bottom, 300ms ease-outToast manually dismissedFade out, 150msCheck-in expands to help panelHeight expand, 250ms ease-in-outSuccess toast replaces check-inCross-fade, 200ms

Step 7 — Mobile Behavior
On screens smaller than 768px:

Toast spans full width minus 32px (16px margin each side)
The two buttons stack vertically — success button on top, trouble button below
Help panel bullet points remain as single column
The two action buttons in the help panel also stack vertically


State Management
Track these states:
javascriptconst toastStates = {
  HIDDEN: "hidden",           // Default, toast not visible
  CHECK_IN: "checkin",        // "Did your playlist save?"
  SUCCESS: "success",         // "Amazing — enjoy the playlist!"
  HELP: "help",               // Expanded help panel
}
Only one toast state is active at a time. Transitioning between states uses the animations defined in Step 6.

What Must Not Change:

The existing playlist display
The "Save This Playlist →" button
The Tunemymusic modal and its copy
The "Copy Track List" button
Any other existing feature or UI element
The overall page layout and scroll behavior

What Is Being Added:

The visibilitychange event listener
The tunemymusicOpened flag
The toast component with all its states
The success path actions
The help panel with recovery actions
Mobile responsive behavior for the toast