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
  score int not null check (score >= 0 and score <= 10),
  feedback text not null,

  created_at timestamptz not null default now(),
  unique (interview_id, question_id)
);

alter table public.interview_answers
  drop constraint if exists interview_answers_score_check;

alter table public.interview_answers
  add constraint interview_answers_score_check check (score >= 0 and score <= 10);

create index if not exists idx_interview_answers_interview_id on public.interview_answers(interview_id);
create index if not exists idx_interview_answers_question_id on public.interview_answers(question_id);

create table if not exists public.user_daily_quota (
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null,
  questions_used int not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, day)
);

create index if not exists idx_user_daily_quota_user_id on public.user_daily_quota(user_id);
create index if not exists idx_user_daily_quota_day on public.user_daily_quota(day);

create or replace function public.reserve_daily_questions(
  p_user_id uuid,
  p_count int,
  p_limit int
)
returns table (allowed boolean, used int, remaining int, quota_limit int)
language plpgsql
as $$
declare
  v_day date := (now() at time zone 'utc')::date;
  v_used int;
begin
  if p_count is null or p_count <= 0 then
    raise exception 'p_count must be > 0';
  end if;

  if p_limit is null or p_limit <= 0 then
    raise exception 'p_limit must be > 0';
  end if;

  if exists (select 1 from public.admin_users au where au.user_id = p_user_id) then
    allowed := true;
    used := 0;
    remaining := p_limit;
    quota_limit := p_limit;
    return next;
    return;
  end if;

  insert into public.user_daily_quota (user_id, day, questions_used)
  values (p_user_id, v_day, 0)
  on conflict (user_id, day) do nothing;

  select q.questions_used
  into v_used
  from public.user_daily_quota q
  where q.user_id = p_user_id and q.day = v_day
  for update;

  if v_used + p_count > p_limit then
    allowed := false;
    used := v_used;
    remaining := greatest(0, p_limit - v_used);
    quota_limit := p_limit;
    return next;
    return;
  end if;

  update public.user_daily_quota
  set questions_used = v_used + p_count,
      updated_at = now()
  where user_id = p_user_id and day = v_day;

  allowed := true;
  used := v_used + p_count;
  remaining := greatest(0, p_limit - (v_used + p_count));
  quota_limit := p_limit;
  return next;
end;
$$;
