import { useEffect, useRef } from "react";
import LiquidGlassPill from "./LiquidGlassPill";
import MetalSurface from "./MetalSurface";
import { openWaitlist } from "./WaitlistDialog";
import { lowPower, onPowerChange } from "../lib/perf";
import { PEARL, STAINLESS } from "../shaders/liquidMetal";
import "./Hero.css";

const LOCKUP_SRC = "/icons/quanthive-lockup.svg";
// Flash's hero (frames 5:3615, 5:3695): its logo in solid white, no shader.
const FLASH_LOGO_SRC = "/images/figma-product/flash-logo-white.svg";
// The edge marks: the landing ornaments' artwork and bevel (EdgeMotifs.tsx), in
// white metal.
const MOTIF_SRC = "/icons/hero-motif.svg";
const MOTIF_ART_SHARE = 393.649 / 453.649;
const MOTIF_BEVEL = 0.05;

// The lockup SVG carries transparent padding around its artwork, which the mask
// pipeline needs (see the file's own comment). `artHeightShare` converts a bevel
// fraction defined against the ARTWORK into one against the padded box.
const LOCKUP_ART_SHARE = 2365.401 / 2665.401;

// How quickly the rays swing toward the pointer, per frame (0–1).
const FOLLOW_EASE = 0.1;
// The two rays' anchors on the hero's top edge, as a share of its width. These
// must match `left` on .hero__ray--a / --b in Hero.css.
const RAY_ANCHORS = [0.28, 0.72] as const;

// Flash's hero plays a pass of the rays on its own, as if an unseen pointer
// swept the page: in from the top centre, down to 80% of the height, back up to
// 25%, and down to settle at 70% — each leg eased in and out so it reads as one
// unhurried movement. Heights are shares of the hero, so it plays the same at any
// size. The pass plays through whatever the mouse does (the click that brought
// the reader here moves it); the rays follow a real pointer once it's done.
const AUTO_START_MS = 0; // from the moment the page loads
const AUTO_PATH: { y: number; ms: number }[] = [
  { y: 0, ms: 0 },
  { y: 0.8, ms: 3600 },
  { y: 0.25, ms: 3200 },
  { y: 0.7, ms: 3000 },
];
const easeInOutSine = (t: number) => 0.5 - Math.cos(Math.PI * t) / 2;

/** Where the auto pass is at `elapsed` ms: a height share, or null once done. */
function autoY(elapsed: number) {
  let t = elapsed;
  for (let i = 1; i < AUTO_PATH.length; i++) {
    const leg = AUTO_PATH[i]!;
    if (t <= leg.ms) return AUTO_PATH[i - 1]!.y + (leg.y - AUTO_PATH[i - 1]!.y) * easeInOutSine(t / leg.ms);
    t -= leg.ms;
  }
  return null;
}

/**
 * The two light rays: each stays pinned to its anchor on the top edge while its
 * far end swings to point at the pointer. Shown while a mouse is over the page,
 * or (`auto`) through the pass above, on any device.
 */
function useLightRays(auto = false, delayMs = 0) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = ref.current;
    if (!layer) return;
    const hover = window.matchMedia("(hover: hover)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const playAuto = auto && !reduce;
    if (!hover && !playAuto) return;
    const rays = Array.from(layer.querySelectorAll<HTMLElement>(".hero__ray"));

    let frame = 0;
    const target = RAY_ANCHORS.map(() => 0);
    const current = RAY_ANCHORS.map(() => 0);
    // The auto pass runs to its end; a pointer that moves meanwhile is remembered
    // and taken up after.
    let autoOn = playAuto;
    let pointer: { x: number; y: number } | null = null;
    const autoFrom = performance.now() + AUTO_START_MS + delayMs;
    // The pass is already eased, so the rays ride it directly rather than chasing
    // it (chasing a moving target is what made it feel springy). The point is kept
    // a little below the top edge, so the rays open from a gentle angle, not flat.
    const AUTO_TOP = 0.08;

    // A ray drawn straight down, rotated by θ, points along (−sin θ, cos θ); so to
    // aim it at (x, y) from its anchor, θ = −atan2(dx, dy). x, y within the layer.
    const aim = (x: number, y: number) => {
      const box = layer.getBoundingClientRect();
      RAY_ANCHORS.forEach((anchor, i) => {
        target[i] = (-Math.atan2(x - box.width * anchor, Math.max(y, 1)) * 180) / Math.PI;
      });
    };

    const step = (now: number) => {
      let moving = false;
      if (autoOn) {
        const y = autoY(Math.max(0, now - autoFrom));
        if (y === null) {
          autoOn = false;
          if (pointer) aim(pointer.x, pointer.y);
        } else {
          const box = layer.getBoundingClientRect();
          aim(box.width / 2, Math.max(y, AUTO_TOP) * box.height);
          for (let i = 0; i < current.length; i++) current[i] = target[i] ?? 0;
          if (now >= autoFrom) layer.dataset.rays = "";
        }
        moving = autoOn;
      }
      rays.forEach((ray, i) => {
        const goal = target[i] ?? 0;
        const value = (current[i] ?? 0) + (goal - (current[i] ?? 0)) * FOLLOW_EASE;
        current[i] = value;
        if (Math.abs(goal - value) > 0.02) moving = true;
        ray.style.setProperty("--ray-a", `${value.toFixed(2)}deg`);
      });
      frame = moving ? requestAnimationFrame(step) : 0;
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const box = layer.getBoundingClientRect();
      pointer = { x: event.clientX - box.left, y: event.clientY - box.top };
      if (autoOn) return;
      aim(pointer.x, pointer.y);
      layer.dataset.rays = "";
      if (!frame) frame = requestAnimationFrame(step);
    };

    const onLeave = () => {
      if (!autoOn) delete layer.dataset.rays;
    };

    if (playAuto) frame = requestAnimationFrame(step);
    if (hover) {
      window.addEventListener("pointermove", onMove, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);
    }
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(frame);
    };
  }, [auto, delayMs]);

  return ref;
}

/** One glyph (or pair) of the headline set in a different face. */
function G({ f, tight, children }: { f: "pg" | "hg" | "sg"; tight?: boolean; children: string }) {
  return (
    <span className={`hero__glyph hero__glyph--${f}`} data-tight={tight || undefined}>
      {children}
    </span>
  );
}

/** The waitlist key (frame 5:3695): a pill of clear liquid glass (LiquidGlassPill),
 *  its label and a white disc with an arrow. Opens the waitlist form. */
function WaitlistButton({ onOpen }: { onOpen: () => void }) {
  return (
    <a
      className="hero__cta"
      href="#waitlist"
      aria-haspopup="dialog"
      onClick={(event) => {
        event.preventDefault();
        onOpen();
      }}
    >
      <LiquidGlassPill />
      <span className="hero__cta-label">Join waitlist</span>
      <span className="hero__cta-disc" aria-hidden>
        <svg viewBox="0 0 32 32">
          <path d="M16 10V22M21.25 15.25L16 10L10.75 15.25" />
        </svg>
      </span>
    </a>
  );
}

/**
 * The landing hero, or (variant "flash") the product page's: the same stage and
 * the same headline in the same place, on a dark ground — Flash's logo opens it
 * in place of the QuantHive lockup, with the caption under it (frame 5:3615), then
 * hands over to the headline, a line of its own and the waitlist key.
 *
 * `handoff`: arrived from the other hero by a page change (App.tsx): its timeline
 * waits for the change, and its edge marks morph across rather than enter.
 */
/** The headline's two lines; single letters set in other faces, exactly as the
 *  frame does. */
function HeadlineText() {
  return (
    <>
      <span className="hero__headline-line">
        F<G f="pg">i</G>nanc<G f="pg">i</G>al Anal<G f="sg">y</G><G f="pg">t</G>ics.
      </span>{" "}
      <span className="hero__headline-line">
        <G f="pg" tight>At</G>
        <G f="pg">{" "}</G>S<G f="hg">p</G>ee<G f="hg">d</G>.
      </span>
    </>
  );
}

/**
 * The glint's filter: from the letters' outline, a thin band just OUTSIDE it
 * (dilated, less the letters), pushed about by slowly churning turbulence so it
 * swells into small bumps that stand off the edge, then softened, haloed and
 * lit white — and cut back to outside the letters, so none of it lies on them.
 */
function GlintFilter() {
  // On weaker devices the turbulence holds still (its churn re-renders the glow
  // every frame); the sweep still carries the glint across.
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const pause = () => {
      if (lowPower()) ref.current?.pauseAnimations();
    };
    pause();
    return onPowerChange(pause);
  }, []);
  return (
    <svg ref={ref} className="hero__glint-defs" width="0" height="0" aria-hidden focusable="false">
      {/* The headline's, a gentler one for it on phones, and a finer one for the
          much smaller logo. */}
      <GlintFilterDef id="hero-glint" ring={1.6} bumps={9} soft={0.8} halo={4} frequency={0.045} />
      <GlintFilterDef id="hero-glint-sm" ring={1.1} bumps={4.5} soft={0.6} halo={2.6} frequency={0.07} />
      <GlintFilterDef id="hero-glint-fine" ring={0.9} bumps={3.5} soft={0.5} halo={2.2} frequency={0.09} />
    </svg>
  );
}

function GlintFilterDef({ id, ring, bumps, soft, halo, frequency }: {
  id: string; ring: number; bumps: number; soft: number; halo: number; frequency: number;
}) {
  const f = (k: number) => (frequency * k).toFixed(3);
  return (
    <filter id={id} x="-5%" y="-20%" width="110%" height="140%" colorInterpolationFilters="sRGB">
      <feMorphology in="SourceAlpha" operator="dilate" radius={ring} result="fat" />
      <feComposite in="fat" in2="SourceAlpha" operator="out" result="ring" />
      <feTurbulence type="fractalNoise" baseFrequency={frequency} numOctaves="2" seed="7" result="noise">
        <animate attributeName="baseFrequency" dur="11s" values={`${f(0.9)};${f(1.3)};${f(1)};${f(0.9)}`} repeatCount="indefinite" />
      </feTurbulence>
      <feDisplacementMap in="ring" in2="noise" scale={bumps} xChannelSelector="R" yChannelSelector="G" result="bumps" />
      <feGaussianBlur in="bumps" stdDeviation={soft} result="soft" />
      <feGaussianBlur in="bumps" stdDeviation={halo} result="halo" />
      <feMerge result="glow">
        <feMergeNode in="halo" />
        <feMergeNode in="soft" />
        <feMergeNode in="soft" />
      </feMerge>
      <feComposite in="glow" in2="SourceAlpha" operator="out" result="outside" />
      <feFlood floodColor="#ffffff" />
      <feComposite in2="outside" operator="in" />
    </filter>
  );
}

export default function Hero({
  recessed = false,
  variant = "quanthive",
  handoff = false,
}: {
  recessed?: boolean;
  variant?: "quanthive" | "flash";
  handoff?: boolean;
}) {
  const flash = variant === "flash";
  // Arriving from the other page, the sweep waits for the page change
  // (--page-t0, page-transition.css).
  const lightRef = useLightRays(flash, handoff ? 1500 : 0);

  return (
    <main
      className={`hero${flash ? " hero--flash" : ""}`}
      data-recessed={recessed || undefined}
      data-handoff={handoff || undefined}
      aria-label={flash ? "Flash" : undefined}
    >
      <div className="hero__grid" aria-hidden />
      {flash && <GlintFilter />}
      {/* Flash's edge marks: the landing ornaments in white metal. */}
      {flash &&
        (["left", "right"] as const).map((side) => (
          <MetalSurface
            key={side}
            className={`hero__motif hero__motif--${side}`}
            src={MOTIF_SRC}
            artHeightShare={MOTIF_ART_SHARE}
            bevelFrac={MOTIF_BEVEL}
            trackPointer={false}
            preset={PEARL}
            aria-hidden
          />
        ))}
      <div className="hero__light" ref={lightRef} aria-hidden>
        <span className="hero__blob hero__blob--big-a" />
        <span className="hero__blob hero__blob--big-b" />
        <span className="hero__blob hero__blob--medium" />
        <span className="hero__blob hero__blob--small hero__blob--small-a" />
        <span className="hero__blob hero__blob--small hero__blob--small-b" />
        <span className="hero__blob hero__blob--small hero__blob--small-c" />
        <span className="hero__ray hero__ray--a" />
        <span className="hero__ray hero__ray--b" />
      </div>

      <div className="hero__inner">
        {/* The lockup opens the page, then lifts away and the headline rises into
            its place (frame 4034:1457). The lockup overlays the headline's box, so
            both share one centre without either moving the layout. */}
        <div className="hero__stage">
          <h1 className="hero__headline">
            <HeadlineText />
          </h1>
          {/* Flash: light catching the headline's edges — a copy of it, drawn only
              as a bumpy glow just outside its letters, swept across (Hero.css). */}
          {flash && (
            <div className="hero__glint" aria-hidden>
              <div className="hero__headline hero__headline--glint">
                <HeadlineText />
              </div>
            </div>
          )}
          {flash ? (
            <>
              <img className="hero__lockup hero__lockup--flash" src={FLASH_LOGO_SRC} alt="" aria-hidden />
              {/* The same glint as the headline's, passing once over the logo
                  while it holds (Hero.css). */}
              <div className="hero__glint hero__glint--logo" aria-hidden>
                <img className="hero__lockup hero__lockup--flash" src={FLASH_LOGO_SRC} alt="" />
              </div>
            </>
          ) : (
            <MetalSurface
              className="hero__lockup"
              src={LOCKUP_SRC}
              artHeightShare={LOCKUP_ART_SHARE}
              bevelFrac={STAINLESS.bevelFrac}
              aria-hidden
            />
          )}
          {/* Flash: the landing caption, under the logo while it shows. */}
          {flash && (
            <div className="hero__sub-wrap hero__sub-wrap--logo" aria-hidden>
              <p className="hero__sub hero__sub--logo">
                <span>
                  Transform complex market data<br className="hero__sub-break" /> into actionable
                </span>{" "}
                <span>investment intelligence.</span>
              </p>
            </div>
          )}
        </div>
        {/* Hung below the headline, out of flow, so the headline alone is what sits
            dead centre in the hero. */}
        <div className="hero__sub-wrap">
          {flash ? (
            <>
              <p className="hero__sub hero__sub--flash">
                <span>Flash launches in 8 weeks.</span> <span>Join the waitlist for early access.</span>
              </p>
              <div className="hero__cta-slot hero__cta-slot--inline">
                <WaitlistButton onOpen={openWaitlist} />
              </div>
            </>
          ) : (
            <p className="hero__sub">
              <span>
                Transform complex market data<br className="hero__sub-break" /> into actionable
              </span>{" "}
              <span>investment intelligence.</span>
            </p>
          )}
        </div>
      </div>
      {/* Phones: the waitlist key sits at the foot of the hero instead (Hero.css
          shows one slot or the other). */}
      {flash && (
        <div className="hero__cta-slot hero__cta-slot--dock">
          <WaitlistButton onOpen={openWaitlist} />
        </div>
      )}
    </main>
  );
}
