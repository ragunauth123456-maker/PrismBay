-- 005_orders.sql
-- Customer orders

CREATE TABLE IF NOT EXISTS orders (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_session_id       TEXT,
  stripe_payment_intent_id TEXT,
  status                  TEXT NOT NULL DEFAULT 'pending',
  total_cents             INTEGER NOT NULL DEFAULT 0,
  currency                TEXT NOT NULL DEFAULT 'usd',
  customer_email          TEXT NOT NULL,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_orders_user_id ON orders (user_id);
CREATE INDEX idx_orders_stripe_session_id ON orders (stripe_session_id);
