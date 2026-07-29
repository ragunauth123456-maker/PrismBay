/**
 * File storage helpers for product file serving.
 */

import { BUNDLES } from "~/data/products";

const ZIP_DIR = "/home/team/shared/product-repos";

export function getZipPath(slug: string): string {
  return `${ZIP_DIR}/${slug}.zip`;
}

export function getBundleProductSlugs(bundleSlug: string): string[] {
  const bundle = BUNDLES.find((b) => b.slug === bundleSlug);
  return bundle?.productSlugs ?? [];
}

export function isBundle(slug: string): boolean {
  return BUNDLES.some((b) => b.slug === slug);
}
