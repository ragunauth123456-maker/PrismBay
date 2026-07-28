-- 004_products.sql
-- Digital products for sale

CREATE TABLE IF NOT EXISTS products (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title             TEXT NOT NULL,
  slug              TEXT NOT NULL UNIQUE,
  description       TEXT NOT NULL DEFAULT '',
  long_description  TEXT NOT NULL DEFAULT '',
  price_cents       INTEGER NOT NULL DEFAULT 0,
  currency          TEXT NOT NULL DEFAULT 'usd',
  category_id       UUID REFERENCES categories(id) ON DELETE SET NULL,
  file_path         TEXT,
  file_name         TEXT,
  file_size_bytes   BIGINT,
  thumbnail_url     TEXT,
  demo_video_url    TEXT,
  is_published      BOOLEAN NOT NULL DEFAULT false,
  is_featured       BOOLEAN NOT NULL DEFAULT false,
  stripe_price_id   TEXT,
  stripe_product_id TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_products_slug ON products (slug);
CREATE INDEX idx_products_category_id ON products (category_id);
CREATE INDEX idx_products_is_published ON products (is_published);
