import { Children, useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { GROUND, LATTICE_INK, TILE_H, TILE_SRC, TILE_W } from "./VideoPromptGlass";
import "./GlassMenu.css";

// The video panel's menu: one "⋯" key in the top-right corner that opens into a
// column of keys. The keys are liquid glass, drawn by a small WebGL canvas the
// way the prompt is (VideoPromptGlass): each is a drop in one metaball field, so
// as the column opens each key swells out of the one above, holds by a liquid
// neck, then snaps free — and on closing, flows back up and merges in. The glass
// refracts the panel's own lattice beneath it. The keys' icons are DOM, laid over
// the drops and following them.

const STAGGER_MS = 70;
const OPEN_MS = 640;
const CLOSE_MS = 420;

const VERT = `#version 300 es
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

// Geometry in CSS px within the canvas, y down. Up to five drops: the menu key
// and the (up to four) it holds.
const FRAG = `#version 300 es
precision highp float;
out vec4 outColor;
uniform vec2 u_res;
uniform float u_dpr;
uniform vec2 u_origin;      // the canvas's top-left within the panel
uniform vec2 u_panel;       // the panel's size (the lattice is centred on it)
uniform sampler2D u_tile;
uniform vec2 u_tile_size;
uniform float u_ground;
uniform float u_ink;
uniform vec3 u_drop[5];     // centre x, centre y, radius
uniform float u_lit[5];     // hover glow, 0–1
uniform float u_k;          // how far apart drops still fuse

float smin(float a, float b, float k) {
  if (k <= 0.001) return min(a, b);
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

float field(vec2 p) {
  float d = 1e5;
  for (int i = 0; i < 5; i++) {
    if (u_drop[i].z <= 0.01) continue;
    d = smin(d, length(p - u_drop[i].xy) - u_drop[i].z, u_k);
  }
  return d;
}

vec2 normalAt(vec2 p) {
  vec2 e = vec2(0.6, 0.0);
  return normalize(vec2(field(p + e.xy) - field(p - e.xy), field(p + e.yx) - field(p - e.yx)) + 0.0001);
}

float ground(vec2 p) {
  vec2 q = p + u_origin;
  vec2 uv = (q - (u_panel - u_tile_size) * 0.5) / u_tile_size;
  return u_ground + u_ink * texture(u_tile, uv).a;
}

float safeAsin(float v) { return asin(clamp(v, -1.0, 1.0)); }

float liquidGlassEdgeFactor(float depth, float thickness, float refractionFactor) {
  if (depth >= thickness) return 0.0;
  float edgeRatio = 1.0 - depth / thickness;
  float thetaIncident = safeAsin(edgeRatio * edgeRatio);
  float thetaTransmitted = safeAsin(sin(thetaIncident) / refractionFactor);
  return -tan(thetaTransmitted - thetaIncident);
}

void main() {
  vec2 p = vec2(gl_FragCoord.x, u_res.y - gl_FragCoord.y) / u_dpr;
  float d = field(p);
  if (d > 1.5) discard;

  // The nearest drop sets the local radius, top edge and glow.
  int near = 0;
  float best = 1e5;
  for (int i = 0; i < 5; i++) {
    if (u_drop[i].z <= 0.01) continue;
    float di = length(p - u_drop[i].xy) - u_drop[i].z;
    if (di < best) { best = di; near = i; }
  }
  vec3 drop = u_drop[near];
  float radius = max(drop.z, 1.0);

  vec2 n = normalAt(p);
  float edge = liquidGlassEdgeFactor(-d, radius * 0.62, 1.42);
  vec2 offset = -n * edge * radius * 1.15;
  vec3 col = vec3(ground(p + offset * 1.05), ground(p + offset), ground(p + offset * 0.95));

  // Dark glass, lighter toward the foot, as the prompt's.
  float t = clamp((p.y - (drop.y - radius)) / (radius * 2.0), 0.0, 1.0);
  col = mix(col, vec3(mix(0.112, 0.160, t)), 0.8);
  col += u_lit[near] * vec3(0.05, 0.042, 0.026);
  col += abs(edge) * 0.05;
  float rim = 1.0 - smoothstep(0.0, 1.25, abs(d + 0.55));
  col += rim * mix(0.34, 0.2, t) * (1.0 + u_lit[near] * 0.5);

  float alpha = clamp(0.5 - d * u_dpr, 0.0, 1.0);
  outColor = vec4(clamp(col, 0.0, 1.0), alpha);
}`;

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const smootherstep = (v: number) => {
  const p = clamp01(v);
  return p * p * p * (p * (p * 6 - 15) + 10);
};
/** A damped spring from rest: one soft overshoot, then still. */
const spring = (v: number, damping = 7) => {
  const p = clamp01(v);
  if (p >= 1) return 1;
  const w = Math.PI * 2.5;
  return 1 - Math.exp(-damping * p) * (Math.cos(w * p) + (damping / w) * Math.sin(w * p));
};

function compile(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn("[glass-menu] shader error:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export default function GlassMenu({
  children,
  label = "Video options",
  busy,
}: {
  /** The keys the menu holds, top to bottom (up to four). */
  children: ReactNode;
  label?: string;
  /** A task in progress (0–1) to show round the closed key, e.g. a render. */
  busy?: number | null;
}) {
  const items = Children.toArray(children).slice(0, 4);
  const count = items.length;
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [open, setOpen] = useState(false);
  const [fallback, setFallback] = useState(false);
  // Shared with the frame loop.
  const motion = useRef({ open: false, at: -1e9, from: [0, 0, 0, 0], count: 0, lit: [0, 0, 0, 0, 0], litTarget: [0, 0, 0, 0, 0] });
  motion.current.count = count;
  const kickRef = useRef<() => void>(() => {});

  const toggle = useCallback((next?: boolean) => {
    const m = motion.current;
    const target = next ?? !m.open;
    if (target === m.open) return;
    // Each drop sets off from wherever it is now (a reversal mid-flight is smooth).
    m.from = m.from.map((_, i) => progressOf(m, i, performance.now()));
    m.open = target;
    // Reduced motion: straight to the end state.
    m.at = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? -1e9 : performance.now();
    setOpen(target);
    kickRef.current();
  }, []);

  // Closes on a click elsewhere, or Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) toggle(false);
    };
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && toggle(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, toggle]);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const panel = root?.closest<HTMLElement>(".about__video");
    if (!root || !canvas || !panel) return;

    const gl = canvas.getContext("webgl2", { alpha: true, premultipliedAlpha: false });
    let program: WebGLProgram | null = null;
    let tile: WebGLTexture | null = null;
    const uni: Record<string, WebGLUniformLocation | null> = {};
    if (gl) {
      const vs = compile(gl, gl.VERTEX_SHADER, VERT);
      const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
      program = gl.createProgram();
      if (vs && fs && program) {
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) program = null;
      } else program = null;
      vs && gl.deleteShader(vs);
      fs && gl.deleteShader(fs);
    }
    if (!gl || !program) {
      setFallback(true);
    } else {
      for (const name of ["u_res", "u_dpr", "u_origin", "u_panel", "u_tile", "u_tile_size", "u_ground", "u_ink", "u_drop", "u_lit", "u_k"]) {
        uni[name] = gl.getUniformLocation(program, name);
      }
      tile = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tile);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));
      const image = new Image();
      image.onload = () => {
        gl.bindTexture(gl.TEXTURE_2D, tile);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        draw(performance.now());
      };
      image.src = TILE_SRC;
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    }

    // ---- Layout: the key's size from the CSS (GlassMenu.css), the gap from the panel ----
    let size = 32;
    let gap = 8;
    let pad = 8;
    let dpr = 1;
    let origin = { x: 0, y: 0 };
    let panelSize = { w: 1, h: 1 };
    const resize = () => {
      const r = root.getBoundingClientRect();
      const pr = panel.getBoundingClientRect();
      size = r.width || 32;
      // The least gap (px) can be raised from the CSS (--key-gap-min, a number).
      const gapMin = parseFloat(getComputedStyle(root).getPropertyValue("--key-gap-min")) || 8;
      gap = Math.max(gapMin, Math.min(pr.width, pr.height) * 0.02);
      pad = Math.ceil(size * 0.35);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = size + pad * 2;
      const h = size * (count + 1) + gap * count + pad * 2;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      canvas.style.left = `${-pad}px`;
      canvas.style.top = `${-pad}px`;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      origin = { x: r.left - pr.left - pad, y: r.top - pr.top - pad };
      panelSize = { w: pr.width, h: pr.height };
      root.style.setProperty("--key-step", `${size + gap}px`);
      draw(performance.now());
    };

    // ---- One frame ----
    const drops = new Float32Array(15);
    const lit = new Float32Array(5);
    const draw = (now: number) => {
      const m = motion.current;
      const r = size / 2;
      const cx = pad + r;
      const cy0 = pad + r;
      drops.set([cx, cy0, r], 0);
      for (let i = 0; i < 4; i++) {
        const p = progressOf(m, i, now);
        const slot = slotRefs.current[i];
        // Swells out of the key above as it leaves, full size once clear.
        const y = cy0 + (i + 1) * (size + gap) * p;
        const radius = i < items.length ? r * (0.45 + 0.55 * smootherstep(p * 1.25)) * (p > 0.002 ? 1 : 0) : 0;
        drops.set([cx, y, radius], (i + 1) * 3);
        if (slot) {
          slot.style.setProperty("--y", `${((i + 1) * (size + gap) * p).toFixed(2)}px`);
          slot.style.setProperty("--in", smootherstep((p - 0.55) / 0.4).toFixed(3));
          slot.toggleAttribute("data-ready", m.open && p > 0.85);
        }
      }
      // Hover glow eases toward its target.
      for (let i = 0; i < 5; i++) {
        m.lit[i]! += (m.litTarget[i]! - m.lit[i]!) * 0.18;
        lit[i] = m.lit[i]!;
      }
      if (!gl || !program) return;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(program);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tile);
      gl.uniform1i(uni.u_tile!, 0);
      gl.uniform2f(uni.u_res!, canvas.width, canvas.height);
      gl.uniform1f(uni.u_dpr!, dpr);
      gl.uniform2f(uni.u_origin!, origin.x, origin.y);
      gl.uniform2f(uni.u_panel!, panelSize.w, panelSize.h);
      gl.uniform2f(uni.u_tile_size!, TILE_W, TILE_H);
      gl.uniform1f(uni.u_ground!, GROUND);
      gl.uniform1f(uni.u_ink!, LATTICE_INK);
      gl.uniform3fv(uni.u_drop!, drops);
      gl.uniform1fv(uni.u_lit!, lit);
      gl.uniform1f(uni.u_k!, size * 0.42);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    // ---- Loop: only while something is moving ----
    let frame = 0;
    const loop = (now: number) => {
      draw(now);
      const m = motion.current;
      const moving = now - m.at < (m.open ? OPEN_MS : CLOSE_MS) + STAGGER_MS * m.count + 50;
      const glowing = m.lit.some((v, i) => Math.abs(v - m.litTarget[i]!) > 0.005);
      frame = moving || glowing ? requestAnimationFrame(loop) : 0;
    };
    const kick = () => {
      if (!frame) frame = requestAnimationFrame(loop);
    };
    kickRef.current = kick;

    const sizer = new ResizeObserver(resize);
    sizer.observe(panel);
    resize();

    // Hover lights the drop under the pointer.
    const onOver = (event: PointerEvent) => {
      const key = (event.target as HTMLElement).closest<HTMLElement>("[data-drop]");
      const m = motion.current;
      m.litTarget = [0, 0, 0, 0, 0];
      if (key) m.litTarget[Number(key.dataset.drop)] = 1;
      kick();
    };
    const onLeave = () => {
      motion.current.litTarget = [0, 0, 0, 0, 0];
      kick();
    };
    root.addEventListener("pointerover", onOver);
    root.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(frame);
      sizer.disconnect();
      root.removeEventListener("pointerover", onOver);
      root.removeEventListener("pointerleave", onLeave);
      if (gl) {
        program && gl.deleteProgram(program);
        tile && gl.deleteTexture(tile);
      }
    };
  }, [count]);

  const showBusy = !open && busy !== null && busy !== undefined;

  return (
    <div
      ref={rootRef}
      className="glass-menu"
      data-open={open || undefined}
      data-fallback={fallback || undefined}
    >
      <canvas className="glass-menu__glass" ref={canvasRef} aria-hidden />

      <button
        type="button"
        className="glass-menu__key glass-menu__toggle"
        data-drop={0}
        aria-label={open ? "Close video options" : label}
        aria-expanded={open}
        title={open ? "Close" : label}
        onClick={() => toggle()}
      >
        {/* Three dots that draw together into a close mark. */}
        <svg viewBox="0 0 16 16" aria-hidden>
          <circle className="glass-menu__dot glass-menu__dot--a" cx="3.5" cy="8" r="1.25" />
          <circle className="glass-menu__dot glass-menu__dot--b" cx="8" cy="8" r="1.25" />
          <circle className="glass-menu__dot glass-menu__dot--c" cx="12.5" cy="8" r="1.25" />
          <path className="glass-menu__close" d="M4.5 4.5l7 7M11.5 4.5l-7 7" />
        </svg>
        {showBusy && (
          <svg className="glass-menu__busy" viewBox="0 0 36 36" aria-hidden style={{ "--progress": busy } as CSSProperties}>
            <circle cx="18" cy="18" r="16.5" pathLength={100} />
          </svg>
        )}
      </button>

      <div className="glass-menu__items" inert={!open || undefined} role="group" aria-label={label}>
        {items.map((item, i) => (
          <div
            className="glass-menu__slot"
            key={i}
            data-drop={i + 1}
            ref={(el) => {
              slotRefs.current[i] = el;
            }}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

type Motion = { open: boolean; at: number; from: number[]; count: number };

/** How far key `i` is out of the menu (0 tucked in, 1 in place) at `now`. Opening
 *  drops them top-first on a spring; closing draws them back bottom-first. */
function progressOf(m: Motion, i: number, now: number) {
  const from = m.from[i] ?? 0;
  if (m.open) {
    const local = (now - m.at - i * STAGGER_MS) / OPEN_MS;
    return from + (1 - from) * spring(local, 6.5);
  }
  const local = (now - m.at - Math.max(0, m.count - 1 - i) * STAGGER_MS * 0.6) / CLOSE_MS;
  return from * (1 - smootherstep(local));
}
