-- 004_make_admin.sql

-- Make all existing users Admins so you can manage staff
UPDATE profiles SET role = 'Admin';
