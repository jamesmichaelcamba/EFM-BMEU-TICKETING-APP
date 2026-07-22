-- =============================================================
-- BMEU JMC Ticketing System — Supabase Database Migration
-- Run this in your Supabase project's SQL Editor
-- Project: ZCMC BMEU Ticketing App
-- =============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================
-- WIPE EXISTING SCHEMA (Safe for new setups)
-- =============================================================
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS tickets CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- =============================================================
-- TABLE: profiles (extends Supabase auth.users)
-- =============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id         UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  work_id    TEXT UNIQUE NOT NULL,
  full_name  TEXT NOT NULL,
  role       TEXT NOT NULL DEFAULT 'Technician'
               CHECK (role IN ('Technician', 'Admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================
-- TABLE: categories
-- =============================================================
CREATE TABLE IF NOT EXISTS categories (
  id         UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name       TEXT NOT NULL,
  is_custom  BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default categories
INSERT INTO categories (name, is_custom) VALUES
  ('Equipment Failure / Malfunction',     false),
  ('Missing / Unavailable Spare Parts',   false),
  ('Equipment Sent for External Repair',  false),
  ('Calibration Issues',                  false),
  ('Safety / Hazard Concerns',            false),
  ('Administrative / Paperwork Delays',   false),
  ('Intern / Staff-Related Concerns',     false),
  ('Ward / Department Requests',          false),
  ('Personal Work Notes / Reminders',     false)
ON CONFLICT DO NOTHING;

-- =============================================================
-- TABLE: tickets
-- =============================================================
CREATE TABLE IF NOT EXISTS tickets (
  id               UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ticket_number    TEXT UNIQUE NOT NULL DEFAULT '',
  type             TEXT NOT NULL DEFAULT 'CM'
                     CHECK (type IN ('CM', 'PM', 'Other')),
  title            TEXT NOT NULL,
  description      TEXT,
  category_id      UUID REFERENCES categories(id) ON DELETE SET NULL,
  priority         TEXT NOT NULL DEFAULT 'Medium'
                     CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
  status           TEXT NOT NULL DEFAULT 'Open'
                     CHECK (status IN ('Open', 'In Progress', 'Pending Parts', 'For Monitoring', 'Resolved', 'Closed')),
  department       TEXT,
  equipments       JSONB DEFAULT '[]'::jsonb,
  reported_by      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  assigned_to      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  due_date         DATE,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW(),
  resolved_at      TIMESTAMPTZ
);

-- =============================================================
-- TABLE: comments
-- =============================================================
CREATE TABLE IF NOT EXISTS comments (
  id         UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ticket_id  UUID REFERENCES tickets(id) ON DELETE CASCADE NOT NULL,
  author_id  UUID REFERENCES profiles(id) ON DELETE SET NULL,
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================
-- FUNCTION + TRIGGER: Auto-generate ticket_number
-- Format: TKT-YYYYMMDD-XXXX (e.g. TKT-20260722-0001)
-- =============================================================
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TRIGGER AS $$
DECLARE
  date_str   TEXT;
  seq_num    INTEGER;
  ticket_num TEXT;
BEGIN
  date_str := TO_CHAR(NOW() AT TIME ZONE 'Asia/Manila', 'YYYYMMDD');
  SELECT COUNT(*) + 1 INTO seq_num
    FROM tickets
    WHERE DATE(created_at AT TIME ZONE 'Asia/Manila') = CURRENT_DATE;
  ticket_num := 'TKT-' || date_str || '-' || LPAD(seq_num::TEXT, 4, '0');
  NEW.ticket_number := ticket_num;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_ticket_number ON tickets;
CREATE TRIGGER trg_set_ticket_number
  BEFORE INSERT ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION generate_ticket_number();

-- =============================================================
-- FUNCTION + TRIGGER: Auto-update updated_at
-- =============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_tickets_updated_at ON tickets;
CREATE TRIGGER trg_tickets_updated_at
  BEFORE UPDATE ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================
-- FUNCTION + TRIGGER: Set resolved_at when status → Resolved/Closed
-- =============================================================
CREATE OR REPLACE FUNCTION set_resolved_at_on_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IN ('Resolved', 'Closed')
     AND (OLD.status NOT IN ('Resolved', 'Closed') OR OLD.status IS NULL) THEN
    NEW.resolved_at := NOW();
  END IF;
  -- If reopened, clear resolved_at
  IF NEW.status = 'Open' AND OLD.status IN ('Resolved', 'Closed') THEN
    NEW.resolved_at := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_resolved_at ON tickets;
CREATE TRIGGER trg_set_resolved_at
  BEFORE UPDATE ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION set_resolved_at_on_status_change();

-- =============================================================
-- FUNCTION + TRIGGER: Create profile automatically on signup
-- The app passes work_id and full_name in user metadata
-- =============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, work_id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'work_id', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'BMEU Staff'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'Technician')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_on_auth_user_created ON auth.users;
CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_signup();

-- =============================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================
ALTER TABLE profiles  ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets   ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments  ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- profiles: authenticated users can read all, update own
CREATE POLICY "profiles_select" ON profiles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "profiles_insert" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- tickets: all authenticated can read + create; owner/admin can update
CREATE POLICY "tickets_select" ON tickets
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "tickets_insert" ON tickets
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "tickets_update" ON tickets
  FOR UPDATE USING (
    auth.uid() = reported_by
    OR auth.uid() = assigned_to
    OR EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Admin'
    )
  );

CREATE POLICY "tickets_delete" ON tickets
  FOR DELETE USING (
    auth.uid() = reported_by
    OR EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Admin'
    )
  );

-- comments: all authenticated can read + create
CREATE POLICY "comments_select" ON comments
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "comments_insert" ON comments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- categories: all authenticated can read + create
CREATE POLICY "categories_select" ON categories
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "categories_insert" ON categories
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- =============================================================
-- HELPFUL INDEXES for performance
-- =============================================================
CREATE INDEX IF NOT EXISTS idx_tickets_status      ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_priority    ON tickets(priority);
CREATE INDEX IF NOT EXISTS idx_tickets_type        ON tickets(type);
CREATE INDEX IF NOT EXISTS idx_tickets_department  ON tickets(department);
CREATE INDEX IF NOT EXISTS idx_tickets_reported_by ON tickets(reported_by);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at  ON tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_ticket_id  ON comments(ticket_id);

-- =============================================================
-- DONE! Your BMEU Ticketing database is ready.
-- =============================================================
-- Next steps:
-- 1. Go to Supabase → Authentication → Settings
-- 2. Disable "Confirm email" (since you're using work ID-based emails)
-- 3. Create your first user account via Supabase Auth API or use
--    the signup helper below (run once, then comment out):
--
-- To manually create a user (replace values as needed):
-- SELECT auth.users from the Supabase dashboard and use
-- "Add User" with email format: {workid}@bmeu.zcmc
-- e.g. email: 2024001@bmeu.zcmc, password: <your-password>
-- The full_name and work_id will be set via the trigger above.
--
-- Or you can create users programmatically via your Supabase dashboard.
-- =============================================================
