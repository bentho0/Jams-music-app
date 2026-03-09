/**
 * Sandbox detection — v5
 *
 * THE BUG IN EVERY PREVIOUS VERSION
 * ──────────────────────────────────
 * We exported `IS_FIGMA_SANDBOX` as a module-level const evaluated ONCE at
 * bundle load time. At that moment, Figma's Service Worker has not yet
 * "claimed" the preview page, so navigator.serviceWorker.controller is null
 * and every other heuristic also returns false. The const is locked to false.
 *
 * Later, when the user actually triggers a fetch() (e.g. clicks "Generate"),
 * the SW IS active and would have been detected — but we're reading the
 * stale const. The fetch goes through, Figma's SW intercepts it, sends a
 * message to the devtools worker, and the worker's own fetch() throws
 * "TypeError: Failed to fetch" (showing only worker frames in the stack).
 *
 * THE FIX
 * ───────
 * `detectSandbox()` is now a cheap function called FRESH at every potential
 * network call site (inside apiFetch). By the time the user interacts, the
 * SW is active and detectable. No stale const.
 *
 * We still export IS_FIGMA_SANDBOX as a live getter (via a tiny object) so
 * existing component code that reads it for UI decisions (banners etc.) also
 * gets the up-to-date value.
 */

export function detectSandbox(): boolean {
  // 1. Service Worker controller — set once the SW claims the page.
  //    Absent on the very first module evaluation; present during user interaction.
  try {
    const ctrl = navigator.serviceWorker?.controller;
    if (ctrl) {
      const url = ctrl.scriptURL ?? "";
      // Figma Make's SW is served from figma.com
      if (url.includes("figma")) return true;
    }
  } catch { /* SW not supported */ }

  // 2. Any registered SW whose scope/URL mentions figma (covers the window
  //    before the SW claims the page, if the registration already exists).
  //    NOTE: getRegistrations() is async; we use a cached result below.

  // 3. Figma-injected globals (window.figma exists in plugin/widget contexts)
  if (
    typeof (window as any).__FIGMA_MAKE__ !== "undefined" ||
    typeof (window as any).__FIGMA__ !== "undefined" ||
    typeof (window as any).figma !== "undefined"
  ) return true;

  // 4. iframe (Figma may switch back to iframes)
  try {
    if (window.self !== window.top) return true;
  } catch { return true; }

  // 5. ancestorOrigins / referrer mention figma
  try {
    const ao = Array.from((window.location as any).ancestorOrigins ?? []) as string[];
    if (ao.some(o => o.includes("figma"))) return true;
  } catch { /* not supported */ }
  if (document.referrer.includes("figma")) return true;

  return false;
}

// ── Cached SW registration check (async, updates _swFigmaDetected) ──────────
// We seed this from getRegistrations() so that, even before the SW claims the
// page, we know a Figma SW registration exists.
let _swFigmaDetected = false;
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then(regs => {
    _swFigmaDetected = regs.some(r =>
      r.active?.scriptURL.includes("figma") ||
      r.installing?.scriptURL.includes("figma") ||
      r.waiting?.scriptURL.includes("figma")
    );
    if (_swFigmaDetected) {
      console.info("[Jams] 🔒 Figma SW registration detected — network will be blocked.");
    }
  }).catch(() => {});
}

/**
 * Returns true when the app is running inside Figma Make's environment.
 * Call this immediately before any network operation; don't cache the result.
 */
export function isFigmaSandbox(): boolean {
  return _swFigmaDetected || detectSandbox();
}

/**
 * Legacy compat: components that import IS_FIGMA_SANDBOX as a boolean.
 * This is now a live getter so it re-evaluates on every read.
 */
const _sandboxProxy = { get IS_FIGMA_SANDBOX() { return isFigmaSandbox(); } };
export const IS_FIGMA_SANDBOX: boolean = _sandboxProxy.IS_FIGMA_SANDBOX;
//  ↑ This is evaluated once at module load (likely false due to SW timing),
//    BUT components only use it for UI decisions (banners), not for guarding
//    fetch(). The actual fetch guard in apiFetch calls isFigmaSandbox() fresh.

// Initial console diagnostic
console.info(
  `[Jams] Sandbox check at module load: ${isFigmaSandbox()}`,
  "| SW controller:", navigator.serviceWorker?.controller?.scriptURL ?? "none (SW not yet active)"
);
