# Interview Prep Tracker

> A modern, personal learning dashboard for interview preparation.  
> Track study sessions, DSA problems, revision queues, notes, timers, performance scores, and short technical reflections — all in one place.

Built for developers (and QA → Dev transitioners) who want to **show** their preparation journey instead of just saying “I studied Java today”.

---

## Features (v1)

### Core
- **Learning Sessions** – Log topic, category, duration, concepts covered, key takeaways, confidence level, revision flags
- **Performance Scoring** – Automatic score points based on time spent, confidence progression, consistency (timestamps)
- **Study Timer** – Start/stop timer that can auto-create or link to a learning session
- **DSA Problem Tracker** – Status, difficulty, tags, notes, time spent
- **Revision Queue** – Prioritized list of concepts that need revisit
- **Notes** – Quick self-notes / “message to self” (pinned, tagged)
- **Blog / Reflections** – Write short technical posts or weekly retrospectives (private by default)
- **Dashboard Metrics** – Total hours, topics covered, problems solved, weekly/monthly charts, streak
- **Dark Mode** + fully responsive (mobile + desktop)
- **Auth** – Email/password + optional GitHub (Auth.js)

### Design Goals
- Clean, modern, card-based UI that feels premium (loved by 20-somethings preparing for jobs)
- Real-time feel for timer & notes
- Business logic driven by actual timestamps for honest progress tracking

---

## Tech Stack

| Layer          | Technology                          |
|----------------|-------------------------------------|
| Framework      | Next.js 15 (App Router) + TypeScript |
| Styling        | Tailwind CSS + dark mode            |
| Database       | PostgreSQL + Prisma ORM             |
| Auth           | Auth.js (NextAuth v5)               |
| Forms          | React Hook Form + Zod               |
| Charts         | Recharts                            |
| Icons          | Lucide React                        |
| Deployment     | Vercel (frontend) + any Postgres host |

---

## Architecture Overview

```
src/
├── app/
│   ├── (auth)/              # login / register
│   ├── (dashboard)/         # protected routes
│   │   ├── page.tsx         # main dashboard
│   │   ├── sessions/        # learning logs CRUD
│   │   ├── dsa/             # problem tracker
│   │   ├── revision/        # revision queue
│   │   ├── notes/           # quick notes
│   │   ├── blog/            # reflections
│   │   └── timer/           # study timer
│   ├── api/                 # route handlers + Auth.js
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                  # button, card, input, etc.
│   ├── dashboard/           # metric cards, charts
│   ├── sessions/
│   ├── timer/
│   └── layout/              # sidebar, navbar
├── lib/
│   ├── auth.ts              # Auth.js config
│   ├── prisma.ts            # Prisma client singleton
│   ├── scoring.ts           # performance score logic
│   └── utils.ts
├── types/
└── prisma/
    └── schema.prisma
```

### Data Flow (simplified)
1. User starts a **timer** → `StudyTimer` record created with `startedAt`
2. On stop → duration calculated from timestamps → optional `LearningSession` created
3. Session saved → score points calculated (duration + confidence weight + streak bonus)
4. Daily `PerformanceLog` updated
5. Dashboard reads aggregated metrics + charts

---

## Getting Started

### 1. Prerequisites
- Node.js 20+
- Docker (for local Postgres)

### 2. Clone & Install
```bash
git clone <your-repo-url>
cd interview-prep-tracker
npm install
```

### 3. Start Database
```bash
docker compose up -d
```

### 4. Environment
```bash
cp .env.example .env
# Edit AUTH_SECRET (run: openssl rand -base64 32)
```

### 5. Database Setup
```bash
npx prisma db push
npx prisma generate
# optional: npm run db:seed
```

### 6. Run
```bash
npm run dev
```
Open http://localhost:3000

---

## Publish on GitHub and Deploy to Vercel

### 1. Push the project to GitHub

Create an empty repository on GitHub, then run these commands from the project
directory:

```bash
git init
git add .
git status
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<your-username>/interview-prep-tracker.git
git push -u origin main
```

Before committing, check that `.env` is not staged and `.env.example` is staged.
Never commit database URLs, OAuth secrets, or `AUTH_SECRET`. Keep
`package-lock.json` in Git so Vercel installs the same dependency versions;
`node_modules` and `.next` are generated locally and should not be committed.

### 2. Create a production PostgreSQL database

Create a managed PostgreSQL database with a provider such as Neon or Supabase.
The local Docker database is only for development; it is not reachable by Vercel
or public users. Keep the provider's database URL private. Initialize the
production schema with `npx prisma db push` using that database URL before
opening the deployed app to registrations. This repository currently has no
Prisma migration history, so `db push` is the initial-schema shortcut; before
making future production schema changes, create and commit Prisma migrations
and apply them with `prisma migrate deploy`.

### 3. Deploy with Vercel

In Vercel, import the GitHub repository and keep the detected Next.js defaults.
Add these environment variables under **Project Settings → Environment
Variables** for Production (and Preview if desired):

| Variable | Value |
| --- | --- |
| `DATABASE_URL` | Connection URL for the production PostgreSQL database |
| `AUTH_SECRET` | A newly generated, strong random secret |
| `AUTH_URL` | The deployed app's canonical HTTPS URL |
| `NEXT_PUBLIC_APP_URL` | The same canonical HTTPS URL |
| `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` | Optional; only if GitHub sign-in is configured |

Redeploy after setting environment variables. When using GitHub sign-in, add
the Vercel URL to the GitHub OAuth app's callback URL:
`https://<your-domain>/api/auth/callback/github`.

### Production notes

- Registration and email/password sign-in are implemented. The database schema
  associates learning data with a user, so public deployment can serve multiple
  accounts rather than sharing one local database.
- Vercel's filesystem is not durable storage. The current upload handler writes
  files under `public/uploads`, which is ignored by Git and will not reliably
  persist across deployments or serverless instances. It also exposes uploaded
  files through public URLs. Before enabling uploads for real users, move them
  to object storage and enforce the intended access permissions.
- Do not use the local Docker credentials in production. Keep secrets in
  Vercel's environment settings, not in Git or client-side `NEXT_PUBLIC_`
  variables.

---

## Must-have Learning Log Fields

| Field              | Type / Example                                      | Purpose |
|--------------------|-----------------------------------------------------|---------|
| Title              | "Java Constructors deep dive"                       | Quick identification |
| Topic              | Java constructors                                   | Grouping |
| Category           | JAVA / DSA / DBMS / OS / SYSTEM_DESIGN / ...        | Filtering & progress by subject |
| Date               | Auto / picker                                       | Timeline |
| Duration (min)     | 90                                                  | Accurate time tracking |
| Concepts Covered   | ["default", "parameterized", "private"]             | What exactly was learned |
| Practice Notes     | "Wrote 4 examples + factory method"                 | Proof of practice |
| Key Takeaway       | "Private constructor restricts instantiation..."    | Interview-ready summary |
| Confidence         | LEARNING → PRACTICED → REVISION → INTERVIEW_READY   | Honest progress levels |
| Revision Needed    | true / false                                        | Feeds revision queue |
| Next Step          | "Implement utility class with private ctor"         | Actionable follow-up |
| Score Points       | Auto-calculated                                     | Gamified motivation |

---

## Performance Scoring Logic (Business Rules)

Score is calculated on every session save using real timestamps:

- Base points = `durationMinutes / 10` (1 point per 10 min)
- Confidence multiplier:
  - LEARNING → ×1.0
  - PRACTICED → ×1.3
  - REVISION → ×1.6
  - INTERVIEW_READY → ×2.0
- Streak bonus: +5 points if studying on consecutive days
- Consistency bonus: extra points when weekly goal is met

All timestamps (`createdAt`, `startedAt`, `endedAt`, `date`) are used so the system rewards **actual** work, not just logging.

---

## Roadmap

### Phase 1–2 (implemented)
- [x] Project scaffold + Prisma schema
- [x] Auth (credentials + optional GitHub)
- [x] Learning session CRUD + form + scoring
- [x] Dashboard metrics (live data)
- [x] Study timer (timestamp-based)
- [x] Notes (self-messaging, pin, tags)
- [x] Blog / Reflections
- [x] DSA problem tracker (status, difficulty, filters)
- [x] Revision queue (auto from sessions + manual)
- [x] Insights charts (weekly / monthly / category)
- [x] CSV export of sessions
- [x] Dark mode ready + responsive layout

### Phase 3 (future)
- Public profile page
- LinkedIn draft generator
- GitHub Actions + tests
- Dark mode toggle UI

---

## Project Structure Philosophy

- **App Router** with route groups for clean separation of auth vs dashboard
- **Server Components** by default, Client Components only where interactivity is needed (timer, forms, charts)
- **Prisma** as single source of truth for data model
- **Zod** for all form validation
- **Scoring logic** isolated in `lib/scoring.ts` so it can evolve independently

---

## Contributing

This is primarily a personal project, but clean architecture makes it easy for others to fork and adapt.

1. Fork
2. Create feature branch
3. Open PR with clear description

---

## License

MIT

---

**One concept at a time. One commit at a time.**
