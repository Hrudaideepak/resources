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
arrays plus a JSON file for submissions.

## Phases

| Phase | Scope | Status |
| --- | --- | --- |
| 1 Product architecture | this doc, types, schema | ✅ |
| 2 Academic database | JNTUH R22 + R25 CSE, 144 subjects · unit titles + topics for all 28 R22 core theory subjects (140 units) | ✅ |
| 3 Website | home, semester, subject (unit-level browsing), search, submit | ✅ |
| 4 Submission + moderation | submit ✅ · moderator UI + auth | ⏳ |
| 5 Discovery + ingestion | connectors: college sites, YouTube, GitHub; AI classification into the taxonomy | ⏳ |
| 6 Search engine | topic → unit inference ✅ · pg_trgm + pgvector hybrid, ranking model | ⏳ |
| 7 AI / RAG | subject assistant grounded on syllabus + indexed resources | ⏳ |
| 8 Scale | more branches (ECE, IT, CSM…), autonomous colleges, other universities | ⏳ |

## Immediate next steps

1. Moderator page (`/admin`) with Supabase Auth to approve/reject pending resources.
2. Add branches: IT, ECE, CSM (AI&ML), CSD — the seed format makes this a copy of the course-structure table.
3. Syllabus-match scoring: use `units.topics` to score how well each resource covers a unit (`Resource Score = relevance + syllabus_match + unit_match + rating + freshness + source_quality`).
4. First connector: YouTube Data API search per subject, auto-tagged, landing as `pending`.
5. R25 units once JNTUH publishes the detailed R25 CSE syllabus (currently only the course structure PDF exists).
