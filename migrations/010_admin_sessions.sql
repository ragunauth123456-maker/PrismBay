-- 010_admin_sessions.sql
-- Admin session store (fully isolated from customer sessions)

CREATE TABLE IF NOT EXISTS admin_sessions (
  id         TEXT PRIMARY KEY,
  admin_id   UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_admin_sessions_admin_id ON admin_sessions (admin_id);
CREATE INDEX idx_admin_sessions_expires_at ON admin_sessions (expires_at);
