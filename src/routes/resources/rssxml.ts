/**
 * GET /resources/rssxml
 * RSS 2.0 feed of published articles.
 */

import { createFileRoute } from "@tanstack/react-router";
import { ARTICLES, isPublished } from "~/data/articles";

export const Route = createFileRoute("/resources/rssxml")({
  server: {
    handlers: {
      GET: async () => {
        const published = ARTICLES.filter(isPublished);
        const baseUrl = "https://www.prismbayai.com";

        const items = published
          .map(
            (article) => `    <item>
      <title><![CDATA[${article.title}]]></title>
      <link>${baseUrl}/resources/${article.slug}</link>
      <description><![CDATA[${article.description}]]></description>
      <guid isPermaLink="true">${baseUrl}/resources/${article.slug}</guid>
      <pubDate>${new Date().toUTCString()}</pubDate>
    </item>`,
          )
          .join("\n");

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>PrismBay Blog</title>
    <link>${baseUrl}/resources</link>
    <description>Guides, articles, and resources on AI business systems, digital transformation, AI compliance, AI workforce platforms, and building AI-native businesses.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/resources/rssxml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

        return new Response(xml, {
          status: 200,
          headers: {
            "Content-Type": "application/rss+xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
