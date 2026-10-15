import { useState, type FormEvent } from "react";
import { LOREM_LONG, PageHead } from "./AboutPage";
import "./AboutPage.css";
import "./ContactPage.css";

// The Contact page (frame 24:4211), on the About page's column: its head and
// copy, then a four-line form (hairline fields, a black send key) beside a square
// map in greys, and a closing rule broken by a small grey motif. The form posts to
// /api/contact (api/contact.ts), which mails the message to the team.

// Where the map points. A place name or full street address both work.
const MAP_PLACE = "India";
const MAP_ZOOM = 4;
const MAP_SRC = `https://maps.google.com/maps?q=${encodeURIComponent(MAP_PLACE)}&z=${MAP_ZOOM}&output=embed`;

type Status = { state: "idle" | "sending" | "sent" } | { state: "error"; message: string };

export default function ContactPage() {
  const [status, setStatus] = useState<Status>({ state: "idle" });

  const send = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    setStatus({ state: "sending" });
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!response.ok || !result.ok) throw new Error(result.error || "Something went wrong — please try again.");
      form.reset();
      setStatus({ state: "sent" });
    } catch (error) {
      setStatus({ state: "error", message: error instanceof Error ? error.message : String(error) });
    }
  };

  const sending = status.state === "sending";

  return (
    <main className="about-page" aria-labelledby="contact-page-title">
      <article className="about-page__column">
        <PageHead id="contact-page-title">
          <span className="about-page__pp">Co</span>
          <span className="about-page__bg">n</span>
          <span className="about-page__pg">t</span>
          <span className="about-page__pp">ac</span>
          <span className="about-page__pg">t</span>
        </PageHead>

        <div className="about-page__copy">
          <p>{LOREM_LONG}</p>
        </div>

        <div className="contact-page__body">
          <form className="contact-form" onSubmit={send}>
            <input name="name" type="text" placeholder="Name" aria-label="Name" autoComplete="name" maxLength={120} required />
            <input name="email" type="email" placeholder="Email" aria-label="Email" autoComplete="email" maxLength={200} required />
            <input name="organisation" type="text" placeholder="Organisation" aria-label="Organisation" autoComplete="organization" maxLength={160} />
            <textarea name="message" placeholder="Message" aria-label="Message" rows={1} maxLength={4000} required />
            {/* Hidden from people; bots fill it in (api/contact.ts drops those). */}
            <input className="contact-form__trap" name="website" tabIndex={-1} autoComplete="off" aria-hidden />

            <button type="submit" className="contact-form__send" disabled={sending}>
              {sending ? "Sending…" : "Send message"}
            </button>
            <p className="contact-form__status" role="status" aria-live="polite">
              {status.state === "sent" && "Thanks — we'll be in touch soon."}
              {status.state === "error" && status.message}
            </p>
          </form>

          <div className="contact-page__map">
            <iframe title={`Map: ${MAP_PLACE}`} src={MAP_SRC} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
          </div>
        </div>

        <div className="contact-page__end" aria-hidden>
          <span />
          <i />
          <span />
        </div>
      </article>
    </main>
  );
}
