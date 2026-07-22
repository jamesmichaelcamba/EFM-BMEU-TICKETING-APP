-- 005_fix_missing_profiles.sql

-- 1. Insert missing profiles for any users that were created before the trigger was fully set up
INSERT INTO public.profiles (id, work_id, full_name, role, status)
SELECT 
  id, 
  SPLIT_PART(email, '@', 1), 
  'BMEU Admin', 
  'Admin', 
  'Approved'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles);

-- 2. Ensure all existing profiles are Admins for now so you can access the page
UPDATE public.profiles SET role = 'Admin', status = 'Approved';
