import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type Ref,
} from "react";
import "./Seeker.css";

const TICKS = 121; // a major every 10th and a mid every 5th, so the dial reads in twelfths
const KEY_STEP = 1 / (TICKS - 1);
// After this long untouched (and not hovered), the dial dims back to its needle.
const IDLE_MS = 1000;
// While scrubbing, ticks this close to the needle (in ticks) show at full strength,
// then fade out over the next few.
const GLOW_FULL = 3;
const GLOW_FADE = 4;

/**
 * How much of the dial is lit:
 * - "hover":  the pointer is over the dial — every tick at full strength.
 * - "scrub":  the needle is being moved (drag, keys) — only the ticks around it.
 * - "idle":   a second untouched — the needle at 65%, the ticks at 20%.
 */
type Mode = "hover" | "scrub" | "idle";

/** Lets whatever the dial drives move its needle as it plays. */
export type SeekerHandle = {
  /** Show playback at `progress` (0–1); ignored while the reader is dragging. */
  show: (progress: number) => void;
};

// Playback moves the needle in steps this fine (of the dial's width), so the
// dial re-renders a few dozen times a second rather than every frame.
const SHOW_STEPS = 600;

/**
 * A radio-dial scrubber: a row of grey tick lines with an orange needle that can be
 * dragged, clicked to, or stepped with the arrow keys, like a video's seek bar.
 * It reports positions (0–1) through `onSeek`, brackets drags with
 * `onScrubStart`/`onScrubEnd`, and follows playback through `controlRef.show`.
 */
export default function Seeker({
  initial = 0,
  onSeek,
  onScrubStart,
  onScrubEnd,
  controlRef,
  label = "Timeline",
  hidden = false,
}: {
  initial?: number;
  onSeek?: (progress: number) => void;
  onScrubStart?: () => void;
  onScrubEnd?: () => void;
  controlRef?: Ref<SeekerHandle>;
  label?: string;
  /** Tucked away (faded, not focusable), still following playback. */
  hidden?: boolean;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(initial);
  const [mode, setMode] = useState<Mode>("scrub");

  // Refs, not state, so the handlers and the timer always see the current values.
  const dragging = useRef(false);
  const hovered = useRef(false);
  const idleTimer = useRef(0);

  // The dial's resting state, once nothing is holding it awake: lit while hovered,
  // otherwise dimmed after IDLE_MS. Dragging overrides both.
  const settle = useCallback((after: Mode) => {
    window.clearTimeout(idleTimer.current);
    if (dragging.current) return setMode("scrub");
    if (hovered.current) return setMode("hover");
    setMode(after);
    idleTimer.current = window.setTimeout(() => {
      if (!dragging.current && !hovered.current) setMode("idle");
    }, IDLE_MS);
  }, []);

  // Playback moves the needle without waking the dial.
  useImperativeHandle(
    controlRef,
    () => ({
      show: (next) => {
        if (dragging.current) return;
        const stepped = Math.round(Math.min(1, Math.max(0, next)) * SHOW_STEPS) / SHOW_STEPS;
        setProgress((current) => (current === stepped ? current : stepped));
      },
    }),
    [],
  );

  useEffect(() => {
    settle("scrub");
    return () => window.clearTimeout(idleTimer.current);
  }, [settle]);

  const seek = useCallback(
    (next: number) => {
      const clamped = Math.min(1, Math.max(0, next));
      setProgress(clamped);
      onSeek?.(clamped);
    },
    [onSeek],
  );

  const seekToPointer = (event: PointerEvent) => {
    const box = trackRef.current?.getBoundingClientRect();
    if (box) seek((event.clientX - box.left) / box.width);
  };

  const onPointerEnter = (event: PointerEvent) => {
    // Touch has no hover; a finger on the dial is a drag, handled below.
    if (event.pointerType === "mouse") hovered.current = true;
    settle("hover");
  };

  const onPointerLeave = () => {
    hovered.current = false;
    // Leaving straight after a drag (capture releases first) keeps the scrub look.
    settle(mode === "scrub" ? "scrub" : "hover");
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragging.current = true;
    onScrubStart?.();
    settle("scrub");
    seekToPointer(event);
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (dragging.current) seekToPointer(event);
  };

  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (dragging.current) onScrubEnd?.();
    dragging.current = false;
    // Pointer capture means a release outside the dial lands here, not on leave.
    const box = event.currentTarget.getBoundingClientRect();
    hovered.current =
      event.pointerType === "mouse" &&
      event.clientX >= box.left &&
      event.clientX <= box.right &&
      event.clientY >= box.top &&
      event.clientY <= box.bottom;
    settle("scrub");
  };

  const onKeyDown = (event: KeyboardEvent) => {
    const big = event.shiftKey ? 10 : 1;
    const moves: Record<string, number> = {
      ArrowLeft: progress - KEY_STEP * big,
      ArrowDown: progress - KEY_STEP * big,
      ArrowRight: progress + KEY_STEP * big,
      ArrowUp: progress + KEY_STEP * big,
      PageDown: progress - KEY_STEP * 10,
      PageUp: progress + KEY_STEP * 10,
      Home: 0,
      End: 1,
    };
    const next = moves[event.key];
    if (next === undefined) return;
    event.preventDefault();
    // Stepping is a scrub: light the ticks around the needle, then settle.
    if (!hovered.current) settle("scrub");
    seek(next);
  };

  const needleTick = progress * (TICKS - 1);

  return (
    <div
      className="seeker"
      ref={trackRef}
      role="slider"
      tabIndex={hidden ? -1 : 0}
      aria-hidden={hidden || undefined}
      data-hidden={hidden || undefined}
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress * 100)}
      data-mode={mode}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onFocus={() => settle("scrub")}
      onKeyDown={onKeyDown}
    >
      <div className="seeker__ticks" aria-hidden>
        {Array.from({ length: TICKS }, (_, i) => {
          const distance = Math.abs(i - needleTick);
          // 1 beside the needle, easing to 0 over GLOW_FADE ticks beyond GLOW_FULL.
          const glow = Math.max(0, Math.min(1, 1 - (distance - GLOW_FULL) / GLOW_FADE));
          return (
            <span
              key={i}
              className="seeker__tick"
              data-major={i % 10 === 0 || undefined}
              data-mid={i % 10 === 5 || undefined}
              data-passed={i <= needleTick || undefined}
              data-near={distance < 1.5 || undefined}
              style={glow > 0 ? ({ "--glow": glow.toFixed(2) } as CSSProperties) : undefined}
            />
          );
        })}
      </div>
      <span className="seeker__needle" style={{ left: `${progress * 100}%` }} aria-hidden />
    </div>
  );
}
