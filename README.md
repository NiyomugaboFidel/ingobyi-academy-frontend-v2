# Ingobyi Academy — Frontend

Next.js 16 (App Router) frontend for the Ingobyi Academy platform.

**Backend repo:** [ingobyi-academy-backend-v2](https://github.com/NiyomugaboFidel/ingobyi-academy-backend-v2)

## Stack

- Next.js 16 + React 19 + TypeScript
- Tailwind CSS v4
- TanStack Query · Zustand · Socket.io client

## Local development

```bash
cp .env.local.example .env.local
npm install
npm run dev          # http://localhost:3000
```

Start the [backend API](https://github.com/NiyomugaboFidel/ingobyi-academy-backend-v2) on port **3001** and seed demo data before logging in.

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes (prod) | API base, e.g. `https://your-api.railway.app/api` |
| `NEXT_PUBLIC_WS_URL` | No | WebSocket origin (defaults from API URL) |
| `NEXT_PUBLIC_SHOW_DEMO_CREDENTIALS` | No | `true` for demo login hints on `/login` |

Copy `.env.example` or `.env.local.example` — **never commit** `.env.local`.

## Deploy on Vercel

1. Import this repo in [Vercel](https://vercel.com/new)
2. **Framework preset:** Next.js (auto-detected)
3. **Root directory:** `/` (repo root is this frontend)
4. **Environment variables** (Production + Preview):

   | Name | Example |
   |------|---------|
   | `NEXT_PUBLIC_API_URL` | `https://your-backend.up.railway.app/api` |
   | `NEXT_PUBLIC_WS_URL` | `https://your-backend.up.railway.app` |
   | `NEXT_PUBLIC_SHOW_DEMO_CREDENTIALS` | `false` |

5. Deploy — `vercel.json` is included for build settings and security headers.

**Backend CORS:** set `FRONTEND_URL` / `CORS_ORIGIN` on the API to your Vercel URL (e.g. `https://ingobyi-academy.vercel.app`).

## Deploy on Railway (alternative)

See `railway.toml`. Set the same `NEXT_PUBLIC_*` variables before the first build.

## Scripts

```bash
npm run dev        # Dev server :3000
npm run build      # Production build
npm run start      # Production server
npm run lint       # ESLint
```

## Demo login

| Role | Email | Password |
|------|-------|----------|
| Superadmin | `super@ingobyi.com` | `password123` |
| Student | `student1@kigali-tech-school.com` | `password123` |

## What is gitignored

- `node_modules/`, `.next/`, `.vercel/`
- All `.env*` except `.env.example` and `.env.local.example`
- Logs, OS files, IDE caches
