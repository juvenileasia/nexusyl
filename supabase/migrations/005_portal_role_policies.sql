-- Phase 5: Role portal RLS (enrollment progress + supplier read access)
-- Idempotent: safe to re-run.

drop policy if exists "Users update own enrollment progress" on public.enrollments;
create policy "Users update own enrollment progress"
  on public.enrollments for update
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

drop policy if exists "Suppliers read employee profiles" on public.profiles;
create policy "Suppliers read employee profiles"
  on public.profiles for select
  using (public.get_user_role() = 'supplier' and role = 'employee');

drop policy if exists "Suppliers read assigned student profiles" on public.profiles;
create policy "Suppliers read assigned student profiles"
  on public.profiles for select
  using (
    public.get_user_role() = 'supplier'
    and exists (
      select 1 from public.applications a
      where a.student_id = profiles.id
        and a.assigned_to = auth.uid()
    )
  );

drop policy if exists "Suppliers read employee enrollments" on public.enrollments;
create policy "Suppliers read employee enrollments"
  on public.enrollments for select
  using (
    public.get_user_role() = 'supplier'
    and exists (
      select 1 from public.profiles p
      where p.id = enrollments.profile_id
        and p.role = 'employee'
    )
  );

-- Enrolled learners can read modules on their courses (even if unpublished)
drop policy if exists "Enrolled users read course modules" on public.course_modules;
create policy "Enrolled users read course modules"
  on public.course_modules for select
  using (
    exists (
      select 1 from public.enrollments e
      where e.course_id = course_modules.course_id
        and e.profile_id = auth.uid()
    )
  );

drop policy if exists "Enrolled users read enrolled courses" on public.courses;
create policy "Enrolled users read enrolled courses"
  on public.courses for select
  using (
    exists (
      select 1 from public.enrollments e
      where e.course_id = courses.id
        and e.profile_id = auth.uid()
    )
  );
