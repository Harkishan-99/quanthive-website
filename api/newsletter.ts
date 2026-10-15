import { appendFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { DATA_DIR, EMAIL_RE, mailer, oneLine, rateLimited } from "./waitlist.js"; // .js: how Node on Vercel finds the compiled file; Bun and TypeScript map it to .ts

// The blog's newsletter sign-up: POST /api/newsletter (server.ts; on Vercel this
// file is the function). An address is stored in data/newsletter.jsonl where the
// disk allows it and mailed to NEWSLETTER_TO (default: WAITLIST_TO, then
// mail@quanthive.in) over the waitlist's SMTP settings.

const LOG_FILE = join(DATA_DIR, "newsletter.jsonl");
const TO = process.env.NEWSLETTER_TO || process.env.WAITLIST_TO || "mail@quanthive.in";

export async function handleNewsletter(req: Request, fallbackIp = "unknown") {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || fallbackIp;
  if (rateLimited(ip)) return Response.json({ ok: false, error: "Too many tries — please wait a few minutes." }, { status: 429 });
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  // A field people never see; bots fill it in.
  if (body?.website) return Response.json({ ok: true });
  const email = typeof body?.email === "string" ? body.email.trim().slice(0, 200) : "";
  if (!EMAIL_RE.test(email)) return Response.json({ ok: false, error: "Please add a valid email." }, { status: 400 });

  const at = new Date().toISOString();
  let stored = false;
  try {
    await mkdir(DATA_DIR, { recursive: true });
    await appendFile(LOG_FILE, JSON.stringify({ email, at, ip }) + "\n");
    stored = true;
  } catch (error) {
    console.warn("[newsletter] could not store sign-up (read-only disk?):", error);
  }

  let mailed = false;
  const smtp = mailer();
  if (smtp) {
    try {
      await smtp.sendMail({
        from: `"QuantHive website" <${process.env.WAITLIST_FROM || process.env.SMTP_USER}>`,
        to: TO,
        replyTo: oneLine(email),
        subject: oneLine(`Newsletter sign-up: ${email}`),
        text: `Email: ${email}\nSigned up: ${at}`,
      });
      mailed = true;
    } catch (error) {
      console.error("[newsletter] mail failed:", error);
    }
  } else console.warn("[newsletter] SMTP not configured — sign-up not mailed.");

  if (!stored && !mailed) {
    return Response.json({ ok: false, error: "Something went wrong — please try again." }, { status: 500 });
  }
  return Response.json({ ok: true });
}

/** Vercel's entry point (a web-standard handler). server.ts doesn't use it. */
export const POST = (req: Request) => handleNewsletter(req);
