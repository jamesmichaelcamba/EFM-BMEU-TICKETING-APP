-- 007_add_resolved_by.sql
-- Track which technician resolved the ticket

ALTER TABLE tickets
ADD COLUMN IF NOT EXISTS resolved_by UUID REFERENCES profiles(id) ON DELETE SET NULL;
