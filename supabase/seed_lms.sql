-- Demo LMS content for Phase 1 — run after 002_lms_schema.sql + seed.sql courses

-- Enrich existing courses (if seeded from seed.sql)
update public.courses set colour = '#E8211A', pass_mark = 70, published = true
where title = 'UK Right to Work & Compliance';

update public.courses set colour = '#2563eb', pass_mark = 80, published = true
where title = 'DBS Vetting Preparation';

update public.courses set colour = '#22c55e', pass_mark = 70, published = true
where title = 'Student Visa Document Checklist';

update public.courses set colour = '#eab308', pass_mark = 75, published = true
where title = 'Employer Onboarding Essentials';

-- Sample modules for first course (idempotent via title match)
insert into public.course_modules (course_id, sort_order, module_type, title, duration, content)
select c.id, 1, 'video', 'Introduction to Food Safety', '15 min',
  '{"youtubeId":"Kyux1lWdQ1I","url":"https://www.youtube.com/watch?v=Kyux1lWdQ1I"}'::jsonb
from public.courses c
where c.title = 'UK Right to Work & Compliance'
  and not exists (
    select 1 from public.course_modules m
    where m.course_id = c.id and m.title = 'Introduction to Food Safety'
  );

insert into public.course_modules (course_id, sort_order, module_type, title, duration, content)
select c.id, 2, 'text', 'COSHH Protocols', '20 min',
  '{"body":"<h3>COSHH Overview</h3><p>Control of Substances Hazardous to Health — key workplace compliance requirements.</p>"}'::jsonb
from public.courses c
where c.title = 'UK Right to Work & Compliance'
  and not exists (
    select 1 from public.course_modules m
    where m.course_id = c.id and m.title = 'COSHH Protocols'
  );

-- Sample DBS queue rows
insert into public.dbs_checks (profile_id, role_title, stage, submitted_at, est_clearance)
select p.id, coalesce(pd.role_title, 'Student'), 'Identity Verified', '2026-05-02'::date, '2026-05-04'::date
from public.profiles p
left join public.profile_details pd on pd.profile_id = p.id
where p.email = 'jordan.singh@student.ac.uk'
  and not exists (select 1 from public.dbs_checks d where d.profile_id = p.id);

insert into public.dbs_checks (profile_id, role_title, stage, submitted_at, est_clearance)
select p.id, coalesce(pd.role_title, 'Senior Coordinator'), 'Data Submitted', '2026-05-10'::date, '2026-05-12'::date
from public.profiles p
left join public.profile_details pd on pd.profile_id = p.id
where p.email = 'sarah.thompson@nexusyl.co.uk'
  and not exists (
    select 1 from public.dbs_checks d
    where d.profile_id = p.id and d.stage = 'Data Submitted'
  );

update public.profile_details pd
set dbs_status = 'Processing'
from public.profiles p
where pd.profile_id = p.id and p.email in ('jordan.singh@student.ac.uk', 'sarah.thompson@nexusyl.co.uk');

update public.profile_details pd
set organisation = 'Global Talent Partners Ltd', students_supplied = 7, role_title = 'Recruitment Partner'
from public.profiles p
where pd.profile_id = p.id and p.email = 'contact@globaltalent.co.uk';

update public.profile_details pd
set role_title = 'Senior Coordinator'
from public.profiles p
where pd.profile_id = p.id and p.email = 'sarah.thompson@nexusyl.co.uk';

-- Demo enrolments for Phase 3 testing
insert into public.enrollments (profile_id, course_id, status, progress, completed)
select p.id, c.id, 'active', 0, false
from public.profiles p
cross join public.courses c
where p.email = 'jordan.singh@student.ac.uk'
  and c.title = 'UK Right to Work & Compliance'
  and not exists (
    select 1 from public.enrollments e
    where e.profile_id = p.id and e.course_id = c.id
  );

insert into public.enrollments (profile_id, course_id, status, progress, completed)
select p.id, c.id, 'active', 35, false
from public.profiles p
cross join public.courses c
where p.email = 'sarah.thompson@nexusyl.co.uk'
  and c.title = 'UK Right to Work & Compliance'
  and not exists (
    select 1 from public.enrollments e
    where e.profile_id = p.id and e.course_id = c.id
  );

-- Demo progress + quiz scores for reports page
update public.enrollments e
set progress = 50
from public.profiles p, public.courses c
where e.profile_id = p.id
  and e.course_id = c.id
  and p.email = 'sarah.thompson@nexusyl.co.uk'
  and c.title = 'UK Right to Work & Compliance';

insert into public.module_progress (profile_id, course_id, module_id, completed, quiz_score)
select p.id, c.id, m.id, true, 85
from public.profiles p
cross join public.courses c
cross join public.course_modules m
where p.email = 'jordan.singh@student.ac.uk'
  and c.title = 'UK Right to Work & Compliance'
  and m.title = 'Introduction to Food Safety'
  and not exists (
    select 1 from public.module_progress mp
    where mp.profile_id = p.id and mp.module_id = m.id
  );

-- Demo student application for Phase 5 portals
insert into public.applications (student_id, assigned_to, type, status, title, notes, metadata)
select
  student.id,
  supplier.id,
  'visa',
  'documents_required',
  'UK Student Visa Application',
  'Please upload your offer letter and CAS document to proceed.',
  '{"current_stage": 1}'::jsonb
from public.profiles student
cross join public.profiles supplier
where student.email = 'jordan.singh@student.ac.uk'
  and supplier.email = 'contact@globaltalent.co.uk'
  and not exists (
    select 1 from public.applications a
    where a.student_id = student.id
  );
