import { appendFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import nodemailer, { type Transporter } from "nodemailer";

// The Flash waitlist: POST /api/waitlist (server.ts). Each sign-up is written to
// data/waitlist.jsonl first — so none is ever lost, whatever happens to the mail
// — and then mailed to WAITLIST_TO over plain SMTP with the mailbox's own
// credentials (no third-party mail API, so nothing to pay for):
//
//   SMTP_HOST, SMTP_PORT (465 = TLS, 587 = STARTTLS), SMTP_USER, SMTP_PASS,
//   WAITLIST_TO (default mail@quanthive.in), WAITLIST_FROM (default SMTP_USER)
//
// set in .env (Bun loads it). See .env.example.

const DATA_DIR = join(import.meta.dir, "..", "data");
const LOG_FILE = join(DATA_DIR, "waitlist.jsonl");
const TO = process.env.WAITLIST_TO || "mail@quanthive.in";

export type Signup = { name: string; email: string; organisation: string; phone: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[+()\-.\s\d]{6,24}$/;

/** Trims, bounds and checks the fields; returns the clean sign-up or an error. */
export function validate(body: unknown): { signup: Signup } | { error: string } {
  if (!body || typeof body !== "object") return { error: "Invalid request." };
  const read = (key: string, max: number) => {
    const value = (body as Record<string, unknown>)[key];
    return typeof value === "string" ? value.trim().slice(0, max) : "";
  };
  const signup = {
    name: read("name", 120),
    email: read("email", 200),
    organisation: read("organisation", 160),
    phone: read("phone", 24),
  };
  if (!signup.name) return { error: "Please add your name." };
  if (!EMAIL_RE.test(signup.email)) return { error: "Please add a valid email." };
  if (!signup.organisation) return { error: "Please add your organisation." };
  if (!signup.phone) return { error: "Please add your phone number." };
  if (!PHONE_RE.test(signup.phone)) return { error: "Please check the phone number." };
  return { signup };
}

// A little room per address — enough for a person, not for a script.
const RATE_WINDOW_MS = 10 * 60_000;
const RATE_MAX = 5;
const hits = new Map<string, number[]>();
export function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > RATE_MAX;
}

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
// Header-safe: no line breaks can reach a subject or reply-to.
const oneLine = (s: string) => s.replace(/[\r\n]+/g, " ");

let transport: Transporter | null = null;
function mailer() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;
  const port = Number(SMTP_PORT || 465);
  transport ??= nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  return transport;
}

/** Stores the sign-up, then mails it. `mailed` is false if SMTP isn't set up or
 *  the send failed (the sign-up is still stored). */
export async function submit(signup: Signup, meta: { ip: string; ua: string }) {
  const entry = { ...signup, at: new Date().toISOString(), ...meta };
  await mkdir(DATA_DIR, { recursive: true });
  await appendFile(LOG_FILE, JSON.stringify(entry) + "\n");

  const smtp = mailer();
  if (!smtp) {
    console.warn("[waitlist] SMTP not configured (SMTP_HOST/USER/PASS) — sign-up stored only.");
    return { mailed: false };
  }
  const rows: [string, string][] = [
    ["Name", signup.name],
    ["Email", signup.email],
    ["Organisation", signup.organisation],
    ["Phone", signup.phone],
    ["Signed up", entry.at],
  ];
  try {
    await smtp.sendMail({
      from: `"Flash waitlist" <${process.env.WAITLIST_FROM || process.env.SMTP_USER}>`,
      to: TO,
      replyTo: oneLine(`"${signup.name.replace(/"/g, "")}" <${signup.email}>`),
      subject: oneLine(`Flash waitlist: ${signup.name} (${signup.organisation})`),
      text: rows.map(([k, v]) => `${k}: ${v}`).join("\n"),
      html:
        `<h2 style="font:600 18px system-ui,sans-serif;margin:0 0 12px">New Flash waitlist sign-up</h2>` +
        `<table style="font:14px system-ui,sans-serif;border-collapse:collapse">` +
        rows
          .map(([k, v]) => `<tr><td style="padding:4px 16px 4px 0;color:#666">${k}</td><td style="padding:4px 0">${escapeHtml(v)}</td></tr>`)
          .join("") +
        `</table>`,
    });
    return { mailed: true };
  } catch (error) {
    console.error("[waitlist] mail failed (sign-up stored):", error);
    return { mailed: false };
  }
}
