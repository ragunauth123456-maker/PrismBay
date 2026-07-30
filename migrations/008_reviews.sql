-- 008_reviews.sql
-- Product reviews

CREATE TABLE IF NOT EXISTS reviews (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id          UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  rating              INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title               TEXT NOT NULL DEFAULT '',
  body                TEXT NOT NULL DEFAULT '',
  is_verified_purchase BOOLEAN NOT NULL DEFAULT false,
  is_approved         BOOLEAN NOT NULL DEFAULT false,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);

CREATE INDEX idx_reviews_product_id ON reviews (product_id);
CREATE INDEX idx_reviews_user_id ON reviews (user_id);
