-- JNTUH Hub — auth (hall-ticket users) + interaction events (learning loop)
-- Run after 0001_schema.sql.

-- ------------------------------------------------------------------- users
-- Hall ticket number IS the username. Password hashes live here and are only
-- ever touched by the service-role key (server code) — RLS denies the anon
-- key everything, so hashes can never leak to the browser.
create table users (
  hall_ticket    text primary key check (hall_ticket ~ '^[0-9A-Z]{10}$'),
  name           text not null check (char_length(name) between 2 and 80),
  password_hash  text not null,
  college        text,
  branch_id      uuid references branches(id) on delete set null,
  regulation_id  uuid references regulations(id) on delete set null,
  year           int  check (year between 1 and 4),
  semester       int  check (semester between 1 and 2),
  role           text not null default 'student' check (role in ('student','admin')),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

alter table users enable row level security;
-- no select/insert/update/delete policies ⇒ the anon key is fully locked out;
-- server code uses the service role (SUPABASE_SERVICE_ROLE_KEY) which bypasses RLS.

-- ------------------------------------------------------------------ events
-- Interaction telemetry that re-ranks resources (clicks, votes) and records
-- searches. Anonymous allowed; logged-in events carry the hall ticket.
create table events (
  id           uuid primary key default gen_random_uuid(),
  "user"       text,                 -- hall ticket or null (anonymous)
  kind         text not null check (kind in ('search','click','up','down')),
  subject_id   text,                 -- slug id; loose FK since seeds may be local
  resource_id  text,
  query        text,
  created_at   timestamptz not null default now()
);
create index events_resource_idx on events (resource_id, kind);
create index events_subject_idx  on events (subject_id, kind, created_at desc);

alter table events enable row level security;
-- anyone may append events; nobody can read them back via the anon key
create policy "append events" on events for insert with check (kind in ('search','click','up','down'));
