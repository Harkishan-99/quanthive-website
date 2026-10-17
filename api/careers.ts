import { appendFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { DATA_DIR, EMAIL_RE, escapeHtml, mailer, oneLine, rateLimited } from "./waitlist.js"; // .js: how Node on Vercel finds the compiled file; Bun and TypeScript map it to .ts

// The Careers page's applications: POST /api/careers (server.ts; on Vercel this
// file is the function). Each one — a name, an email and the role — is written to
// data/careers.jsonl where the disk allows it, then mailed to CAREERS_TO (default:
// WAITLIST_TO, then mail@quanthive.in) over the waitlist's SMTP settings.

const LOG_FILE = join(DATA_DIR, "careers.jsonl");
const TO = process.env.CAREERS_TO || process.env.WAITLIST_TO || "mail@quanthive.in";

type Application = { name: string; email: string; role: string };

function validate(body: unknown): { application: Application } | { error: string } {
  if (!body || typeof body !== "object") return { error: "Invalid request." };
  const read = (key: string, max: number) => {
    const value = (body as Record<string, unknown>)[key];
    return typeof value === "string" ? value.trim().slice(0, max) : "";
  };
  const application = { name: read("name", 120), email: read("email", 200), role: read("role", 120) };
  if (!application.name) return { error: "Please add your name." };
  if (!EMAIL_RE.test(application.email)) return { error: "Please add a valid email." };
  if (!application.role) return { error: "Please pick a role." };
  return { application };
}

async function deliver(application: Application, meta: { ip: string; ua: string }) {
  const at = new Date().toISOString();
  let stored = false;
  try {
    await mkdir(DATA_DIR, { recursive: true });
    await appendFile(LOG_FILE, JSON.stringify({ ...application, at, ...meta }) + "\n");
    stored = true;
  } catch (error) {
    console.warn("[careers] could not store application (read-only disk?):", error);
  }

  let mailed = false;
  const smtp = mailer();
  if (!smtp) console.warn("[careers] SMTP not configured (SMTP_HOST/USER/PASS) — application not mailed.");
  else {
    const rows: [string, string][] = [
      ["Role", application.role],
      ["Name", application.name],
      ["Email", application.email],
      ["Applied", at],
    ];
    try {
      await smtp.sendMail({
        from: `"QuantHive careers" <${process.env.WAITLIST_FROM || process.env.SMTP_USER}>`,
        to: TO,
        replyTo: oneLine(`"${application.name.replace(/"/g, "")}" <${application.email}>`),
        subject: oneLine(`Application: ${application.role} — ${application.name}`),
        text: rows.map(([k, v]) => `${k}: ${v}`).join("\n"),
        html:
          `<h2 style="font:600 18px system-ui,sans-serif;margin:0 0 12px">New application from the Careers page</h2>` +
          `<table style="font:14px system-ui,sans-serif;border-collapse:collapse">` +
          rows
            .map(([k, v]) => `<tr><td style="padding:4px 16px 4px 0;color:#666">${k}</td><td style="padding:4px 0">${escapeHtml(v)}</td></tr>`)
            .join("") +
          `</table>`,
      });
      mailed = true;
    } catch (error) {
      console.error("[careers] mail failed:", error);
    }
  }
  if (!stored && !mailed) throw new Error("application neither stored nor mailed");
  return { mailed };
}

/** POST /api/careers: the whole request, for server.ts and for Vercel. */
export async function handleCareers(req: Request, fallbackIp = "unknown") {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || fallbackIp;
  if (rateLimited(ip)) return Response.json({ ok: false, error: "Too many tries — please wait a few minutes." }, { status: 429 });
  const body = await req.json().catch(() => null);
  // A field people never see; bots fill it in.
  if (body && typeof body === "object" && (body as { website?: unknown }).website) return Response.json({ ok: true });
  const result = validate(body);
  if ("error" in result) return Response.json({ ok: false, error: result.error }, { status: 400 });
  try {
    const { mailed } = await deliver(result.application, { ip, ua: req.headers.get("user-agent") ?? "" });
    return Response.json({ ok: true, mailed });
  } catch (error) {
    console.error("[careers] could not take application:", error);
    return Response.json({ ok: false, error: "Something went wrong — please try again." }, { status: 500 });
  }
}

/** Vercel's entry point (a web-standard handler). server.ts doesn't use it. */
export const POST = (req: Request) => handleCareers(req);
