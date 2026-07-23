-- 006_add_duplicate_of.sql
-- Adds a self-referencing column to link duplicate tickets to the original

ALTER TABLE tickets
ADD COLUMN IF NOT EXISTS duplicate_of UUID REFERENCES tickets(id) ON DELETE SET NULL;
