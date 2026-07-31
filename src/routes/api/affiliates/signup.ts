/**
 * POST /api/affiliates/signup
 * Accepts affiliate applications.
 * Body: { name: string, email: string, code: string }
 * Creates a pending affiliate record.
 */

import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod/v4";
import { sql } from "~/db";

const signupSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  email: z.string().email("Valid email is required"),
  code: z
    .string()
    .min(3, "Code must be at least 3 characters")
    .max(50, "Code must be 50 characters or less")
    .regex(/^[a-z0-9-]+$/, "Code can only contain lowercase letters, numbers, and hyphens"),
});

export const Route = createFileRoute("/api/affiliates/signup")({
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

        const parsed = signupSchema.safeParse(body);
        if (!parsed.success) {
          return new Response(
            JSON.stringify({
              error: "Validation failed",
              details: parsed.error.issues,
            }),
            { status: 400, headers: { "Content-Type": "application/json" } },
          );
        }

        const { name, email, code } = parsed.data;

        // Check for duplicate code
        const codeRows = await sql()`
          SELECT id FROM affiliates WHERE code = ${code}
        `;
        if (codeRows.length > 0) {
          return new Response(
            JSON.stringify({ error: "This referral code is already taken. Please choose another." }),
            { status: 409, headers: { "Content-Type": "application/json" } },
          );
        }

        // Check for duplicate email
        const emailRows = await sql()`
          SELECT id FROM affiliates WHERE email = ${email}
        `;
        if (emailRows.length > 0) {
          return new Response(
            JSON.stringify({ error: "An application with this email already exists." }),
            { status: 409, headers: { "Content-Type": "application/json" } },
          );
        }

        // Create the affiliate record
        await sql()`
          INSERT INTO affiliates (name, email, code, commission_rate, status)
          VALUES (${name}, ${email}, ${code}, 35, 'pending')
        `;

        console.log(`Affiliate signup: ${name} <${email}> code=${code}`);

        return new Response(
          JSON.stringify({
            success: true,
            message: "Application received. You'll be notified when approved.",
          }),
          { status: 201, headers: { "Content-Type": "application/json" } },
        );
      },
    },
  },
});
