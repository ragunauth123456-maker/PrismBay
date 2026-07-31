/* 013_affiliates.sql
   Affiliate/referral tracking — affiliates, commissions, and order tracking columns */

CREATE TABLE IF NOT EXISTS affiliates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code            TEXT UNIQUE NOT NULL,
  name            TEXT NOT NULL,
  email           TEXT UNIQUE NOT NULL,
  commission_rate INTEGER NOT NULL DEFAULT 35,
  stripe_coupon_id TEXT,
  status          TEXT NOT NULL DEFAULT 'pending',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  approved_at     TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_affiliates_code ON affiliates (code);
CREATE INDEX IF NOT EXISTS idx_affiliates_email ON affiliates (email);

CREATE TABLE IF NOT EXISTS commissions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id      UUID NOT NULL REFERENCES affiliates(id),
  order_id          UUID NOT NULL REFERENCES orders(id),
  order_amount_cents INTEGER NOT NULL,
  commission_cents  INTEGER NOT NULL,
  commission_rate   INTEGER NOT NULL,
  status            TEXT NOT NULL DEFAULT 'pending',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  approved_at       TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_commissions_affiliate_id ON commissions (affiliate_id);
CREATE INDEX IF NOT EXISTS idx_commissions_order_id ON commissions (order_id);

ALTER TABLE orders ADD COLUMN IF NOT EXISTS referral_code TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS affiliate_id UUID REFERENCES affiliates(id);

CREATE INDEX IF NOT EXISTS idx_orders_referral_code ON orders (referral_code);
CREATE INDEX IF NOT EXISTS idx_orders_affiliate_id ON orders (affiliate_id);
