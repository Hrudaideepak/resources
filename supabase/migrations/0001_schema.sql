-- JNTUH Resource Hub — V1 schema
-- Hierarchy: college → regulation → program → branch → subject (year/sem) → unit → resource
-- Run in Supabase SQL editor or via `supabase db push`.

create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";      -- fuzzy text search
create extension if not exists "unaccent";

-- ---------------------------------------------------------------- colleges
create type college_type as enum ('university', 'constituent', 'affiliated');

create table colleges (
  id                         uuid primary key default gen_random_uuid(),
  slug                       text unique not null,
  name                       text not null,
  short_name                 text not null,
  type                       college_type not null,
  is_autonomous              boolean not null default false,
  follows_university_syllabus boolean not null default true,
  website                    text,
  created_at                 timestamptz not null default now()
);

-- ------------------------------------------------------------- regulations
create table regulations (
  id                    uuid primary key default gen_random_uuid(),
  slug                  text not null,
  name                  text not null,
  owner_college_id      uuid not null references colleges(id) on delete cascade,
  applicable_from_year  int  not null,
  source_url            text,
  unique (owner_college_id, slug)
);

-- ---------------------------------------------------------------- programs
create table programs (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,
  name            text not null,
  duration_years  int not null default 4
);

-- ---------------------------------------------------------------- branches
create table branches (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null,
  code        text not null,
  name        text not null,
  program_id  uuid not null references programs(id) on delete cascade,
  unique (program_id, slug)
);

-- ---------------------------------------------------------------- subjects
create type subject_kind as enum ('theory', 'lab', 'project', 'mandatory', 'skill');

create table subjects (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,
  code            text,
  name            text not null,
  short_name      text,
  regulation_id   uuid not null references regulations(id) on delete cascade,
  branch_id       uuid not null references branches(id) on delete cascade,
  year            int not null check (year between 1 and 4),
  semester        int not null check (semester between 1 and 2),
  kind            subject_kind not null default 'theory',
  credits         numeric(3,1),
  elective_group  text,
  aliases         text[] not null default '{}',
  created_at      timestamptz not null default now()
);
create index subjects_reg_branch_sem_idx on subjects (regulation_id, branch_id, year, semester);
create index subjects_name_trgm_idx on subjects using gin (name gin_trgm_ops);

-- ------------------------------------------------------------------- units
create table units (
  id           uuid primary key default gen_random_uuid(),
  subject_id   uuid not null references subjects(id) on delete cascade,
  unit_number  int not null check (unit_number between 1 and 8),
  title        text not null,
  topics       text,
  unique (subject_id, unit_number)
);

-- --------------------------------------------------------------- resources
create type resource_type   as enum ('notes','question_paper','syllabus','video','website','textbook','lab','important_questions');
create type resource_source as enum ('jntuh','college','youtube','website','github','telegram_public','user');
create type resource_status as enum ('pending','approved','rejected');

create table resources (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  url           text not null,
  url_hash      text generated always as (md5(lower(url))) stored,
  type          resource_type not null,
  source        resource_source not null default 'user',
  subject_id    uuid not null references subjects(id) on delete cascade,
  unit_number   int check (unit_number between 1 and 8),
  description   text,
  language      text not null default 'en',
  status        resource_status not null default 'pending',
  score         int not null default 50 check (score between 0 and 100),
  submitted_by  text,
  created_at    timestamptz not null default now(),
  -- one URL per subject (dedupe). Same link may legitimately serve 2 subjects.
  unique (subject_id, url_hash)
);
create index resources_subject_status_idx on resources (subject_id, status, type);
create index resources_title_trgm_idx on resources using gin (title gin_trgm_ops);

-- --------------------------------------------------------------- search view
-- Flat, denormalised row per subject for the search box / semester pages.
create view subject_search as
select
  s.id, s.slug, s.code, s.name, s.short_name, s.year, s.semester, s.kind,
  s.credits, s.elective_group, s.aliases,
  r.slug  as regulation_slug, r.name as regulation_name,
  b.slug  as branch_slug,     b.code as branch_code,
  c.slug  as college_slug,
  (select count(*) from resources x where x.subject_id = s.id and x.status = 'approved') as resource_count
from subjects s
join regulations r on r.id = s.regulation_id
join colleges    c on c.id = r.owner_college_id
join branches    b on b.id = s.branch_id;

-- ---------------------------------------------------------------------- RLS
alter table colleges    enable row level security;
alter table regulations enable row level security;
alter table programs    enable row level security;
alter table branches    enable row level security;
alter table subjects    enable row level security;
alter table units       enable row level security;
alter table resources   enable row level security;

create policy "public read"   on colleges    for select using (true);
create policy "public read"   on regulations for select using (true);
create policy "public read"   on programs    for select using (true);
create policy "public read"   on branches    for select using (true);
create policy "public read"   on subjects    for select using (true);
create policy "public read"   on units       for select using (true);
-- anyone can see approved resources; anyone can submit (lands as 'pending')
create policy "read approved" on resources for select using (status = 'approved');
create policy "anon submit"   on resources for insert with check (status = 'pending' and source = 'user');
