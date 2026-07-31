-- 014_checkout_events.sql
-- Tracks checkout initiations for abandoned cart analysis.
-- Used by the checkout endpoint and sequence runner to identify
-- users who started but didn't complete a purchase.

CREATE TABLE IF NOT EXISTS checkout_events (
  id              SERIAL PRIMARY KEY,
  email           TEXT NOT NULL,
  product_slug    TEXT NOT NULL,
  session_id      TEXT,
  ip_address      TEXT,
  completed       BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at    TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_checkout_events_email
  ON checkout_events (email);

CREATE INDEX IF NOT EXISTS idx_checkout_events_completed
  ON checkout_events (completed, created_at);

CREATE INDEX IF NOT EXISTS idx_checkout_events_session
  ON checkout_events (session_id);
