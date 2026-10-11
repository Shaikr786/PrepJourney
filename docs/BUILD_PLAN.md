# PrepJourney — build plan (next iterations)

## A. Timer (done in this package)

- [x] Global green **floating bar** on all dashboard pages while timer runs
- [x] Live elapsed time on the bar
- [x] **Stop & save session** → opens session form with duration + topic filled
- [x] **Stop only** without creating a session
- [x] Hide bar without stopping (timer keeps running in DB)
- [x] Padding on main content so bar does not cover page content

## B. Skills & tech stack (next — confirmed concept)

1. **Skill model** — name, type (TECH / TOOL / SOFT / DOMAIN), level 1–5, last practiced  
2. **Skills page** — add/edit skills, see “tapped” from sessions  
3. **Tech stack** on dashboard/profile from categories + skills  
4. **Suggestions** — gaps (e.g. no soft skills lately, high hours low level)  
5. **Resume readiness** metric (coverage + depth + recent practice)  
6. **Brazil app** — only after you share name/URL/API (link or real integration)

## C. Optional polish later

- Link uploads to session automatically after create  
- Year selector on contribution calendar  
- Export skills for resume bullet points  

---

**Morning checklist for you**

1. Unzip package, `npm install`, `npx prisma db push`, `npm run dev`  
2. Start timer → leave to Sessions / Files → confirm green bar  
3. Stop & save session → form opens with minutes filled → save  
4. Confirm Skills build (B) or adjust rules before we code it  
