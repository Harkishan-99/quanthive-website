import { useEffect, useRef } from "react";
import { maxDpr } from "../lib/perf";

// A portrait as a banknote engraving cut into a grid (the team page's boxes):
//
//   1. The photo, cropped square, becomes an engraving: wavy parallel lines whose
//      thickness follows the darkness of the photo, so shadows are solid ink and
//      lights thin to hairlines, with a little grit along the edges.
//   2. The square is cut into a grid. The cells over the face show the engraving;
//      cells round the edge drop out to the ground, unevenly, so the portrait
//      reads as a blocky silhouette; and a few cells — inside and just outside it —
//      are swapped for pastel gradient squares or squares of fine line-work.
//
// Each portrait's grid comes from its own seed, so every person's is different
// but the same on every visit. With no photo, the same treatment is applied to a
// soft placeholder shape.

const GROUND = "#f1f4f5";
const INK = "#0b0b0b";
const GRID = 8; // cells per side
const PASTELS: [string, string][] = [
  ["#d9d3f8", "#f6e5f1"], // lavender to pink
  ["#a9d6fb", "#f1f8ff"], // sky
  ["#bdf4dc", "#f4fbc6"], // mint to lime
  ["#c8c2f7", "#b6e0fb"], // violet to blue
];

/** A small deterministic random sequence (mulberry32). */
function random(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Lightness 0–1 of the photo (or placeholder) at every pixel of a size × size square. */
function lightness(image: HTMLImageElement | null, size: number) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, size, size);
  if (image) {
    // Cover, favouring the top of the frame, where faces are.
    const side = Math.min(image.naturalWidth, image.naturalHeight);
    const sx = (image.naturalWidth - side) / 2;
    const sy = Math.max(0, (image.naturalHeight - side) * 0.2);
    ctx.drawImage(image, sx, sy, side, side, 0, 0, size, size);
  } else {
    // A head-and-shoulders shape in soft shading.
    const g = ctx.createRadialGradient(size * 0.44, size * 0.36, size * 0.02, size * 0.5, size * 0.45, size * 0.34);
    g.addColorStop(0, "#d8d8d8");
    g.addColorStop(0.6, "#7a7a7a");
    g.addColorStop(1, "#262626");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(size * 0.5, size * 0.42, size * 0.2, size * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(size * 0.5, size * 1.02, size * 0.42, size * 0.32, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  const data = ctx.getImageData(0, 0, size, size).data;
  const out = new Float32Array(size * size);
  for (let i = 0; i < out.length; i++) {
    out[i] = (0.299 * data[i * 4]! + 0.587 * data[i * 4 + 1]! + 0.114 * data[i * 4 + 2]!) / 255;
  }
  // Tone it as an engraver would, from the face rather than the whole frame:
  // the face sets the black and white points (2nd and 98th percentiles), and a
  // gamma puts its median tone a little under mid-grey. So a darker
  // complexion or a dark backdrop still lands in the lines' mid-range, where the
  // forms read, instead of going to solid ink.
  const sample: number[] = [];
  const step = Math.max(1, Math.floor(size / 120));
  // The face: the upper middle of a head-and-shoulders crop.
  for (let y = Math.floor(size * 0.08); y < size * 0.55; y += step) {
    for (let x = Math.floor(size * 0.3); x < size * 0.7; x += step) sample.push(out[y * size + x]!);
  }
  sample.sort((a, b) => a - b);
  const at = (q: number) => sample[Math.min(sample.length - 1, Math.floor(q * sample.length))] ?? 0;
  const lo = at(0.02);
  const span = Math.max(at(0.98) - lo, 0.05);
  const median = Math.min(0.95, Math.max(0.05, (at(0.5) - lo) / span));
  const gamma = Math.min(1.6, Math.max(0.4, Math.log(0.46) / Math.log(median)));
  for (let i = 0; i < out.length; i++) {
    const l = Math.min(1, Math.max(0, (out[i]! - lo) / span));
    out[i] = Math.pow(l, gamma);
  }
  return out;
}

/** The engraving itself: wavy line-screen ink where the photo is dark. */
function engrave(light: Float32Array, size: number, seed: number) {
  const img = new ImageData(size, size);
  const px = img.data;
  const rand = random(seed * 7 + 1);
  const pitch = Math.max(3, size / 118); // line spacing: fine enough for a face to read
  const wave = size / 5; // wavelength of the lines' sway
  const sway = pitch * 0.9; // gentle, so the lines don't fight the features
  const tilt = (rand() - 0.5) * 0.3;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = y * size + x;
      const dark = 1 - light[i]!;
      // Lines run across, swaying, their phase bent a little by the image so they
      // follow the forms.
      const v = (y + tilt * x + sway * Math.sin((x / wave) * Math.PI * 2 + y / (wave * 1.7)) + dark * pitch * 0.45) / pitch;
      const d = Math.abs((v - Math.floor(v)) - 0.5) * 2; // 0 on a line's centre, 1 between
      const grit = (Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1;
      // Lights carry no ink at all; elsewhere a little grit roughens the edges.
      const width = dark < 0.06 ? 0 : Math.min(1, dark * 1.05) + Math.abs(grit) * 0.05 - 0.025;
      const ink = d < width ? 1 : 0;
      const o = i * 4;
      if (ink) {
        px[o] = px[o + 1] = px[o + 2] = 11;
        px[o + 3] = 255;
      }
    }
  }
  return img;
}

/** A square of fine line-work: a family of swaying curves, sometimes two crossing. */
function lineWork(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, rand: () => number, dpr: number) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, s, s);
  ctx.clip();
  ctx.strokeStyle = INK;
  ctx.lineWidth = Math.max(0.6, 0.9 * dpr);
  const families = rand() < 0.5 ? 2 : 1;
  for (let f = 0; f < families; f++) {
    const count = 9 + Math.floor(rand() * 6);
    const amp = s * (0.08 + rand() * 0.18);
    const freq = 0.8 + rand() * 1.2;
    const vertical = f === 1 ? true : rand() < 0.5;
    for (let k = 0; k <= count; k++) {
      const base = (k / count) * s;
      ctx.beginPath();
      for (let t = 0; t <= 24; t++) {
        const u = (t / 24) * s;
        const off = amp * Math.sin((u / s) * Math.PI * 2 * freq + k * 0.35) * (0.4 + 0.6 * (u / s));
        const px = vertical ? x + base + off : x + u;
        const py = vertical ? y + u : y + base + off;
        if (t === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
  }
  ctx.restore();
}

type Cell = "photo" | "ground" | "pastel" | "lines";

/** Which cells show what: the portrait runs from the top edge to the bottom —
 *  narrow over the head and widening to the shoulders, its sides stepped
 *  unevenly into the ground — with a few tiles round its edges, never over the
 *  face. */
function layout(seed: number) {
  const rand = random(seed);
  const cells: Cell[] = [];
  const edge: number[] = [];
  const c = (GRID - 1) / 2;
  for (let row = 0; row < GRID; row++) {
    const t = row / (GRID - 1);
    // Half-width of the silhouette in cells: the head's at the top, the
    // shoulders' near the foot.
    const half = 2.1 + 1.8 * (t * t * (3 - 2 * t));
    for (let col = 0; col < GRID; col++) {
      const off = Math.abs(col - c) - (half + (rand() - 0.5) * 0.8);
      cells.push(off < 0 ? "photo" : "ground");
      // Tiles only on the silhouette's edge, and never over the face (the
      // middle of the top five rows).
      const overFace = row < 5 && Math.abs(col - c) < 2.2;
      if (off > -1.2 && off < 1 && !overFace) edge.push(row * GRID + col);
    }
  }
  const tiles = 3 + Math.floor(rand() * 3);
  for (let n = 0; n < tiles && edge.length; n++) {
    const i = edge.splice(Math.floor(rand() * edge.length), 1)[0]!;
    const roll = rand();
    cells[i] = roll < 0.45 ? "pastel" : roll < 0.85 ? "lines" : cells[i] === "photo" ? "ground" : "lines";
  }
  return cells;
}

export default function EngravedPortrait({ src, seed, alt }: { src?: string; seed: number; alt: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let disposed = false;
    let image: HTMLImageElement | null = null;
    let drawnAt = 0;

    const draw = () => {
      const css = canvas.clientWidth;
      if (!css || disposed) return;
      const dpr = maxDpr();
      const size = Math.round(css * dpr);
      if (size === drawnAt) return;
      drawnAt = size;
      canvas.width = canvas.height = size;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = GROUND;
      ctx.fillRect(0, 0, size, size);

      const engraving = document.createElement("canvas");
      engraving.width = engraving.height = size;
      engraving.getContext("2d")!.putImageData(engrave(lightness(image, size), size, seed), 0, 0);

      const rand = random(seed * 13 + 5);
      const cell = size / GRID;
      layout(seed).forEach((kind, i) => {
        const x = Math.round((i % GRID) * cell);
        const y = Math.round(Math.floor(i / GRID) * cell);
        const s = Math.round(((i % GRID) + 1) * cell) - x;
        if (kind === "photo") ctx.drawImage(engraving, x, y, s, s, x, y, s, s);
        else if (kind === "pastel") {
          const [a, b] = PASTELS[Math.floor(rand() * PASTELS.length)]!;
          const g = ctx.createLinearGradient(x, y, x + s, y + s);
          g.addColorStop(0, a);
          g.addColorStop(1, b);
          ctx.fillStyle = g;
          ctx.fillRect(x, y, s, s);
        } else if (kind === "lines") lineWork(ctx, x, y, s, rand, dpr);
      });
    };

    const ro = new ResizeObserver(draw);
    ro.observe(canvas);
    if (src) {
      const img = new Image();
      img.decoding = "async";
      img.src = src;
      img
        .decode()
        .then(() => {
          image = img;
          drawnAt = 0;
          draw();
        })
        .catch(() => draw());
    } else draw();

    return () => {
      disposed = true;
      ro.disconnect();
    };
  }, [src, seed]);

  return <canvas ref={ref} className="engraved-portrait" role="img" aria-label={alt} />;
}
