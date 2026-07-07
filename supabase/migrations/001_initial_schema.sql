-- Nexusyl portal schema — run in Supabase SQL Editor or via CLI

create type public.user_role as enum ('admin', 'employee', 'student', 'supplier');

-- ── Profiles (extends auth.users) ───────────────────────────────────────────
create table public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text not null,
  full_name  text not null,
  role       public.user_role not null default 'student',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_role_idx on public.profiles (role);
create index profiles_email_idx on public.profiles (email);

-- ── LMS ───────────────────────────────────────────────────────────────────────
create table public.courses (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  description    text,
  category       text,
  duration_hours integer,
  published      boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table public.enrollments (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid not null references public.profiles (id) on delete cascade,
  course_id   uuid not null references public.courses (id) on delete cascade,
  status      text not null default 'active',
  progress    integer not null default 0 check (progress between 0 and 100),
  enrolled_at timestamptz not null default now(),
  unique (student_id, course_id)
);

-- ── CRM / portal records ──────────────────────────────────────────────────────
create table public.applications (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid references public.profiles (id) on delete set null,
  assigned_to uuid references public.profiles (id) on delete set null,
  type        text not null,
  status      text not null default 'pending',
  title       text not null,
  notes       text,
  metadata    jsonb not null default '{}',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── Helpers ───────────────────────────────────────────────────────────────────
create or replace function public.get_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data ->> 'role')::public.user_role, 'student')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger courses_updated_at before update on public.courses
  for each row execute function public.set_updated_at();
create trigger applications_updated_at before update on public.applications
  for each row execute function public.set_updated_at();

-- ── Row Level Security ────────────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.enrollments enable row level security;
alter table public.applications enable row level security;

-- profiles
create policy "Users read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Admins read all profiles"
  on public.profiles for select
  using (public.get_user_role() = 'admin');

create policy "Employees read student profiles"
  on public.profiles for select
  using (
    public.get_user_role() = 'employee'
    and role in ('student', 'employee')
  );

create policy "Admins manage profiles"
  on public.profiles for all
  using (public.get_user_role() = 'admin');

-- courses
create policy "Authenticated users read published courses"
  on public.courses for select
  using (auth.role() = 'authenticated' and (published = true or public.get_user_role() in ('admin', 'employee')));

create policy "Admins and employees manage courses"
  on public.courses for all
  using (public.get_user_role() in ('admin', 'employee'));

-- enrollments
create policy "Students read own enrollments"
  on public.enrollments for select
  using (auth.uid() = student_id);

create policy "Staff read all enrollments"
  on public.enrollments for select
  using (public.get_user_role() in ('admin', 'employee'));

create policy "Staff manage enrollments"
  on public.enrollments for all
  using (public.get_user_role() in ('admin', 'employee'));

-- applications
create policy "Students read own applications"
  on public.applications for select
  using (auth.uid() = student_id);

create policy "Suppliers read assigned applications"
  on public.applications for select
  using (auth.uid() = assigned_to);

create policy "Staff read all applications"
  on public.applications for select
  using (public.get_user_role() in ('admin', 'employee'));

create policy "Staff manage applications"
  on public.applications for all
  using (public.get_user_role() in ('admin', 'employee'));

create policy "Students create own applications"
  on public.applications for insert
  with check (auth.uid() = student_id and public.get_user_role() = 'student');
