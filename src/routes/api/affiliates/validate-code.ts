/**
 * GET /api/affiliates/validate-code
 * Checks whether a referral code is available.
 * Query: ?code=XXX
 * Returns { available: true/false }
 */

import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod/v4";
import { sql } from "~/db";

const validateSchema = z.object({
  code: z
    .string()
    .min(1, "Code is required")
    .max(50)
    .regex(/^[a-z0-9-]+$/, "Invalid code format"),
});

export const Route = createFileRoute("/api/affiliates/validate-code")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const codeParam = url.searchParams.get("code") || "";

        const parsed = validateSchema.safeParse({ code: codeParam });
        if (!parsed.success) {
          return new Response(
            JSON.stringify({
              error: "Validation failed",
              details: parsed.error.issues,
            }),
            { status: 400, headers: { "Content-Type": "application/json" } },
          );
        }

        const { code } = parsed.data;

        const rows = await sql()`
          SELECT id FROM affiliates WHERE code = ${code}
        `;

        return new Response(
          JSON.stringify({
            available: rows.length === 0,
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      },
    },
  },
});
