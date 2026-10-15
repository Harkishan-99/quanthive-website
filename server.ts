import { join, normalize } from "node:path";
import index from "./index.html";
import { rateLimited, submit, validate } from "./api/waitlist.ts";

const ICON_DIR = join(import.meta.dir, "src/assets/icons");
const IMAGE_DIR = join(import.meta.dir, "src/assets/images");
const FIGMA_SOLUTION_IMAGE_DIR = join(IMAGE_DIR, "figma-solution");
const FIGMA_PRODUCT_IMAGE_DIR = join(IMAGE_DIR, "figma-product");
const FIGMA_CAPABILITIES_IMAGE_DIR = join(IMAGE_DIR, "figma-capabilities");
const VIDEO_SHOT_IMAGE_DIR = join(IMAGE_DIR, "video-shot");
const VIDEO_DIR = join(import.meta.dir, "src/assets/videos");

// The video panel's download: rendered on demand (scripts/render-video.ts) and
// reused while nothing it's made from has changed. Kept on globalThis so a hot
// reload doesn't lose a render in progress.
type VideoJob = { state: "idle" | "rendering" | "done" | "error"; progress: number; error?: string };
const videoJob: VideoJob = ((globalThis as { __videoJob?: VideoJob }).__videoJob ??= {
  state: "idle",
  progress: 0,
});

async function startVideoRender(): Promise<VideoJob> {
  if (videoJob.state === "rendering") return videoJob;
  const { renderVideo, videoIsFresh } = await import("./scripts/render-video.ts");
  if (await videoIsFresh()) return Object.assign(videoJob, { state: "done", progress: 1, error: undefined });
  Object.assign(videoJob, { state: "rendering", progress: 0, error: undefined });
  renderVideo({
    baseUrl: `http://localhost:${server.port}`,
    onProgress: (progress) => (videoJob.progress = progress),
  })
    .then(() => Object.assign(videoJob, { state: "done", progress: 1 }))
    .catch((error) => {
      console.error("[video] render failed:", error);
      Object.assign(videoJob, { state: "error", error: String(error) });
    });
  return videoJob;
}

const safeName = (name: string) =>
  normalize(name).replace(/^(\.\.(\/|\\|$))+/, "");

const server = Bun.serve({
  port: Number(process.env.PORT ?? 4173),
  routes: {
    "/": index,
    "/showcase": index, // the demo alone, full screen (App renders Showcase)
    "/icons/:file": (req) =>
      new Response(Bun.file(join(ICON_DIR, safeName(req.params.file)))),
    "/images/figma-solution/:file": (req) =>
      new Response(Bun.file(join(FIGMA_SOLUTION_IMAGE_DIR, safeName(req.params.file)))),
    "/images/figma-product/:file": (req) =>
      new Response(Bun.file(join(FIGMA_PRODUCT_IMAGE_DIR, safeName(req.params.file)))),
    "/images/figma-capabilities/:file": (req) =>
      new Response(Bun.file(join(FIGMA_CAPABILITIES_IMAGE_DIR, safeName(req.params.file)))),
    "/api/video/render": {
      GET: () => Response.json(videoJob),
      POST: async () => Response.json(await startVideoRender()),
    },
    // Flash waitlist sign-ups: stored, then mailed over SMTP (api/waitlist.ts).
    "/api/waitlist": {
      POST: async (req, srv) => {
        const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || srv.requestIP(req)?.address || "unknown";
        if (rateLimited(ip)) return Response.json({ ok: false, error: "Too many tries — please wait a few minutes." }, { status: 429 });
        const body = await req.json().catch(() => null);
        // A field people never see; bots fill it in.
        if (body && typeof body === "object" && (body as { website?: unknown }).website) return Response.json({ ok: true });
        const result = validate(body);
        if ("error" in result) return Response.json({ ok: false, error: result.error }, { status: 400 });
        try {
          const { mailed } = await submit(result.signup, { ip, ua: req.headers.get("user-agent") ?? "" });
          return Response.json({ ok: true, mailed });
        } catch (error) {
          console.error("[waitlist] could not store sign-up:", error);
          return Response.json({ ok: false, error: "Something went wrong — please try again." }, { status: 500 });
        }
      },
    },
    "/videos/:file": (req) =>
      new Response(Bun.file(join(VIDEO_DIR, safeName(req.params.file)))),
    "/images/video-shot/:file": (req) =>
      new Response(Bun.file(join(VIDEO_SHOT_IMAGE_DIR, safeName(req.params.file)))),
    "/images/:file": (req) =>
      new Response(Bun.file(join(IMAGE_DIR, safeName(req.params.file)))),
    // News about the followed companies, proxied so the GNews key stays
    // server-side (set GNEWS_API_KEY in .env). Returns raw GNews articles.
    "/api/company-news": async (req) => {
      const key = process.env.GNEWS_API_KEY;
      const u = new URL(req.url);
      const q = u.searchParams.get("q") ?? "";
      const max = u.searchParams.get("max") ?? "4";
      if (!key || !q) return Response.json({ articles: [] });
      try {
        const gurl =
          `https://gnews.io/api/v4/search?q=${encodeURIComponent(q)}` +
          `&lang=en&max=${max}&sortby=publishedAt&apikey=${key}`;
        const r = await fetch(gurl);
        if (!r.ok) throw new Error(`GNews ${r.status}`);
        const data = await r.json();
        return Response.json(
          { articles: data.articles ?? [] },
          { headers: { "cache-control": "public, max-age=300" } },
        );
      } catch (e) {
        console.warn("[news] proxy failed:", e);
        return Response.json({ articles: [] });
      }
    },
  },
  // Hot reload and browser-console forwarding in development only; with
  // NODE_ENV=production Bun serves the bundled, minified site.
  development: process.env.NODE_ENV === "production" ? false : { hmr: true, console: true },
});

console.log(`Flash running at ${server.url}`);
