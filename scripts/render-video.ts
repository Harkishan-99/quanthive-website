// Renders the About section's video panel (VideoPromptGlass) to a QuickTime .mov
// (H.264). Every frame poses the shot at an exact time through the page's
// ?render hook and is captured, so the file is smooth whatever the machine's
// speed. Frames are split across a few browser tabs and captured in parallel,
// then encoded with ffmpeg.
//
// Used by the server (the panel's download button, /api/video/render) and from
// the command line:
//
//   bun run dev            # in one terminal (the site on :4173)
//   bun run render-video   # writes src/assets/videos/quanthive-flash.mov
//
// Options: --fps 60, --scale 2 (device pixel ratio), --workers 4,
//          --url http://localhost:4173

import { chromium, type Page } from "playwright";
import { mkdtemp, readdir, rename, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const ROOT = join(import.meta.dir, "..");
export const VIDEO_FILE = join(ROOT, "src/assets/videos/quanthive-flash.mov");

// What the video is made from: if none of these has changed since the last
// render, that render is still current.
const SOURCES = [
  "src/components/VideoPromptGlass.tsx",
  "src/components/VideoPromptGlass.css",
  "src/components/About.css",
  "src/components/Capabilities.css",
  "src/assets/images/video-shot",
  "src/assets/images/landing-pattern-mask.png",
];

async function newestSource() {
  let newest = 0;
  for (const source of SOURCES) {
    const path = join(ROOT, source);
    const info = await stat(path).catch(() => null);
    if (!info) continue;
    if (info.isDirectory()) {
      for (const name of await readdir(path)) {
        const child = await stat(join(path, name));
        newest = Math.max(newest, child.mtimeMs);
      }
    } else {
      newest = Math.max(newest, info.mtimeMs);
    }
  }
  return newest;
}

/** Whether the rendered file exists and is newer than everything it's made from. */
export async function videoIsFresh() {
  const video = await stat(VIDEO_FILE).catch(() => null);
  return !!video && video.mtimeMs > (await newestSource());
}

type Shot = { length: number; renderAt: (ms: number) => void };

export type RenderOptions = {
  baseUrl: string;
  fps?: number;
  scale?: number;
  workers?: number;
  /** 0–1: capturing is the first 90%, encoding the last 10%. */
  onProgress?: (progress: number) => void;
};

/** Opens the site in render mode with the panel in view, ready to pose frames. */
async function openShot(page: Page, baseUrl: string) {
  await page.goto(`${baseUrl}/?render`, { waitUntil: "networkidle" });
  await page.evaluate(() => {
    const el = document.querySelector(".about__video")!;
    window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - (window.innerHeight - el.clientHeight) / 2);
  });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => "__flashShot" in window);
  // Let the section's reveal finish and the lattice tile load.
  await page.waitForTimeout(2200);
  // Where the panel sits on the page (not the viewport): that's what Chrome's
  // screenshot clip measures from.
  const box = await page.evaluate(() => {
    const r = document.querySelector(".about__video")!.getBoundingClientRect();
    return { x: r.left + window.scrollX, y: r.top + window.scrollY, width: r.width, height: r.height };
  });
  const length = await page.evaluate(() => (window as unknown as { __flashShot: Shot }).__flashShot.length);
  return { box, length };
}

export async function renderVideo({ baseUrl, fps = 60, scale = 2, workers = 4, onProgress }: RenderOptions) {
  const frameDir = await mkdtemp(join(tmpdir(), "quanthive-render-"));
  const partial = VIDEO_FILE.replace(/\.mov$/, ".partial.mov");
  // On the GPU (Metal on a Mac): software WebGL is many times slower.
  const browser = await chromium.launch({ args: ["--use-angle=metal", "--ignore-gpu-blocklist", "--enable-gpu-rasterization"] });
  try {
    // A 1920px-wide desktop: the panel is 10×7 cells (~696 × 487), drawn at
    // `scale`× pixels (the fast capture path needs the clip scaled to match).
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: scale });
    const pages = await Promise.all(Array.from({ length: workers }, () => context.newPage()));
    const shots = await Promise.all(pages.map((page) => openShot(page, baseUrl)));
    const { length } = shots[0]!;
    const frames = Math.ceil((length / 1000) * fps);
    let captured = 0;
    onProgress?.(0);

    // Each tab takes every `workers`-th frame, captured through Chrome's fast
    // screenshot path straight to a numbered JPEG.
    await Promise.all(
      pages.map(async (page, worker) => {
        const { box } = shots[worker]!;
        const clip = { x: Math.round(box.x), y: Math.round(box.y), width: Math.round(box.width), height: Math.round(box.height), scale };
        const cdp = await context.newCDPSession(page);
        for (let frame = worker; frame < frames; frame += workers) {
          await page.evaluate((at) => (window as unknown as { __flashShot: Shot }).__flashShot.renderAt(at), (frame * 1000) / fps);
          const { data } = await cdp.send("Page.captureScreenshot", { format: "jpeg", quality: 95, clip, optimizeForSpeed: true });
          await Bun.write(join(frameDir, `f${String(frame).padStart(5, "0")}.jpg`), Buffer.from(data, "base64"));
          captured++;
          onProgress?.((captured / frames) * 0.9);
        }
      }),
    );
    await browser.close();

    const ffmpeg = Bun.spawn(
      [
        "ffmpeg", "-y", "-loglevel", "error", "-progress", "pipe:1", "-nostats",
        "-framerate", String(fps), "-i", join(frameDir, "f%05d.jpg"),
        // Even sides, and video-range colour (the JPEG frames are full-range).
        "-vf", "scale=trunc(iw/2)*2:trunc(ih/2)*2:out_range=tv,format=yuv420p",
        "-c:v", "libx264", "-preset", "medium", "-crf", "16", "-pix_fmt", "yuv420p", "-tag:v", "avc1",
        "-movflags", "+faststart",
        partial,
      ],
      { stdout: "pipe", stderr: "inherit" },
    );
    // ffmpeg reports how far it has encoded; that is the last 10%.
    const totalUs = (frames / fps) * 1e6;
    const decoder = new TextDecoder();
    const reader = ffmpeg.stdout.getReader();
    for (let read = await reader.read(); !read.done; read = await reader.read()) {
      const times = [...decoder.decode(read.value).matchAll(/out_time_us=(\d+)/g)];
      const last = times[times.length - 1];
      if (last) onProgress?.(0.9 + 0.1 * Math.min(1, Number(last[1]) / totalUs));
    }
    const code = await ffmpeg.exited;
    if (code !== 0) throw new Error(`ffmpeg exited with ${code}`);
    // Swapped in whole: the file is only playable once finished, so the site
    // must never serve one mid-render.
    await rename(partial, VIDEO_FILE);
    onProgress?.(1);
    return { frames, file: VIDEO_FILE };
  } finally {
    await browser.close().catch(() => {});
    await rm(frameDir, { recursive: true, force: true });
    await rm(partial, { force: true });
  }
}

if (import.meta.main) {
  const arg = (name: string, fallback: string) => {
    const i = Bun.argv.indexOf(`--${name}`);
    return i > 0 && Bun.argv[i + 1] ? Bun.argv[i + 1]! : fallback;
  };
  const started = performance.now();
  let shown = -1;
  const { frames, file } = await renderVideo({
    baseUrl: arg("url", `http://localhost:${process.env.PORT ?? 4173}`),
    fps: Number(arg("fps", "60")),
    scale: Number(arg("scale", "2")),
    workers: Number(arg("workers", "4")),
    onProgress: (progress) => {
      const percent = Math.floor(progress * 100);
      if (percent === shown || percent % 5) return;
      shown = percent;
      console.log(`  ${percent}%  (${((performance.now() - started) / 1000).toFixed(0)}s)`);
    },
  });
  console.log(`Wrote ${frames} frames to ${file} in ${((performance.now() - started) / 1000).toFixed(0)}s`);
}
