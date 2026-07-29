/**
 * SEO helpers for PrismBay — reusable structured data and meta generators.
 *
 * Usage in route head():
 *   import { breadcrumbListScript, twitterMeta } from "~/utils/seo";
 *
 *   scripts: [breadcrumbListScript([...])],
 *   meta: [...existingMeta, ...twitterMeta(title, description, imageUrl)],
 */

export interface BreadcrumbItem {
  name: string;
  url: string;
}

/** Build a JSON-LD BreadcrumbList script tag object for TanStack Router's `scripts` array. */
export function breadcrumbListScript(items: BreadcrumbItem[]) {
  return {
    tag: "script" as const,
    attrs: { type: "application/ld+json" },
    children: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: items.map((item, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: item.name,
        item: item.url,
      })),
    }),
  };
}

const DEFAULT_OG_IMAGE = "https://www.prismbayai.com/images/og-default.png";

/**
 * Generate Twitter card meta tags from og values.
 * Use these alongside existing og:title / og:description.
 */
export function twitterMeta(
  title: string,
  description: string,
  image?: string,
): Array<{ name: string; content: string }> {
  return [
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: image ?? DEFAULT_OG_IMAGE },
  ];
}
