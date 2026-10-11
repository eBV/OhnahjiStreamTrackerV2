# Ohnahji Stream Tracker V2

A React 18 + Vite 5 + TypeScript dashboard tracking the Ohnahji Twitch
channel: followers, live status, recent streams (VODs), top clips, a stream
schedule, and milestones. Data comes from the Twitch Helix API through
serverless functions in `api/` (Vercel).

## Tech

- Frontend: React 18, Vite 5, Tailwind CSS, Recharts, TanStack Query
- API: Vercel serverless functions (`api/twitch-stats.ts`, `api/eventsub/`)
- Twitch app-OAuth token is cached server-side in memory (refreshed before
  expiry) instead of being re-fetched on every request

## Prerequisites

- Node.js 20 (see `.nvmrc`)
- A Twitch app (client ID + secret) from https://dev.twitch.tv/console/apps

## Environment variables

Copy `.env.example` to `.env` (local dev) and fill in:

| Variable | Required | What it is |
|---|---|---|
| `TWITCH_CLIENT_ID` | Yes | Twitch app client ID (server-side only, never `VITE_`-prefixed) |
| `TWITCH_CLIENT_SECRET` | Yes | Twitch app client secret |
| `TWITCH_USERNAME` | No | Streamer login to track (default: `ohnahji`) |
| `FRONTEND_URL` | No | Production frontend origin for CORS (e.g. `https://your-app.vercel.app`); defaults to `http://localhost:5173` |

In Vercel, set these under Project Settings → Environment Variables.

## Local development

```bash
npm ci
cp .env.example .env   # fill in your Twitch credentials
npm run dev            # Vite dev server on http://localhost:5173
```

To exercise the serverless API locally: `npm run vercel-dev` (requires the
Vercel CLI).

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | `tsc -b` + `vite build` → `dist/` |
| `npm run lint` | ESLint flat config over the whole repo |
| `npm run preview` | Preview the production build |

CI (`.github/workflows/ci.yml`) runs `npm ci`, `npm run lint`, `npx tsc -b`,
and `npx vite build`.

## Deploy to Vercel

1. Import this repo in Vercel (framework preset: Vite, output dir: `dist`).
2. Add `TWITCH_CLIENT_ID`, `TWITCH_CLIENT_SECRET` (and optionally
   `TWITCH_USERNAME`, `FRONTEND_URL`) as environment variables.
3. Deploy. The `/api/*` routes are served as serverless functions; the
   `vercel.json` rewrite serves `index.html` for all non-API routes (SPA).
