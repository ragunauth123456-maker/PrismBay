/**
 * Transactional email service using Resend.
 *
 * Sends emails through Resend when RESEND_API_KEY is configured.
 * Falls back to console logging when no API key is present (dev mode).
 *
 * Required env vars:
 *   RESEND_API_KEY  — Resend API key for sending
 *   EMAIL_FROM      — "From" address (defaults to "PrismBay <support@prismbay.com>")
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
  const from = process.env.EMAIL_FROM || "PrismBay <support@prismbay.com>";

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
