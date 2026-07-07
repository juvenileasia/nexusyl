-- Phase 4: Documents storage bucket + object policies
-- Idempotent: safe to re-run if a previous attempt partially applied.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'documents',
  'documents',
  false,
  10485760, -- 10 MB
  array[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Path convention: {profile_id}/{doc_type}/{filename}

drop policy if exists "Users upload to own folder" on storage.objects;
drop policy if exists "Users read own files" on storage.objects;
drop policy if exists "Staff read all document files" on storage.objects;
drop policy if exists "Staff upload document files" on storage.objects;
drop policy if exists "Admins manage all document files" on storage.objects;
drop policy if exists "Admins delete document files" on storage.objects;

create policy "Users upload to own folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users read own files"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Staff read all document files"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'documents'
    and public.get_user_role() in ('admin', 'employee')
  );

create policy "Staff upload document files"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'documents'
    and public.get_user_role() in ('admin', 'employee')
  );

create policy "Admins manage all document files"
  on storage.objects for all
  to authenticated
  using (
    bucket_id = 'documents'
    and public.get_user_role() = 'admin'
  );

create policy "Admins delete document files"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'documents'
    and public.get_user_role() = 'admin'
  );
