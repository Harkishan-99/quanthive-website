import { appendFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { DATA_DIR, EMAIL_RE, escapeHtml, mailer, oneLine, rateLimited } from "./waitlist.js"; // .js: how Node on Vercel finds the compiled file; Bun and TypeScript map it to .ts

// The contact form: POST /api/contact (server.ts; on Vercel this file is the
// function). Each message is written to data/contact.jsonl where the disk allows
// it, then mailed to CONTACT_TO (default: WAITLIST_TO, then mail@quanthive.in)
// over the same SMTP settings as the waitlist (api/waitlist.ts).

const LOG_FILE = join(DATA_DIR, "contact.jsonl");
const TO = process.env.CONTACT_TO || process.env.WAITLIST_TO || "mail@quanthive.in";

type Message = { name: string; email: string; message: string };

function validate(body: unknown): { message: Message } | { error: string } {
  if (!body || typeof body !== "object") return { error: "Invalid request." };
  const read = (key: string, max: number) => {
    const value = (body as Record<string, unknown>)[key];
    return typeof value === "string" ? value.trim().slice(0, max) : "";
  };
  const message = { name: read("name", 120), email: read("email", 200), message: read("message", 4000) };
  if (!message.name) return { error: "Please add your name." };
  if (!EMAIL_RE.test(message.email)) return { error: "Please add a valid email." };
  if (!message.message) return { error: "Please add a message." };
  return { message };
}

async function deliver(message: Message, meta: { ip: string; ua: string }) {
  const at = new Date().toISOString();
  let stored = false;
  try {
    await mkdir(DATA_DIR, { recursive: true });
    await appendFile(LOG_FILE, JSON.stringify({ ...message, at, ...meta }) + "\n");
    stored = true;
  } catch (error) {
    console.warn("[contact] could not store message (read-only disk?):", error);
  }

  let mailed = false;
  const smtp = mailer();
  if (!smtp) console.warn("[contact] SMTP not configured (SMTP_HOST/USER/PASS) — message not mailed.");
  else {
    try {
      await smtp.sendMail({
        from: `"QuantHive website" <${process.env.WAITLIST_FROM || process.env.SMTP_USER}>`,
        to: TO,
        replyTo: oneLine(`"${message.name.replace(/"/g, "")}" <${message.email}>`),
        subject: oneLine(`Contact form: ${message.name}`),
        text: `Name: ${message.name}\nEmail: ${message.email}\nSent: ${at}\n\n${message.message}`,
        html:
          `<h2 style="font:600 18px system-ui,sans-serif;margin:0 0 12px">New message from the website</h2>` +
          `<p style="font:14px system-ui,sans-serif;color:#666;margin:0 0 4px">${escapeHtml(message.name)} &lt;${escapeHtml(message.email)}&gt; · ${at}</p>` +
          `<p style="font:15px/1.5 system-ui,sans-serif;white-space:pre-wrap;margin:16px 0 0">${escapeHtml(message.message)}</p>`,
      });
      mailed = true;
    } catch (error) {
      console.error("[contact] mail failed:", error);
    }
  }
  if (!stored && !mailed) throw new Error("message neither stored nor mailed");
}

/** POST /api/contact: the whole request, for server.ts and for Vercel. */
export async function handleContact(req: Request, fallbackIp = "unknown") {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || fallbackIp;
  if (rateLimited(ip)) return Response.json({ ok: false, error: "Too many tries — please wait a few minutes." }, { status: 429 });
  const body = await req.json().catch(() => null);
  // A field people never see; bots fill it in.
  if (body && typeof body === "object" && (body as { website?: unknown }).website) return Response.json({ ok: true });
  const result = validate(body);
  if ("error" in result) return Response.json({ ok: false, error: result.error }, { status: 400 });
  try {
    await deliver(result.message, { ip, ua: req.headers.get("user-agent") ?? "" });
    return Response.json({ ok: true });
  } catch (error) {
    console.error("[contact] could not take message:", error);
    return Response.json({ ok: false, error: "Something went wrong — please try again." }, { status: 500 });
  }
}

/** Vercel's entry point (a web-standard handler). server.ts doesn't use it. */
export const POST = (req: Request) => handleContact(req);
