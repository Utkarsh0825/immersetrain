-- ============================================================
-- ImmerseTrain Database Schema
-- Run this in Supabase SQL Editor: Dashboard → SQL Editor → New query
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── Scenarios ────────────────────────────────────────────────
create table scenarios (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  video_url text not null,
  thumbnail_url text,
  duration_seconds integer default 120,
  published boolean default true,
  created_at timestamptz default now()
);

-- ── Questions ─────────────────────────────────────────────────
create table questions (
  id uuid primary key default uuid_generate_v4(),
  scenario_id uuid references scenarios(id) on delete cascade,
  timestamp_seconds integer not null,
  question_text text not null,
  option_a text not null,
  option_b text not null,
  correct_option text not null check (correct_option in ('a', 'b')),
  explanation text not null,
  points integer default 10,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- ── Sessions ──────────────────────────────────────────────────
create table sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id text not null,
  user_email text,
  user_name text,
  scenario_id uuid references scenarios(id) on delete cascade,
  score integer default 0,
  max_score integer default 100,
  completed boolean default false,
  started_at timestamptz default now(),
  completed_at timestamptz
);

-- ── Answers ───────────────────────────────────────────────────
create table answers (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid references sessions(id) on delete cascade,
  question_id uuid references questions(id) on delete cascade,
  chosen_option text not null check (chosen_option in ('a', 'b')),
  is_correct boolean not null,
  points_earned integer default 0,
  answered_at timestamptz default now()
);

-- ── Indexes ───────────────────────────────────────────────────
create index idx_sessions_user_id on sessions(user_id);
create index idx_sessions_scenario_id on sessions(scenario_id);
create index idx_answers_session_id on answers(session_id);
create index idx_questions_scenario_id on questions(scenario_id);

-- ── Row Level Security ────────────────────────────────────────
alter table scenarios enable row level security;
alter table questions enable row level security;
alter table sessions enable row level security;
alter table answers enable row level security;

-- Permissive policies for MVP (tighten post-launch)
create policy "Allow all for authenticated" on scenarios for all using (true);
create policy "Allow all for authenticated" on questions for all using (true);
create policy "Allow all for authenticated" on sessions for all using (true);
create policy "Allow all for authenticated" on answers for all using (true);
