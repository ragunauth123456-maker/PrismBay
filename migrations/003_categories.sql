-- 003_categories.sql
-- Product categories

CREATE TABLE IF NOT EXISTS categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_categories_slug ON categories (slug);
