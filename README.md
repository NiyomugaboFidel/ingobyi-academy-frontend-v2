# Ingobyi Academy — Frontend

Next.js 16 (App Router) frontend for the Ingobyi Academy platform.

**Backend repo:** [ingobyi-academy-backend-v2](https://github.com/NiyomugaboFidel/ingobyi-academy-backend-v2)

## Stack

- Next.js 16 + React 19 + TypeScript
- Tailwind CSS v4
- TanStack Query · Zustand · Socket.io client

## Production URLs

| Service | URL |
|---------|-----|
| Frontend | https://ingobyi-academy-frontend-v2.vercel.app |
| API | https://ingobyi-academy-backend-v2-production.up.railway.app/api |

Defaults in code point to these URLs when env vars are unset.

## Local development

```bash
cp .env.local.example .env.local   # optional overrides
npm install
npm run dev
```

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | No | Defaults to Railway production API |
| `NEXT_PUBLIC_WS_URL` | No | Defaults to Railway WebSocket origin |
| `NEXT_PUBLIC_SHOW_DEMO_CREDENTIALS` | No | `true` for demo login hints on `/login` |

Copy `.env.example` or `.env.local.example` — **never commit** `.env.local`.

## Deploy on Vercel

1. Import this repo in [Vercel](https://vercel.com/new)
2. **Framework preset:** Next.js (auto-detected)
3. **Root directory:** `/` (repo root is this frontend)
4. **Environment variables** (Production + Preview):

   | Name | Example |
   |------|---------|
   | `NEXT_PUBLIC_API_URL` | `https://ingobyi-academy-backend-v2-production.up.railway.app/api` |
   | `NEXT_PUBLIC_WS_URL` | `https://ingobyi-academy-backend-v2-production.up.railway.app` |
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
| Superadmin | `fidelniyomugabo67@gmail.com` | `password123` |
| Admin | `cyubahirorichard250@gmail.com` | `password123` |
| Student | `holly.worshiptv@gmail.com` | `password123` |
| Parent | `nfidele290@gmail.com` | `password123` |

## What is gitignored

- `node_modules/`, `.next/`, `.vercel/`
- All `.env*` except `.env.example` and `.env.local.example`
- Logs, OS files, IDE caches
