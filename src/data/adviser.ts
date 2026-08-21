/* ─── PrismBay AI Adviser — Phase 1 Retrieval / Query Layer ─── */
/* Deterministic, rule-first retrieval over the consolidated canonical
 * knowledge base (src/data/knowledge.ts). No LLM calls — keyword/intent
 * matching against canonical facts, returning a structured answer plus the
 * cited source facts and a confidence / fallback flag.
 *
 * Also contains a lightweight safety frame: canned fallbacks for anything the
 * data cannot answer, with no invented prices, no fabricated support promises,
 * and always pointing to real contact channels at @prismbayai.com.
 *
 * Purely additive — not imported by any existing page.
 */

import {
  getRecord,
  getProducts,
  getBundles,
  findByDisplayName,
  CONTACT_CHANNELS,
  type KnowledgeRecord,
} from "./knowledge";

/* ─── Public types ─── */

export type IntentType =
  | "recommendation"
  | "product_qa"
  | "comparison"
  | "business_fit"
  | "bundle_advisor"
  | "checkout_order"
  | "handoff";

export interface SearchResult {
  slug: string;
  name: string;
  kind: "product" | "bundle";
  score: number;
  matchedTerms: string[];
}

export interface AnswerSource {
  slug: string;
  kind: "product" | "bundle";
  name: string;
  label: string;
  value: string;
}

export interface BusinessProfile {
  size?: string; // e.g. "10-250 employees", "250+", "SMB", "enterprise"
  role?: string; // e.g. "procurement lead", "executive", "founder"
  need?: string; // what they want to accomplish
  spend?: string; // e.g. "$10M+ annual procurement spend"
}

export interface IntentContext {
  query?: string; // free text (recommendation / qa / fit)
  slug?: string; // product/bundle for product_qa
  slugs?: string[]; // comparison
  profile?: BusinessProfile; // business_fit
  issue?: string; // checkout/order issue type
}

export interface AdviserAnswer {
  intent: IntentType;
  answer: string;
  sources: AnswerSource[];
  productSlugs: string[];
  confidence: number; // 0..1
  fallback: boolean; // true when a canned fallback was used
}

/* ─── Small text helpers ─── */

const STOP = new Set([
  "i", "me", "my", "we", "our", "us", "you", "your", "the", "a", "an", "is",
  "are", "was", "be", "to", "of", "for", "and", "or", "but", "in", "on", "at",
  "with", "that", "this", "it", "its", "which", "what", "how", "do", "does",
  "not", "no", "can", "cant", "help", "want", "need", "get", "have", "has",
  "please", "recommend", "tell", "give", "about", "from", "by", "as", "so",
  "if", "then", "than", "will", "would", "should", "am", "been", "into",
]);

function norm(s: string): string {
  return s.toLowerCase().replace(/[’'`]/g, "").trim();
}

function tokenize(s: string): string[] {
  return norm(s)
    .split(/[^a-z0-9#+.-]+/)
    .filter((t) => t.length > 1 && !STOP.has(t));
}

function includesAny(corpus: string, terms: string[]): string[] {
  return terms.filter((t) => corpus.includes(t));
}

/* ─── 1. searchProducts ─── */

/** Rank all products+bundles by how many query terms match their canonical corpus. */
export function searchProducts(query: string): SearchResult[] {
  const terms = tokenize(query);
  const results: SearchResult[] = [];
  for (const r of getProducts().concat(getBundles())) {
    const matched: string[] = [];
    for (const t of terms) {
      if (r.corpus.includes(t) || r.name.toLowerCase().includes(t)) matched.push(t);
    }
    if (matched.length === 0) continue;
    let score = matched.length;
    // name/tagline hits weigh more: name is the first corpus segment
    if (r.name.toLowerCase().split(/\s+/).some((w) => matched.includes(norm(w)))) {
      score += 2;
    }
    results.push({ slug: r.slug, name: r.name, kind: r.kind, score, matchedTerms: matched });
  }
  return results.sort((a, b) => b.score - a.score);
}

/* ─── 2. getProductFacts ─── */

/** Return the full canonical fact record for a slug (product or bundle). */
export function getProductFacts(slug: string): KnowledgeRecord | undefined {
  return getRecord(slug);
}

/* ─── 3. Intent routing ─── */

const PRODUCT_ALIASES: Record<string, string[]> = {
  "nexusos": ["nexusos", "intelligent business operating system"],
  "nexus-one": ["nexus one", "nexus one os"],
  "empire-ai": ["empire ai", "empire", "executive command"],
  "nexus-network": ["nexus network", "marketplace"],
  "digital-humans": ["digital humans", "virtual employees", "ai workforce"],
  "genesis-platform": ["genesis platform", "genesis", "app builder", "no-code"],
  "guardianos": ["guardianos", "payment verification", "trust"],
  "spendshield-ai": ["spendshield", "spend shield", "procurement"],
  "evidenceflow-ai": ["evidenceflow", "evidence flow", "compliance"],
};

function detectSlugFromText(text: string): string | undefined {
  const c = norm(text);
  if (getRecord(c.replace(/\s+/g, "").replace(/-/g, ""))) {
    const exact = findByDisplayName(text);
    if (exact) return exact.slug;
  }
  // Check display-name partial (e.g. "SpendShield", "NexusOS")
  for (const r of getProducts()) {
    if (c.includes(norm(r.name))) return r.slug;
  }
  for (const r of getBundles()) {
    if (c.includes(norm(r.name))) return r.slug;
  }
  // Check aliases
  for (const [slug, aliases] of Object.entries(PRODUCT_ALIASES)) {
    if (aliases.some((a) => c.includes(a))) return slug;
  }
  return undefined;
}

/** Canned product-question matching against canonical FAQs + fact fields. */
function answerProductQa(rec: KnowledgeRecord, query: string): AdviserAnswer {
  const terms = tokenize(query);
  const sources: AnswerSource[] = [];
  // 1) Exact FAQ question/answer match by shared terms
  let bestFaq = rec.faqs[0];
  let bestFaqScore = 0;
  for (const f of rec.faqs) {
    const fq = includesAny(norm(f.question), terms).length;
    const fa = includesAny(norm(f.answer), terms).length;
    const s = fq * 3 + fa;
    if (s > bestFaqScore) {
      bestFaqScore = s;
      bestFaq = f;
    }
  }
  if (bestFaqScore > 0) {
    sources.push({ slug: rec.slug, kind: rec.kind, name: rec.name, label: "FAQ", value: bestFaq.answer });
    return {
      intent: "product_qa",
      answer: `Q: ${bestFaq.question}\nA: ${bestFaq.answer}`,
      sources,
      productSlugs: [rec.slug],
      confidence: 0.9,
      fallback: false,
    };
  }
  // 2) Match against bestFor / limitations / included
  const wantFit =
    includesAny(norm("best for who is it for fit suited suitable"), terms).length > 0 ||
    /fit|for who|best for|suitable|right for/i.test(query);
  if (wantFit) {
    sources.push({ slug: rec.slug, kind: rec.kind, name: rec.name, label: "Best for", value: rec.bestFor });
    for (const l of rec.limitations) {
      sources.push({ slug: rec.slug, kind: rec.kind, name: rec.name, label: "Not included", value: l });
    }
    return {
      intent: "product_qa",
      answer: `${rec.name} is best for: ${rec.bestFor}`,
      sources,
      productSlugs: [rec.slug],
      confidence: 0.85,
      fallback: false,
    };
  }
  // 3) Licence / pricing / format style questions fall to canonical fact fields
  const q = norm(query);
  if (/(licence|license|agency|multi-client)/.test(q)) {
    const lic = rec.limitations.find((l) => /licence|license/.test(l));
    const val = lic ?? "Single-business perpetual licence; agency or multi-client use requires a separate enterprise licence.";
    sources.push({ slug: rec.slug, kind: rec.kind, name: rec.name, label: "Licence", value: val });
    return {
      intent: "product_qa",
      answer: `${rec.name}: ${val}`,
      sources,
      productSlugs: [rec.slug],
      confidence: 0.8,
      fallback: false,
    };
  }
  if (rec.kind === "product" && rec.price && /(price|cost|how much|pricing)/.test(q)) {
    const val = `$${rec.price.launchPrice} (launch) / $${rec.price.regularPrice} (regular) — ${rec.price.discountPercent}% off launch.`;
    sources.push({ slug: rec.slug, kind: rec.kind, name: rec.name, label: "Price", value: val });
    return {
      intent: "product_qa",
      answer: `${rec.name}: ${val}`,
      sources,
      productSlugs: [rec.slug],
      confidence: 0.9,
      fallback: false,
    };
  }
  if (/(format|deliver|pdf|download)/.test(q)) {
    const val =
      "A structured documentation package — architecture diagrams, workflow maps, technical specifications, revenue model, and implementation roadmap — delivered as downloadable PDFs and editable source documents.";
    sources.push({ slug: rec.slug, kind: rec.kind, name: rec.name, label: "Format", value: val });
    return {
      intent: "product_qa",
      answer: `${rec.name}: ${val}`,
      sources,
      productSlugs: [rec.slug],
      confidence: 0.8,
      fallback: false,
    };
  }
  // 4) Deep-dive grounded answer for workflow / architecture / implementation
  const dd = rec.deepDive;
  const topic =
    /(workflow|how.*work|how.*operate|day.?to.?day)/.test(q)
      ? "workflow"
      : /(architect|stack|component|build.*system)/.test(q)
        ? "architecture"
        : /(implement|roadmap|stage|rollout|build|mvp|timeline|week)/.test(q)
          ? "implementation"
          : undefined;
  if (dd && topic) {
    const map = { workflow: dd.workflow, architecture: dd.architecture, implementation: dd.implementation } as const;
    sources.push({ slug: rec.slug, kind: rec.kind, name: rec.name, label: `${topic} overview`, value: map[topic] });
    return {
      intent: "product_qa",
      answer: map[topic],
      sources,
      productSlugs: [rec.slug],
      confidence: 0.9,
      fallback: false,
    };
  }
  // 5) General descriptive answer from description/valueStatement
  const desc = rec.longDescription ?? rec.description;
  sources.push({ slug: rec.slug, kind: rec.kind, name: rec.name, label: "Overview", value: desc });
  return {
    intent: "product_qa",
    answer: `${rec.name}: ${desc}`,
    sources,
    productSlugs: [rec.slug],
    confidence: 0.7,
    fallback: false,
  };
}

function recommend(query: string): AdviserAnswer {
  const q = norm(query);
  const matches = new Map<string, number>(); // slug -> weight

  const boost = (slug: string, keyword: string, weight = 1) => {
    if (q.includes(keyword)) matches.set(slug, (matches.get(slug) ?? 0) + weight);
  };

  boost("evidenceflow-ai", "compliance"); boost("evidenceflow-ai", "audit");
  boost("evidenceflow-ai", "evidence"); boost("evidenceflow-ai", "grc");
  boost("evidenceflow-ai", "iso"); boost("evidenceflow-ai", "soc");
  boost("guardianos", "payment fraud"); boost("guardianos", "payment verification");
  boost("guardianos", "fraud"); boost("guardianos", "supplier verification");
  boost("guardianos", "high-value payment"); boost("guardianos", "bec");
  boost("spendshield-ai", "procurement"); boost("spendshield-ai", "supplier");
  boost("spendshield-ai", "spend"); boost("spendshield-ai", "vendor");
  boost("spendshield-ai", "cost"); boost("spendshield-ai", "savings");
  boost("spendshield-ai", "negotiation"); boost("spendshield-ai", "purchasing");
  boost("digital-humans", "virtual"); boost("digital-humans", "workforce");
  boost("digital-humans", "ai employee"); boost("digital-humans", "ai worker");
  boost("digital-humans", "chatbot"); boost("digital-humans", "digital employee");
  boost("genesis-platform", "app builder"); boost("genesis-platform", "no-code");
  boost("genesis-platform", "nocode"); boost("genesis-platform", "application builder");
  boost("genesis-platform", "build apps"); boost("genesis-platform", "saas");
  boost("nexus-network", "marketplace"); boost("nexus-network", "collaboration");
  boost("nexus-network", "find partners"); boost("nexus-network", "b2b");
  boost("empire-ai", "executive"); boost("empire-ai", "dashboard");
  boost("empire-ai", "command"); boost("empire-ai", "company performance");
  boost("empire-ai", "monitor company"); boost("empire-ai", "kpi");
  boost("nexus-one", "smb"); boost("nexus-one", "small business");
  boost("nexus-one", "small and medium"); boost("nexus-one", "startup");
  boost("nexus-one", "10-250"); boost("nexus-one", "operations");
  boost("nexusos", "enterprise"); boost("nexusos", "250+"); boost("nexusos", "integration");
  boost("nexusos", "erp"); boost("nexusos", "department"); boost("nexusos", "operating system");

  // Detect any explicitly named product and boost it strongly
  const named = detectSlugFromText(query);
  if (named) matches.set(named, (matches.get(named) ?? 0) + 5);

  if (matches.size === 0) {
    return fallback("recommendation", query);
  }

  const ranked = [...matches.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
  const sources: AnswerSource[] = [];
  const lines: string[] = [`Recommended for "${query}":`];
  ranked.forEach(([slug]) => {
    const r = getRecord(slug)!;
    lines.push(`\n• ${r.name} — ${r.description}`);
    sources.push({ slug, kind: r.kind, name: r.name, label: "Description", value: r.description });
    sources.push({ slug, kind: r.kind, name: r.name, label: "Best for", value: r.bestFor });
    if (r.price) {
      sources.push({
        slug, kind: r.kind, name: r.name, label: "Launch price",
        value: `$${r.price.launchPrice} (launch) — regular $${r.price.regularPrice}`,
      });
    }
  });
  return {
    intent: "recommendation",
    answer: lines.join(""),
    sources,
    productSlugs: ranked.map(([s]) => s),
    confidence: 0.85,
    fallback: false,
  };
}

function businessFit(profile: BusinessProfile): AdviserAnswer {
  const query = [profile.size, profile.role, profile.need, profile.spend].filter(Boolean).join(" ");
  const q = norm(query);
  const scored: { r: KnowledgeRecord; s: number }[] = [];
  for (const r of getProducts()) {
    let s = 0;
    const size = norm(profile.size ?? "");
    const needs = norm(profile.need ?? "");
    if (size.includes("250") || size.includes("enterprise") || size.includes("large")) {
      if (/250\+/.test(r.bestFor)) s += 2;
      if (/10–250|10-250|smb|small and medium/.test(r.bestFor)) s -= 2;
    } else if (size.includes("smb") || size.match(/\b1?0?\s*[-–]\s*250/) || size.includes("small")) {
      if (/10–250|10-250|smb|small and medium/.test(r.bestFor)) {
        s += 3;
        if (/10–250|10-250/.test(r.bestFor)) s += 1;
      }
      if (/250\+/.test(r.bestFor)) s -= 3;
    }
    if (needs) {
      const nTerms = tokenize(needs).filter((t) => !["need","and","with","for"].includes(t));
      s += includesAny(r.corpus, nTerms).length * 1.5;
    }
    if (q.includes("procurement") && r.slug === "spendshield-ai") s += 4;
    if (/procurement|supplier|vendor|contract/.test(needs) && r.slug === "spendshield-ai") s += 3;
    if (/compliance|audit|evidence/.test(needs) && r.slug === "evidenceflow-ai") s += 3;
    if (/(fraud|payment|verify)/.test(needs) && r.slug === "guardianos") s += 3;
    if (/virtual|workforce/.test(needs) && r.slug === "digital-humans") s += 3;
    if (/app builder|no-code/.test(needs) && r.slug === "genesis-platform") s += 3;
    if (/executive|dashboard|monitor/.test(needs) && r.slug === "empire-ai") s += 3;
    if (/marketplace|collaboration/.test(needs) && r.slug === "nexus-network") s += 3;
    scored.push({ r, s });
  }
  const ranked = scored.filter((x) => x.s > 0).sort((a, b) => b.s - a.s);
  if (ranked.length === 0) return fallback("business_fit", query);
  const sources: AnswerSource[] = [];
  const lines: string[] = [`Fit assessment for${profile.size ? ` a ${profile.size} organization` : " your organization"}:`];
  ranked.slice(0, 3).forEach(({ r, s }) => {
    lines.push(`\n• ${r.name} (fit score ${s}) — ${r.bestFor}`);
    sources.push({ slug: r.slug, kind: r.kind, name: r.name, label: "Best for", value: r.bestFor });
    if (r.technicalRequirements) {
      sources.push({ slug: r.slug, kind: r.kind, name: r.name, label: "What you'll need", value: r.technicalRequirements });
    }
  });
  return {
    intent: "business_fit",
    answer: lines.join(""),
    sources: sources.slice(0, 6),
    productSlugs: ranked.slice(0, 3).map((x) => x.r.slug),
    confidence: 0.8,
    fallback: false,
  };
}

function compare(slugs: string[]): AdviserAnswer {
  const valid = slugs.map(getRecord).filter((r): r is KnowledgeRecord => Boolean(r));
  const query = slugs.join(" ");
  if (valid.length < 2) {
    return fallback("comparison", query);
  }
  const sources: AnswerSource[] = [];
  const lines: string[] = [];
  for (const r of valid) {
    lines.push(`\n=== ${r.name} ===`);
    lines.push(`Kind: ${r.kind === "product" ? "Product" : "Bundle"}`);
    if (r.kind === "product") {
      lines.push(`Category: ${r.category}`);
      if (r.price) {
        lines.push(`Launch price: $${r.price.launchPrice} (regular $${r.price.regularPrice}, ${r.price.discountPercent}% off)`);
      }
    } else if (r.bundle) {
      lines.push(
        `Includes: ${r.bundle.productNames.join(", ")} — launch $${r.bundle.launchPrice} (combined regular $${r.bundle.regularCombined}, save $${r.bundle.saving})`,
      );
    }
    lines.push(`What it does: ${r.description}`);
    lines.push(`Best for: ${r.bestFor}`);
    sources.push({ slug: r.slug, kind: r.kind, name: r.name, label: "Description", value: r.description });
    sources.push({ slug: r.slug, kind: r.kind, name: r.name, label: "Best for", value: r.bestFor });
    if (r.price) {
      sources.push({
        slug: r.slug, kind: r.kind, name: r.name, label: "Launch price",
        value: `$${r.price.launchPrice} (regular $${r.price.regularPrice})`,
      });
    }
  }
  return {
    intent: "comparison",
    answer: `Comparison of ${valid.map((r) => r.name).join(" vs ")}:\n${lines.join("")}`,
    sources,
    productSlugs: valid.map((r) => r.slug),
    confidence: 0.9,
    fallback: false,
  };
}

function bundleAdvise(query: string): AdviserAnswer {
  const q = norm(query);
  const bundles = getBundles();
  // Detect if a specific bundle is named
  const named = bundles.find((b) => q.includes(norm(b.name).replace(/-/g, " ")) || q.includes(norm(b.name)));
  const sources: AnswerSource[] = [];
  const lines: string[] = [];
  if (named) {
    lines.push(`${named.name}:`);
    lines.push(named.description);
    lines.push(`Launch price: $${named.bundle!.launchPrice} (combined regular $${named.bundle!.regularCombined}, you save $${named.bundle!.saving})`);
    lines.push(`Includes: ${named.bundle!.productNames.join(", ")}`);
    lines.push(`Best for: ${named.bestFor}`);
    sources.push({ slug: named.slug, kind: named.kind, name: named.name, label: "Description", value: named.description });
    sources.push({ slug: named.slug, kind: named.kind, name: named.name, label: "Launch price", value: `$${named.bundle!.launchPrice} (save $${named.bundle!.saving})` });
    sources.push({ slug: named.slug, kind: named.kind, name: named.name, label: "Best for", value: named.bestFor });
    return { intent: "bundle_advisor", answer: lines.join(""), sources, productSlugs: [named.slug], confidence: 0.9, fallback: false };
  }
  // Otherwise offer all bundles with a rough needs-based steer
  for (const b of bundles) {
    lines.push(`\n• ${b.name} — $${b.bundle!.launchPrice} (save $${b.bundle!.saving})`);
    lines.push(`  Includes: ${b.bundle!.productNames.join(", ")}`);
    if (includesAny(norm(b.bestFor), tokenize(q)).length > 0 || q.includes(norm(b.name))) {
      lines.push(`  → Match: ${b.bestFor}`);
      sources.push({ slug: b.slug, kind: b.kind, name: b.name, label: "Best for", value: b.bestFor });
    }
  }
  if (sources.length === 0) {
    return {
      intent: "bundle_advisor",
      answer: `Here are the available bundles:\n${lines.join("")}\n\nTell me a bit more about what you need and I can steer you to the right one.`,
      sources,
      productSlugs: bundles.map((b) => b.slug),
      confidence: 0.6,
      fallback: true,
    };
  }
  return {
    intent: "bundle_advisor",
    answer: `Bundles that may fit:\n${lines.join("")}`,
    sources,
    productSlugs: bundles.map((b) => b.slug),
    confidence: 0.75,
    fallback: false,
  };
}

function checkoutOrder(issue: string): AdviserAnswer {
  const q = norm(issue ?? "");
  const sources: AnswerSource[] = [];
  const contact = CONTACT_CHANNELS.support;
  const ref = CONTACT_CHANNELS.guarantees;

  if (/(refund|return|money.back|guarantee|not satisfied)/.test(q)) {
    const val = `Every purchase is covered by our 14-day money-back guarantee. Email ${contact} within ${ref.moneyBackDays} days of purchase with your order number and reason, and we will process a full refund. Refunds are processed within ${ref.refundProcessing}. See ${CONTACT_CHANNELS.site}${ref.refundPolicy}.`;
    sources.push({ slug: "policy", kind: "bundle", name: "Refund policy", label: "Guarantee", value: val });
    return { intent: "checkout_order", answer: val, sources, productSlugs: [], confidence: 0.9, fallback: false };
  }
  if (/(download|access my|where.*my|not receive|get my order)/.test(q)) {
    const val = `Your purchase is delivered digitally as downloadable PDFs and editable source documents. If you haven't received your download link, email ${contact} with your order number and we'll help — every message goes to a real person.`;
    sources.push({ slug: "order", kind: "bundle", name: "Order support", label: "Delivery", value: val });
    return { intent: "checkout_order", answer: val, sources, productSlugs: [], confidence: 0.8, fallback: true };
  }
  if (/(payment|charge|invoice|receipt|stripe|transaction|declined)/.test(q)) {
    const val = `For payment, invoice, or receipt questions (including billing or a declined charge), email ${contact} with your order details and we'll investigate directly. Order status is handled by a real person on our team.`;
    sources.push({ slug: "order", kind: "bundle", name: "Billing support", label: "Payments", value: val });
    return { intent: "checkout_order", answer: val, sources, productSlugs: [], confidence: 0.8, fallback: true };
  }
  if (/(license|licence)/.test(q)) {
    const val = `Every blueprint carries a single-business perpetual licence; agency or multi-client use requires a separate enterprise licence. Email ${CONTACT_CHANNELS.legal} for licensing questions.`;
    sources.push({ slug: "policy", kind: "bundle", name: "Licensing", label: "Licence", value: val });
    return { intent: "checkout_order", answer: val, sources, productSlugs: [], confidence: 0.8, fallback: false };
  }
  // Generic order support — never fabricate a status; hand to real contact
  const val = `This needs your account details, so a real person should help. Email ${contact} with your order number and describe the issue — we respond to every inquiry within 24 hours.`;
  sources.push({ slug: "order", kind: "bundle", name: "Order support", label: "Contact", value: val });
  return { intent: "checkout_order", answer: val, sources, productSlugs: [], confidence: 0.7, fallback: true };
}

function fallback(intent: IntentType, _query?: string): AdviserAnswer {
  return {
    intent,
    answer: `I couldn't find an answer to that in the canonical product catalogue. To be accurate, I'd rather not guess. You can browse the full catalogue at ${CONTACT_CHANNELS.site}, or reach a real person on our team — support at ${CONTACT_CHANNELS.support} (sales/support) or ${CONTACT_CHANNELS.partners} (partner program) — and we'll get you a precise answer.`,
    sources: [],
    productSlugs: [],
    confidence: 0.1,
    fallback: true,
  };
}

/* ─── 4. Public entry points ─── */

/** Answer a structured intent deterministically. */
export function answerIntent(intent: IntentType, ctx: IntentContext = {}): AdviserAnswer {
  switch (intent) {
    case "recommendation":
      return ctx.query ? recommend(ctx.query) : fallback(intent, "");
    case "product_qa": {
      let rec = ctx.slug ? getRecord(ctx.slug) : undefined;
      if (!rec && ctx.query) {
        const slug = detectSlugFromText(ctx.query);
        rec = slug ? getRecord(slug) : undefined;
      }
      if (!rec) return fallback(intent, ctx.query ?? "");
      return answerProductQa(rec, ctx.query ?? rec.name);
    }
    case "comparison": {
      let slugs = ctx.slugs ?? [];
      if (slugs.length === 0 && ctx.query) {
        // crude "a vs b" split
        const parts = ctx.query.trim().split(/\s+(?:vs?\.?|versus|or|and)\s+/i);
        if (parts.length >= 2) {
          slugs = parts.map((p) => detectSlugFromText(p) ?? p.trim()).filter(Boolean);
        }
      }
      return compare(slugs);
    }
    case "business_fit":
      return businessFit(ctx.profile ?? {});
    case "bundle_advisor":
      return bundleAdvise(ctx.query ?? "");
    case "checkout_order":
      return checkoutOrder(ctx.issue ?? ctx.query ?? "");
    case "handoff":
    default:
      return fallback("handoff", ctx.query ?? "");
  }
}

/** Route a free-text query to an intent and answer deterministically. */
export function answerQuery(text: string): AdviserAnswer {
  const q = norm(text);
  // Explicit named product with an informational question → product Q&A
  const slug = detectSlugFromText(text);
  // Order of intent detection (first match wins; ordered by safety/specificity)
  if (/refund|money.back|guarantee|order status|order number|download|my order|payment|invoice|receipt|not receive|declined|access my/.test(q)) {
    return answerIntent("checkout_order", { issue: text, query: text });
  }
  if (/vs\.?|versus|compare|difference|better/.test(q) && slug) {
    // comparison only when multiple names present
    const distinct = text
      .toLowerCase()
      .split(/\s+(?:vs?\.?|versus|and|or)\s+/)
      .filter((p) => detectSlugFromText(p));
    if (distinct.length >= 2) {
      return answerIntent("comparison", { query: text });
    }
  }
  if (/compare|vs\.?|versus|difference between/.test(q)) {
    return answerIntent("comparison", { query: text });
  }
  if (/bundle|portfolio|complete collection/.test(q)) {
    return answerIntent("bundle_advisor", { query: text });
  }
  if (/fit|best for|which (is )?best|suitable|my company|my business|we have|i have \d|employees|for a .+company/.test(q) && slug) {
    return answerIntent("product_qa", { query: text, slug });
  }
  if (/100|200|250|employees|smb|small|enterprise|startup|my business|my company/.test(q)) {
    return answerIntent("business_fit", {
      profile: { size: text, role: text, need: text },
    });
  }
  if (slug) {
    return answerIntent("product_qa", { query: text, slug });
  }
  if (/recommend|which|should i|what.*for|what.*product/.test(q)) {
    return answerIntent("recommendation", { query: text });
  }
  // Default: treat as recommendation/search; fall back gracefully
  const searched = searchProducts(text);
  if (searched.length > 0) {
    return answerIntent("recommendation", { query: text });
  }
  return answerIntent("handoff", { query: text });
}
