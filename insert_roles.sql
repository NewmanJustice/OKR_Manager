-- insert_admin.sql: Seed initial roles for OKR Manager
-- Run this script against your PostgreSQL database after migrations

INSERT INTO "Role" (name, description) VALUES
  ('Admin', 'Administrator with full access'),
  ('User', 'Standard user'),
  ('LineManager', 'Line manager with team oversight')
ON CONFLICT (name) DO NOTHING;
