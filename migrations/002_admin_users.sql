-- 002_admin_users.sql
-- Admin user accounts (isolated from customer users)

CREATE TABLE IF NOT EXISTS admin_users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name          TEXT NOT NULL DEFAULT '',
  role          TEXT NOT NULL DEFAULT 'admin',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_admin_users_email ON admin_users (email);
