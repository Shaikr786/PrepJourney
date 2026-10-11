# Interview Prep Tracker — Product Walkthrough & Cheat Sheet

> Your personal learning operating system for interview preparation.  
> Built so you can **show** progress, not just say “I studied Java today.”

---

## 1. What is this product?

**Interview Prep Tracker** is a full-stack web app that turns your interview preparation into:

- A **private learning dashboard** (sessions, time, confidence, scores)
- A **DSA problem tracker**
- A **revision queue**
- **Notes** (messages to yourself)
- **Reflections** (short technical write-ups)
- **Insights** (charts based on real timestamps)
- **CSV export** of your study history

It is designed especially for someone moving from **Manual QA → Software Development**, so the project itself becomes something you can discuss in interviews.

---

## 2. How it was born (product story)

**Problem**  
Posting “Studied Java today” on LinkedIn does not prove consistency, depth, or interview readiness. Spreadsheets are private and hard to showcase. Mock interviews expose gaps, but those gaps are easy to forget.

**Idea**  
Treat preparation like a product:

1. Log real study time (timer + timestamps)
2. Record *what* you can do, not only what you read
3. Track confidence in four stages (Learning → Interview-ready)
4. Score effort fairly so progress feels visible
5. Keep revision and notes in one place
6. Optionally turn strong learnings into reflections

**Result**  
A single app that is both your daily tool and a portfolio piece (Next.js, TypeScript, Prisma, PostgreSQL, Auth.js, scoring logic, charts).

---

## 3. Tech stack (one glance)

| Layer        | Choice                          |
|-------------|-------------------------------|
| Framework   | Next.js 15 (App Router) + TypeScript |
| UI          | Tailwind CSS, card-based, dark-mode ready |
| Auth        | Auth.js (email/password + optional GitHub) |
| Database    | PostgreSQL + Prisma           |
| Charts      | Recharts                      |
| Forms       | React Hook Form patterns + Zod + Server Actions |

---

## 4. Login & first run

1. Open `http://localhost:3000`
2. **Register** with name, email, password (min 6 characters)
3. You land on the **Dashboard**
4. Sidebar (left on desktop, menu on mobile):  
   Dashboard · Sessions · Timer · DSA · Revision · Notes · Reflections · Insights

---

## 5. Feature walkthrough (use this as a cheat sheet)

### A. Dashboard (`/dashboard`)

**What you see**
- Total hours, sessions, problems solved, score points, streak, notes count
- Recent sessions
- Quick actions (Start Timer, Add Session, etc.)

**How numbers are born**
- Hours / sessions / scores come from **Learning Sessions**
- Streak uses **real session dates**
- Problems solved come from **DSA** status = SOLVED

**Tip**  
After every study block, either use the Timer or Add Session so the dashboard stays honest.

---

### B. Study Timer (`/timer`)

**Purpose**  
Record real study time with timestamps (not guessed minutes).

**How to use**
1. Optional: type a topic (e.g. `Java Collections`)
2. Click **Start**
3. Study
4. Click **Stop**
5. Confirm → app opens **New Session** with duration (and topic) pre-filled

**Behind the scenes**
- Creates a `StudyTimer` with `startedAt`
- On stop: `endedAt` + `durationSec` from clock difference
- Duration feeds scoring when you save the session

**Cheat tip**  
Always stop the timer when you finish. That is the source of truth for time.

---

### C. Learning Sessions (`/sessions`)

**Purpose**  
Atomic unit of learning. One meaningful study block = one session.

**Must-have fields**

| Field              | Why it matters |
|--------------------|----------------|
| Title              | Quick identity (“Java Constructors deep dive”) |
| Topic              | Grouping |
| Category           | JAVA / DSA / DBMS / OS / … |
| Date               | Timeline & streak |
| Duration (minutes) | Scoring base |
| Concepts covered   | What exactly you touched |
| Practice notes     | Proof you *did* something |
| Key takeaway       | Interview-ready one-liner |
| Confidence         | LEARNING → PRACTICED → REVISION → INTERVIEW_READY |
| Revision needed    | Feeds Revision Queue |
| Next step          | Action for later |
| Score points       | Auto-calculated |

**Confidence levels (remember these)**
1. **LEARNING** — understand with notes  
2. **PRACTICED** — wrote working examples  
3. **REVISION** — can recall without notes  
4. **INTERVIEW_READY** — can explain + answer follow-ups  

**Scoring (business logic)**
- Base = duration ÷ 10  
- × confidence multiplier (1.0 → 2.0)  
- +5 if you studied yesterday (streak)  
- +15 when you first cross weekly goal  

**Actions**
- **+ Add Session** — manual log  
- **Edit / Delete** on each card  
- **Export CSV** — download all sessions  

**Cheat tip**  
Prefer: Timer → Stop → fill takeaway + confidence → Save.  
That keeps time honest and scores meaningful.

---

### D. DSA Problems (`/dsa`)

**Purpose**  
Track coding problems with status and difficulty.

**Fields**
- Title, Link (LeetCode/GFG), Difficulty (EASY/MEDIUM/HARD)
- Status: TODO → ATTEMPTED → SOLVED → REVISIT
- Topic tags, time spent, notes

**How to use**
1. **+ Add Problem**
2. Change status from the list (dropdown) when you progress
3. Filter by status chips at the top

**Cheat tip**  
When you solve a problem, set status to **SOLVED** and write a short note on the approach. That note is gold for revision and interviews.

---

### E. Revision Queue (`/revision`)

**Purpose**  
Concepts you must revisit (from weak mocks or flagged sessions).

**How items appear**
1. Automatically when you check **Mark for revision** on a session  
2. Manually via the “Add to queue” form  

**Actions**
- ✓ Mark complete  
- Reopen  
- Delete  

**Cheat tip**  
After every mock interview, add 2–3 concepts you struggled with. Clear the queue weekly.

---

### F. Notes (`/notes`)

**Purpose**  
Quick “message to yourself” — reminders, ideas, links, doubts.

**Features**
- Optional title, content, tags  
- **Pin** important notes  
- Delete  

**Cheat tip**  
Use notes for “things to ask in the next prep session” or “confusion to resolve tomorrow.”

---

### G. Reflections / Blog (`/blog`)

**Purpose**  
Turn strong learnings into short technical posts or weekly retrospectives.

**Fields**
- Title, content, excerpt, tags  
- Draft vs **Published** (for a future public profile)

**Suggested rhythm**
- Week 1: Introduce your prep journey  
- Week 2: One concept explained simply  
- Week 3: What you built in the tracker  
- Week 4: Retrospective (what to revise next)

**Cheat tip**  
Write the reflection *after* a session while the takeaway is fresh. One solid post beats many empty ones.

---

### H. Insights (`/insights`)

**Purpose**  
See progress over time from real data.

**Charts**
- Weekly hours (last 8 weeks)  
- Monthly hours + score points (last 6 months)  
- Time by category (pie)

**Cheat tip**  
If a week looks empty, that is signal — schedule Timer blocks, don’t only plan.

---

### I. CSV Export

On **Sessions** page → **Export CSV**  
Downloads all learning sessions for backup, spreadsheets, or sharing a summary with a mentor.

---

## 6. Recommended daily / weekly flow

**Daily (15–90 min)**
1. Open **Timer** → Start  
2. Study (concept + practice)  
3. Stop timer → create **Session** (takeaway + confidence)  
4. If stuck → add **Note** or **Revision** item  
5. Optional: log a **DSA** problem  

**Weekly**
1. Check **Insights**  
2. Clear or triage **Revision** queue  
3. Write one **Reflection**  
4. Export CSV if you want a backup  

---

## 7. How this helps in interviews

You can say:

- “I built a full-stack tracker to structure my prep.”
- “Sessions store duration from real timestamps and a confidence model from Learning to Interview-ready.”
- “Score is derived from time, confidence, and consistency — not vanity metrics.”
- “I used Next.js, TypeScript, Prisma, PostgreSQL, Auth.js, and server actions.”
- “Revision queue is fed from sessions I mark after mocks.”

That is stronger than “I solved 100 LeetCode problems.”

---

## 8. Data model (mental map)

```
User
 ├── LearningSession  (core log + score)
 ├── StudyTimer        (live clock → duration)
 ├── DsaProblem        (status + difficulty)
 ├── RevisionItem      (queue)
 ├── Note              (pinned notes)
 ├── BlogPost          (reflections)
 └── PerformanceLog   (daily aggregates)
```

---

## 9. Quick troubleshooting

| Issue | What to check |
|-------|----------------|
| Register shows error but account exists | Use **Sign in**; redirect was fixed in auth action |
| DB connection failed | Docker running? Port **5433** in `.env` and `docker-compose.yml`? |
| Empty dashboard | Create at least one session (via Timer or form) |
| Charts empty | Need sessions with dates in the last weeks/months |
| Auth secret errors | `AUTH_SECRET` set in `.env` |

---

## 10. One-line philosophy

**One concept at a time. One commit at a time.  
Log what you can do — not only what you read.**

---

*Document version: aligned with v1 of Interview Prep Tracker*  
*Paths: Dashboard, Sessions, Timer, DSA, Revision, Notes, Reflections, Insights*
