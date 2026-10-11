# Architecture Document – Interview Prep Tracker

## 1. Vision

Turn interview preparation from a private activity into a structured, measurable, and showcase-able journey.  
The application is a **personal learning operating system** with:

- Honest time tracking (real timestamps)
- Progressive confidence model
- Gamified but fair scoring
- Notes + reflections that can later become public content

## 2. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser (Mobile / Desktop)              │
│  Next.js App Router  •  Tailwind  •  Dark Mode  •  Recharts │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTPS
┌────────────────────────────▼────────────────────────────────┐
│                     Next.js Server                          │
│  • Server Components (data fetching)                        │
│  • Server Actions / Route Handlers (mutations)              │
│  • Auth.js (session + credentials / GitHub)                 │
│  • Scoring engine (lib/scoring.ts)                          │
└────────────────────────────┬────────────────────────────────┘
                             │ Prisma Client
┌────────────────────────────▼────────────────────────────────┐
│                     PostgreSQL                              │
│  users, learning_sessions, dsa_problems, revision_items,    │
│  notes, blog_posts, study_timers, performance_logs          │
└─────────────────────────────────────────────────────────────┘
```

## 3. Domain Model (Key Entities)

### LearningSession
The atomic unit of work. Every meaningful study block becomes one record.  
Contains duration, concepts, confidence, and calculated score.

### StudyTimer
Live timer. `startedAt` / `endedAt` are the source of truth for duration.  
Can optionally create a LearningSession on stop.

### PerformanceLog
Daily aggregate. Updated transactionally when a session is saved.  
Powers streaks, weekly charts, and total score.

### ConfidenceLevel (enum)
Four discrete stages that map to real interview readiness:

1. LEARNING – I understand the concept when I look at notes
2. PRACTICED – I wrote working code / examples
3. REVISION – I can recall without notes
4. INTERVIEW_READY – I can explain clearly + answer follow-ups

### Scoring Engine
Located in `lib/scoring.ts`. Pure functions that take:

- durationMinutes
- confidence
- previous session dates (for streak)
- weekly totals

and return `scorePoints`. All calculations use real timestamps so the system cannot be easily gamed by just typing numbers.

## 4. Auth Strategy

- Auth.js (NextAuth v5) with Prisma Adapter
- Providers: Credentials (email + hashed password) + optional GitHub
- Session strategy: JWT (or database sessions)
- All dashboard routes protected by middleware

## 5. UI / UX Principles

- **Card-based layout** – every metric, session, note is a card
- **Dark mode first** – preferred by most 20-something developers
- **Mobile responsive** – sidebar collapses to bottom nav on small screens
- **Immediate feedback** – timer updates every second, score animates on save
- **Clean typography** – Inter / system font, generous spacing, subtle borders

## 6. Folder Responsibilities

| Path                    | Responsibility                                      |
|-------------------------|-----------------------------------------------------|
| `app/(dashboard)`       | All authenticated pages                             |
| `app/(auth)`            | Login / Register                                    |
| `components/ui`         | Reusable primitives (Button, Card, Input, Badge…)   |
| `components/dashboard`  | Metric cards, charts, streak display                |
| `lib/scoring.ts`        | Pure business logic for points & streaks            |
| `lib/prisma.ts`         | Singleton Prisma client                             |
| `lib/auth.ts`           | Auth.js configuration                               |

## 7. Future Extensibility

- Public profile page can read only `isPublished` blog posts
- CSV export is a simple Server Action that streams Prisma results
- GitHub Actions can run `prisma migrate` + tests on every PR
- Can later extract a Spring Boot service if deeper Java backend experience is desired

## 8. Security Notes

- Passwords hashed with bcrypt
- All mutations require authenticated session
- Private data (detailed sessions, notes) never exposed publicly by default
- Environment variables never committed

---

This document is the single source of truth for architectural decisions.
