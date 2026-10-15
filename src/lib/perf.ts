// How much this device can draw. "low" on a weaker machine (few cores, little
// memory, or the reader has asked to save data), or on any machine that turns out
// not to keep up: frames are timed for a couple of seconds after load, and a
// device that can't hold ~40fps is moved to "low" then.
//
// "low" is set as data-perf on <html>, so CSS can drop the costliest effects
// (Hero.css, page-transition.css), and the WebGL surfaces render at a lower pixel
// density (lowPower(), onPowerChange()).

const EVENT = "quanthive:perf";

let low = (() => {
  if (typeof navigator === "undefined") return false;
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  if (nav.connection?.saveData) return true;
  if (nav.deviceMemory !== undefined && nav.deviceMemory <= 4) return true;
  return (nav.hardwareConcurrency || 8) <= 4;
})();

export const lowPower = () => low;

/** The most device pixels per CSS pixel worth drawing a WebGL surface at. */
export const maxDpr = (full = 2) => Math.min(window.devicePixelRatio || 1, low ? 1.25 : full);

export function onPowerChange(callback: () => void) {
  window.addEventListener(EVENT, callback);
  return () => window.removeEventListener(EVENT, callback);
}

function setLow() {
  if (low) return;
  low = true;
  document.documentElement.dataset.perf = "low";
  window.dispatchEvent(new Event(EVENT));
}

/** Marks the page, then watches the first frames. Call once, at start-up. */
export function watchPerformance() {
  if (low) {
    document.documentElement.dataset.perf = "low";
    return;
  }
  const frames: number[] = [];
  let last = 0;
  const start = performance.now();
  const tick = (now: number) => {
    if (document.visibilityState !== "visible") return; // a background tab isn't slow
    if (last) frames.push(now - last);
    last = now;
    // The first half-second is the page loading, slow on any machine.
    if (now - start < 500) frames.length = 0;
    if (now - start < 3000) {
      requestAnimationFrame(tick);
      return;
    }
    frames.sort((a, b) => a - b);
    const median = frames[Math.floor(frames.length / 2)] ?? 0;
    if (median > 25) setLow();
  };
  requestAnimationFrame(tick);
}
