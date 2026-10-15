# QuantHive Website

The QuantHive marketing site and the Flash product page: a React 19 app served
by [Bun](https://bun.sh) (`server.ts`), with a small API for the Flash waitlist.

Pages (one app; moving between them never reloads):

- `/` — QuantHive landing page (hero, capabilities, about section)
- `/flash` — Flash product page (hero with the waitlist form, partner logos); old `/#flash` and `/#product` links redirect here
- `/#about-us` — About page
- `/showcase` — the about-section demo alone, full screen (for a display)

## Requirements

| What | Why | Needed for |
| --- | --- | --- |
| **Bun ≥ 1.3** | runtime, bundler, server, package manager | everything |
| An **SMTP mailbox** (e.g. Gmail / Google Workspace with an App Password) | sends waitlist sign-ups by email — see [Waitlist email (SMTP)](#waitlist-email-smtp--set-up-before-going-live) | waitlist emails (optional — sign-ups are always saved to a file) |
| **ffmpeg** + Playwright's Chromium | renders the about-section demo to a `.mov` | only the "download video" button (optional) |

Install Bun:

```bash
curl -fsSL https://bun.sh/install | bash
```

No Node.js, npm or database is needed.

## Set up

```bash
git clone <this repo>
cd <repo folder>
bun install
cp .env.example .env      # then fill in .env (see below)
```

### Environment variables (`.env`)

Bun loads `.env` automatically. **Never commit `.env`** — it's git-ignored.

| Variable | Required | What it is |
| --- | --- | --- |
| `SMTP_HOST` | for waitlist email | e.g. `smtp.gmail.com` |
| `SMTP_PORT` | for waitlist email | `465` (TLS) or `587` (STARTTLS) |
| `SMTP_USER` | for waitlist email | the mailbox that sends, e.g. `you@quanthive.in` |
| `SMTP_PASS` | for waitlist email | that mailbox's **App Password** (Google: myaccount.google.com/apppasswords, needs 2-Step Verification) |
| `WAITLIST_TO` | no | where sign-ups are emailed (default `mail@quanthive.in`) |
| `WAITLIST_FROM` | no | the "from" address (default `SMTP_USER`) |
| `WAITLIST_DATA_DIR` | no | where sign-ups are saved (default `data/`) |
| `PORT` | no | port to listen on (default `4173`) |
| `NODE_ENV` | in production | set to `production` to serve the minified build without hot reload |
| `GNEWS_API_KEY` | no | only for the legacy company-news proxy (`/api/company-news`) |

Without SMTP settings the site still works: each waitlist sign-up is saved to
`data/waitlist.jsonl` on the server and a warning is logged.

## Run locally

```bash
bun run dev
```

Open http://localhost:4173 — edits hot-reload.

Other scripts:

```bash
bun run typecheck      # TypeScript check
bun run build          # static bundle into dist/ (see note below)
bun run render-video   # render the about-section demo to src/assets/videos/quanthive-flash.mov (needs ffmpeg + Playwright)
```

## Host it

The site must be run **as a Bun server** (it has API routes: the waitlist form
posts to `/api/waitlist`). Uploading only the static `dist/` folder to a static
host will show the pages but **the waitlist form will not work**.

### On Vercel

`vercel.json` sets everything up: Vercel installs with Bun, runs `bun run build`,
serves `dist/`, and serves the app at `/flash` and `/showcase` too, so refreshing
those pages works instead of showing Vercel's 404. `api/waitlist.ts` runs as a
Vercel function for the waitlist form.

1. Import the repo in Vercel and leave the framework preset on **Other**. Don't
   override the build settings: `vercel.json` provides them.
2. Project → Settings → Environment Variables: add `SMTP_HOST`, `SMTP_PORT`,
   `SMTP_USER`, `SMTP_PASS` and optionally `WAITLIST_TO` / `WAITLIST_FROM` (see
   [Waitlist email (SMTP)](#waitlist-email-smtp--set-up-before-going-live)), then redeploy.

On Vercel the disk is read-only, so sign-ups are **only emailed**, not saved to
`data/waitlist.jsonl`. If SMTP isn't set up, the form shows an error rather than
dropping the sign-up. The demo-video download (`/api/video/render`) isn't
available on Vercel.

### On your own server

On any Linux VM / VPS (or a container platform such as Railway, Render, Fly.io):

```bash
bun install --production
NODE_ENV=production PORT=4173 bun run start      # runs: bun server.ts
```

`server.ts` serves the app at both `/` and `/flash`. If you put another server or
CDN in front, pass `/flash` through to the app (or rewrite it to `/`); don't
let it 404.

Then put it behind your web server / load balancer (e.g. nginx or Caddy) for
HTTPS and your domain, and keep it running with a process manager, e.g.:

```bash
# systemd, pm2, or similar — pm2 example:
bun add -g pm2
NODE_ENV=production pm2 start "bun server.ts" --name quanthive-site
pm2 save
```

Checklist for the server:

- Bun installed
- `.env` present with the SMTP settings (and `NODE_ENV=production`)
- the app can write to `data/` (waitlist sign-ups are appended to `data/waitlist.jsonl` — back this up)
- outbound SMTP allowed (port 465 or 587) — see [Waitlist email (SMTP)](#waitlist-email-smtp--set-up-before-going-live)
- ffmpeg + `bunx playwright install chromium` only if you want the demo-video download to work

If the app sits behind a proxy, it reads the client IP from `X-Forwarded-For`
(used for the waitlist's rate limit: 5 sign-ups per IP per 10 minutes).

## Waitlist email (SMTP) — set up before going live

The "Join waitlist" form on the Flash page posts to `/api/waitlist`. The server
saves every sign-up to `data/waitlist.jsonl` and then emails it, signing in to
an ordinary mailbox over SMTP. No paid email service or API key is involved,
but the person deploying has to provide a mailbox the server can send from.

### 1. Pick the sending mailbox and get an app password

Use a mailbox on the company domain, such as `hello@quanthive.in` or
`waitlist@quanthive.in`. Mail sent from a personal address can land in spam.

**Google Workspace or Gmail**

1. Sign in to the sending mailbox.
2. Turn on 2-Step Verification at myaccount.google.com → Security. Google only
   issues app passwords to accounts that have it.
3. Go to myaccount.google.com/apppasswords, create one named, say, "Website
   waitlist", and copy the 16-character password. It's shown only once.
   - If the page says app passwords aren't available, a Workspace admin must
     allow them: Admin console → Security → Authentication → 2-Step
     Verification, and make sure the user can enrol.
4. Use `SMTP_HOST=smtp.gmail.com` and `SMTP_PORT=465`.

**Zoho Mail:** `SMTP_HOST=smtp.zoho.in` (or `smtp.zoho.com`), `SMTP_PORT=465`,
with an app-specific password from Zoho Mail → Settings → Security.

**Any other provider** (Outlook/Microsoft 365, Amazon SES SMTP, Brevo, …): use
its SMTP host, port 465 (TLS) or 587 (STARTTLS), and the SMTP username and
password it gives you.

Use the app password, not the mailbox's normal sign-in password; normal
passwords are rejected.

### 2. Put it in `.env` on the server

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=waitlist@quanthive.in      # the mailbox that sends
SMTP_PASS=<16-char app password>     # spaces optional
WAITLIST_TO=team@quanthive.in        # who receives sign-ups (default mail@quanthive.in)
# WAITLIST_FROM=waitlist@quanthive.in  # optional; must be the mailbox or an alias it can send as
```

Restart the server after editing `.env`: Bun reads it at start-up.

### 3. Make sure the host allows outgoing SMTP

The server needs to reach the mail provider on port 465 (or 587).

- **DigitalOcean** blocks outbound SMTP ports on new accounts. Open a support
  ticket to lift it, or host elsewhere.
- **Some other VPS and cloud hosts** do the same. Check with your provider.
- **AWS EC2** only throttles port 25; 465 and 587 work.
- **Railway, Render and Fly.io** allow 465 and 587.

To check from the server:

```bash
nc -vz smtp.gmail.com 465
```

### 4. Test it

1. Open `/flash` on the live site, click "Join waitlist" and submit the form
   once.
2. The email should arrive at `WAITLIST_TO` from "Flash waitlist". Replying to
   it replies to the person who signed up.
3. The server log shows the result:
   - nothing extra means it was sent;
   - `[waitlist] SMTP not configured` means the `SMTP_*` variables weren't
     found (check `.env` and restart);
   - `[waitlist] mail failed …` gives the provider's reason.

Common failures:

| Error in the log | Fix |
| --- | --- |
| `535 … Username and Password not accepted` / `Invalid login` | use an **app password**, not the normal password; check `SMTP_USER` is the full address |
| `ETIMEDOUT` / `ECONNREFUSED` | the host is blocking outbound SMTP (step 3), or the host or port is wrong |
| `self signed certificate` / TLS errors | port mismatch: 465 for TLS, 587 for STARTTLS |
| Mail arrives in spam | send from a mailbox on your own domain, with the domain's SPF/DKIM set up (Google Workspace and Zoho guide you through this) |

### Limits and upkeep

- **Daily limits:** the provider's apply. Google Workspace allows about 2,000
  emails a day and personal Gmail about 500, far more than a waitlist needs.
  If mail is ever refused, sign-ups are still saved to `data/waitlist.jsonl`.
- **Back up `data/waitlist.jsonl`:** it's the full list of sign-ups (personal
  data), so keep it out of git, which `.gitignore` already does.
- **Rotate the password if it leaks:** revoke the app password, create a new
  one, update `SMTP_PASS` and restart.

## Project layout

```
server.ts            Bun server: pages, assets, /api/waitlist, /api/video/render
api/waitlist.ts      waitlist validation, storage (data/waitlist.jsonl) and SMTP mail
index.html           app entry
src/App.tsx          page switching + page transitions
src/components/      sections and pages (Hero, Capabilities, About, AboutPage, FlashPartners, Nav, …)
src/shaders/         WebGL shaders (liquid metal)
src/styles/          tokens, fonts, global styles, page-transition.css
src/assets/          fonts, icons, images, videos
scripts/render-video.ts  renders the about-section demo to .mov
```

## Security notes

- Secrets live only in `.env` (git-ignored). `.env.example` lists the names with no values.
- `data/` (waitlist sign-ups — personal data) is git-ignored; don't commit it.
- The waitlist API validates and length-limits every field, rate-limits per IP,
  drops bot submissions (hidden honeypot field), and escapes everything it puts
  into the email.
