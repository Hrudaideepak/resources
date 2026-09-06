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
  src/data/units.ts      official R22 unit titles + topics — 31 theory subjects × 5 units (155 rows)
  src/data/resources.ts  seed resources (official PDFs + well-known public references)
  src/lib/types.ts       the academic data model
  src/lib/repo.ts        data access — Supabase if configured, otherwise local seed data
  src/lib/search.ts      query understanding + topic search: "normalization notes" → DBMS · Unit 3
  src/app/               pages: home, /{college}/{reg}/{branch}/{y}-{s}, /subject/{slug}, /search, /submit
  src/lib/auth.ts        JWT sessions (jose) + bcrypt, hall-ticket usernames, admin bootstrap
  src/lib/users.ts       user store (Supabase service-role or .data/users.json)
  src/lib/events.ts      interaction telemetry → popularity boost + trending
  src/lib/ai.ts          grounded subject assistant (OpenAI or honest offline fallback)
  src/lib/discover.ts    discovery agent: open-web connectors → taxonomy classifier → pending queue
  scripts/gen-seed-sql.ts  emits supabase/seed.sql from src/data so DB and local data never drift
  scripts/discover.ts    discovery CLI (+ --selftest classifier fixtures)
  scripts/verify.ts      end-to-end self-checks (npm run verify)
supabase/
  migrations/0001_schema.sql   core schema + RLS (public read, anonymous submit → pending)
  migrations/0002_users_events.sql  users (RLS-locked) + events (insert-only)
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

- **Accounts & profiles** — your **hall ticket number is your username**; bcrypt passwords, JWT session cookie.
  Profile: name, college, regulation, branch, year, semester → drives all personalization.
- **"My Semester"** — logged-in students get their subjects pinned to the homepage.
- **Personalized, self-improving search** — results biased to your regulation/branch; 👍/👎 votes and clicks
  re-rank resources automatically (`score + clamp(-25..25, clicks + 4·up − 6·down)`); trending strip learns from
  what students actually open.
- **Topic search** — syllabus unit topics are searchable: `normalization notes` finds
  *DBMS → Unit 3* even though no subject is named "normalization"; explicit `dbms unit 3 important questions`
  and `cn pyq r22` still just work.
- **🤖 AI subject assistant** (per subject, login-gated) — with `OPENAI_API_KEY`, answers grounded strictly in the
  official syllabus units + indexed resources with citations; without a key, an honest offline syllabus mapping.
  Every question is logged as interaction data.
- **Discovery agent** — scans YouTube, GitHub and the open web per subject (least-covered first), auto-classifies
  into the taxonomy, queues everything **pending**; moderators approve at `/admin` (admin = hall ticket in
  `ADMIN_HALL_TICKETS`). Run manually: `npm run discover`; self-test the classifier: `npm run discover -- --selftest`.
- Semester picker, unit-level course outlines, type/unit filters, link-only submission with dedupe.
- `npm run verify` — 19 self-checks for auth, JWT, ranking boost, moderation queue and the offline AI path.

## What V1 deliberately does NOT do

No Telegram/WhatsApp scraping, no re-hosted files, no self-modifying code (autonomy = discovery pipeline +
interaction-driven ranking, both human-gated), no mobile app. See `docs/ARCHITECTURE.md` for the roadmap.
