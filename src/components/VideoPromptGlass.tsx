import {
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type Ref,
} from "react";
import { LiveLoader, type Loader } from "./Capabilities";
import { useNearViewport } from "../lib/useNearViewport";
import "./VideoPromptGlass.css";

// The video panel's opening shot, frames 4048:3660 → 123:238.
//
// 1. A liquid-glass prompt types a question and its send button peels away: the
//    Flash product page's prompt (ProductPromptGlass) without its logo prelude,
//    dark here and refracting the panel's own lattice.
// 2. A pointer drifts in from the bottom-right corner on a human S-curve, clicks
//    send (the product page's contained shine), and the arrow gives way to card
//    two's search-bar loader.
// 3. The loader runs, the button melts away, and the prompt shrinks while the
//    Flash window springs in from the right. The shrunk prompt settles into the
//    window as the user's message, the avatar pops in beside it (nudging it
//    over), "Thought for 0.5s" rises in, and the answer box grows as its reply
//    streams in, word by word, like a model writing.
// 4. Below the reply the rest of the answer streams in block by block: four
//    metrics counting up, the shipments bar chart rising bar by bar, a note, and
//    the Brent line chart drawing itself. The box grows down to hold them, and
//    once its foot reaches the dial the window's content scrolls up under the
//    window's top edge to keep it in view, as a chat does.
//
// Everything is a pure function of the time into the shot, so it loops (holding
// the last frame a moment, then fading out) and can be scrubbed to any point —
// the panel's dial drives it through `controlRef` and follows it via `onProgress`.

const PROMPT = "Report on oil shock due to strait of hormuz closure";
const ANSWER =
  "The disruption of shipping through the Strait of Hormuz has triggered one of the most significant global energy shocks in recent history. The waterway, which historically carried approximately 20% of global petroleum consumption, has experienced severe restrictions following the escalation of the US–Iran conflict in February 2026.";
const ANSWER_WORDS = ANSWER.split(" ");

// Timeline (ms from the panel coming into view).
const START_DELAY_MS = 450; // let the panel finish rising in first
const APPEAR_MS = 420;
const EXPAND_AT_MS = APPEAR_MS + 480;
const EXPAND_MS = 1100;
const SIDE_ARC_AT_MS = EXPAND_AT_MS + EXPAND_MS * 0.15;
const SIDE_ARC_MS = 1120;
const TYPE_AT_MS = EXPAND_AT_MS + 60;
const TYPE_CHAR_MS = 34;
const TYPE_MS = PROMPT.length * TYPE_CHAR_MS;
const SEND_AT_MS = Math.max(TYPE_AT_MS + TYPE_MS, EXPAND_AT_MS + EXPAND_MS) + 420;
const SEND_MS = 920;
// Once typed, the line eases back to its start, as a field does on blur.
const RETURN_AT_MS = TYPE_AT_MS + TYPE_MS + 260;
const RETURN_MS = 760;
// The pointer: in from the corner once the button has settled, a slight overshoot
// and correction (as a hand does), a click, then a small drift off the button so
// the loader shows.
const CURSOR_AT_MS = SEND_AT_MS + SEND_MS - 120; // as the button settles
const CURSOR_MOVE_MS = 980;
const CURSOR_CORRECT_MS = 200;
const CLICK_AT_MS = CURSOR_AT_MS + CURSOR_MOVE_MS + CURSOR_CORRECT_MS + 80;
const PRESS_MS = 220;
const SHINE_MS = 620; // = the product page's click shine
const AWAY_AT_MS = CLICK_AT_MS + 520;
const AWAY_MS = 760;
// The answer. The loader shows 220ms after the click (its CSS fade delay).
const LOADER_AT_MS = CLICK_AT_MS + 220;
const SEND_OUT_AT_MS = LOADER_AT_MS + 1200; // after 1.2s of loading the button goes
const SEND_OUT_MS = 460;
const SHRINK_AT_MS = LOADER_AT_MS + 1300; // after 1.3s the prompt starts to shrink
const SHRINK_MS = 760;
const WINDOW_AT_MS = SHRINK_AT_MS + 200; // the window springs in mid-shrink
const WINDOW_MS = 1500;
const REST_AT_MS = WINDOW_AT_MS + 260; // the pointer drifts to where the frame has it
const REST_MS = 1300;
const MOVE_AT_MS = WINDOW_AT_MS + 620; // the prompt flies to its place in the window
const MOVE_MS = 1000;
const AVATAR_AT_MS = MOVE_AT_MS + MOVE_MS - 260;
const AVATAR_MS = 820;
const THINK_AT_MS = AVATAR_AT_MS + 420;
const THINK_MS = 640;
const BOX_AT_MS = THINK_AT_MS + 160;
const BOX_MS = 760;
const STREAM_AT_MS = BOX_AT_MS + 420;

// Token pacing: words land one or two at a time, a short beat apart, like a
// model streaming. Fixed (not random per run) so every replay is the same.
function streamSteps(count: number, seed: number, beat: number, spread: number) {
  const delays: number[] = [];
  let at = 0;
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < count; ) {
    const chunk = 1 + Math.floor(rand() * 2);
    for (let k = 0; k < chunk && i < count; k++, i++) delays.push(at);
    at += beat + rand() * spread;
  }
  return delays;
}
const STREAM_STEPS = streamSteps(ANSWER_WORDS.length, 7, 42, 30);
const STREAM_MS = STREAM_STEPS[STREAM_STEPS.length - 1]! + 60;
const WORD_FADE_MS = 220;
// How long the reply's box takes to open up for a new line as its first word lands.
const LINE_GROW_MS = 320;

// ---- The rest of the answer (ms after the reply above has finished) ----
const EXTRA_AT_MS = STREAM_AT_MS + STREAM_MS;
const METRICS = [
  { label: "Brent crude futures", sub: "Per barrel, 14 Oct. 2026", value: (k: number) => `$${Math.round(106 * k)}–${Math.round(107 * k)}` },
  { label: "Historical Hormuz flows", sub: "Barrels per day, 2024 baseline", value: (k: number) => `${Math.round(20 * k)}M` },
  { label: "September 2026 flows", sub: "Barrels per day through Hormuz", value: (k: number) => `${(10.9 * k).toFixed(1)}M` },
  { label: "Global oil demand", sub: "Barrels/day, IEA 2026 annual change forecast", value: (k: number) => `−${(2.6 * k).toFixed(1)}M` },
];
// Each block follows straight on from the last, at a brisk streaming pace.
const METRIC_AT = 0; // as the reply's last word fades in
const METRIC_STAGGER = 90;
const METRIC_MS = 420;
const COUNT_MS = 700;
const SOURCES_AT = METRIC_AT + 3 * METRIC_STAGGER + 220;
// Within a chart, from its title: the subtitle, the gridlines, the plot.
const SUB_AFTER = 80;
const GRID_AFTER = 160;
const PLOT_AFTER = 240;
// Chart 1: quarterly flows through the strait, million barrels a day.
const FLOWS = [
  { label: "Q1 '25", value: 20.9 },
  { label: "Q2 '25", value: 21.0 },
  { label: "Q3 '25", value: 21.3 },
  { label: "Q4 '25", value: 21.6 },
  { label: "Q1 '26", value: 14.9 },
  { label: "Q2 '26", value: 4.9 },
  { label: "Sep '26", value: 10.9 },
];
const C1_AT = SOURCES_AT + 200;
const C1_GRID_AT = C1_AT + GRID_AFTER;
const C1_BAR_AT = C1_AT + PLOT_AFTER;
const C1_BAR_STAGGER = 60;
const C1_BAR_MS = 700;
const NOTE =
  "Oil flows collapsed from 21.6 million barrels per day in Q4 2025 to 4.9 million in Q2 2026. By September, shipments had recovered to 10.9 million barrels per day, but remained substantially below pre-conflict levels.";
const NOTE_WORDS = NOTE.split(" ");
const NOTE_STEPS = streamSteps(NOTE_WORDS.length, 11, 36, 26);
const NOTE_MS = NOTE_STEPS[NOTE_STEPS.length - 1]! + 220;
// Chart 2: Brent spot, USD a barrel.
const BRENT = [
  { label: "Jul '26", value: 84 },
  { label: "Aug '26", value: 91 },
  { label: "Sep '26", value: 114 },
  { label: "Q4 forecast", value: 105 },
];
const C2_LINE_MS = 900;
// After the bar chart, two orders. Stacked (the panel, phones): its source
// note, the paragraph, then the Brent chart below. Side by side (a large
// landscape showcase): the Brent chart straight away, beside the bars, then the
// note and the paragraph under both. Times are ms after the reply's first part.
type BlockOrder = { sourceNote: number; note: number; c2: number };
const C1_DONE = C1_BAR_AT + 6 * C1_BAR_STAGGER;
const STACKED: BlockOrder = {
  sourceNote: C1_DONE + 260,
  note: C1_DONE + 440,
  c2: C1_DONE + 440 + NOTE_MS + 120,
};
const SIDE_BY_SIDE: BlockOrder = {
  c2: C1_DONE + 80,
  sourceNote: C1_DONE + 80 + PLOT_AFTER + C2_LINE_MS * 0.6,
  note: C1_DONE + 80 + PLOT_AFTER + C2_LINE_MS * 0.6 + 180,
};
const orderEnd = (o: BlockOrder) => Math.max(o.c2 + PLOT_AFTER + C2_LINE_MS + 400, o.note + NOTE_MS + 400);
const EXTRA_MS = Math.max(orderEnd(STACKED), orderEnd(SIDE_BY_SIDE));
const END_MS = EXTRA_AT_MS + EXTRA_MS + 600;
// ---- Compare: Claude answering the same question, in a window alongside ----
// Its window follows Flash's in; its copy of the question appears as Flash's
// lands; it starts thinking the moment Flash's "Thought for 0.5s" appears, and
// thinks for 5.85s before answering — more slowly — in its own words.
const C_WINDOW_DELAY_MS = 180;
const C_BUBBLE_AT_MS = MOVE_AT_MS + MOVE_MS * 0.55;
const C_THINK_AT_MS = THINK_AT_MS;
const C_THINK_MS = 5850;
const C_REPLY_AT_MS = C_THINK_AT_MS + C_THINK_MS;
const C_DOT_MS = 380; // "Thinking", then one dot more each beat, round and round
const CLAUDE_P1 =
  "A full closure of the Strait of Hormuz would be one of the largest oil supply shocks on record. Roughly a fifth of global oil consumption passes through the strait, and only a limited share could be rerouted through pipelines across Saudi Arabia and the UAE.";
const CLAUDE_P2 = "How far prices move would depend mostly on how long the disruption lasts:";
const CLAUDE_P3 =
  "These are rough, illustrative ranges rather than forecasts. Spare production capacity, strategic reserve releases and the demand response would all shape the outcome.";
const CLAUDE_SCENARIOS = [
  { label: "Rapid reopening", value: 85 },
  { label: "Weeks of disruption", value: 100 },
  { label: "Months-long closure", value: 130 },
];
const splitWords = (text: string) => text.split(" ");
const CP1_WORDS = splitWords(CLAUDE_P1);
const CP2_WORDS = splitWords(CLAUDE_P2);
const CP3_WORDS = splitWords(CLAUDE_P3);
// Slower than Flash's stream: a longer, less even beat.
const CP1_STEPS = streamSteps(CP1_WORDS.length, 3, 85, 75);
const CP2_STEPS = streamSteps(CP2_WORDS.length, 5, 85, 75);
const CP3_STEPS = streamSteps(CP3_WORDS.length, 9, 85, 75);
const lastStep = (steps: number[]) => steps[steps.length - 1]! + 260;
// ms after Claude starts to answer.
const CP2_AT = lastStep(CP1_STEPS) + 220;
const CC_AT = CP2_AT + lastStep(CP2_STEPS) + 260;
const CC_BAR_AT = CC_AT + 260;
const CC_BAR_STAGGER = 160;
const CC_BAR_MS = 900;
const CP3_AT = CC_BAR_AT + 2 * CC_BAR_STAGGER + CC_BAR_MS + 200;
const CLAUDE_MS = CP3_AT + lastStep(CP3_STEPS) + 400;
const END_COMPARE_MS = Math.max(END_MS, C_REPLY_AT_MS + CLAUDE_MS + 600);

// The loop: hold the finished frame, fade the scene out, start again.
const HOLD_MS = 1600;
const FADE_MS = 600;
const LOOP_MS = START_DELAY_MS + END_MS + HOLD_MS + FADE_MS;
const LOOP_COMPARE_MS = START_DELAY_MS + END_COMPARE_MS + HOLD_MS + FADE_MS;
// The outro (full screen on a large display only): once the shot has faded, the
// QuantHive logo resolves in the middle, holds for 3s, and fades before the next
// loop — or, playing once, stays.
const OUTRO_GAP_MS = 200;
const OUTRO_IN_MS = 1200;
const OUTRO_HOLD_MS = 3000;
const OUTRO_OUT_MS = 900;
const OUTRO_TAIL_MS = 400;

/** Marks an element to be revealed `at` ms into the extra blocks, over `dur` ms.
 *  `ease`: "smooth" (default), "spring" (overshoots), "linear", or "count"
 *  (eased out, and the element's text is rewritten by METRICS[n].value). */
const reveal = (at: number, dur: number, ease = "smooth", count?: number) => ({
  "data-at": Math.round(at),
  "data-dur": Math.round(dur),
  "data-ease": ease,
  ...(count === undefined ? {} : { "data-count": count }),
});
/** Marks a top-level block: from `at`, over `dur` ms, the box grows to hold it. */
const block = (at: number, dur: number) => ({
  "data-block-at": Math.round(at),
  "data-block-dur": Math.round(dur),
});

// Chart geometry, in viewBox units (the box's inner width is 265 in the frame).
const C1 = { w: 265, h: 132, left: 30, right: 262, top: 6, bottom: 114, max: 24 };
// The same plot box as chart 1, so the two read as a pair side by side.
const C2 = { w: 265, h: 132, left: 30, right: 256, top: 6, bottom: 114, min: 60, max: 140 };
const c1Slot = (C1.right - C1.left) / FLOWS.length;
const c1Y = (v: number) => C1.bottom - (v / C1.max) * (C1.bottom - C1.top);
const c2X = (i: number) => C2.left + 8 + (i * (C2.right - C2.left - 16)) / (BRENT.length - 1);
const c2Y = (v: number) => C2.bottom - ((v - C2.min) / (C2.max - C2.min)) * (C2.bottom - C2.top);
const C2_PATH = BRENT.map((point, i) => `${i ? "L" : "M"}${c2X(i).toFixed(2)} ${c2Y(point.value).toFixed(2)}`).join(" ");

// The answer box reads a little larger than the frame: its type and width are
// the frame's times this.
const ANSWER_SCALE = 1.2;

// Card two's loader (Capabilities), centred in the button: its eight dots keep
// their ring-to-dot proportion (12 on 68.4), the ring half the button.
const SEND_LOADER: Loader = { x: 0.5, y: 0.5, ring: 0.5, dot: 12 / 68.4 };

// Panel ground and lattice — must match .about__video and its ::before.
// (Shared with GlassMenu, whose keys refract the same ground.)
export const GROUND = 6 / 255;
export const LATTICE_INK = 0.04;
export const TILE_SRC = "/images/landing-pattern-mask.png";
export const TILE_W = 125;
export const TILE_H = 126;
// The window body's fill (#1C1C1C at 35%, window.svg), so the glass bends it too.
const WINDOW_FILL = 28 / 255;
const WINDOW_FILL_ALPHA = 0.35;
// Claude's window body: its dark interface (#262624), opaque.
const CLAUDE_FILL = 38 / 255;

const VERT = `#version 300 es
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

// All geometry arrives in CSS pixels, y down, so it lines up with the DOM text.
const FRAG = `#version 300 es
precision highp float;

out vec4 outColor;
uniform vec2 u_res;
uniform float u_dpr;
uniform sampler2D u_tile;
uniform vec2 u_tile_size;
uniform vec2 u_tile_offset;
uniform float u_ground;
uniform float u_ink;
uniform vec4 u_window;      // the window body: left, top, right, bottom
uniform vec2 u_window_fill; // fill, alpha
uniform vec4 u_window2;     // Claude's window body, when comparing
uniform vec2 u_window2_fill;
uniform vec2 u_pill;
uniform vec2 u_pill_half;
uniform float u_radius;
uniform vec2 u_send;
uniform float u_send_r;
uniform float u_separate;
uniform float u_side_arc;
uniform float u_click;
uniform vec2 u_box;         // the answer box's top-left corner
uniform vec2 u_box_size;
uniform float u_box_r;
uniform float u_box_in;
uniform vec2 u_clip;        // the window body's scroll edge: top, fade length

float smin(float a, float b, float k) {
  if (k <= 0.001) return min(a, b);
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

float sdRoundBox(vec2 p, vec2 halfSize, float radius) {
  vec2 q = abs(p) - halfSize + radius;
  return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - radius;
}

// The prompt and its send button, fused while close and apart once separated.
float promptField(vec2 p) {
  float dPill = sdRoundBox(p - u_pill, u_pill_half, u_radius);
  if (u_separate <= 0.0001 || u_send_r <= 0.01) return dPill;
  float dSend = length(p - u_send) - u_send_r;
  return smin(dPill, dSend, mix(u_radius * 1.3, 0.0, u_separate));
}

float boxField(vec2 p) {
  if (u_box_in <= 0.001) return 1e5;
  vec2 halfSize = u_box_size * 0.5;
  return sdRoundBox(p - (u_box + halfSize), halfSize, u_box_r);
}

float field(vec2 p) { return min(promptField(p), boxField(p)); }

vec2 normalAt(vec2 p) {
  vec2 e = vec2(0.6, 0.0);
  return normalize(vec2(
    field(p + e.xy) - field(p - e.xy),
    field(p + e.yx) - field(p - e.yx)
  ) + 0.0001);
}

// The panel's ground: near-black with the hero lattice drawn faintly on it, and
// the window's translucent body over it once that has slid in.
float ground(vec2 p) {
  vec2 uv = (p - u_tile_offset) / u_tile_size;
  float g = u_ground + u_ink * texture(u_tile, uv).a;
  float inWindow = step(u_window.x, p.x) * step(u_window.y, p.y) * step(p.x, u_window.z) * step(p.y, u_window.w);
  g = mix(g, u_window_fill.x, u_window_fill.y * inWindow);
  float inWindow2 = step(u_window2.x, p.x) * step(u_window2.y, p.y) * step(p.x, u_window2.z) * step(p.y, u_window2.w);
  return mix(g, u_window2_fill.x, u_window2_fill.y * inWindow2);
}

float safeAsin(float v) { return asin(clamp(v, -1.0, 1.0)); }

// Snell's-law edge displacement, as in ProductPromptGlass.
float liquidGlassEdgeFactor(float depth, float thickness, float refractionFactor) {
  if (depth >= thickness) return 0.0;
  float edgeRatio = 1.0 - depth / thickness;
  float thetaIncident = safeAsin(edgeRatio * edgeRatio);
  float thetaTransmitted = safeAsin(sin(thetaIncident) / refractionFactor);
  return -tan(thetaTransmitted - thetaIncident);
}

float containedShine(vec2 local, float radius, float pulse) {
  return pulse * (1.0 - smoothstep(radius * 0.12, radius * 1.06, length(local)));
}

void main() {
  vec2 p = vec2(gl_FragCoord.x, u_res.y - gl_FragCoord.y) / u_dpr;
  float dPrompt = promptField(p);
  float dBox = boxField(p);
  float d = min(dPrompt, dBox);
  if (d > 1.5) discard;
  bool isBox = dBox < dPrompt;

  vec2 n = normalAt(p);
  float radius = max(isBox ? u_box_r : u_radius, 1.0);
  float edgeFactor = liquidGlassEdgeFactor(-d, radius * 0.62, 1.42);
  vec2 offset = -n * edgeFactor * radius * 1.15;

  // Refracted ground, each channel read from a slightly different depth.
  vec3 col = vec3(
    ground(p + offset * 1.05),
    ground(p + offset),
    ground(p + offset * 0.95)
  );

  // Dark glass body: a little lighter toward the foot, as in the frame.
  float top = isBox ? u_box.y : u_pill.y - u_pill_half.y;
  float span = isBox ? u_box_size.y : u_pill_half.y * 2.0;
  float t = clamp((p.y - top) / max(span, 1.0), 0.0, 1.0);
  col = mix(col, vec3(mix(0.112, 0.160, t)), 0.8);

  // The answer box: near-black at the top, clearing toward the foot, behind the
  // words (the frame's 92% -> 50% at 76.5% -> 5% gradient).
  if (isBox) {
    float shade = t < 0.765 ? mix(0.92, 0.5, t / 0.765) : mix(0.5, 0.05, (t - 0.765) / 0.235);
    col = mix(col, vec3(0.03), shade);
  }

  // Edge light: the bent rim brightens, and a hairline catches light at the top.
  col += abs(edgeFactor) * 0.05;
  float rim = 1.0 - smoothstep(0.0, 1.25, abs(d + 0.55));
  col += rim * mix(0.34, 0.2, t) * (isBox ? 0.75 : 1.0);

  if (!isBox) {
    // A soft arc along the pill's left cap, opening from its midpoint once it has
    // stretched out — the product page's cue that the prompt is live.
    vec2 local = p - u_pill;
    vec2 capCenter = vec2(-u_pill_half.x + radius, 0.0);
    float arcDistance = abs(length(local - capCenter) - radius);
    float arcSide = 1.0 - smoothstep(-radius * 0.04, radius * 0.34, local.x - capCenter.x);
    float arcCore = (1.0 - smoothstep(0.25, 1.6, arcDistance)) * arcSide;
    float arcBloom = (1.0 - smoothstep(1.0, 8.0, arcDistance)) * arcSide;
    float arcFront = radius * 1.24 * clamp(u_side_arc, 0.0, 1.0);
    float arcReveal = smoothstep(0.0, 1.75, arcFront - abs(local.y));
    float arcTip = 1.0 - smoothstep(radius * 0.72, radius * 1.08, abs(local.y));
    col += arcReveal * arcTip * (arcBloom * vec3(0.06, 0.075, 0.095) + arcCore * vec3(0.30, 0.36, 0.42));

    // One glint at the right end while the send button peels away.
    float separation = clamp(u_separate, 0.0, 1.0);
    float pulse = sin(separation * 3.14159265);
    float edgeFocus = 1.0 - smoothstep(radius * 0.45, radius * 2.25, length(p - (u_pill + vec2(u_pill_half.x, 0.0))));
    col += pulse * (edgeFocus * 0.6 + rim * 0.2) * vec3(0.42, 0.45, 0.49);

    // A click lights the send button from inside (the product page's shine).
    col += containedShine(p - u_send, radius, u_click) * vec3(0.72, 0.77, 0.86);
  }

  float alpha = clamp(0.5 - d * u_dpr, 0.0, 1.0) * (isBox ? u_box_in : 1.0);
  // Scrolled content fades out under the window's top edge.
  alpha *= smoothstep(u_clip.x, u_clip.x + u_clip.y, p.y);
  outColor = vec4(clamp(col, 0.0, 1.0), alpha);
}`;

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
/** Progress through a span of the timeline (0 before the shot has begun). */
const at0 = (t: number, from: number, span: number) => (t < 0 ? 0 : (t - from) / span);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smootherstep = (v: number) => {
  const p = clamp01(v);
  return p * p * p * (p * (p * 6 - 15) + 10);
};
// The product page's liquid settle: a soft overshoot with a small wobble.
const settle = (v: number) => {
  const p = clamp01(v);
  const overshoot = 0.9;
  const bounce = 1 + (overshoot + 1) * (p - 1) ** 3 + overshoot * (p - 1) ** 2;
  return bounce + Math.sin(p * Math.PI * 4) * 0.028 * p * (1 - p);
};
/** A damped spring from rest: leaves gently, overshoots once (about 4% at a
 *  damping of 8, 9% at 6), wobbles back and is still by the end. */
const spring = (v: number, damping = 8) => {
  const p = clamp01(v);
  if (p >= 1) return 1;
  const w = Math.PI * 2.5;
  return 1 - Math.exp(-damping * p) * (Math.cos(w * p) + (damping / w) * Math.sin(w * p));
};

type Point = { x: number; y: number };
const bezier = (a: Point, b: Point, c: Point, d: Point, t: number): Point => {
  const u = 1 - t;
  return {
    x: u * u * u * a.x + 3 * u * u * t * b.x + 3 * u * t * t * c.x + t * t * t * d.x,
    y: u * u * u * a.y + 3 * u * u * t * b.y + 3 * u * t * t * c.y + t * t * t * d.y,
  };
};

/** Where the pointer is `t` ms into its move: an S-curve from just past the
 *  panel's bottom-right corner to a point a little beyond the button (a hand
 *  overshoots), a short correction onto it, a drift off it after the click, and
 *  finally a glide to where the frame rests it. */
function cursorAt(t: number, width: number, height: number, target: Point, rest: Point, h: number): Point {
  const from = { x: width + h * 0.15, y: height + h * 0.15 };
  const dx = target.x - from.x;
  const dy = target.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  const n = { x: -dy / len, y: dx / len }; // perpendicular, for the S
  const bend = Math.min(len * 0.2, h * 2.4);
  const over = { x: target.x + (dx / len) * h * 0.09 + n.x * h * 0.03, y: target.y + (dy / len) * h * 0.09 + n.y * h * 0.03 };
  const c1 = { x: from.x + dx * 0.3 + n.x * bend, y: from.y + dy * 0.3 + n.y * bend };
  const c2 = { x: from.x + dx * 0.7 - n.x * bend * 0.8, y: from.y + dy * 0.7 - n.y * bend * 0.8 };
  // Reaching movements peak in speed a little before halfway; skew the clock.
  const u = clamp01(t / CURSOR_MOVE_MS);
  let p = bezier(from, c1, c2, over, smootherstep(u ** 0.85));
  const fix = smootherstep((t - CURSOR_MOVE_MS) / CURSOR_CORRECT_MS);
  p = { x: p.x + (target.x - over.x) * fix, y: p.y + (target.y - over.y) * fix };
  // Off the button, but never past the panel's edge (a narrow phone panel).
  const away = smootherstep((t - (AWAY_AT_MS - CURSOR_AT_MS)) / AWAY_MS);
  const room = Math.max(0, width - h * 0.75 - target.x);
  p = { x: p.x + Math.min(h * 0.78, room) * away, y: p.y + h * 0.62 * away };
  // Then over to where the frame rests it, on a gentle arc.
  const r = (t - (REST_AT_MS - CURSOR_AT_MS)) / REST_MS;
  if (r <= 0) return p;
  const k = smootherstep(r ** 0.9);
  const lift = Math.sin(k * Math.PI) * Math.min(h * 0.9, Math.hypot(rest.x - p.x, rest.y - p.y) * 0.18);
  return { x: lerp(p.x, rest.x, k), y: lerp(p.y, rest.y, k) - lift };
}

/** Where the shot plays: the About section's panel, or a full-screen 9:16 stage
 *  (Showcase) where everything scales freely with the stage. */
export type ShotVariant = "panel" | "showcase";

/** Pill and button sizes for a panel, in CSS px. Scales with the panel, with a
 *  floor so the prompt stays legible on small panels; on a showcase stage it
 *  scales freely — a tenth of a portrait stage's width, or a sixteenth of a
 *  landscape screen's height — however big the screen. */
function layoutFor(width: number, height: number, variant: ShotVariant) {
  const h =
    // A portrait (phone) panel is narrow but has the room to set things larger.
    variant !== "showcase" && height > width ? Math.max(38, Math.min(52, width * 0.13))
    : variant !== "showcase" ? Math.max(38, Math.min(52, width * 0.065))
    : width > height ? Math.max(38, height * 0.062)
    : Math.max(38, width * 0.1);
  const gap = (h * 7) / 52;
  const pillW = Math.min((h * 420) / 52, width * (variant === "showcase" ? 0.88 : 0.9) - h - gap);
  const left = (width - (pillW + gap + h)) / 2;
  return {
    h,
    pillW,
    cy: height / 2,
    midX: width / 2,
    pillCx: left + pillW / 2,
    sendCx: left + pillW + gap + h / 2,
  };
}

/**
 * The answer scene (frame 123:238), in CSS px. Sizes are the frame's (a
 * 1000 × 700 panel) times `u`, the prompt's own scale (its height over the
 * frame's 52), so the window reads at the size of the prompt it grows out of.
 * Positions follow the frame on landscape panels; a portrait (phone) panel
 * brings them in closer.
 */
/** Claude's window and column, when comparing. */
type ClaudeScene = {
  winX: number;
  winY: number;
  winW: number;
  winH: number;
  bodyY: number;
  colX: number;
  colW: number;
  bubbleTop: number;
  thinkY: number;
  replyY: number;
  feedLimit: number;
};

/**
 * Compare: Flash and Claude in two windows of one size — side by side on a
 * landscape panel or screen, one above the other on a portrait one — each with
 * its conversation in a centred column. Where the windows come out narrow, the
 * scene's unit shrinks so each window's tab still fits (about 300 frame units).
 */
function compareSceneFor(width: number, height: number, h: number, variant: ShotVariant) {
  const u0 = h / 52;
  const landscape = width > height;
  let areaW: number, areaH: number;
  let floor = Infinity;
  const inset = Math.max(10, Math.min(width, height) * 0.05);
  if (variant === "showcase") {
    areaW = width * (landscape ? 0.92 : 0.92);
    areaH = height * (landscape ? 0.82 : 0.9);
  } else {
    const keys = inset + Math.max(30, Math.min(width, height) * 0.075) + 8;
    areaW = landscape ? width - keys * 2 : width * 0.92;
    areaH = height * (landscape ? 0.8 : 0.9);
    floor = height - inset - Math.max(26, height * 0.09);
  }
  // Stacked (phones), the windows stand well apart; side by side, closer.
  const gap = landscape ? Math.max(10, Math.min(width, height) * 0.025) : Math.max(28, height * 0.045);
  const winW = landscape ? (areaW - gap) / 2 : areaW;
  const winH = landscape ? areaH : (areaH - gap) / 2;
  const left = (width - areaW) / 2;
  const top = (height - areaH) / 2;
  const u = Math.min(u0, winW / 300);
  const bubbleH = 23 * u;

  const flashX = left;
  const flashY = top;
  const claudeX = landscape ? left + winW + gap : left;
  const claudeY = landscape ? top : top + winH + gap;
  const colOf = (x: number) => {
    const colW = Math.min(winW - 36 * u, 560 * u);
    return { colX: x + (winW - colW) / 2, colW };
  };
  const flashCol = colOf(flashX);
  const claudeCol = colOf(claudeX);
  const bodyY = flashY + 33 * u;
  const bubbleTop = bodyY + 28 * u;
  const avatarCx = flashCol.colX + flashCol.colW - 10 * u;
  const claudeBody = claudeY + 33 * u;
  const claudeBubbleTop = claudeBody + 28 * u;
  const limitOf = (y: number) => Math.min(y + winH - 16 * u, floor - 10 * u);
  const claude: ClaudeScene = {
    winX: claudeX,
    winY: claudeY,
    winW,
    winH,
    bodyY: claudeBody,
    colX: claudeCol.colX,
    colW: claudeCol.colW,
    bubbleTop: claudeBubbleTop,
    thinkY: claudeBubbleTop + 38 * u,
    replyY: claudeBubbleTop + 58 * u,
    feedLimit: limitOf(claudeY),
  };
  return {
    u,
    winX: flashX,
    winY: flashY,
    winW,
    winH,
    winBottom: flashY + winH,
    bodyY,
    bubbleH,
    bubbleCy: bubbleTop + bubbleH / 2,
    bubbleRight: avatarCx - 20 * u,
    avatarCx,
    thinkY: bubbleTop + 33 * u,
    boxX: flashCol.colX,
    boxW: flashCol.colW,
    boxTop: bubbleTop + 52 * u,
    feedLimit: flashY + winH - 16 * u,
    feedFloor: floor - 10 * u,
    // The pointer settles below the windows (or slips off a portrait screen).
    rest: landscape
      ? { x: width * 0.5, y: top + areaH + (height - top - areaH) * 0.55 }
      : { x: width + h, y: height * 0.9 },
    claude: claude as ClaudeScene | null,
  };
}

function sceneFor(width: number, height: number, h: number, variant: ShotVariant, compare = false) {
  if (compare) return compareSceneFor(width, height, h, variant);
  const u = h / 52;
  const bubbleH = 23 * u;

  // Showcase on a landscape screen: a 16:10 browser window centred on the
  // screen, the conversation in a centred column inside it, as a chat app sets
  // it — the message and avatar at the column's right, the reply its width.
  //
  // A landscape panel on the site (large screens) lays out the same way, centred
  // on the panel too, its width kept in from the menu key at the top right
  // (GlassMenu). The dial along the foot (Seeker.css), when shown, may overlap
  // the window's lower edge, so the reply then stops short of it.
  if (width > height) {
    let winW: number, winH: number;
    let feedFloor = Infinity;
    if (variant === "showcase") {
      winH = height * 0.82;
      winW = Math.min(width * 0.88, winH * 1.6);
    } else {
      const inset = Math.max(10, Math.min(width, height) * 0.05);
      const keys = inset + Math.max(30, Math.min(width, height) * 0.075) + 8;
      winH = height * 0.8;
      winW = Math.min(width - keys * 2, winH * 1.6);
      feedFloor = height - inset - Math.max(26, height * 0.09) - 10 * u;
    }
    const winX = (width - winW) / 2;
    const winY = (height - winH) / 2;
    const bodyY = winY + 33 * u;
    const winRight = winX + winW;
    const colW = Math.min(winW - 48 * u, 640 * u) * 0.85;
    const colX = winX + (winW - colW) / 2;
    const colRight = colX + colW;
    const avatarCx = colRight - 10 * u;
    const bubbleTop = bodyY + 34 * u;
    const boxTop = bubbleTop + 52 * u;
    return {
      u,
      winX,
      winY,
      winW,
      winH,
      winBottom: winY + winH,
      bodyY,
      bubbleH,
      bubbleCy: bubbleTop + bubbleH / 2,
      bubbleRight: avatarCx - 20 * u,
      avatarCx,
      thinkY: bubbleTop + 33 * u,
      boxX: colX,
      boxW: colW,
      boxTop,
      feedLimit: winY + winH - 18 * u,
      feedFloor,
      // The pointer settles in the window's margin beside the column.
      rest: { x: colRight + (winRight - colRight) * 0.45, y: winY + winH * 0.62 },
      claude: null as ClaudeScene | null,
    };
  }

  // Showcase on a portrait screen: a whole browser window, centred on the 9:16
  // stage — nearly its full width, four-fifths of its height — with everything
  // laid out inside it: the message and avatar against its right edge, the
  // reply spanning its width.
  if (variant === "showcase") {
    const winW = width * 0.92;
    const winH = height * 0.8;
    const winX = (width - winW) / 2;
    const winY = (height - winH) / 2;
    const bodyY = winY + 33 * u;
    const winRight = winX + winW;
    const avatarCx = winRight - 24 * u;
    const bubbleTop = bodyY + 30 * u;
    const boxX = winX + 18 * u;
    const boxW = winW - 36 * u;
    const boxTop = bubbleTop + 52 * u;
    return {
      u,
      winX,
      winY,
      winW,
      winH,
      winBottom: winY + winH,
      bodyY,
      bubbleH,
      bubbleCy: bubbleTop + bubbleH / 2,
      bubbleRight: avatarCx - 20 * u,
      avatarCx,
      thinkY: bubbleTop + 33 * u,
      boxX,
      boxW,
      boxTop,
      // The reply scrolls within the window, above its foot.
      feedLimit: winY + winH - 18 * u,
      feedFloor: Infinity,
      // The pointer settles below the window, off to the right.
      rest: { x: width * 0.84, y: winY + winH + (height - winY - winH) * 0.45 },
      claude: null as ClaudeScene | null,
    };
  }

  // A portrait panel (phones): a whole window centred on the panel, the message
  // and avatar against its right edge and the reply spanning its width. The
  // dial along the foot (Seeker.css), when shown, may overlap its lower edge, so
  // the reply then stops short of it.
  const winW = width * 0.88;
  const winH = height * 0.8;
  const winX = (width - winW) / 2;
  const winY = (height - winH) / 2;
  const bodyY = winY + 33 * u;
  const avatarCx = winX + winW - 22 * u;
  const bubbleTop = bodyY + 34 * u;
  const inset = Math.max(10, Math.min(width, height) * 0.05);
  const seekerTop = height - inset - Math.max(26, height * 0.09);
  return {
    u,
    winX,
    winY,
    winW,
    winH,
    winBottom: winY + winH,
    bodyY,
    bubbleH,
    bubbleCy: bubbleTop + bubbleH / 2,
    bubbleRight: avatarCx - 20 * u,
    avatarCx,
    // The message spans the window, so the thought and the reply stand a little
    // further down from it.
    thinkY: bubbleTop + 42 * u,
    boxX: winX + 14 * u,
    boxW: winW - 28 * u,
    boxTop: bubbleTop + 62 * u,
    feedLimit: winY + winH - 14 * u,
    feedFloor: seekerTop - 10 * u,
    // The pointer slips off the narrow panel, clear of the box.
    rest: { x: width + h, y: height * 0.82 },
    claude: null as ClaudeScene | null,
  };
}

/** The window's outline (window.svg's path) at any size, in frame units: the
 *  tab keeps its shape; only the right edge and the foot move. */
function windowPath(w: number, h: number) {
  return (
    "M101.862 0.5H235.571C240.051 0.500114 244.239 2.72281 246.75 6.43262L260.422 26.6279" +
    "C263.119 30.6126 267.617 32.9999 272.429 33" +
    `H${(w - 0.5).toFixed(2)}V${(h - 0.5).toFixed(2)}H0.5V33` +
    "H67.6377C72.972 33 77.8753 30.0707 80.4043 25.374L89.9756 7.59961" +
    "C92.3302 3.22683 96.8959 0.5 101.862 0.5Z"
  );
}

function compile(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn("[video-prompt] shader error:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

/** A cited-source pill, as a model's answer shows them. */
function SourceChip() {
  return (
    <span className="va-chip">
      <span className="va-chip__icon" />
      U.S. Energy…
      <span className="va-chip__more">+1</span>
    </span>
  );
}

/** Playback control for the shot, for a scrubber. */
export type VideoControl = {
  /** Jump to `progress` (0–1) through the loop. */
  seek: (progress: number) => void;
  /** Hold the frame while a scrubber is dragged; release resumes from there. */
  scrub: (active: boolean) => void;
};

export default function VideoPromptGlass({
  controlRef,
  onProgress,
  variant = "panel",
  seekerShown = false,
  compare = false,
  outro = false,
  loop = true,
}: {
  variant?: ShotVariant;
  /** End each run on the QuantHive logo (full screen, large displays). */
  outro?: boolean;
  /** Start over after each run; false plays once and rests on the final frame
   *  (the logo, with an outro). */
  loop?: boolean;
  /** Compare: Claude answers the same question in a window alongside. */
  compare?: boolean;
  /** Whether the panel's dial is showing: the reply then keeps clear of it. */
  seekerShown?: boolean;
  controlRef?: Ref<VideoControl>;
  /** Called every frame with the position (0–1) through the loop. */
  onProgress?: (progress: number) => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const answerRef = useRef<HTMLParagraphElement>(null);
  const windowRef = useRef<SVGSVGElement>(null);
  const claudeWindowRef = useRef<SVGSVGElement>(null);
  const claudeRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  // A reader's own click on send, as a time into the shot (-1: none this loop).
  const clickRef = useRef(-1);
  const timeRef = useRef(-1);
  const progressRef = useRef(onProgress);
  progressRef.current = onProgress;
  const seekerShownRef = useRef(seekerShown);
  seekerShownRef.current = seekerShown;
  // Read each frame, so switching between looping and playing once doesn't restart.
  const loopRef = useRef(loop);
  loopRef.current = loop;
  const controlImpl = useRef<VideoControl>({ seek: () => {}, scrub: () => {} });
  useImperativeHandle(
    controlRef,
    () => ({
      seek: (progress) => controlImpl.current.seek(progress),
      scrub: (active) => controlImpl.current.scrub(active),
    }),
    [],
  );
  const hoverTarget = useRef({ x: 0, y: 0 });
  // Restarts the frame loop after a hover or click, set up by the effect below.
  const kickRef = useRef<() => void>(() => {});
  const [webglUnavailable, setWebglUnavailable] = useState(false);
  // A large landscape showcase sets the two charts side by side (and streams
  // them back to back); everywhere else they stack.
  const [sideBySide, setSideBySide] = useState(false);
  const order = sideBySide ? SIDE_BY_SIDE : STACKED;
  // Re-reads the blocks' timings once a re-render has changed them.
  const refreshRef = useRef<() => void>(() => {});
  useLayoutEffect(() => refreshRef.current(), [sideBySide]);
  // The scene (its WebGL, its timeline) starts once the panel is near the
  // screen: on the landing page it begins far below it.
  const near = useNearViewport(rootRef);

  useEffect(() => {
    if (!near) return;
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const text = textRef.current;
    const answer = answerRef.current;
    const scroller = scrollRef.current;
    const windowFrame = windowRef.current;
    const claudeFrame = claudeWindowRef.current;
    const claudeRoot = claudeRef.current;
    const claudeReply = claudeRoot?.querySelector<HTMLElement>(".claude-reply") ?? null;
    const claudeTimer = claudeRoot?.querySelector<HTMLElement>(".claude-think__timer") ?? null;
    const claudeLabel = claudeRoot?.querySelector<HTMLElement>(".claude-think__label") ?? null;
    const claudeDots = claudeRoot?.querySelector<HTMLElement>(".claude-think__dots") ?? null;
    // The loop runs long enough for whichever answer finishes last.
    const endMs = compare ? END_COMPARE_MS : END_MS;
    // With the outro, each run goes on past the shot's fade: the logo comes in,
    // holds, and leaves before the loop starts over.
    const sceneGoneMs = START_DELAY_MS + endMs + HOLD_MS + FADE_MS;
    const outroInAt = sceneGoneMs + OUTRO_GAP_MS;
    const outroHeldAt = outroInAt + OUTRO_IN_MS;
    const outroOutAt = outroHeldAt + OUTRO_HOLD_MS;
    const loopMs = outro ? outroOutAt + OUTRO_OUT_MS + OUTRO_TAIL_MS : compare ? LOOP_COMPARE_MS : LOOP_MS;
    // Playing once, the run stops here: on the logo, or on the finished answer.
    const stopAt = outro ? outroHeldAt : START_DELAY_MS + endMs;
    const panel = root?.parentElement;
    if (!root || !canvas || !text || !answer || !scroller || !panel) return;
    const words = Array.from(answer.children) as HTMLElement[];
    // The extra blocks: everything that reveals, and the blocks the box grows for.
    // The extra blocks' timings live in their data attributes (and change with
    // the chart layout), so they are read here and again on refresh.
    const readReveals = () => (Array.from(scroller.querySelectorAll("[data-at]")) as HTMLElement[]).map((el) => ({
      el,
      at: Number(el.dataset.at),
      dur: Number(el.dataset.dur),
      ease: el.dataset.ease ?? "smooth",
      count: el.dataset.count === undefined ? -1 : Number(el.dataset.count),
      last: -1,
    }));
    const readBlocks = () => (Array.from(scroller.querySelectorAll("[data-block-at]")) as (HTMLElement | SVGElement)[]).map((el) => ({
      el,
      at: Number(el.dataset.blockAt),
      dur: Number(el.dataset.blockDur),
      bottom: 0,
    }));
    let reveals = readReveals();
    let blocks = readBlocks();
    // Claude's answer, timed from when it starts to answer.
    const claudeReveals = claudeReply
      ? (Array.from(claudeReply.querySelectorAll("[data-at]")) as HTMLElement[]).map((el) => ({
          el,
          at: Number(el.dataset.at),
          dur: Number(el.dataset.dur),
          ease: el.dataset.ease ?? "smooth",
          last: -1,
        }))
      : [];
    const claudeBlocks = claudeReply
      ? (Array.from(claudeReply.querySelectorAll("[data-block-at]")) as (HTMLElement | SVGElement)[]).map((el) => ({
          el,
          at: Number(el.dataset.blockAt),
          dur: Number(el.dataset.blockDur),
          bottom: 0,
        }))
      : [];

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const measure = document.createElement("canvas").getContext("2d");

    // ---- Layout (on resize) ----
    let width = 1;
    let height = 1;
    let dpr = 1;
    let layout = layoutFor(1, 1, variant);
    let scene = sceneFor(1, 1, layout.h, variant, compare);
    let promptFont = 12;
    let bubbleW = 1;
    // The reply's lines, laid out in full with unseen words held invisible: where
    // line two starts, the foot of line one, and the foot of each word's line.
    let line2 = 1;
    let firstLineH = 0;
    let wordBottoms: number[] = [];
    const resize = () => {
      const box = panel.getBoundingClientRect();
      width = Math.max(1, box.width);
      height = Math.max(1, box.height);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      layout = layoutFor(width, height, variant);
      scene = sceneFor(width, height, layout.h, variant, compare);
      // Side by side wherever the window is landscape (sceneFor): a landscape
      // panel, or a landscape showcase (a narrow one plays on a 9:16 stage).
      setSideBySide(width > height && !compare);
      const { u } = scene;
      root.style.setProperty("--prompt-h", `${layout.h}px`);
      root.style.setProperty("--u", `${u}px`);
      root.style.setProperty("--ua", `${u * ANSWER_SCALE}px`);
      root.style.setProperty("--win-x", `${scene.winX}px`);
      root.style.setProperty("--win-y", `${scene.winY}px`);
      root.style.setProperty("--win-w", `${scene.winW}px`);
      root.style.setProperty("--win-h", `${scene.winH}px`);
      const frameW = scene.winW / u;
      const frameH = scene.winH / u;
      windowFrame?.setAttribute("viewBox", `0 0 ${frameW.toFixed(2)} ${frameH.toFixed(2)}`);
      windowFrame?.firstElementChild?.setAttribute("d", windowPath(frameW, frameH));
      const cs = scene.claude;
      if (cs) {
        root.style.setProperty("--win2-x", `${cs.winX}px`);
        root.style.setProperty("--win2-y", `${cs.winY}px`);
        root.style.setProperty("--win2-w", `${cs.winW}px`);
        root.style.setProperty("--win2-h", `${cs.winH}px`);
        root.style.setProperty("--c-x", `${cs.colX}px`);
        root.style.setProperty("--c-w", `${cs.colW}px`);
        root.style.setProperty("--c-bubble-y", `${cs.bubbleTop}px`);
        root.style.setProperty("--c-think-y", `${cs.thinkY}px`);
        root.style.setProperty("--c-reply-y", `${cs.replyY}px`);
        claudeFrame?.setAttribute("viewBox", `0 0 ${(cs.winW / u).toFixed(2)} ${(cs.winH / u).toFixed(2)}`);
        claudeFrame?.firstElementChild?.setAttribute("d", windowPath(cs.winW / u, cs.winH / u));
        for (const b of claudeBlocks) {
          const box = b.el instanceof HTMLElement ? b.el : (b.el.parentElement as HTMLElement);
          b.bottom = box.offsetTop + box.offsetHeight;
        }
      }
      root.style.setProperty("--avatar-x", `${scene.avatarCx}px`);
      root.style.setProperty("--avatar-y", `${scene.bubbleCy}px`);
      root.style.setProperty("--think-x", `${scene.boxX + 5 * u}px`);
      root.style.setProperty("--think-y", `${scene.thinkY}px`);
      root.style.setProperty("--box-x", `${scene.boxX}px`);
      root.style.setProperty("--box-y", `${scene.boxTop}px`);
      root.style.setProperty("--box-w", `${scene.boxW}px`);

      // The message bubble fits the question at the frame's size (8.9 on 52).
      promptFont = Math.max(12, (layout.h * 17) / 52);
      const style = getComputedStyle(text);
      let textW = PROMPT.length * 8.9 * u * 0.5;
      if (measure) {
        measure.font = `${style.fontWeight} ${8.9 * u}px ${style.fontFamily}`;
        textW = measure.measureText(PROMPT).width - PROMPT.length * 0.01 * 8.9 * u;
      }
      bubbleW = Math.min(Math.max(210 * u, textW + 22 * u), scene.bubbleRight - Math.max(scene.winX, scene.boxX) - 16 * u);

      const first = words[0];
      const top0 = first?.offsetTop ?? 0;
      line2 = words.findIndex((word) => word.offsetTop > top0 + 1);
      if (line2 < 1) line2 = words.length;
      firstLineH = top0 + (first?.offsetHeight ?? 0);
      wordBottoms = words.map((word) => word.offsetTop + word.offsetHeight);
      // A chart's plot is the last thing in its section (SVG has no offsets).
      for (const b of blocks) {
        const box = b.el instanceof HTMLElement ? b.el : (b.el.parentElement as HTMLElement);
        b.bottom = box.offsetTop + box.offsetHeight;
      }
      draw(performance.now());
    };

    // ---- Playback ----
    // `origin` is when the current loop began; null until the panel is in view,
    // and again after the reader scrolls back up past it, so it restarts like the
    // section's reveal. `held` freezes the shot at a point (while scrubbing, or
    // off screen); with reduced motion it rests on the finished frame.
    const restPose = START_DELAY_MS + endMs;
    let origin: number | null = null;
    let held: number | null = reducedMotion ? restPose : null;
    let loopIndex = 0;
    let typed = -1;
    const wordProgress: number[] = [];
    let wasLooping = loopRef.current;
    const elapsedAt = (now: number) => {
      if (held !== null) return held;
      if (origin === null) return -1;
      // Playing once: the current run stops at its rest frame and stays there.
      const runAt = now - origin - loopIndex * loopMs;
      if (!loopRef.current) {
        wasLooping = false;
        if (runAt >= stopAt) return stopAt;
      } else if (!wasLooping) {
        // Switched back to looping while resting: carry on from the rest frame
        // rather than jumping to wherever the clock has got to.
        wasLooping = true;
        if (runAt > stopAt) origin = now - loopIndex * loopMs - stopAt;
      }
      const index = Math.floor((now - origin) / loopMs);
      if (index !== loopIndex) {
        loopIndex = index;
        clickRef.current = -1; // a new loop: the pointer clicks again
      }
      return (now - origin) % loopMs;
    };

    // ---- WebGL ----
    const gl = canvas.getContext("webgl2", { alpha: true, premultipliedAlpha: false });
    let program: WebGLProgram | null = null;
    let tileTexture: WebGLTexture | null = null;
    const uniforms: Record<string, WebGLUniformLocation | null> = {};
    if (gl) {
      const vertex = compile(gl, gl.VERTEX_SHADER, VERT);
      const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAG);
      program = gl.createProgram();
      if (vertex && fragment && program) {
        gl.attachShader(program, vertex);
        gl.attachShader(program, fragment);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
          console.warn("[video-prompt] link error:", gl.getProgramInfoLog(program));
          gl.deleteProgram(program);
          program = null;
        }
      } else {
        program = null;
      }
      vertex && gl.deleteShader(vertex);
      fragment && gl.deleteShader(fragment);
    }
    if (!gl || !program) setWebglUnavailable(true);

    if (gl && program) {
      for (const name of [
        "u_res", "u_dpr", "u_tile", "u_tile_size", "u_tile_offset", "u_ground", "u_ink",
        "u_window", "u_window_fill", "u_pill", "u_pill_half", "u_radius", "u_send", "u_send_r",
        "u_separate", "u_side_arc", "u_click", "u_box", "u_box_size", "u_box_r", "u_box_in",
        "u_clip", "u_window2", "u_window2_fill",
      ]) {
        uniforms[name] = gl.getUniformLocation(program, name);
      }
      // Until the tile loads the glass refracts a plain ground; a 1×1 clear pixel.
      tileTexture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tileTexture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));
      const image = new Image();
      image.onload = () => {
        gl.bindTexture(gl.TEXTURE_2D, tileTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        draw(performance.now());
      };
      image.src = TILE_SRC;
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    }

    let seekerReserve = seekerShownRef.current ? 1 : 0;
    let lastDraw = performance.now();

    // ---- One frame: glass, words, window and pointer from one timeline ----
    const hover = { x: 0, y: 0 };
    const draw = (now: number) => {
      const elapsed = elapsedAt(now);
      const t = elapsed < 0 ? -1 : elapsed - START_DELAY_MS;
      const live = t >= 0;
      timeRef.current = t;
      progressRef.current?.(Math.max(0, elapsed) / loopMs);
      // The loop's end: the whole scene fades out before it starts over.
      root.style.setProperty("--scene-in", (1 - smootherstep(at0(t, endMs + HOLD_MS, FADE_MS))).toFixed(4));
      if (outro) {
        const into = smootherstep(clamp01((elapsed - outroInAt) / OUTRO_IN_MS));
        const away = smootherstep(clamp01((elapsed - outroOutAt) / OUTRO_OUT_MS));
        // On the panel: the logo sits beside the shot, outside its fade.
        panel.style.setProperty("--outro-in", into.toFixed(4));
        panel.style.setProperty("--outro", (into * (1 - away)).toFixed(4));
      }
      const at = (from: number, span: number) => (live ? (t - from) / span : 0);
      const { h, pillW, cy, midX, sendCx } = layout;
      const { u } = scene;

      // -- The prompt: appear, expand, type, then the send button peels away --
      const appear = live ? settle(t / APPEAR_MS) : 0;
      const expand = live ? settle(at(EXPAND_AT_MS, EXPAND_MS)) : 0;
      const sideArc = smootherstep(at(SIDE_ARC_AT_MS, SIDE_ARC_MS));
      const separate = live ? settle(at(SEND_AT_MS, SEND_MS)) : 0;
      // Typed in the middle of the panel; it slides left to make room only as
      // the send button comes out of it.
      const pillCx = lerp(midX, layout.pillCx, separate);
      const textIn = clamp01(at(TYPE_AT_MS, 260));
      const chars = live ? Math.max(0, Math.min(PROMPT.length, Math.floor((t - TYPE_AT_MS) / TYPE_CHAR_MS))) : 0;
      const back = smootherstep(at(RETURN_AT_MS, RETURN_MS));

      // -- Into the window: shrink in place, fly over, make room for the avatar --
      const shrink = smootherstep(at(SHRINK_AT_MS, SHRINK_MS));
      const move = live ? spring(at(MOVE_AT_MS, MOVE_MS), 8.5) : 0;
      const moveSize = smootherstep(at(MOVE_AT_MS, MOVE_MS * 0.7));
      const push = live ? spring(at(AVATAR_AT_MS, AVATAR_MS), 6) : 0;
      // "Almost shrunk" is 1.2× the bubble; the rest goes on the way over.
      const fullW = h + (pillW - h) * expand;
      const pillWNow = lerp(lerp(fullW, bubbleW * 1.2, shrink), bubbleW, moveSize);
      const pillHNow = lerp(lerp(h, scene.bubbleH * 1.2, shrink), scene.bubbleH, moveSize);
      const r = (pillHNow / 2) * Math.max(0, appear);
      const halfW = r + Math.max(0, pillWNow - pillHNow) / 2;
      // It lands where the avatar will go, then the avatar nudges it left.
      const landX = scene.avatarCx + 10 * u - bubbleW / 2;
      const pillX = lerp(pillCx, landX, move) - 30 * u * push;
      const pillY = lerp(cy, scene.bubbleCy, move);

      // -- The send button, its click, the loader, and its exit --
      hover.x += (hoverTarget.current.x - hover.x) * 0.14;
      hover.y += (hoverTarget.current.y - hover.y) * 0.14;
      // The click: the pointer's, or a reader's own if they got there first.
      const clickedAt = Math.min(CLICK_AT_MS, clickRef.current >= 0 ? clickRef.current : Infinity);
      const clickProgress = (t - clickedAt) / SHINE_MS;
      const click = live && clickProgress >= 0 && clickProgress < 1 ? Math.sin(clickProgress * Math.PI) : 0;
      const loadingStarted = live && t >= clickedAt;
      const sendOut = smootherstep(at(SEND_OUT_AT_MS, SEND_OUT_MS));
      const sendFrom = pillCx + halfW;
      const sendX = sendFrom + (sendCx + hover.x - sendFrom) * separate;
      const sendY = cy + hover.y * separate;

      root.style.setProperty("--pill-w", `${(halfW * 2).toFixed(2)}px`);
      root.style.setProperty("--pill-h", `${pillHNow.toFixed(2)}px`);
      root.style.setProperty("--pill-x", `${pillX.toFixed(2)}px`);
      root.style.setProperty("--pill-y", `${pillY.toFixed(2)}px`);
      // The words shrink with the glass, from the prompt's size to the bubble's.
      const fontK = clamp01((h - pillHNow) / (h - scene.bubbleH));
      root.style.setProperty("--text-size", `${lerp(promptFont, 8.9 * u, fontK).toFixed(3)}px`);
      root.style.setProperty("--text-pad", `${lerp((h * 24) / 52, 10 * u, fontK).toFixed(3)}px`);
      root.style.setProperty("--text-in", textIn.toFixed(3));
      root.style.setProperty("--send-x", `${sendX.toFixed(2)}px`);
      root.style.setProperty("--send-y", `${sendY.toFixed(2)}px`);
      root.style.setProperty("--send-in", (clamp01(separate) * (1 - sendOut)).toFixed(3));
      root.style.setProperty("--send-scale", ((1 - click * 0.1) * (1 - sendOut * 0.35)).toFixed(4));
      root.toggleAttribute("data-typing", chars > 0 && chars < PROMPT.length);
      root.toggleAttribute("data-send-ready", separate > 0.6 && !loadingStarted);
      root.toggleAttribute("data-loading", loadingStarted && sendOut < 1);

      if (chars !== typed) {
        typed = chars;
        text.textContent = PROMPT.slice(0, chars);
      }
      // While typing, keep the end of the line (and the caret) in view; once done,
      // ease back to the start and let the far end run under the right edge.
      const pad = h * (24 / 52);
      const room = halfW * 2 - pad * 2;
      const overflow = Math.max(0, text.offsetWidth - room) * (1 - back);
      root.style.setProperty("--text-shift", `${(-overflow).toFixed(2)}px`);

      // -- The window springs in from the right, leaning into its stop --
      const winT = at(WINDOW_AT_MS, WINDOW_MS);
      const slide = live ? spring(winT, 7.5) : 0;
      const velocity = live ? (spring(winT + 0.01, 7.5) - slide) / 0.01 : 0;
      const winShift = (1 - slide) * (width - scene.winX + 24 * u);
      root.style.setProperty("--win-shift", `${winShift.toFixed(2)}px`);
      root.style.setProperty("--win-skew", `${Math.max(-2.2, Math.min(2.2, velocity * 0.9)).toFixed(3)}deg`);

      // -- Compare: Claude's window follows Flash's in, and answers in its own time --
      const cs = scene.claude;
      let win2Shift = 0;
      let claudeFeed = 0;
      if (cs) {
        const win2T = at(WINDOW_AT_MS + C_WINDOW_DELAY_MS, WINDOW_MS);
        const slide2 = live ? spring(win2T, 7.5) : 0;
        const velocity2 = live ? (spring(win2T + 0.01, 7.5) - slide2) / 0.01 : 0;
        win2Shift = (1 - slide2) * (width - cs.winX + 24 * u);
        root.style.setProperty("--win2-shift", `${win2Shift.toFixed(2)}px`);
        root.style.setProperty("--win2-skew", `${Math.max(-2.2, Math.min(2.2, velocity2 * 0.9)).toFixed(3)}deg`);
        // Its copy of the question appears as Flash's lands.
        root.style.setProperty("--cb-in", (live ? Math.max(0, spring(at(C_BUBBLE_AT_MS, 620), 6.5)) : 0).toFixed(4));
        // Thinking: the spark turns (easing to a stop as it finishes), "Thinking"
        // gains a dot a beat, and the clock runs from when Flash's thought appeared.
        const thinkT = live ? t - C_THINK_AT_MS : -1;
        root.style.setProperty("--ct-in", smootherstep(at(C_THINK_AT_MS, 520)).toFixed(4));
        const ran = Math.max(0, Math.min(C_THINK_MS, thinkT));
        const thinking = thinkT >= 0 && thinkT < C_THINK_MS;
        const ease = 600;
        const spin = 0.24; // deg per ms
        const angle =
          ran < C_THINK_MS - ease
            ? ran * spin
            : (C_THINK_MS - ease) * spin + spin * ease * (() => {
                const x = (ran - (C_THINK_MS - ease)) / ease;
                return x - (x * x) / 2;
              })();
        root.style.setProperty("--ct-rot", `${angle.toFixed(2)}deg`);
        root.style.setProperty("--ct-pulse", thinking ? (1 + 0.08 * Math.sin(thinkT / 140)).toFixed(4) : "1");
        root.toggleAttribute("data-claude-thinking", thinking);
        const timer = `${(ran / 1000).toFixed(2)}s`;
        if (claudeTimer && claudeTimer.textContent !== timer) claudeTimer.textContent = timer;
        const label = thinkT >= C_THINK_MS ? "Thought for" : "Thinking";
        if (claudeLabel && claudeLabel.textContent !== label) claudeLabel.textContent = label;
        const dots = thinking ? ".".repeat(Math.floor(thinkT / C_DOT_MS) % 4) : "";
        if (claudeDots && claudeDots.textContent !== dots) claudeDots.textContent = dots;

        // The answer streams in, and the window scrolls to keep its foot in view.
        const sinceReply = live ? t - C_REPLY_AT_MS : -1;
        for (const r of claudeReveals) {
          const linear = clamp01((sinceReply - r.at) / r.dur);
          const p = r.ease === "spring" ? spring(linear, 6.5) : r.ease === "linear" ? linear : smootherstep(linear);
          if (Math.abs(p - r.last) < 0.0005) continue;
          r.last = p;
          r.el.style.setProperty("--p", p.toFixed(4));
        }
        let need = 0;
        for (const b of claudeBlocks) need = lerp(need, Math.max(need, b.bottom), smootherstep(at(C_REPLY_AT_MS + b.at, b.dur)));
        claudeFeed = Math.max(0, cs.replyY + need - cs.feedLimit);
        root.style.setProperty("--cfeed-scroll", `${(-claudeFeed).toFixed(2)}px`);
        root.style.setProperty("--cfeed-top", `${(claudeFeed > 0 ? cs.bodyY + 2 * u : -1e4).toFixed(2)}px`);
      }

      // -- The avatar pops in, the thought rises, the answer box grows --
      const avatar = live ? spring(at(AVATAR_AT_MS + 60, AVATAR_MS), 5.5) : 0;
      root.style.setProperty("--avatar-in", Math.max(0, avatar).toFixed(4));
      root.style.setProperty("--think-in", smootherstep(at(THINK_AT_MS, THINK_MS)).toFixed(4));
      const boxIn = live ? Math.max(0, spring(at(BOX_AT_MS, BOX_MS), 7)) : 0;
      const boxFade = smootherstep(at(BOX_AT_MS, BOX_MS * 0.6));
      // The box holds what has appeared and no more: it opens up a line at a time
      // as the first word of each new line lands, then for each block below as
      // it streams in — a row of metrics, a chart as it draws, a note's lines.
      // (Heights are measured from the top of the box, padding included.)
      const padY = 11 * u * ANSWER_SCALE;
      let need = firstLineH;
      for (let i = line2; i < words.length; i++) {
        const k = live ? 1 - (1 - clamp01((t - STREAM_AT_MS - STREAM_STEPS[i - line2]!) / LINE_GROW_MS)) ** 3 : 0;
        if (k <= 0) break;
        need = lerp(need, Math.max(need, wordBottoms[i]!), k);
      }
      for (const b of blocks) need = lerp(need, Math.max(need, b.bottom), smootherstep(at(EXTRA_AT_MS + b.at, b.dur)));
      const boxH = (need + padY) * lerp(0.82, 1, boxIn);
      const boxW = scene.boxW * lerp(0.95, 1, boxIn);
      const boxX = scene.boxX + (scene.boxW - boxW) / 2;
      const boxShift = (1 - boxIn) * 10 * u;
      // Once the foot of the box would pass the dial, the window's content (the
      // message, the thought, the box) scrolls up to keep it in view, sliding
      // away under the window's top edge.
      // Room for the dial eases in and out as it's shown and hidden (never in a
      // rendered video, where it's hidden).
      const reserveTarget = seekerShownRef.current && !panel.hasAttribute("data-rendering") ? 1 : 0;
      seekerReserve += (reserveTarget - seekerReserve) * (1 - Math.exp(-Math.max(0, now - lastDraw) / 140));
      if (Math.abs(reserveTarget - seekerReserve) < 0.001) seekerReserve = reserveTarget;
      lastDraw = now;
      const feedLimit = lerp(scene.feedLimit, Math.min(scene.feedLimit, scene.feedFloor), seekerReserve);
      const feedScroll = Math.max(0, scene.boxTop + boxShift + boxH - feedLimit);
      const clipTop = feedScroll > 0 ? scene.bodyY + 2 * u : -1e4;
      root.style.setProperty("--feed-scroll", `${(-feedScroll).toFixed(2)}px`);
      root.style.setProperty("--feed-top", `${clipTop.toFixed(2)}px`);
      root.style.setProperty("--box-h", `${boxH.toFixed(2)}px`);
      root.style.setProperty("--box-shift", `${boxShift.toFixed(2)}px`);
      // The words follow the glass in a beat later.
      root.style.setProperty("--box-in", smootherstep(at(BOX_AT_MS + 140, BOX_MS * 0.6)).toFixed(4));

      // Streaming: line one is there as the box appears; the rest comes in
      // tokens, each word fading in over WORD_FADE_MS (--p, from the timeline, so
      // a scrub or a rendered frame shows exactly where each word is).
      words.forEach((word, i) => {
        const p =
          !live || t < BOX_AT_MS ? 0
          : i < line2 ? 1
          : 1 - (1 - clamp01((t - STREAM_AT_MS - STREAM_STEPS[i - line2]!) / WORD_FADE_MS)) ** 3;
        if (wordProgress[i] === p) return;
        wordProgress[i] = p;
        word.style.setProperty("--p", p.toFixed(3));
      });

      // The extra blocks, each at its own progress (--p), metrics counting up.
      const extra = live ? t - EXTRA_AT_MS : -1;
      for (const r of reveals) {
        const linear = clamp01((extra - r.at) / r.dur);
        const p =
          r.ease === "spring" ? spring(linear, 6.5)
          : r.ease === "linear" ? linear
          : r.ease === "count" ? 1 - (1 - linear) ** 3
          : smootherstep(linear);
        if (Math.abs(p - r.last) < 0.0005) continue;
        r.last = p;
        r.el.style.setProperty("--p", p.toFixed(4));
        if (r.count >= 0) r.el.textContent = METRICS[r.count]!.value(p);
      }

      // -- The pointer, by its tip --
      const tip = { x: sendCx + h * 0.1, y: cy + h * 0.12 };
      const cursorT = t - CURSOR_AT_MS;
      const cursor =
        !live || cursorT < 0
          ? { x: width + h, y: height + h }
          : cursorAt(cursorT, width, height, tip, scene.rest, h);
      const pressT = (t - CLICK_AT_MS + PRESS_MS * 0.5) / PRESS_MS;
      const press = live && !reducedMotion && pressT > 0 && pressT < 1 ? Math.sin(pressT * Math.PI) : 0;
      root.style.setProperty("--cursor-x", `${cursor.x.toFixed(2)}px`);
      root.style.setProperty("--cursor-y", `${cursor.y.toFixed(2)}px`);
      root.style.setProperty("--cursor-press", (1 - press * 0.14).toFixed(4));

      if (!gl || !program) return;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      if (r <= 0.01) return;
      gl.useProgram(program);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tileTexture);
      gl.uniform1i(uniforms.u_tile!, 0);
      gl.uniform2f(uniforms.u_res!, canvas.width, canvas.height);
      gl.uniform1f(uniforms.u_dpr!, dpr);
      gl.uniform2f(uniforms.u_tile_size!, TILE_W, TILE_H);
      // CSS centres the tile in the panel (50% 50%); the same origin here.
      gl.uniform2f(uniforms.u_tile_offset!, (width - TILE_W) / 2, (height - TILE_H) / 2);
      gl.uniform1f(uniforms.u_ground!, GROUND);
      gl.uniform1f(uniforms.u_ink!, LATTICE_INK);
      gl.uniform4f(
        uniforms.u_window!,
        scene.winX + winShift,
        scene.bodyY,
        scene.winX + winShift + scene.winW,
        Math.min(scene.winBottom, 1e5),
      );
      gl.uniform2f(uniforms.u_window_fill!, WINDOW_FILL, live && winT > 0 ? WINDOW_FILL_ALPHA : 0);
      gl.uniform2f(uniforms.u_pill!, pillX, pillY - feedScroll);
      gl.uniform2f(uniforms.u_pill_half!, halfW, r);
      gl.uniform1f(uniforms.u_radius!, r);
      gl.uniform2f(uniforms.u_send!, sendX, sendY);
      const sendR = separate > 0 ? (h / 2) * (1 - click * 0.1) * (1 - sendOut) : 0;
      gl.uniform1f(uniforms.u_send_r!, sendR);
      gl.uniform1f(uniforms.u_separate!, separate);
      gl.uniform1f(uniforms.u_side_arc!, sideArc);
      gl.uniform1f(uniforms.u_click!, click);
      gl.uniform2f(uniforms.u_box!, boxX, scene.boxTop + boxShift - feedScroll);
      gl.uniform2f(uniforms.u_box_size!, boxW, boxH);
      gl.uniform1f(uniforms.u_box_r!, 14 * u);
      gl.uniform1f(uniforms.u_box_in!, boxFade);
      gl.uniform2f(uniforms.u_clip!, clipTop, 12 * u);
      if (cs) {
        gl.uniform4f(uniforms.u_window2!, cs.winX + win2Shift, cs.bodyY, cs.winX + win2Shift + cs.winW, cs.winY + cs.winH);
        gl.uniform2f(uniforms.u_window2_fill!, CLAUDE_FILL, live && win2Shift < width ? 1 : 0);
      } else {
        gl.uniform2f(uniforms.u_window2_fill!, 0, 0);
      }
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    refreshRef.current = () => {
      reveals = readReveals();
      blocks = readBlocks();
      resize();
    };

    // ---- Frame loop: runs only while the panel is on screen ----
    let frame = 0;
    let visible = false;
    const loop = (now: number) => {
      draw(now);
      frame = visible ? requestAnimationFrame(loop) : 0;
    };
    const kick = () => {
      if (!frame && visible) frame = requestAnimationFrame(loop);
    };
    kickRef.current = kick;

    // ---- Control, for the dial ----
    let scrubbing = false;
    controlImpl.current = {
      seek: (progress) => {
        const now = performance.now();
        const to = Math.min(loopMs - 1, Math.max(0, progress * loopMs));
        clickRef.current = -1;
        if (held !== null) held = to;
        else origin = now - to;
        draw(now);
        kick();
      },
      scrub: (active) => {
        const now = performance.now();
        if (active && !scrubbing) {
          scrubbing = true;
          if (held === null) held = Math.max(0, elapsedAt(now));
        } else if (!active && scrubbing) {
          scrubbing = false;
          // Play on from where it was let go (reduced motion stays put).
          if (!reducedMotion && held !== null) {
            origin = now - held;
            loopIndex = 0;
            held = null;
          }
        }
        kick();
      },
    };

    // ---- Rendering to video (scripts/render-video.ts) ----
    // With ?render in the URL, the page exposes a frame-by-frame renderer: the
    // panel's controls hide, and each call poses the whole shot — including the
    // loader's CSS animation — at an exact time, ready to be captured.
    if (new URLSearchParams(window.location.search).has("render")) {
      (window as unknown as { __flashShot?: unknown }).__flashShot = {
        length: loopMs,
        renderAt: (ms: number) => {
          panel.setAttribute("data-rendering", "");
          held = Math.max(0, Math.min(loopMs - 1, ms));
          clickRef.current = -1;
          draw(performance.now());
          const sinceClick = held - START_DELAY_MS - CLICK_AT_MS;
          for (const el of root.querySelectorAll<HTMLElement>(".loader__ring, .loader__dot")) {
            for (const animation of el.getAnimations()) {
              animation.pause();
              animation.currentTime = Math.max(0, sinceClick);
            }
          }
        },
      };
    }

    // Plays while on screen and pauses off it. Scrolling back up past the panel
    // rewinds it, so it starts over the next time it comes into view.
    let hiddenAt: number | null = null;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        const now = performance.now();
        visible = entry.isIntersecting;
        if (entry.isIntersecting) {
          if (hiddenAt !== null && held === null && origin !== null) {
            origin = now - hiddenAt;
            loopIndex = 0;
          }
          hiddenAt = null;
          if (entry.intersectionRatio >= 0.35 && origin === null && held === null) {
            origin = now;
            loopIndex = 0;
          }
        } else if (entry.boundingClientRect.top > 0) {
          origin = null;
          held = reducedMotion ? restPose : null;
          hiddenAt = null;
          clickRef.current = -1;
          draw(now);
        } else if (origin !== null && held === null) {
          hiddenAt = elapsedAt(now);
        }
        kick();
      },
      { threshold: [0, 0.35] },
    );
    observer.observe(panel);

    const sizer = new ResizeObserver(resize);
    sizer.observe(panel);
    resize();
    // Line breaks depend on the webfont; measure again once it has loaded.
    document.fonts?.ready.then(resize);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      sizer.disconnect();
      if (gl) {
        program && gl.deleteProgram(program);
        tileTexture && gl.deleteTexture(tileTexture);
      }
    };
  }, [variant, compare, outro, near]);

  const kick = () => kickRef.current();

  const onSendMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    hoverTarget.current = {
      x: ((event.clientX - box.left) / box.width - 0.5) * 4.4,
      y: ((event.clientY - box.top) / box.height - 0.5) * 4.4,
    };
    kick();
  };

  const onSendLeave = () => {
    hoverTarget.current = { x: 0, y: 0 };
    kick();
  };

  const onSend = () => {
    if (clickRef.current >= 0 || timeRef.current < 0) return;
    clickRef.current = timeRef.current;
    hoverTarget.current = { x: 0, y: 0 };
    kick();
  };

  return (
    <>
    <div
      className="video-prompt"
      ref={rootRef}
      data-fallback={webglUnavailable || undefined}
      data-side-by-side={sideBySide || undefined}
    >
      {/* The Flash window, under the glass so the glass bends it. */}
      <div className="video-window" aria-hidden>
        {/* window.svg's outline, redrawn at the window's size (windowPath). */}
        <svg className="video-window__frame" ref={windowRef} viewBox="0 0 736 519.5" preserveAspectRatio="none">
          <path d={windowPath(736, 519.5)} />
        </svg>
        <img className="video-window__lights" src="/images/video-shot/lights.svg" alt="" />
        <img className="video-window__logo" src="/images/video-shot/flash-logo.svg" alt="" />
        <img className="video-window__close" src="/images/video-shot/close.svg" alt="" />
      </div>

      {/* Compare: Claude's window, its tab carrying Claude's mark. */}
      {compare && (
        <div className="video-window video-window--claude" aria-hidden>
          <svg className="video-window__frame" ref={claudeWindowRef} viewBox="0 0 736 519.5" preserveAspectRatio="none">
            <path d={windowPath(736, 519.5)} />
          </svg>
          <img className="video-window__lights" src="/images/video-shot/lights.svg" alt="" />
          <span className="video-window__claude-tab">
            <img src="/images/video-shot/claude-spark.svg" alt="" />
            Claude
          </span>
          <img className="video-window__close" src="/images/video-shot/close.svg" alt="" />
        </div>
      )}

      <canvas className="video-prompt__glass" ref={canvasRef} aria-hidden />

      {/* The window's scrolling content: the message, the thought and the reply. */}
      <div className="video-feed">
        <div className="video-feed__inner">
          <span className="video-prompt__clip" aria-hidden>
            <span className="video-prompt__line">
              <span className="video-prompt__text" ref={textRef} />
              <span className="video-prompt__caret" aria-hidden />
            </span>
          </span>
          <span className="video-prompt__sr">{PROMPT}</span>

          <span className="video-avatar" aria-hidden>
            C
          </span>

          <span className="video-think" aria-hidden>
            <img src="/images/video-shot/think-icon.svg" alt="" />
            Thought for 0.5s
          </span>

          <div className="video-answer" aria-hidden>
            <div className="video-answer__scroll" ref={scrollRef}>
              <p className="video-answer__text" ref={answerRef}>
                {ANSWER_WORDS.map((word, i) => (
                  <span key={i}>{i < ANSWER_WORDS.length - 1 ? `${word} ` : word}</span>
                ))}
              </p>

              <div className="va-metrics">
                {METRICS.map((metric, i) => (
                  <div
                    className="va-metric"
                    key={metric.label}
                    {...block(METRIC_AT + i * METRIC_STAGGER, 320)}
                    {...reveal(METRIC_AT + i * METRIC_STAGGER, METRIC_MS)}
                  >
                    <span className="va-metric__label">{metric.label}</span>
                    <span className="va-metric__value" {...reveal(METRIC_AT + i * METRIC_STAGGER + 80, COUNT_MS, "count", i)}>
                      {metric.value(1)}
                    </span>
                    <span className="va-metric__sub">{metric.sub}</span>
                  </div>
                ))}
              </div>

              <p className="va-sources" {...block(SOURCES_AT, 320)} {...reveal(SOURCES_AT, 380)}>
                Sources: US EIA historical data and IEA October 2026 Oil Market Report.{" "}
                <SourceChip />
              </p>

              <section className="va-chart va-chart--flows">
                <h4 className="va-chart__title" {...block(C1_AT, 320)} {...reveal(C1_AT, 380)}>
                  Oil shipments through the Strait of Hormuz
                </h4>
                <p className="va-chart__sub" {...block(C1_AT + SUB_AFTER, 320)} {...reveal(C1_AT + SUB_AFTER, 380)}>
                  Total petroleum liquids • Million barrels per day
                </p>
                <svg className="va-chart__svg" viewBox={`0 0 ${C1.w} ${C1.h}`} {...block(C1_GRID_AT, 500)}>
                  <g {...reveal(C1_GRID_AT, 400)} className="va-chart__grid">
                    {[0, 6, 12, 18, 24].map((v) => (
                      <g key={v}>
                        <line x1={C1.left} x2={C1.right} y1={c1Y(v)} y2={c1Y(v)} />
                        <text x={0} y={c1Y(v) + 1.8}>{`${v} mb/d`}</text>
                      </g>
                    ))}
                  </g>
                  <defs>
                    {/* The shot's gold (#d39532), deepening toward the baseline. */}
                    <linearGradient id="va-bar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="#e0a646" />
                      <stop offset="1" stopColor="#9c681c" />
                    </linearGradient>
                  </defs>
                  {FLOWS.map((bar, i) => {
                    const x = C1.left + i * c1Slot + c1Slot * 0.14;
                    const w = c1Slot * 0.72;
                    return (
                      <g key={bar.label}>
                        <rect
                          className="va-chart__bar"
                          x={x}
                          y={c1Y(bar.value)}
                          width={w}
                          height={C1.bottom - c1Y(bar.value)}
                          rx={2.4}
                          {...reveal(C1_BAR_AT + i * C1_BAR_STAGGER, C1_BAR_MS, "spring")}
                        />
                        <text
                          className="va-chart__tick"
                          x={x + w / 2}
                          y={C1.bottom + 10}
                          {...reveal(C1_BAR_AT + i * C1_BAR_STAGGER, 400)}
                        >
                          {bar.label}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </section>

              <p className="va-sources va-sources--chart" {...block(order.sourceNote, 320)} {...reveal(order.sourceNote, 380)}>
                Source: EIA quarterly tanker-tracking data; IEA September 2026 estimate. The final bar
                represents one month rather than a quarter. <SourceChip />
              </p>

              <p className="va-note">
                {NOTE_WORDS.map((word, i) => (
                  <span
                    key={i}
                    {...block(order.note + NOTE_STEPS[i]!, LINE_GROW_MS)}
                    {...reveal(order.note + NOTE_STEPS[i]!, 220)}
                  >
                    {i < NOTE_WORDS.length - 1 ? `${word} ` : word}
                  </span>
                ))}
              </p>

              <section className="va-chart va-chart--brent">
                <h4 className="va-chart__title" {...block(order.c2, 320)} {...reveal(order.c2, 380)}>
                  Brent crude oil price shock
                </h4>
                <p className="va-chart__sub" {...block(order.c2 + SUB_AFTER, 320)} {...reveal(order.c2 + SUB_AFTER, 380)}>
                  Brent spot price • USD per barrel
                </p>
                <svg className="va-chart__svg" viewBox={`0 0 ${C2.w} ${C2.h}`} {...block(order.c2 + GRID_AFTER, 500)}>
                  <g {...reveal(order.c2 + GRID_AFTER, 400)} className="va-chart__grid">
                    {[60, 80, 100, 120, 140].map((v) => (
                      <g key={v}>
                        <line x1={C2.left} x2={C2.right} y1={c2Y(v)} y2={c2Y(v)} />
                        <text x={0} y={c2Y(v) + 1.8}>{`$${v}`}</text>
                      </g>
                    ))}
                    {BRENT.map((point, i) => (
                      <text key={point.label} className="va-chart__tick" x={c2X(i)} y={C2.bottom + 10}>
                        {point.label}
                      </text>
                    ))}
                  </g>
                  <path
                    className="va-chart__line"
                    d={C2_PATH}
                    pathLength={1}
                    {...reveal(order.c2 + PLOT_AFTER, C2_LINE_MS)}
                  />
                  {BRENT.map((point, i) => (
                    <circle
                      key={point.label}
                      className="va-chart__dot"
                      cx={c2X(i)}
                      cy={c2Y(point.value)}
                      r={2.3}
                      {...reveal(order.c2 + PLOT_AFTER + (i / (BRENT.length - 1)) * C2_LINE_MS * 0.92, 420, "spring")}
                    />
                  ))}
                </svg>
              </section>
            </div>
          </div>
          <span className="video-prompt__sr">{ANSWER}</span>
        </div>
      </div>

      {/* Compare: Claude's side of the conversation, in its own interface — the
          question in a plain bubble, the spark thinking, then a serif answer. */}
      {compare && (
        <div className="claude-feed" ref={claudeRef}>
          <div className="claude-feed__inner">
            <p className="claude-user" aria-hidden>
              {PROMPT}
            </p>
            <div className="claude-think" aria-hidden>
              <img className="claude-think__spark" src="/images/video-shot/claude-spark.svg" alt="" />
              <span className="claude-think__label">Thinking</span>
              <span className="claude-think__dots" />
              <span className="claude-think__timer">0.00s</span>
            </div>
            <div className="claude-reply" aria-hidden>
              <p>
                {CP1_WORDS.map((word, i) => (
                  <span key={i} {...block(CP1_STEPS[i]!, LINE_GROW_MS)} {...reveal(CP1_STEPS[i]!, 300)}>
                    {i < CP1_WORDS.length - 1 ? `${word} ` : word}
                  </span>
                ))}
              </p>
              <p>
                {CP2_WORDS.map((word, i) => (
                  <span key={i} {...block(CP2_AT + CP2_STEPS[i]!, LINE_GROW_MS)} {...reveal(CP2_AT + CP2_STEPS[i]!, 300)}>
                    {i < CP2_WORDS.length - 1 ? `${word} ` : word}
                  </span>
                ))}
              </p>
              <figure className="claude-chart" {...block(CC_AT, 520)} {...reveal(CC_AT, 480)}>
                <figcaption>Illustrative Brent scenarios · USD per barrel</figcaption>
                <svg viewBox="0 0 265 84">
                  {CLAUDE_SCENARIOS.map((row, i) => {
                    const y = 6 + i * 26;
                    const w = (row.value / 140) * 130;
                    return (
                      <g key={row.label}>
                        <text x={0} y={y + 10.5}>{row.label}</text>
                        <rect
                          className="claude-chart__bar"
                          x={104}
                          y={y}
                          width={w}
                          height={14}
                          rx={2}
                          {...reveal(CC_BAR_AT + i * CC_BAR_STAGGER, CC_BAR_MS, "spring")}
                        />
                        <text
                          className="claude-chart__value"
                          x={104 + w + 5}
                          y={y + 10.5}
                          {...reveal(CC_BAR_AT + i * CC_BAR_STAGGER + CC_BAR_MS * 0.5, 360)}
                        >
                          ${row.value}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </figure>
              <p>
                {CP3_WORDS.map((word, i) => (
                  <span key={i} {...block(CP3_AT + CP3_STEPS[i]!, LINE_GROW_MS)} {...reveal(CP3_AT + CP3_STEPS[i]!, 300)}>
                    {i < CP3_WORDS.length - 1 ? `${word} ` : word}
                  </span>
                ))}
              </p>
            </div>
            <span className="video-prompt__sr">
              Claude, after thinking for 5.85 seconds: {CLAUDE_P1} {CLAUDE_P2} Rapid reopening, about $85 a barrel;
              weeks of disruption, about $100; a months-long closure, about $130. {CLAUDE_P3}
            </span>
          </div>
        </div>
      )}

      <button
        type="button"
        className="video-prompt__send"
        aria-label="Send question"
        onPointerMove={onSendMove}
        onPointerLeave={onSendLeave}
        onClick={onSend}
      >
        <svg viewBox="0 0 24 24" aria-hidden>
          <path d="M12 19V5M5.5 11.5 12 5l6.5 6.5" />
        </svg>
        <span className="video-prompt__loader">
          <LiveLoader loader={SEND_LOADER} />
        </span>
      </button>

      {/* The frame's pointer; its tip is at the SVG's (5.2, 1.9) of 22. */}
      <svg className="video-prompt__cursor" viewBox="0 0 22 22" aria-hidden>
        <path d="M4.71429 2.83171C4.71429 1.77414 5.94 1.18957 6.76264 1.85507L20.0255 12.595C20.8254 13.2424 20.3673 14.5357 19.338 14.5357H11.9704C11.7069 14.5358 11.4468 14.5947 11.209 14.7082C10.9712 14.8217 10.7618 14.9869 10.5961 15.1918L6.69743 20.0114C6.03586 20.8293 4.71429 20.3618 4.71429 19.3097V2.83171Z" />
      </svg>
    </div>
    {/* The outro: the QuantHive logo after the shot (full screen, large displays),
        beside the shot rather than in it, so the shot's fade doesn't take it too. */}
    {outro && (
      <div className="video-outro" aria-hidden>
        <span className="video-outro__logo" />
      </div>
    )}
    </>
  );
}
