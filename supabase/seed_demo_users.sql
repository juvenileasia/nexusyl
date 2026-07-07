-- Demo auth users — run in Supabase → SQL Editor
-- Requires: 001_initial_schema.sql already applied (profiles trigger)
-- Creates login accounts from seed.sql lines 4–8

create extension if not exists "pgcrypto";

-- Helper: create one email/password user with role metadata
create or replace function public.seed_demo_user(
  p_email text,
  p_password text,
  p_full_name text,
  p_role public.user_role
)
returns void
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
declare
  v_user_id uuid := gen_random_uuid();
begin
  if exists (select 1 from auth.users where email = p_email) then
    raise notice 'User already exists: %', p_email;
    return;
  end if;

  insert into auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) values (
    '00000000-0000-0000-0000-000000000000',
    v_user_id,
    'authenticated',
    'authenticated',
    p_email,
    extensions.crypt(p_password, extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', p_full_name, 'role', p_role::text),
    now(),
    now(),
    '',
    '',
    '',
    ''
  );

  insert into auth.identities (
    id,
    user_id,
    provider_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  ) values (
    gen_random_uuid(),
    v_user_id,
    v_user_id::text,
    jsonb_build_object('sub', v_user_id::text, 'email', p_email),
    'email',
    now(),
    now(),
    now()
  );

  raise notice 'Created user: % (%)', p_email, p_role;
end;
$$;

-- ── Demo accounts ─────────────────────────────────────────────────────────────
select public.seed_demo_user('admin@nexusyl.co.uk',          'nexusyl2026',  'Nexusyl Admin',          'admin');
select public.seed_demo_user('sarah.thompson@nexusyl.co.uk', 'employee2026', 'Sarah Thompson',         'employee');
select public.seed_demo_user('jordan.singh@student.ac.uk',   'student2026',  'Jordan Singh',           'student');
select public.seed_demo_user('contact@globaltalent.co.uk',   'supplier2026', 'Global Talent Partners', 'supplier');

-- Verify
select p.email, p.full_name, p.role
from public.profiles p
where p.email in (
  'admin@nexusyl.co.uk',
  'sarah.thompson@nexusyl.co.uk',
  'jordan.singh@student.ac.uk',
  'contact@globaltalent.co.uk'
)
order by p.role;

-- Optional cleanup (run later if you want to remove the helper function)
-- drop function if exists public.seed_demo_user(text, text, text, public.user_role);
