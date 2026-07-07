-- Demo seed data — run AFTER creating auth users in Supabase Dashboard
-- Authentication → Users → Add user (email + password), then update profile role if needed.
--
-- Demo accounts — run supabase/seed_demo_users.sql to create these in one step:
--   admin@nexusyl.co.uk            / nexusyl2026    → role: admin
--   sarah.thompson@nexusyl.co.uk   / employee2026   → role: employee
--   jordan.singh@student.ac.uk     / student2026    → role: student
--   contact@globaltalent.co.uk     / supplier2026   → role: supplier
insert into public.courses (title, description, category, duration_hours, published) values
  ('UK Right to Work & Compliance', 'Essential compliance training for newcomers entering the UK workforce.', 'Compliance', 4, true),
  ('DBS Vetting Preparation', 'Guide to completing DBS checks and document requirements.', 'HR', 2, true),
  ('Student Visa Document Checklist', 'Step-by-step document upload and visa tracking workflow.', 'Immigration', 3, true),
  ('Employer Onboarding Essentials', 'How to onboard candidates through the Nexusyl recruitment pipeline.', 'Recruitment', 5, true)
on conflict do nothing;
