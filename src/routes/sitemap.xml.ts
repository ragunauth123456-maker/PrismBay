/**
 * GET /sitemap.xml
 * XML sitemap containing all static pages, products, bundles, comparisons, demos, and articles.
 */

import { createFileRoute } from "@tanstack/react-router";
import { PRODUCTS, BUNDLES } from "~/data/products";
import { ARTICLES, isPublished } from "~/data/articles";
import { COMPARISONS } from "~/data/comparisons";

const BASE_URL = "https://www.prismbayai.com";

interface SitemapEntry {
  loc: string;
  lastmod: string;
  changefreq: string;
  priority: string;
}

function entry({
  loc,
  lastmod,
  changefreq,
  priority,
}: SitemapEntry): string {
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

export const Route = createFileRoute("/sitemap/xml")({
  server: {
    handlers: {
      GET: async () => {
        const today = new Date().toISOString().split("T")[0];
        const urls: SitemapEntry[] = [];

        // Static pages
        const staticPages: Array<{ path: string; priority: string; changefreq: string }> = [
          { path: "/", priority: "1.0", changefreq: "daily" },
          { path: "/products", priority: "0.9", changefreq: "daily" },
          { path: "/pricing", priority: "0.8", changefreq: "weekly" },
          { path: "/how-it-works", priority: "0.7", changefreq: "monthly" },
          { path: "/trust", priority: "0.6", changefreq: "monthly" },
          { path: "/faq", priority: "0.6", changefreq: "monthly" },
          { path: "/about", priority: "0.5", changefreq: "monthly" },
          { path: "/contact", priority: "0.5", changefreq: "monthly" },
          { path: "/cookies", priority: "0.3", changefreq: "yearly" },
          { path: "/privacy", priority: "0.3", changefreq: "yearly" },
          { path: "/terms", priority: "0.3", changefreq: "yearly" },
          { path: "/refunds", priority: "0.3", changefreq: "yearly" },
        ];

        for (const page of staticPages) {
          urls.push({
            loc: `${BASE_URL}${page.path}`,
            lastmod: today,
            changefreq: page.changefreq,
            priority: page.priority,
          });
        }

        // Index pages
        const indexPages: Array<{ path: string; priority: string; changefreq: string }> = [
          { path: "/bundles", priority: "0.8", changefreq: "weekly" },
          { path: "/compare", priority: "0.7", changefreq: "weekly" },
          { path: "/demo", priority: "0.7", changefreq: "weekly" },
          { path: "/resources", priority: "0.8", changefreq: "daily" },
        ];

        for (const page of indexPages) {
          urls.push({
            loc: `${BASE_URL}${page.path}`,
            lastmod: today,
            changefreq: page.changefreq,
            priority: page.priority,
          });
        }

        // Product pages
        for (const product of PRODUCTS) {
          urls.push({
            loc: `${BASE_URL}/products/${product.slug}`,
            lastmod: today,
            changefreq: "weekly",
            priority: "0.8",
          });
        }

        // Bundle pages
        for (const bundle of BUNDLES) {
          urls.push({
            loc: `${BASE_URL}/bundles/${bundle.slug}`,
            lastmod: today,
            changefreq: "weekly",
            priority: "0.7",
          });
        }

        // Comparison pages
        for (const comp of COMPARISONS) {
          urls.push({
            loc: `${BASE_URL}/compare/${comp.slug}`,
            lastmod: today,
            changefreq: "monthly",
            priority: "0.6",
          });
        }

        // Demo pages
        for (const product of PRODUCTS) {
          urls.push({
            loc: `${BASE_URL}/demo/${product.slug}`,
            lastmod: today,
            changefreq: "monthly",
            priority: "0.6",
          });
        }

        // Resource articles
        const publishedArticles = ARTICLES.filter(isPublished);
        for (const article of publishedArticles) {
          urls.push({
            loc: `${BASE_URL}/resources/${article.slug}`,
            lastmod: today,
            changefreq: "monthly",
            priority: "0.6",
          });
        }

        const xmlEntries = urls.map(entry).join("\n");

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlEntries}
</urlset>`;

        return new Response(xml, {
          status: 200,
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
