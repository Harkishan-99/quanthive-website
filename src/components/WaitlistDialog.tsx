import { useEffect, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import LiquidGlassPill from "./LiquidGlassPill";
import MemberCard from "./MemberCard";
import "./WaitlistDialog.css";

// The waitlist form, opened by the hero's "Join waitlist" key: a small dark card
// (3px corners) — Flash's logo top left, a close key top right, name, email,
// organisation and phone — on a dimmed, blurred page, with the submit key outside
// it, under it, in the same liquid glass as the key that opened it. Sends to
// /api/waitlist (server.ts → api/waitlist.ts), which stores and mails it.

type Phase = "idle" | "sending" | "sent";

// One form for the whole site (App.tsx mounts it): anything can open it —
// "Join waitlist" on Flash's hero, "Request demo" in the nav — from any page.
const OPEN_EVENT = "quanthive:waitlist";
export function openWaitlist() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}
/** Calls `onOpen` whenever something asks for the form. */
export function onWaitlistRequest(onOpen: () => void) {
  window.addEventListener(OPEN_EVENT, onOpen);
  return () => window.removeEventListener(OPEN_EVENT, onOpen);
}

export default function WaitlistDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [phase, setPhase] = useState<Phase>("idle");
  // In the page only while open or fading out (so its glass isn't drawing for
  // nobody); `shown` lags a frame behind opening so the fade-in has a start.
  const [mounted, setMounted] = useState(open);
  const [shown, setShown] = useState(false);
  const [error, setError] = useState("");
  // The name on the card the reader is handed once they're in.
  const [name, setName] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const firstRef = useRef<HTMLInputElement>(null);

  // Open: hold the page still, focus the first field; Escape closes.
  useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    const overflow = html.style.overflow;
    html.style.overflow = "hidden";
    const focus = window.setTimeout(() => firstRef.current?.focus({ preventScroll: true }), 120);
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      html.style.overflow = overflow;
      window.clearTimeout(focus);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      setMounted(true);
      const frame = requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
      return () => cancelAnimationFrame(frame);
    }
    // Closed: fade out, then leave the page and start fresh next time.
    setShown(false);
    const leave = window.setTimeout(() => {
      setMounted(false);
      setPhase("idle");
      setError("");
    }, 400);
    return () => window.clearTimeout(leave);
  }, [open]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (phase === "sending") return;
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
    setPhase("sending");
    setError("");
    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!response.ok || !result.ok) throw new Error(result.error || "Something went wrong — please try again.");
      setName(data.name ?? "");
      setPhase("sent");
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Something went wrong — please try again.");
      setPhase("idle");
    }
  };

  if (!mounted) return null;

  return createPortal(
    <div
      className="waitlist"
      data-open={shown || undefined}
      data-glass-ground
      data-lenis-prevent
      aria-hidden={!open}
      inert={!open}
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="waitlist__stack" data-sent={phase === "sent" || undefined} role="dialog" aria-modal="true" aria-labelledby="waitlist-title">
        {phase === "sent" ? (
          // In: their card, between a line of welcome and a note on the launch.
          <div className="waitlist__welcome" role="status">
            <button type="button" className="waitlist__close waitlist__close--corner" onClick={onClose} aria-label="Close">
              <svg viewBox="0 0 16 16" aria-hidden>
                <path d="M4 4l8 8M12 4l-8 8" />
              </svg>
            </button>
            <h2 id="waitlist-title" className="waitlist__welcome-title">
              Your seat at the front of the line.
            </h2>
            <MemberCard name={name} />
            <p className="waitlist__welcome-note">
              Flash launches in 8 weeks, and we can&apos;t wait to onboard you.
            </p>
          </div>
        ) : (
        <form ref={formRef} id="waitlist-form" className="waitlist__card" onSubmit={submit} noValidate={false}>
          <header className="waitlist__head">
            <img className="waitlist__logo" src="/images/figma-product/flash-logo-white.svg" alt="Flash" />
            <button type="button" className="waitlist__close" onClick={onClose} aria-label="Close">
              <svg viewBox="0 0 16 16" aria-hidden>
                <path d="M4 4l8 8M12 4l-8 8" />
              </svg>
            </button>
          </header>

            <>
              <h2 id="waitlist-title" className="waitlist__title">Join the waitlist</h2>
              <p className="waitlist__lede">Flash launches in 8 weeks. Leave your details for early access.</p>

              <div className="waitlist__fields">
                <label className="waitlist__field">
                  <span>Name</span>
                  <input ref={firstRef} name="name" type="text" autoComplete="name" required maxLength={120} />
                </label>
                <label className="waitlist__field">
                  <span>Email</span>
                  <input name="email" type="email" autoComplete="email" required maxLength={200} />
                </label>
                <label className="waitlist__field">
                  <span>Organisation</span>
                  <input name="organisation" type="text" autoComplete="organization" required maxLength={160} />
                </label>
                <label className="waitlist__field">
                  <span>Phone</span>
                  <input name="phone" type="tel" autoComplete="tel" inputMode="tel" required maxLength={24} pattern="[+()\-.\s\d]{6,24}" />
                </label>
                {/* Never shown; bots fill it in, and the server drops those. */}
                <input className="waitlist__trap" name="website" tabIndex={-1} autoComplete="off" aria-hidden />
              </div>

              <p className="waitlist__error" role="alert">
                {error}
              </p>
            </>
        </form>
        )}

        {/* The submit key, outside the card, under it. */}
        {phase === "sent" ? (
          <button type="button" className="waitlist__submit" onClick={onClose}>
            <LiquidGlassPill />
            <span className="waitlist__submit-label">Done</span>
          </button>
        ) : (
          <button type="submit" form="waitlist-form" className="waitlist__submit" disabled={phase === "sending"}>
            <LiquidGlassPill />
            <span className="waitlist__submit-label">{phase === "sending" ? "Sending…" : "Submit"}</span>
            <span className="waitlist__submit-disc" aria-hidden>
              <svg viewBox="0 0 32 32">
                <path d="M16 10V22M21.25 15.25L16 10L10.75 15.25" />
              </svg>
            </span>
          </button>
        )}
      </div>
    </div>,
    document.body,
  );
}
