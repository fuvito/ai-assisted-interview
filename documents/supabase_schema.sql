create extension if not exists "pgcrypto";

create table if not exists public.subjects (
  id text primary key,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  subject_id text not null references public.subjects(id) on delete restrict,
  question_text text not null,
  expert_answer text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_questions_subject_id on public.questions(subject_id);
create index if not exists idx_questions_created_at on public.questions(created_at);

create table if not exists public.interviews (
  id uuid primary key default gen_random_uuid(),
  subject_id text not null references public.subjects(id) on delete restrict,

  total_questions int not null,
  current_index int not null default 0,

  status text not null default 'in_progress' check (status in ('in_progress', 'completed')),
  created_at timestamptz not null default now(),
  completed_at timestamptz null
);

create index if not exists idx_interviews_subject_id on public.interviews(subject_id);
create index if not exists idx_interviews_status on public.interviews(status);

create table if not exists public.interview_questions (
  interview_id uuid not null references public.interviews(id) on delete cascade,
  position int not null,
  question_id uuid not null references public.questions(id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (interview_id, position),
  unique (interview_id, question_id)
);

create index if not exists idx_interview_questions_interview_id on public.interview_questions(interview_id);
create index if not exists idx_interview_questions_question_id on public.interview_questions(question_id);

create table if not exists public.interview_answers (
  id uuid primary key default gen_random_uuid(),
  interview_id uuid not null references public.interviews(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete restrict,

  answer_text text not null,
  score int not null check (score >= 0 and score <= 100),
  feedback text not null,

  created_at timestamptz not null default now(),
  unique (interview_id, question_id)
);

create index if not exists idx_interview_answers_interview_id on public.interview_answers(interview_id);
create index if not exists idx_interview_answers_question_id on public.interview_answers(question_id);
