-- Phase 1: LMS + CRM extensions (run after 001_initial_schema.sql)

-- ── Extend courses ────────────────────────────────────────────────────────────
alter table public.courses
  add column if not exists colour text not null default '#E8211A',
  add column if not exists pass_mark integer not null default 70 check (pass_mark between 0 and 100);

-- ── Profile details (role-specific fields) ────────────────────────────────────
create table public.profile_details (
  profile_id        uuid primary key references public.profiles (id) on delete cascade,
  phone             text,
  role_title        text,
  organisation      text,
  dbs_status        text not null default 'Not Submitted',
  students_supplied integer not null default 0,
  must_change_pass  boolean not null default false,
  metadata          jsonb not null default '{}',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ── Course modules (video / text / pdf / quiz) ────────────────────────────────
create type public.module_type as enum ('video', 'text', 'pdf', 'quiz');

create table public.course_modules (
  id          uuid primary key default gen_random_uuid(),
  course_id   uuid not null references public.courses (id) on delete cascade,
  sort_order  integer not null default 0,
  module_type public.module_type not null,
  title       text not null,
  duration    text,
  content     jsonb not null default '{}',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index course_modules_course_idx on public.course_modules (course_id, sort_order);

-- ── Per-user module progress ──────────────────────────────────────────────────
create table public.module_progress (
  id               uuid primary key default gen_random_uuid(),
  profile_id       uuid not null references public.profiles (id) on delete cascade,
  course_id        uuid not null references public.courses (id) on delete cascade,
  module_id        uuid not null references public.course_modules (id) on delete cascade,
  completed        boolean not null default false,
  quiz_score       integer,
  completed_at     timestamptz,
  last_active_at   timestamptz not null default now(),
  unique (profile_id, module_id)
);

create index module_progress_profile_course_idx
  on public.module_progress (profile_id, course_id);

-- ── Extend enrollments ────────────────────────────────────────────────────────
alter table public.enrollments
  add column if not exists completed boolean not null default false,
  add column if not exists completed_at timestamptz,
  add column if not exists started_at timestamptz not null default now();

-- Allow employees on enrollments (not only students)
alter table public.enrollments rename column student_id to profile_id;

-- ── Documents (metadata; files in Supabase Storage) ─────────────────────────
create table public.documents (
  id           uuid primary key default gen_random_uuid(),
  profile_id   uuid not null references public.profiles (id) on delete cascade,
  application_id uuid references public.applications (id) on delete set null,
  doc_type     text not null,
  file_name    text not null,
  storage_path text not null,
  mime_type    text,
  file_size    integer,
  status       text not null default 'pending',
  uploaded_at  timestamptz not null default now()
);

create index documents_profile_idx on public.documents (profile_id);

-- ── DBS compliance queue ──────────────────────────────────────────────────────
create table public.dbs_checks (
  id              uuid primary key default gen_random_uuid(),
  profile_id      uuid not null references public.profiles (id) on delete cascade,
  role_title      text,
  stage           text not null default 'Data Submitted',
  submitted_at    date,
  est_clearance   date,
  certificate_url text,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index dbs_checks_profile_idx on public.dbs_checks (profile_id);

-- ── Auto-create profile_details on new profile ──────────────────────────────
create or replace function public.handle_new_profile_details()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profile_details (profile_id)
  values (new.id)
  on conflict (profile_id) do nothing;
  return new;
end;
$$;

create trigger on_profile_created_details
  after insert on public.profiles
  for each row execute function public.handle_new_profile_details();

-- Backfill details for existing profiles
insert into public.profile_details (profile_id)
select id from public.profiles
on conflict (profile_id) do nothing;

-- ── Updated_at triggers ───────────────────────────────────────────────────────
create trigger profile_details_updated_at before update on public.profile_details
  for each row execute function public.set_updated_at();
create trigger course_modules_updated_at before update on public.course_modules
  for each row execute function public.set_updated_at();
create trigger dbs_checks_updated_at before update on public.dbs_checks
  for each row execute function public.set_updated_at();

-- ── Row Level Security ────────────────────────────────────────────────────────
alter table public.profile_details enable row level security;
alter table public.course_modules enable row level security;
alter table public.module_progress enable row level security;
alter table public.documents enable row level security;
alter table public.dbs_checks enable row level security;

-- profile_details
create policy "Users read own details"
  on public.profile_details for select using (auth.uid() = profile_id);

create policy "Staff read all details"
  on public.profile_details for select
  using (public.get_user_role() in ('admin', 'employee'));

create policy "Admins manage details"
  on public.profile_details for all
  using (public.get_user_role() = 'admin');

create policy "Users update own limited details"
  on public.profile_details for update
  using (auth.uid() = profile_id);

-- course_modules
create policy "Authenticated read modules for accessible courses"
  on public.course_modules for select
  using (
    exists (
      select 1 from public.courses c
      where c.id = course_modules.course_id
        and (c.published = true or public.get_user_role() in ('admin', 'employee'))
    )
  );

create policy "Staff manage modules"
  on public.course_modules for all
  using (public.get_user_role() in ('admin', 'employee'));

-- module_progress
create policy "Users read own progress"
  on public.module_progress for select using (auth.uid() = profile_id);

create policy "Staff read all progress"
  on public.module_progress for select
  using (public.get_user_role() in ('admin', 'employee'));

create policy "Users update own progress"
  on public.module_progress for insert
  with check (auth.uid() = profile_id);

create policy "Users patch own progress"
  on public.module_progress for update
  using (auth.uid() = profile_id);

create policy "Staff manage progress"
  on public.module_progress for all
  using (public.get_user_role() in ('admin', 'employee'));

-- documents
create policy "Users read own documents"
  on public.documents for select using (auth.uid() = profile_id);

create policy "Staff read all documents"
  on public.documents for select
  using (public.get_user_role() in ('admin', 'employee'));

create policy "Users upload own documents"
  on public.documents for insert
  with check (auth.uid() = profile_id);

create policy "Staff manage documents"
  on public.documents for all
  using (public.get_user_role() in ('admin', 'employee'));

-- dbs_checks
create policy "Users read own dbs"
  on public.dbs_checks for select using (auth.uid() = profile_id);

create policy "Staff read all dbs"
  on public.dbs_checks for select
  using (public.get_user_role() in ('admin', 'employee'));

create policy "Staff manage dbs"
  on public.dbs_checks for all
  using (public.get_user_role() in ('admin', 'employee'));

-- enrollments: update policies for renamed column
drop policy if exists "Students read own enrollments" on public.enrollments;
drop policy if exists "Staff read all enrollments" on public.enrollments;
drop policy if exists "Staff manage enrollments" on public.enrollments;

create policy "Users read own enrollments"
  on public.enrollments for select using (auth.uid() = profile_id);

create policy "Staff read all enrollments"
  on public.enrollments for select
  using (public.get_user_role() in ('admin', 'employee'));

create policy "Staff manage enrollments"
  on public.enrollments for all
  using (public.get_user_role() in ('admin', 'employee'));
