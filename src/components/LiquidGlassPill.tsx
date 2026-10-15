import { useEffect, useRef } from "react";
import { TILE_H, TILE_SRC, TILE_W } from "./VideoPromptGlass";

// Liquid glass for a pill-shaped key on Flash's dark hero: a small WebGL canvas
// filling the key that draws the hero's own ground (#050505 and its faint
// lattice) as seen through a clear, thick lens. No frost: the lattice stays sharp
// and is only bent — magnified a touch across the face, pulled hard round the
// rounded ends where the glass curves away — with a bright rim along the edge, a
// soft caustic at the foot and a sheen that follows the pointer (a little
// brighter while the pointer is over it).
//
// The lattice is laid out as the hero lays it (.hero--flash .hero__grid: the tile
// centred on the hero's box), so what shows through lines up with what's around
// (or, on a [data-glass-ground] element, centred on that).
//
// It is also lit by the hero's light rays (.hero__ray): where a beam falls on the
// key, the edge facing it — the top, and the side toward the ray's source —
// catches the light and brightens, the far edge only faintly (light carried
// through the glass), and the light fades again as the beam swings away.

const VERT = `#version 300 es
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

const FRAG = `#version 300 es
precision highp float;
out vec4 outColor;
uniform vec2 u_res;        // canvas, device px
uniform float u_dpr;
uniform vec2 u_size;       // the pill, CSS px
uniform vec2 u_origin;     // the pill's top-left within the hero
uniform vec2 u_hero;       // the hero's size (the lattice is centred on it)
uniform sampler2D u_tile;
uniform vec2 u_tile_size;
uniform float u_ground;
uniform float u_ink;
uniform vec2 u_light;      // sheen centre, 0–1 across the pill
uniform float u_hover;     // 0–1
uniform vec3 u_ray;        // light falling from the rays: direction of travel (xy), strength (z)

// A capsule (the pill), signed distance, centred.
float pill(vec2 p, vec2 hs) {
  float r = hs.y;
  vec2 q = abs(p) - vec2(hs.x - r, 0.0);
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

float ground(vec2 p) {
  vec2 q = p + u_origin;
  vec2 uv = (q - (u_hero - u_tile_size) * 0.5) / u_tile_size;
  return u_ground + u_ink * texture(u_tile, uv).a;
}

float safeAsin(float v) { return asin(clamp(v, -1.0, 1.0)); }

// How far a ray bends crossing a curved edge of the given depth.
float edgeBend(float depth, float thickness, float ior) {
  if (depth >= thickness) return 0.0;
  float edgeRatio = 1.0 - depth / thickness;
  float ti = safeAsin(edgeRatio * edgeRatio);
  float tt = safeAsin(sin(ti) / ior);
  return -tan(tt - ti);
}

void main() {
  vec2 frag = vec2(gl_FragCoord.x, u_res.y - gl_FragCoord.y) / u_dpr;
  vec2 hs = u_size * 0.5;
  vec2 p = frag - hs;
  float d = pill(p, hs);
  if (d > 1.0) discard;

  vec2 e = vec2(0.5, 0.0);
  vec2 n = normalize(vec2(pill(p + e.xy, hs) - pill(p - e.xy, hs),
                          pill(p + e.yx, hs) - pill(p - e.yx, hs)) + 1e-4);
  float r = hs.y;
  float bend = edgeBend(-d, r * 0.75, 1.5);
  // A slight lens across the face, and the strong pull at the edge.
  vec2 lens = -p * 0.08;
  vec2 offset = lens - n * bend * r * 1.3;
  // A whisper of dispersion at the edge.
  vec3 col = vec3(ground(frag + offset * 1.04), ground(frag + offset), ground(frag + offset * 0.96));

  // Clear glass: barely tinted, a little lift where it's thickest at the ends.
  col += 0.018 + abs(bend) * 0.06;
  // Caustic: light gathered along the foot, as through a rod of glass.
  float t = clamp((p.y + hs.y) / u_size.y, 0.0, 1.0);
  col += smoothstep(0.55, 1.0, t) * (1.0 - smoothstep(0.0, 6.0, -d)) * 0.10;
  // The rim: a little light from above at rest (top over bottom), and where a
  // ray falls, the edge facing it catches it strongly, the far edge faintly.
  float rim = 1.0 - smoothstep(0.0, 1.3, abs(d + 0.6));
  vec2 toLight = -normalize(u_ray.xy + vec2(0.0, 1e-4));
  float facing = max(dot(n, toLight), 0.0);
  float away = max(-dot(n, toLight), 0.0);
  col += rim * mix(0.34, 0.1, t);
  col += rim * u_ray.z * (pow(facing, 1.5) * 0.75 + away * 0.12);
  // The lit edge's glow spills a little into the glass behind it.
  float spill = 1.0 - smoothstep(0.0, 5.0, -d);
  col += spill * u_ray.z * pow(facing, 2.0) * 0.07;
  // A fainter inner line just inside it, where the edge curves away.
  float inner = 1.0 - smoothstep(0.0, 1.6, abs(d + 3.2));
  col += inner * 0.05 * (1.0 - t);
  // The sheen following the pointer, a little brighter while it's over.
  vec2 lp = (u_light - 0.5) * u_size;
  float sheen = exp(-dot(p - lp, p - lp) / (r * r * 3.0));
  col += sheen * (0.05 + 0.05 * u_hover);

  float alpha = clamp(0.5 - d * u_dpr, 0.0, 1.0);
  outColor = vec4(clamp(col, 0.0, 1.0), alpha);
}`;

function compile(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn("[liquid-glass-pill] shader error:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

/** The glass layer: place it as the first child of the key (Hero.css sizes it).
 *  On a key without WebGL2 it sets `data-glass="off"` on the key, and the CSS
 *  draws a plain clear pill instead. */
export default function LiquidGlassPill({ ground = 5 / 255, ink = 0.032 }: { ground?: number; ink?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const key = canvas?.parentElement;
    // The ground it sits on: an element marked data-glass-ground (the waitlist
    // dialog), or the hero.
    const hero = canvas?.closest<HTMLElement>("[data-glass-ground]") ?? canvas?.closest<HTMLElement>(".hero");
    if (!canvas || !key || !hero) return;

    const gl = canvas.getContext("webgl2", { alpha: true, premultipliedAlpha: false });
    let program: WebGLProgram | null = null;
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
      key.dataset.glass = "off";
      return;
    }

    const uni: Record<string, WebGLUniformLocation | null> = {};
    for (const name of ["u_res", "u_dpr", "u_size", "u_origin", "u_hero", "u_tile", "u_tile_size", "u_ground", "u_ink", "u_light", "u_hover", "u_ray"]) {
      uni[name] = gl.getUniformLocation(program, name);
    }
    gl.useProgram(program);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const tile = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tile);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));
    const image = new Image();
    image.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, tile);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    };
    image.src = TILE_SRC;

    // The pointer: the sheen eases toward it, and brightens while over.
    const light = { x: 0.3, y: 0, tx: 0.3, ty: 0, hover: 0, over: false };
    const onMove = (event: PointerEvent) => {
      const box = key.getBoundingClientRect();
      light.tx = (event.clientX - box.left) / box.width;
      light.ty = (event.clientY - box.top) / box.height;
      light.over = true;
    };
    const onLeave = () => {
      light.over = false;
      light.tx = 0.3;
      light.ty = 0;
    };
    key.addEventListener("pointermove", onMove);
    key.addEventListener("pointerleave", onLeave);

    // The rays: each hangs from a point on the hero's top edge (its CSS `left`) and
    // is turned by --ray-a (Hero.tsx). A beam spreads 2 × --ray-half (Hero.css;
    // narrower on phones), brightest down its middle; how much of it falls on the
    // key depends on how far off its axis the key sits.
    const rays = Array.from(hero.querySelectorAll<HTMLElement>(".hero__ray"));
    const rayLight = (cx: number, cy: number, hb: DOMRect) => {
      let strength = 0;
      let dx = 0;
      let dy = 1;
      for (const ray of rays) {
        const style = getComputedStyle(ray);
        const opacity = parseFloat(style.opacity) || 0;
        if (opacity <= 0.01) continue;
        const half = parseFloat(style.getPropertyValue("--ray-half")) || 16;
        const BEAM_SIGMA = ((half * 0.56) * Math.PI) / 180;
        const angle = (parseFloat(ray.style.getPropertyValue("--ray-a")) || 0) * (Math.PI / 180);
        const ax = hb.left + ray.offsetLeft;
        const ay = hb.top;
        // The beam's axis: straight down, turned by the angle.
        const bx = -Math.sin(angle);
        const by = Math.cos(angle);
        const vx = cx - ax;
        const vy = cy - ay;
        const len = Math.hypot(vx, vy) || 1;
        const off = Math.acos(Math.max(-1, Math.min(1, (vx * bx + vy * by) / len)));
        const s = opacity * Math.exp(-(off * off) / (2 * BEAM_SIGMA * BEAM_SIGMA));
        if (s > strength) {
          strength = s;
          dx = vx / len;
          dy = vy / len;
        }
      }
      return { dx, dy, strength };
    };
    const lit = { x: 0, y: 1, s: 0 };

    let raf = 0;
    let visible = true;
    const frame = () => {
      raf = 0;
      if (!visible) return;
      // Measured every frame: the key rises in and scales on hover, and the
      // lattice under it has to stay put while it does.
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (w && h) {
        const cw = Math.round(w * dpr);
        const ch = Math.round(h * dpr);
        if (canvas.width !== cw || canvas.height !== ch) {
          canvas.width = cw;
          canvas.height = ch;
        }
        const c = canvas.getBoundingClientRect();
        const hb = hero.getBoundingClientRect();
        light.x += (light.tx - light.x) * 0.12;
        light.y += (light.ty - light.y) * 0.12;
        light.hover += ((light.over ? 1 : 0) - light.hover) * 0.1;
        gl.viewport(0, 0, cw, ch);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform2f(uni.u_res!, cw, ch);
        gl.uniform1f(uni.u_dpr!, dpr);
        gl.uniform2f(uni.u_size!, w, h);
        // The canvas may be scaled (hover, entrance); map back to its own px.
        const k = w / (c.width || w);
        gl.uniform2f(uni.u_origin!, (c.left - hb.left) * k, (c.top - hb.top) * k);
        gl.uniform2f(uni.u_hero!, hb.width * k, hb.height * k);
        gl.uniform1i(uni.u_tile!, 0);
        gl.uniform2f(uni.u_tile_size!, TILE_W, TILE_H);
        gl.uniform1f(uni.u_ground!, ground);
        gl.uniform1f(uni.u_ink!, ink);
        gl.uniform2f(uni.u_light!, light.x, light.y);
        gl.uniform1f(uni.u_hover!, light.hover);
        const ray = rayLight(c.left + c.width / 2, c.top + c.height / 2, hb);
        lit.x += (ray.dx - lit.x) * 0.2;
        lit.y += (ray.dy - lit.y) * 0.2;
        lit.s += (ray.strength - lit.s) * 0.15;
        gl.uniform3f(uni.u_ray!, lit.x, lit.y, lit.s);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      }
      raf = requestAnimationFrame(frame);
    };
    const io = new IntersectionObserver(([entry]) => {
      visible = !!entry?.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(frame);
    });
    io.observe(key);
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      key.removeEventListener("pointermove", onMove);
      key.removeEventListener("pointerleave", onLeave);
      gl.deleteTexture(tile);
      gl.deleteProgram(program);
    };
  }, [ground, ink]);

  return <canvas ref={canvasRef} className="liquid-glass-pill" aria-hidden />;
}
