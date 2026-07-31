-- 013_email_campaign_log.sql
-- Tracks which emails received which campaign templates to prevent duplicate sends.
-- Used by the automated sequence runner for post-purchase onboarding and
-- pre-purchase nurture sequences.

CREATE TABLE IF NOT EXISTS email_campaign_log (
  id              SERIAL PRIMARY KEY,
  campaign_name   TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  template_name   TEXT NOT NULL,
  sent_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata        JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_email_campaign_log_email
  ON email_campaign_log (recipient_email);

CREATE INDEX IF NOT EXISTS idx_email_campaign_log_campaign
  ON email_campaign_log (campaign_name);

CREATE UNIQUE INDEX IF NOT EXISTS idx_email_campaign_log_unique
  ON email_campaign_log (campaign_name, recipient_email, template_name);
