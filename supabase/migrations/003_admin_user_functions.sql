-- Phase 2: Admin user management RPCs (callable from React portal by admins)

create or replace function public.admin_create_portal_user(
  p_email text,
  p_password text,
  p_full_name text,
  p_role public.user_role,
  p_phone text default null,
  p_role_title text default null,
  p_organisation text default null,
  p_dbs_status text default 'Not Submitted',
  p_students_supplied integer default 0,
  p_must_change_pass boolean default true
)
returns uuid
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
declare
  v_user_id uuid := gen_random_uuid();
begin
  if public.get_user_role() <> 'admin' then
    raise exception 'Only admins can create users';
  end if;

  if exists (select 1 from auth.users where email = lower(trim(p_email))) then
    raise exception 'A user with this email already exists';
  end if;

  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at,
    confirmation_token, email_change, email_change_token_new, recovery_token
  ) values (
    '00000000-0000-0000-0000-000000000000',
    v_user_id, 'authenticated', 'authenticated', lower(trim(p_email)),
    extensions.crypt(p_password, extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', p_full_name, 'role', p_role::text),
    now(), now(), '', '', '', ''
  );

  insert into auth.identities (
    id, user_id, provider_id, identity_data, provider,
    last_sign_in_at, created_at, updated_at
  ) values (
    gen_random_uuid(), v_user_id, v_user_id::text,
    jsonb_build_object('sub', v_user_id::text, 'email', lower(trim(p_email))),
    'email', now(), now(), now()
  );

  update public.profiles
  set full_name = p_full_name, role = p_role, email = lower(trim(p_email))
  where id = v_user_id;

  update public.profile_details
  set
    phone = p_phone,
    role_title = p_role_title,
    organisation = p_organisation,
    dbs_status = coalesce(p_dbs_status, 'Not Submitted'),
    students_supplied = coalesce(p_students_supplied, 0),
    must_change_pass = coalesce(p_must_change_pass, true)
  where profile_id = v_user_id;

  return v_user_id;
end;
$$;

create or replace function public.admin_update_portal_user(
  p_user_id uuid,
  p_full_name text,
  p_phone text default null,
  p_role_title text default null,
  p_organisation text default null,
  p_dbs_status text default null,
  p_students_supplied integer default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.get_user_role() <> 'admin' then
    raise exception 'Only admins can update users';
  end if;

  update public.profiles
  set full_name = p_full_name
  where id = p_user_id;

  update public.profile_details
  set
    phone = p_phone,
    role_title = p_role_title,
    organisation = coalesce(p_organisation, organisation),
    dbs_status = coalesce(p_dbs_status, dbs_status),
    students_supplied = coalesce(p_students_supplied, students_supplied)
  where profile_id = p_user_id;
end;
$$;

create or replace function public.admin_update_user_password(
  p_user_id uuid,
  p_password text
)
returns void
language plpgsql
security definer
set search_path = auth, extensions, public
as $$
begin
  if public.get_user_role() <> 'admin' then
    raise exception 'Only admins can reset passwords';
  end if;

  if length(p_password) < 6 then
    raise exception 'Password must be at least 6 characters';
  end if;

  update auth.users
  set encrypted_password = extensions.crypt(p_password, extensions.gen_salt('bf')),
      updated_at = now()
  where id = p_user_id;
end;
$$;

create or replace function public.admin_delete_portal_user(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = auth, public
as $$
begin
  if public.get_user_role() <> 'admin' then
    raise exception 'Only admins can delete users';
  end if;

  if p_user_id = auth.uid() then
    raise exception 'You cannot delete your own account';
  end if;

  delete from auth.users where id = p_user_id;
end;
$$;

grant execute on function public.admin_create_portal_user to authenticated;
grant execute on function public.admin_update_portal_user to authenticated;
grant execute on function public.admin_update_user_password to authenticated;
grant execute on function public.admin_delete_portal_user to authenticated;
