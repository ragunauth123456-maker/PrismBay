/**
 * Transactional email service using Resend.
 *
 * Sends emails through Resend when RESEND_API_KEY is configured.
 * Falls back to console logging when no API key is present (dev mode).
 *
 * Required env vars:
 *   RESEND_API_KEY  — Resend API key for sending
 *   EMAIL_FROM      — "From" address (defaults to "PrismBay <admin@prismbay.com>")
 */

import { Resend } from "resend";

let _resend: Resend | null = null;

function getResend(): Resend {
  if (!_resend) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error(
        "RESEND_API_KEY is not set — email sending is not configured.",
      );
    }
    _resend = new Resend(apiKey);
  }
  return _resend;
}

export interface SendEmailParams {
  to: string;
  subject: string;
  body: string;
}

/**
 * Send a transactional email.
 * If RESEND_API_KEY is not configured, the email contents are logged to console
 * and the function returns successfully (graceful degradation for dev).
 */
export async function sendEmail(params: SendEmailParams): Promise<{ success: boolean; error?: string }> {
  const from = process.env.EMAIL_FROM || "PrismBay <admin@prismbay.com>";

  // Log the email regardless
  console.log(`[EMAIL] To: ${params.to} | Subject: ${params.subject}`);

  if (!process.env.RESEND_API_KEY) {
    console.log(`[EMAIL] (no RESEND_API_KEY — email logged but not sent)`);
    console.log(`[EMAIL] Body preview: ${params.body.slice(0, 200)}...`);
    return { success: true };
  }

  try {
    const resend = getResend();
    const { data, error } = await resend.emails.send({
      from,
      to: [params.to],
      subject: params.subject,
      text: params.body,
    });

    if (error) {
      console.error(`[EMAIL] Resend error: ${error.message}`);
      return { success: false, error: error.message };
    }

    console.log(`[EMAIL] Sent — ID: ${data?.id}`);
    return { success: true };
  } catch (err) {
    const message = (err as Error).message;
    console.error(`[EMAIL] Failed to send: ${message}`);
    return { success: false, error: message };
  }
}

/**
 * Send email and swallow errors — for non-critical email flows
 * where we don't want to block the main action if email fails.
 */
export async function sendEmailQuietly(params: SendEmailParams): Promise<void> {
  try {
    await sendEmail(params);
  } catch {
    // Silently ignore — email is non-critical
  }
}

/* ─── Campaign deduplication ─── */

/**
 * Check whether a recipient has already received a specific campaign email.
 * Uses the email_campaign_log table to prevent duplicate sends.
 */
export async function hasReceived(email: string, campaignSlug: string): Promise<boolean> {
  const { neon } = await import("@neondatabase/serverless");
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.warn("[EMAIL] DATABASE_URL not set — cannot check campaign log, assuming not received.");
    return false;
  }
  const db = neon(url);
  try {
    const result = await db.query(
      `SELECT 1 FROM email_campaign_log WHERE recipient_email = $1 AND campaign_slug = $2 LIMIT 1`,
      [email.toLowerCase().trim(), campaignSlug],
    );
    return (result as unknown[]).length > 0;
  } catch (err) {
    console.error("[EMAIL] Failed to check campaign log:", (err as Error).message);
    // On error, assume not received to avoid blocking legitimate sends
    return false;
  }
}

/**
 * Record that a campaign email was sent to a recipient.
 * Call this after successfully sending to prevent future duplicates.
 */
export async function logSent(email: string, campaignSlug: string): Promise<void> {
  const { neon } = await import("@neondatabase/serverless");
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.warn("[EMAIL] DATABASE_URL not set — cannot log campaign send.");
    return;
  }
  const db = neon(url);
  try {
    await db.query(
      `INSERT INTO email_campaign_log (recipient_email, campaign_slug) VALUES ($1, $2) ON CONFLICT (recipient_email, campaign_slug) DO NOTHING`,
      [email.toLowerCase().trim(), campaignSlug],
    );
  } catch (err) {
    console.error("[EMAIL] Failed to log campaign send:", (err as Error).message);
  }
}
