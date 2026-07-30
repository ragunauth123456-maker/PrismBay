-- 012_email_verification_tokens.sql
-- Email verification tokens

CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token      TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_email_verification_tokens_token ON email_verification_tokens (token);
CREATE INDEX idx_email_verification_tokens_user_id ON email_verification_tokens (user_id);
