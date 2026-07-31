/**
 * POST /api/pageview
 * Logs a page view for privacy-friendly analytics.
 * Body: { path: string, referrer?: string }
 * No cookies, no PII — only path, referrer, user-agent, and hashed IP.
 */
import { createFileRoute } from "@tanstack/react-router";
import { sql } from "~/db";

export const Route = createFileRoute("/api/pageview")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Extract IP (hashed for privacy)
        const ip =
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
          request.headers.get("x-real-ip") ||
          "unknown";

        // Simple hash of IP for dedup/counting without storing raw IP
        let ipHash = "unknown";
        if (ip !== "unknown") {
          const encoder = new TextEncoder();
          const data = encoder.encode(ip + "prismbay-salt");
          const hashBuffer = await crypto.subtle.digest("SHA-256", data);
          ipHash = Array.from(new Uint8Array(hashBuffer))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("")
            .slice(0, 16);
        }

        let body: { path?: string; referrer?: string };
        try {
          body = await request.json();
        } catch {
          return new Response(JSON.stringify({ ok: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }

        const path = body.path?.trim();
        if (!path || path.length > 2048) {
          return new Response(JSON.stringify({ ok: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }

        // Skip bot/crawler user agents
        const ua = request.headers.get("user-agent") || "";
        const botPatterns = [
          "bot", "crawler", "spider", "scraper", "curl", "wget",
          "python-requests", "go-http-client", "java", "libwww",
          "httpclient", "nutch", "phpcrawl", "msnbot", "slurp",
          "facebookexternalhit", "twitterbot", "rogerbot",
          "linkedinbot", "embedly", "quora link preview",
          "showyoubot", "outbrain", "pinterest", "slack",
          "vkshare", "w3c_validator", "redditbot",
          "applebot", "whatsapp", "flipboard", "tumblr",
          "bitlybot", "semrush", "ahrefsbot", "dotbot",
          "mj12bot", "yandexbot", "baiduspider", "duckduckbot",
          "bingbot", "googlebot",
        ];
        const isBot = botPatterns.some((p) => ua.toLowerCase().includes(p));

        if (isBot) {
          return new Response(JSON.stringify({ ok: true, skipped: "bot" }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }

        const referrer = (body.referrer || "").slice(0, 2048) || null;
        const userAgent = ua.slice(0, 512);

        try {
          await sql()`
            INSERT INTO page_views (path, referrer, user_agent, ip_hash)
            VALUES (${path}, ${referrer}, ${userAgent}, ${ipHash})
          `;
        } catch (err) {
          console.error("Pageview log error:", err);
          // Don't fail the request — the user shouldn't notice analytics issues
        }

        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
          },
        });
      },
    },
  },
});
