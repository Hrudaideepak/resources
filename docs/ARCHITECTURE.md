# Architecture

## Product

"One academic search engine for JNTUH students." The resource database is the product; search (and later AI)
is the interface on top of it.

## Canonical academic model

```
College ──owns──▶ Regulation ──▶ Subject (branch, year, semester, kind, code, aliases) ──▶ Unit ──▶ Resource
Program ──▶ Branch ─────────────────▲
```

Key decisions:

- **Regulations are owned by a college.** JNTUH owns R22/R25; an autonomous college (e.g. CBIT) owns its own R22.
  Non-autonomous colleges set `follows_university_syllabus = true` and simply reuse JNTUH's regulations.
  This is what makes autonomous colleges pluggable without duplicating the JNTUH tree.
- **Subjects carry `aliases`.** Students search "flat", "mfcs", "java", "m1". Aliases + generated acronyms
  (`Design and Analysis of Algorithms` → `daa`) drive search. Electives store their option lists as aliases.
- **Resources are metadata + URL only.** `url_hash` + `subject_id` is unique → dedupe. Files are never re-hosted.
- **Everything is slug-addressable**: `/jntuh/r22/cse/3-1`, `/subject/r22-cse-3-1-computer-networks`.
- **Seed data lives in TypeScript** and generates SQL. Same data powers the no-DB local mode, so the app runs
  anywhere with zero configuration and the DB can never drift from the code.

## Search (V1)

Rule-based query understanding in `web/src/lib/search.ts`:

1. Extract `unit N` / `unit III`, regulation (`r22`), year-sem (`3-1`), resource type (pyq, notes, lab, video…).
2. Remaining words are matched against subject code, short name, acronym, name, aliases (exact → contains → word
   coverage) and scored 0–100.
3. Best match shows its filtered resources inline; other matches listed below.

Upgrade path (same interface): `pg_trgm` for typos → `pgvector` embeddings of resource text → hybrid ranking:
`relevance + syllabus_match + unit_match + votes + freshness + source_quality`.

## Data access

`web/src/lib/repo.ts` is the only module that knows about storage. If `NEXT_PUBLIC_SUPABASE_URL` is set it uses
Supabase (RLS: public read of approved rows; anonymous insert only with `status='pending'`), otherwise the seed
arrays plus JSON files under `.data/`. `getSupabaseAdmin()` (service-role key) is used exclusively for the `users`
table and moderation writes — password hashes never go near the anon key.

## Auth, profile & personalization

- **Hall ticket number IS the username** (`/^[0-9A-Z]{10}$/`, e.g. `22A81A0501`). Passwords are bcrypt-hashed
  (cost 10); sessions are HS256 JWTs (`jose`) in an httpOnly cookie, 7-day expiry. Admins are bootstrapped via
  `ADMIN_HALL_TICKETS`. `/profile` collects college, regulation, branch, year and semester — the inputs to all
  personalization. `middleware.ts` guards `/profile` and `/admin` (role-checked).
- **Personalization**: home renders a "My semester" section from the profile; search boosts the student's own
  regulation+branch; the AI assistant answers in the context of *their* regulation's syllabus.
- Rate limiting: naive per-key in-memory limiter on login/signup (documented, per-instance).

## The learning loop ("self-improving" engine)

The engine improves from real usage — no opaque magic:

1. **Interaction events** (`/api/events`): searches, resource clicks, 👍/👎 votes, AI questions — appended to
   `events` (RLS: insert-only; never publicly readable).
2. **Re-ranking**: `score_effective = score_seeded + clamp(-25..25, clicks×1 + ups×4 − downs×6)` applied at read
   time in `repo.getSubjectResources`. Community consensus re-orders every listing automatically.
3. **Discovery agent** (`lib/discover.ts`, `POST /admin` run button, or `npm run discover`): scans YouTube,
   GitHub and the open web for each subject (least-covered subjects first), classifies candidates into the
   taxonomy (subject via short-name/acronym/alias/name-word evidence with lab-vs-theory and regulation
   tie-breaking; unit via topic matching; type via URL/title rules), and queues them **pending** — a moderator
   approves before anything goes public. Requires outbound network (Vercel/cron); offline it returns zero and
   says so. AI classification of free text is the V2 upgrade for the same interface.
4. **AI assistant** (`/api/ai/ask`, per subject): with `OPENAI_API_KEY`, answers are grounded strictly in the
   subject's syllabus units + indexed resources (RAG-lite, 0.3 temperature, citations = the resource links).
   Without a key it returns an honest offline syllabus mapping — never a hallucinated answer. Login required;
   questions are logged as interaction events, closing the loop back into step 1.

Not self-modifying code, by design: autonomy = discovery pipeline + interaction-driven ranking, both gated by
deterministic rules and human moderation.

## Phases

| Phase | Scope | Status |
| --- | --- | --- |
| 1 Product architecture | this doc, types, schema | ✅ |
| 2 Academic database | JNTUH R22 + R25 CSE, 144 subjects · unit titles + topics for all R22 core theory subjects (155 units) | ✅ |
| 3 Website | home, semester, subject (unit-level browsing), search, submit | ✅ + personalized "My semester" |
| 4 Submission + moderation | submit ✅ · hall-ticket JWT auth ✅ · moderator queue `/admin` ✅ | ✅ |
| 5 Discovery + ingestion | connectors: YouTube (API or scrape), GitHub, DuckDuckGo · deterministic taxonomy classifier · pending queue | 🟡 MVP (needs network; AI classify is V2) |
| 6 Search engine | query understanding + topic search + personalization bias + interaction-driven re-ranking | 🟡 pg_trgm/pgvector hybrid next |
| 7 AI / RAG | subject assistant grounded on syllabus + resources (OpenAI when keyed, honest offline fallback) | 🟡 MVP |
| 8 Scale | more branches (ECE, IT, CSM…), autonomous colleges, other universities | ⏳ |

## Immediate next steps

1. Add branches: IT, ECE, CSM (AI&ML), CSD — the seed format makes this a copy of the course-structure table.
2. Syllabus-match scoring: use `units.topics` to score how well each resource covers a unit (`Resource Score = relevance + syllabus_match + unit_match + rating + freshness + source_quality`).
3. AI classification in the discovery loop (replace/augment the rule-based classifier when `OPENAI_API_KEY` is set).
4. Schedule discovery (Vercel cron → `npm run discover -- --limit=25`) once deployed with outbound network.
5. R25 units once JNTUH publishes the detailed R25 CSE syllabus (currently only the course structure PDF exists).
6. Contributor gamification (badges/leaderboard from `events` + `submitted_by`).
