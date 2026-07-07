-- Run in Supabase → SQL Editor AFTER creating auth users
-- (Authentication → Users → Add user)

-- 1) Verify profiles were created (one row per auth user)
select id, email, full_name, role, created_at
from public.profiles
order by created_at;

-- 2) Set demo roles + display names
update public.profiles
set role = 'admin', full_name = 'Nexusyl Admin'
where email = 'admin@nexusyl.co.uk';

update public.profiles
set role = 'employee', full_name = 'Sarah Thompson'
where email = 'sarah.thompson@nexusyl.co.uk';

update public.profiles
set role = 'student', full_name = 'Jordan Singh'
where email = 'jordan.singh@student.ac.uk';

update public.profiles
set role = 'supplier', full_name = 'Global Talent Partners'
where email = 'contact@globaltalent.co.uk';

-- 3) Confirm
select email, full_name, role from public.profiles order by role;
