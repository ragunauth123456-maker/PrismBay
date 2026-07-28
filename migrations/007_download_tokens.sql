-- 007_download_tokens.sql
-- Secure download tokens for purchased products

CREATE TABLE IF NOT EXISTS download_tokens (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_item_id   UUID NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  token           TEXT NOT NULL UNIQUE,
  downloads_used  INTEGER NOT NULL DEFAULT 0,
  max_downloads   INTEGER NOT NULL DEFAULT 10,
  expires_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_download_tokens_token ON download_tokens (token);
CREATE INDEX idx_download_tokens_order_item_id ON download_tokens (order_item_id);
