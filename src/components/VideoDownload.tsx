import { useEffect, useRef, useState, type CSSProperties } from "react";

// The video panel's download key. A click asks the server to render the shot
// (scripts/render-video.ts, via /api/video/render) — or reuse the last render
// if nothing has changed — shows its progress as a ring round the key, and
// downloads the .mov once it's ready.

const RENDER_API = "/api/video/render";
const VIDEO_URL = "/videos/quanthive-flash.mov";
const FILE_NAME = "QuantHive-Flash.mov";
const POLL_MS = 400;

type Job = { state: "idle" | "rendering" | "done" | "error"; progress: number };
type Phase = "idle" | "rendering" | "done" | "error";

export default function VideoDownload({
  onProgress,
}: {
  /** The render's progress (0–1) while it runs, then null. */
  onProgress?: (progress: number | null) => void;
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const onProgressRef = useRef(onProgress);
  onProgressRef.current = onProgress;
  useEffect(() => {
    onProgressRef.current?.(phase === "rendering" ? progress : null);
  }, [phase, progress]);
  const alive = useRef(true);
  useEffect(
    () => () => {
      alive.current = false;
    },
    [],
  );

  const download = () => {
    const link = document.createElement("a");
    // A fresh query each time, so the browser never hands back an older render.
    link.href = `${VIDEO_URL}?v=${Date.now()}`;
    link.download = FILE_NAME;
    document.body.append(link);
    link.click();
    link.remove();
  };

  const settleTo = (next: Phase, after: number) => {
    setPhase(next);
    window.setTimeout(() => alive.current && setPhase("idle"), after);
  };

  const start = async () => {
    if (phase === "rendering") return;
    setPhase("rendering");
    setProgress(0);
    try {
      let job: Job = await (await fetch(RENDER_API, { method: "POST" })).json();
      while (job.state === "rendering" && alive.current) {
        setProgress(job.progress);
        await new Promise((resolve) => window.setTimeout(resolve, POLL_MS));
        job = await (await fetch(RENDER_API)).json();
      }
      if (!alive.current) return;
      if (job.state !== "done") throw new Error("render failed");
      setProgress(1);
      download();
      settleTo("done", 1600);
    } catch {
      if (alive.current) settleTo("error", 2400);
    }
  };

  const percent = Math.round(progress * 100);
  const label =
    phase === "rendering" ? `Rendering video, ${percent}%`
    : phase === "done" ? "Video downloaded"
    : phase === "error" ? "Couldn't render the video — try again"
    : "Download this video (MOV)";

  return (
    <button
      type="button"
      className="video-tool video-download"
      data-phase={phase}
      data-starting={(phase === "rendering" && progress === 0) || undefined}
      style={{ "--progress": progress } as CSSProperties}
      onClick={start}
      aria-label={label}
      title={label}
    >
      {/* The ring: a faint track, the orange arc of the render's progress. */}
      <svg className="video-download__ring" viewBox="0 0 36 36" aria-hidden>
        <circle className="video-download__track" cx="18" cy="18" r="16.5" />
        <circle className="video-download__arc" cx="18" cy="18" r="16.5" pathLength={100} />
      </svg>
      <svg className="video-download__icon video-download__icon--arrow" viewBox="0 0 16 16" aria-hidden>
        <path d="M8 2.5v8M4.5 7 8 10.5 11.5 7M3 13.5h10" />
      </svg>
      <svg className="video-download__icon video-download__icon--done" viewBox="0 0 16 16" aria-hidden>
        <path d="M3.5 8.5 6.5 11.5 12.5 5" />
      </svg>
      <svg className="video-download__icon video-download__icon--error" viewBox="0 0 16 16" aria-hidden>
        <path d="M8 4v5M8 11.6v.4" />
      </svg>
      <span className="video-download__percent" aria-hidden>
        {percent}
      </span>
      <span className="video-download__live" aria-live="polite">
        {phase === "rendering" ? "" : phase === "idle" ? "" : label}
      </span>
    </button>
  );
}
