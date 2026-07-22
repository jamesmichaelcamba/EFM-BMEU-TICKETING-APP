-- 003_add_user_verification.sql

-- 1. Add status column with default 'Pending'
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'Pending' 
CHECK (status IN ('Pending', 'Approved', 'Rejected'));

-- 2. Mark existing accounts as 'Approved' so you are not locked out!
UPDATE profiles SET status = 'Approved' WHERE status = 'Pending';

-- 3. Update RLS: Allow Admins to update ANY profile (to change status)
DROP POLICY IF EXISTS "profiles_update" ON profiles;

CREATE POLICY "profiles_update" ON profiles
  FOR UPDATE USING (
    auth.uid() = id
    OR EXISTS (
      SELECT 1 FROM profiles admin_check 
      WHERE admin_check.id = auth.uid() AND admin_check.role = 'Admin'
    )
  );
