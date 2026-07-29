import { createFileRoute } from "@tanstack/react-router";
import { sql } from "~/db";
import { checkRateLimit } from "~/lib/rate-limit";
import { getZipPath } from "~/lib/storage";
import { existsSync, statSync } from "node:fs";

export const Route = createFileRoute("/api/downloads/$token")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const { token } = params as { token: string };
        if (!token) {
          return new Response(
            JSON.stringify({ error: "Missing download token" }),
            { status: 400, headers: { "Content-Type": "application/json" } },
          );
        }

        // Rate limit downloads
        const ip =
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
          request.headers.get("x-real-ip") ??
          "127.0.0.1";
        if (!checkRateLimit("download", token)) {
          return new Response(
            JSON.stringify({
              error: "Too many download requests. Please try again later.",
            }),
            { status: 429, headers: { "Content-Type": "application/json" } },
          );
        }

        // Find the download token record
        const rows = await sql()`
          SELECT dt.id, dt.token, dt.downloads_used, dt.max_downloads, dt.expires_at,
                 dt.order_item_id, dt.created_at,
                 oi.product_title, oi.product_slug, oi.order_id,
                 o.user_id, o.status
          FROM download_tokens dt
          JOIN order_items oi ON oi.id = dt.order_item_id
          JOIN orders o ON o.id = oi.order_id
          WHERE dt.token = ${token}
        `;

        if (rows.length === 0) {
          return new Response(
            JSON.stringify({ error: "Invalid download token" }),
            { status: 404, headers: { "Content-Type": "application/json" } },
          );
        }

        const record = rows[0] as Record<string, unknown>;

        // Check expiry
        if (record.expires_at) {
          const expiresAt = new Date(record.expires_at as string);
          if (Date.now() > expiresAt.getTime()) {
            return new Response(
              JSON.stringify({ error: "Download token has expired" }),
              { status: 410, headers: { "Content-Type": "application/json" } },
            );
          }
        }

        // Check download count
        const downloadsUsed = (record.downloads_used as number) || 0;
        const maxDownloads = (record.max_downloads as number) || 10;
        if (downloadsUsed >= maxDownloads) {
          return new Response(
            JSON.stringify({ error: "Download limit reached" }),
            { status: 429, headers: { "Content-Type": "application/json" } },
          );
        }

        // Check order status
        const orderStatus = record.status as string;
        if (orderStatus !== "paid") {
          return new Response(
            JSON.stringify({ error: "Order is not paid — cannot download" }),
            { status: 403, headers: { "Content-Type": "application/json" } },
          );
        }

        // Resolve the ZIP file from product_slug
        const productSlug = (record.product_slug as string) || "";
        const productTitle = (record.product_title as string) || "product";

        if (!productSlug) {
          console.error(`No product_slug for order_item ${record.order_item_id}`);
          return new Response(
            JSON.stringify({ error: "Product file mapping not found" }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }

        const zipPath = getZipPath(productSlug);

        if (!existsSync(zipPath)) {
          console.error(`ZIP file not found: ${zipPath}`);
          return new Response(
            JSON.stringify({ error: "Product file not found on server" }),
            { status: 404, headers: { "Content-Type": "application/json" } },
          );
        }

        // Increment download count before streaming
        await sql()`
          UPDATE download_tokens
          SET downloads_used = downloads_used + 1, updated_at = now()
          WHERE id = ${record.id as string}
        `;

        const fileSize = statSync(zipPath).size;
        const fileName = `${productSlug}.zip`;
        const remaining = maxDownloads - downloadsUsed - 1;

        console.log(
          `Download: ${productTitle} (${productSlug}) — token ${token} — ${remaining} downloads remaining`,
        );

        // Stream the file using Bun.file()
        const file = Bun.file(zipPath);

        return new Response(file, {
          status: 200,
          headers: {
            "Content-Type": "application/zip",
            "Content-Disposition": `attachment; filename="${fileName}"`,
            "Content-Length": String(fileSize),
            "Cache-Control": "no-store",
          },
        });
      },
    },
  },
});
