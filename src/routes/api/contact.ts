/**
 * POST /api/contact
 * Accepts contact form submissions, stores in DB, and emails admin.
 * Body: { name: string, email: string, subject?: string, message: string }
 */

import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod/v4";
import { sql } from "~/db";
import { sendEmailQuietly } from "~/lib/email";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  email: z.string().email("Invalid email address").max(320),
  subject: z.string().max(300).default(""),
  message: z.string().min(1, "Message is required").max(10000),
});

export const Route = createFileRoute("/api/contact")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return new Response(
            JSON.stringify({ error: "Invalid JSON body" }),
            { status: 400, headers: { "Content-Type": "application/json" } },
          );
        }

        const parsed = contactSchema.safeParse(body);
        if (!parsed.success) {
          return new Response(
            JSON.stringify({
              error: "Validation failed",
              details: parsed.error.issues.map((i) => i.message),
            }),
            { status: 400, headers: { "Content-Type": "application/json" } },
          );
        }

        const { name, email, subject, message } = parsed.data;

        // Get client IP
        const xForwardedFor = request.headers.get("x-forwarded-for");
        const ip = xForwardedFor?.split(",")[0]?.trim() || null;

        try {
          // Store in database
          await sql()`
            INSERT INTO contact_messages (name, email, subject, message, ip_address)
            VALUES (${name}, ${email}, ${subject}, ${message}, ${ip})
          `;

          // Send email notification to admin
          await sendEmailQuietly({
            to: "support@prismbayai.com",
            subject: `PrismBay Contact: ${subject || "New message"} from ${name}`,
            body: [
              `New contact form submission from PrismBay.`,
              ``,
              `Name: ${name}`,
              `Email: ${email}`,
              `Subject: ${subject || "(none)"}`,
              ``,
              `Message:`,
              `${message}`,
              ``,
              `---`,
              `Submitted at: ${new Date().toISOString()}`,
              `IP: ${ip || "unknown"}`,
            ].join("\n"),
          });

          return new Response(
            JSON.stringify({ success: true }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" },
            },
          );
        } catch (err) {
          const errorMessage = (err as Error).message;
          console.error("Contact form error:", errorMessage);

          // If it's a DB connection issue
          if (errorMessage.includes("DATABASE_URL")) {
            return new Response(
              JSON.stringify({
                error: "Unable to store your message right now. Please try again shortly.",
              }),
              { status: 503, headers: { "Content-Type": "application/json" } },
            );
          }

          return new Response(
            JSON.stringify({ error: "Failed to send message. Please try again." }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});
