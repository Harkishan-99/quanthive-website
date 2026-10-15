# QuantHive Website

The QuantHive marketing site and the Flash product page: a React 19 app served
by [Bun](https://bun.sh) (`server.ts`), with a small API for the Flash waitlist.

Pages (hash-routed, one app):

- `/` — QuantHive landing page (hero, capabilities, about section)
- `/#product` — Flash product page (hero with the waitlist form, partner logos)
- `/#about-us` — About page
- `/showcase` — the about-section demo alone, full screen (for a display)

## Requirements

| What | Why | Needed for |
| --- | --- | --- |
| **Bun ≥ 1.3** | runtime, bundler, server, package manager | everything |
| An **SMTP mailbox** (e.g. Gmail / Google Workspace with an App Password) | sends waitlist sign-ups by email | waitlist emails (optional — sign-ups are always saved to a file) |
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

On any Linux VM / VPS (or a container platform such as Railway, Render, Fly.io):

```bash
bun install --production
NODE_ENV=production PORT=4173 bun run start      # runs: bun server.ts
```

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
- outbound SMTP allowed (port 465 or 587)
- ffmpeg + `bunx playwright install chromium` only if you want the demo-video download to work

If the app sits behind a proxy, it reads the client IP from `X-Forwarded-For`
(used for the waitlist's rate limit: 5 sign-ups per IP per 10 minutes).

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
