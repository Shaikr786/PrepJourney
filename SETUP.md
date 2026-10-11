# Interview Prep Tracker — Setup Guide

## Prerequisites
- Node.js 20 or higher
- Docker Desktop (for PostgreSQL)

## Step-by-step

### 1. Extract & enter the project
```bash
cd interview-prep-tracker
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start PostgreSQL
```bash
docker compose up -d
```

### 4. Environment file
```bash
cp .env.example .env
```
Generate a secret:
```bash
openssl rand -base64 32
```
Paste the value into `.env` as `AUTH_SECRET=...`

### 5. Database
```bash
npx prisma db push
npx prisma generate
```

### 6. Run
```bash
npm run dev
```
Open http://localhost:3000 → Register → start using the dashboard.

## Features available
- Learning Sessions (CRUD + scoring)
- Study Timer (real timestamps)
- DSA Problem Tracker
- Revision Queue
- Notes
- Reflections / Blog
- Insights charts
- CSV export

## Commands
| Command | Purpose |
|---------|---------|
| npm run dev | Start app |
| npx prisma studio | DB GUI |
| docker compose up -d | Start DB |
| docker compose down | Stop DB |
