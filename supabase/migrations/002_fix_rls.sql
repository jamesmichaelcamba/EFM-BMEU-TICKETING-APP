-- 002_fix_rls.sql

-- Drop the overly restrictive update policy
DROP POLICY IF EXISTS "tickets_update" ON tickets;

-- Allow any authenticated staff member to update ticket statuses
CREATE POLICY "tickets_update" ON tickets
  FOR UPDATE USING (auth.role() = 'authenticated');
