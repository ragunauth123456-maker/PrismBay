/* ─── PrismBay AI Adviser — Phase 1 Knowledge Base ─── */
/* Consolidated, citable, canonical content source for the AI Adviser.
 *
 * This module does NOT own any facts. It consolidates three canonical sources
 * into one structured, keyed-by-slug dataset:
 *   - product facts  -> src/data/products.ts   (single source of truth)
 *   - fit content    -> product-fit fields that live ON products.ts (bestFor,
 *                       technicalRequirements, limitations), which match
 *                       /home/team/shared/products/product-fit.md verbatim
 *   - deep-dive      -> src/data/deep-dives.ts (verbatim transcription of
 *                       /home/team/shared/products/deep-dive.md)
 *
 * All values are pulled verbatim from those canonical sources (imported, not
 * copied). Nothing is invented or summarized here. Purely additive — this file
 * is not imported by any existing page.
 */

import { PRODUCTS, BUNDLES, type FAQ } from "./products";
import { DEEP_DIVES, type DeepDive } from "./deep-dives";

export interface PriceFacts {
  regularPrice: number;
  launchPrice: number;
  discountPercent: number;
}

export interface BundleFacts {
  productSlugs: string[];
  productNames: string[];
  regularCombined: number;
  launchPrice: number;
  saving: number;
}

export interface KnowledgeRecord {
  slug: string;
  kind: "product" | "bundle";
  name: string;
  category: string;
  description: string;
  longDescription?: string;
  valueStatement?: string;
  ctaText?: string;
  price?: PriceFacts;
  bundle?: BundleFacts;
  included: string[];
  faqs: FAQ[];
  // Fit content (verbatim from canonical products.ts / product-fit.md)
  bestFor: string;
  technicalRequirements?: string;
  limitations: string[];
  // Deep-dive content (verbatim from deep-dives.ts); products only
  deepDive?: DeepDive;
  // Search index: a single searchable corpus for keyword matching
  corpus: string;
  // Citable source references
  sources: string[];
}

function buildCorpus(parts: (string | undefined | string[])[]): string {
  const flat: string[] = [];
  for (const p of parts) {
    if (Array.isArray(p)) flat.push(p.join(" "));
    else if (p) flat.push(p);
  }
  return flat.join(" \n").toLowerCase();
}

export const KNOWLEDGE: KnowledgeRecord[] = (() => {
  const records: KnowledgeRecord[] = [];

  for (const p of PRODUCTS) {
    const dd = DEEP_DIVES[p.slug]; // may be undefined for safety
    const faqCorpus = p.faqs.map((f) => `${f.question} ${f.answer}`).join(" ");
    const includedCorpus = p.included.join(" ");
    const deepDiveCorpus = dd
      ? `${dd.workflow} ${dd.implementation} ${dd.architecture}`
      : "";
    records.push({
      slug: p.slug,
      kind: "product",
      name: p.name,
      category: p.category,
      description: p.description,
      longDescription: p.longDescription,
      valueStatement: p.valueStatement,
      ctaText: p.ctaText,
      price: {
        regularPrice: p.regularPrice,
        launchPrice: p.launchPrice,
        discountPercent: p.discountPercent,
      },
      included: p.included,
      faqs: p.faqs,
      bestFor: p.bestFor,
      technicalRequirements: p.technicalRequirements,
      limitations: p.limitations,
      deepDive: dd,
      corpus: buildCorpus([
        p.name,
        p.tagline,
        p.category,
        p.description,
        p.longDescription,
        p.bestFor,
        p.technicalRequirements,
        p.limitations,
        faqCorpus,
        includedCorpus,
        deepDiveCorpus,
      ]),
      sources: [
        `src/data/products.ts (canonical product facts) → slug ${p.slug}`,
        "product-fit fields (match /home/team/shared/products/product-fit.md verbatim)",
        dd ? "src/data/deep-dives.ts (match /home/team/shared/products/deep-dive.md verbatim)" : "",
      ].filter(Boolean),
    });
  }

  for (const b of BUNDLES) {
    const includedCorpus = b.productNames.join(" ");
    records.push({
      slug: b.slug,
      kind: "bundle",
      name: b.name,
      category: "Bundle",
      description: b.description,
      bundle: {
        productSlugs: b.productSlugs,
        productNames: b.productNames,
        regularCombined: b.regularCombined,
        launchPrice: b.launchPrice,
        saving: b.saving,
      },
      included: b.productNames,
      faqs: [],
      bestFor: b.bestFor,
      technicalRequirements: b.technicalRequirements,
      limitations: b.limitations,
      corpus: buildCorpus([
        b.name,
        b.description,
        b.bestFor,
        b.limitations,
        includedCorpus,
      ]),
      sources: [
        "src/data/products.ts → Bundle specifications (canonical)",
        "Bundle fit fields (match /home/team/shared/products/product-fit.md verbatim)",
      ],
    });
  }

  return records;
})();

const recordMap = new Map<string, KnowledgeRecord>();
for (const r of KNOWLEDGE) recordMap.set(r.slug, r);

/** Get one record (product or bundle) by slug. */
export function getRecord(slug: string): KnowledgeRecord | undefined {
  return recordMap.get(slug);
}

/** All consolidated records (products + bundles). */
export function getAllRecords(): KnowledgeRecord[] {
  return KNOWLEDGE;
}

/** All product records. */
export function getProducts(): KnowledgeRecord[] {
  return KNOWLEDGE.filter((r) => r.kind === "product");
}

/** All bundle records. */
export function getBundles(): KnowledgeRecord[] {
  return KNOWLEDGE.filter((r) => r.kind === "bundle");
}

/** Resolve a product/bundle by name (case/space insensitive; exact or prefix/substring). */
export function findByDisplayName(name: string): KnowledgeRecord | undefined {
  const norm = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "");
  if (!norm) return undefined;
  return KNOWLEDGE.find((r) => {
    const rn = r.name.toLowerCase().replace(/[^a-z0-9]+/g, "");
    return rn === norm || rn.startsWith(norm) || norm.startsWith(rn);
  });
}

/** Real contact / policy facts the safety frame references (all real channels). */
export const CONTACT_CHANNELS = {
  support: "support@prismbayai.com",
  legal: "legal@prismbayai.com",
  partners: "partners@prismbayai.com",
  site: "https://www.prismbayai.com",
  guarantees: {
    refundPolicy: "/refunds",
    moneyBackDays: 14,
    refundProcessing: "5 business days",
    terms: "/terms",
  } as const,
} as const;
