# Ingobyi Academy — Frontend

Next.js 16 (App Router) frontend for the Ingobyi Academy platform, integrated with the NestJS API.

## Stack

- **Next.js 16** + React 19 + TypeScript
- **Tailwind CSS v4** with Ingobyi brand tokens
- **TanStack Query** for client data fetching
- **Zustand** for auth state (persisted)
- **Socket.io client** (ready for realtime features)

## Quick start

```bash
# From frontend/
cp .env.local.example .env.local   # or create .env.local
npm install
npm run dev                        # http://localhost:3000
```

Run frontend and backend together:

```bash
npm run dev:full   # Next.js :3000 + NestJS API :3001
```

Ensure the backend is running and seeded (`cd ../backend && npm run prisma:seed`).

## Environment

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001/api` | NestJS API base URL |

## Demo accounts

| Role | Email | Password |
|------|-------|----------|
| Superadmin | `super@ingobyi.com` | `password123` |
| Student | `student1@kigali-tech-school.com` | `password123` |

## Routes

| Path | Description |
|------|-------------|
| `/` | Landing page |
| `/catalog` | Public course search |
| `/catalog/[slug]` | Course detail + enroll |
| `/login` | Sign in, register, OTP verify |
| `/student/*` | Student dashboard |
| `/admin/*` | Org admin workspace |
| `/trainer/*` | Trainer workspace |
| `/superadmin/*` | Platform admin |
| `/parent/*` | Parent portal (stub) |

## API integration

- `src/lib/api/client.ts` — fetch wrapper with `credentials: 'include'` for refresh cookies
- `src/lib/api/auth.ts` — login, register, refresh, logout
- `src/lib/api/catalog.ts` — public catalog
- `src/lib/api/enrollments.ts` — enroll / my courses

Auth flow: access token in Zustand store; refresh token in httpOnly `ia_refresh` cookie set by the API.

## Scripts

```bash
npm run dev        # Dev server on port 3000
npm run dev:full   # Dev server + backend
npm run build      # Production build
npm run start      # Production server
npm run lint       # ESLint
```
