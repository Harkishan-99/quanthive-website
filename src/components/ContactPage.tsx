import { useState, type FormEvent } from "react";
import "./ContactPage.css";

// The Contact page (frame 24:4211): the invitation and a three-line form on the
// left — underlined fields with small italic labels, an outlined button — and a
// map on the right, in greys. The form posts to /api/contact (api/contact.ts),
// which mails the message to the team.

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
    <main className="contact-page" aria-labelledby="contact-title">
      <div className="contact-page__inner">
        <section className="contact-page__form-col">
          <h1 id="contact-title" className="contact-page__title">
            Don&apos;t hesitate to contact us! We&apos;d love<br className="contact-page__br" /> to meet you!
          </h1>

          <form className="contact-form" onSubmit={send}>
            <label className="contact-form__field">
              <span>your name</span>
              <input name="name" type="text" autoComplete="name" maxLength={120} required />
            </label>
            <label className="contact-form__field">
              <span>your mail</span>
              <input name="email" type="email" autoComplete="email" maxLength={200} required />
            </label>
            <label className="contact-form__field">
              <span>your message</span>
              <textarea name="message" rows={1} maxLength={4000} required />
            </label>
            {/* Hidden from people; bots fill it in (api/contact.ts drops those). */}
            <input className="contact-form__trap" name="website" tabIndex={-1} autoComplete="off" aria-hidden />

            <div className="contact-form__foot">
              <button type="submit" className="contact-form__send" disabled={sending}>
                {sending ? "sending…" : "send us a message"}
              </button>
              <p className="contact-form__status" role="status" aria-live="polite">
                {status.state === "sent" && "Thanks — we'll be in touch soon."}
                {status.state === "error" && status.message}
              </p>
            </div>
          </form>
        </section>

        <div className="contact-page__map">
          <iframe
            title={`Map: ${MAP_PLACE}`}
            src={MAP_SRC}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      </div>
    </main>
  );
}
