create extension if not exists "pgcrypto";

-- Admin allowlist (maps Supabase Auth user IDs to admin capability)
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

-- Only allow admins to view admin list (and only their own row)
create policy if not exists "admin_users_select_self"
  on public.admin_users
  for select
  to authenticated
  using (user_id = auth.uid());

-- Do not allow clients to insert/update/delete admin_users via RLS.
-- Manage this table manually from SQL editor (service role) to promote admins.

-- Content tables: public reads, admin writes
alter table public.subjects enable row level security;
alter table public.questions enable row level security;

create policy if not exists "subjects_public_read"
  on public.subjects
  for select
  to anon, authenticated
  using (true);

create policy if not exists "subjects_admin_write"
  on public.subjects
  for insert
  to authenticated
  with check (exists (select 1 from public.admin_users au where au.user_id = auth.uid()));

create policy if not exists "subjects_admin_update"
  on public.subjects
  for update
  to authenticated
  using (exists (select 1 from public.admin_users au where au.user_id = auth.uid()))
  with check (exists (select 1 from public.admin_users au where au.user_id = auth.uid()));

create policy if not exists "subjects_admin_delete"
  on public.subjects
  for delete
  to authenticated
  using (exists (select 1 from public.admin_users au where au.user_id = auth.uid()));

create policy if not exists "questions_public_read"
  on public.questions
  for select
  to anon, authenticated
  using (true);

create policy if not exists "questions_admin_write"
  on public.questions
  for insert
  to authenticated
  with check (exists (select 1 from public.admin_users au where au.user_id = auth.uid()));

create policy if not exists "questions_admin_update"
  on public.questions
  for update
  to authenticated
  using (exists (select 1 from public.admin_users au where au.user_id = auth.uid()))
  with check (exists (select 1 from public.admin_users au where au.user_id = auth.uid()));

create policy if not exists "questions_admin_delete"
  on public.questions
  for delete
  to authenticated
  using (exists (select 1 from public.admin_users au where au.user_id = auth.uid()));

-- Interview tables: only the backend should write. If you later add end-user auth,
-- you can extend these policies to link interviews to auth.uid().
alter table public.interviews enable row level security;
alter table public.interview_questions enable row level security;
alter table public.interview_answers enable row level security;

-- Default: deny all for clients (no policies).
