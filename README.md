# JNTUH Hub — one academic search engine for JNTUH students

> College → Regulation → Branch → Year → Semester → Subject → Unit → Resource

Instead of hunting through Google, YouTube, Telegram and WhatsApp for "the DBMS unit 3 PDF", students pick their
semester once and get every subject with ranked notes, previous papers, syllabus, videos and links — or just search
`dbms unit 3 important questions`.

**We index and link. We don't re-host.** Every resource is a URL + metadata, attributed to its source.

## Repo layout

```
web/                     Next.js 15 (App Router, TS, Tailwind 4) — the product
  src/data/academic.ts   canonical taxonomy: JNTUH R22 + R25 B.Tech CSE, all 8 semesters (144 subjects)
  src/data/resources.ts  seed resources (official PDFs + well-known public references)
  src/lib/types.ts       the academic data model
  src/lib/repo.ts        data access — Supabase if configured, otherwise local seed data
  src/lib/search.ts      query understanding: "cn unit 3 pyq" → subject + unit + type
  src/app/               pages: home, /{college}/{reg}/{branch}/{y}-{s}, /subject/{slug}, /search, /submit
  scripts/gen-seed-sql.ts  emits supabase/seed.sql from src/data so DB and local data never drift
supabase/
  migrations/0001_schema.sql   Postgres schema + RLS (public read, anonymous submit → pending)
  seed.sql                     generated
docs/
  ARCHITECTURE.md        product & technical design, phases, decisions
```

## Run it

```bash
cd web
npm install
npm run dev          # http://localhost:3000 — works with zero config (local seed data)
```

To use Supabase: create a project, run `supabase/migrations/0001_schema.sql` then `supabase/seed.sql` in the SQL
editor, copy `web/.env.example` → `web/.env.local` and fill in the URL + anon key. Submissions then land as
`pending` for moderation (in local mode they're auto-approved into `web/.data/submissions.json`).

After editing `src/data/*.ts`, regenerate the SQL: `npm run seed:sql`.

## What V1 does

- Semester picker (remembered in the browser → "My semester")
- Semester page grouped by theory / labs / skill / project / mandatory, with course codes and credits
- Subject page: resources grouped by type, filter by type and unit, ranked by score
- Search with query understanding (subject aliases & acronyms, unit numbers, resource type, regulation, `3-1`)
- Resource submission form (link-only, deduped per subject)

## What V1 deliberately does NOT do

No crawler, no Telegram/WhatsApp, no AI, no auth, no mobile app. See `docs/ARCHITECTURE.md` for the roadmap.
