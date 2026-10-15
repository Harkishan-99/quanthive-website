import { useCallback, useEffect, useRef, useState } from "react";
import VideoPromptGlass from "./VideoPromptGlass";
import "./Showcase.css";

// The video panel's shot for a big screen: the live animation (not a recording),
// filling a landscape screen with a centred browser window, or on a 9:16 stage
// centred on a full-screen ground on a phone or portrait display — its lattice
// running edge to edge either way. Opened over the page by the panel's full-screen key, or on its own at
// /showcase for a display that should just run the demo.
//
// The controls (and the pointer) fade away after a moment of stillness, so a
// display shows nothing but the demo; any movement brings them back.

const IDLE_MS = 2200;

export default function Showcase({ onClose, compare = false }: { onClose?: () => void; compare?: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [idle, setIdle] = useState(false);
  const [fullscreen, setFullscreen] = useState(() => !!document.fullscreenElement);
  const idleTimer = useRef(0);
  const canFullscreen = typeof document.documentElement.requestFullscreen === "function";
  // A large landscape screen ends each run on the QuantHive logo, and can loop or
  // play once (the stage there is the whole screen — see Showcase.css).
  const LARGE = "(min-aspect-ratio: 1/1) and (min-width: 900px)";
  const [large, setLarge] = useState(() => window.matchMedia(LARGE).matches);
  useEffect(() => {
    const query = window.matchMedia(LARGE);
    const update = () => setLarge(query.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  const [loop, setLoop] = useState(true);

  const wake = useCallback(() => {
    setIdle(false);
    window.clearTimeout(idleTimer.current);
    idleTimer.current = window.setTimeout(() => setIdle(true), IDLE_MS);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
    else void document.documentElement.requestFullscreen?.().catch(() => {});
  }, []);

  const close = useCallback(() => {
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
    onClose?.();
  }, [onClose]);

  useEffect(() => {
    wake();
    // Opened over the page: hold the page still underneath.
    const html = document.documentElement;
    const overflow = html.style.overflow;
    if (onClose) html.style.overflow = "hidden";

    // Leaving full screen (Esc) closes the overlay it was opened in.
    let wasFullscreen = !!document.fullscreenElement;
    const onFullscreenChange = () => {
      const now = !!document.fullscreenElement;
      setFullscreen(now);
      if (wasFullscreen && !now && onClose) onClose();
      wasFullscreen = now;
    };
    const onKey = (event: KeyboardEvent) => {
      wake();
      if (event.key === "f" || event.key === "F") toggleFullscreen();
      else if (event.key === "Escape" && !document.fullscreenElement) onClose?.();
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(idleTimer.current);
      html.style.overflow = overflow;
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      window.removeEventListener("keydown", onKey);
    };
  }, [wake, toggleFullscreen, onClose]);

  return (
    <div
      ref={rootRef}
      className="showcase"
      data-idle={idle || undefined}
      data-lenis-prevent
      onPointerMove={wake}
      onPointerDown={wake}
      // On its own page, a click anywhere goes full screen (the browser needs a
      // gesture for it); over the site, the key that opened it already did.
      onClick={() => !onClose && !document.fullscreenElement && toggleFullscreen()}
      role="dialog"
      aria-label="Flash demo, full screen"
    >
      <div className="showcase__stage">
        <VideoPromptGlass variant="showcase" compare={compare} outro={large} loop={!large || loop} />
      </div>

      <div className="showcase__controls">
        {/* Large screens: loop the whole thing, or play it once and rest on the logo. */}
        {large && (
          <div className="showcase__mode" role="group" aria-label="Playback">
            <button
              type="button"
              aria-pressed={loop}
              onClick={(event) => {
                event.stopPropagation();
                setLoop(true);
              }}
              title="Loop"
            >
              <svg viewBox="0 0 16 16" aria-hidden>
                <path d="M3 7.5A4.5 4.5 0 0 1 11.6 5.6M13 8.5a4.5 4.5 0 0 1-8.6 1.9" />
                <path d="M11.9 2.8l-.3 2.8-2.8-.3M4.1 13.2l.3-2.8 2.8.3" />
              </svg>
              <span>Loop</span>
            </button>
            <button
              type="button"
              aria-pressed={!loop}
              onClick={(event) => {
                event.stopPropagation();
                setLoop(false);
              }}
              title="Play once"
            >
              <svg viewBox="0 0 16 16" aria-hidden>
                <path d="M3 8h8.5M8.5 4.5 12 8l-3.5 3.5M13.5 3.5v9" />
              </svg>
              <span>Once</span>
            </button>
          </div>
        )}
        {canFullscreen && (
          <button
            type="button"
            className="showcase__control"
            onClick={(event) => {
              event.stopPropagation();
              toggleFullscreen();
            }}
            aria-label={fullscreen ? "Exit full screen" : "Full screen"}
            title={fullscreen ? "Exit full screen (F)" : "Full screen (F)"}
          >
            <svg viewBox="0 0 16 16" aria-hidden>
              {fullscreen ? (
                <path d="M6 2.5V6H2.5M10 2.5V6h3.5M6 13.5V10H2.5M10 13.5V10h3.5" />
              ) : (
                <path d="M2.5 6V2.5H6M13.5 6V2.5H10M2.5 10v3.5H6M13.5 10v3.5H10" />
              )}
            </svg>
          </button>
        )}
        {onClose && (
          <button
            type="button"
            className="showcase__control"
            onClick={(event) => {
              event.stopPropagation();
              close();
            }}
            aria-label="Close"
            title="Close (Esc)"
          >
            <svg viewBox="0 0 16 16" aria-hidden>
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>
        )}
      </div>

      {!onClose && !fullscreen && canFullscreen && (
        <p className="showcase__hint">Click anywhere or press F for full screen</p>
      )}
    </div>
  );
}
