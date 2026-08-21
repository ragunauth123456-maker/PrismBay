/* ─── Ask PrismBay AI — widget copy + chat flow configuration ─── */
/* Pure logic/data (no React). Every chip maps to a deterministic intent or
 * canonical channel, grounded in:
 *   - /home/team/shared/products/adviser-flows.md  (UX / conversation copy)
 *   - src/data/knowledge.ts  (canonical facts + real contact channels)
 *   - src/data/adviser.ts    (the Phase-1 deterministic retrieval layer)
 * The retrieval returns concrete text (no {{placeholders}} in answers), so the
 * widget's authored copy is the only place placeholders appear — resolved here
 * from canonical values. Nothing invented: no new products, prices, guarantees,
 * or promises.
 */

import type {
  AdviserAnswer,
  IntentContext,
  IntentType,
} from "~/data/adviser";
import {
  CONTACT_CHANNELS,
  getBundles,
  getProducts,
  getRecord,
} from "~/data/knowledge";

/* ─── Chat message model ─── */

export type ChipKind =
  | "intent" // deterministic answerIntent(intent, ctx)
  | "query" // free-text answerQuery(query)
  | "link" // internal route (catalogue / policy)
  | "human" // handoff to a real person
  | "fit-start" // begin the business-fit clarifying flow
  | "fit-size" // answer the size step of the fit flow
  | "fit-need" // answer the need step of the fit flow
  | "compare-start"; // begin the comparison clarifying flow

export interface ChipDef {
  id: string;
  label: string;
  kind: ChipKind;
  intent?: IntentType;
  ctx?: IntentContext;
  query?: string;
  href?: string;
  value?: string;
}

export type ChatMessageKind = "greeting" | "clarify" | "answer" | "user";

export interface ChatMessage {
  id: string;
  role: "user" | "bot";
  kind: ChatMessageKind;
  text: string;
  answer?: AdviserAnswer;
  chips?: ChipDef[];
  secondaryChips?: ChipDef[];
}

/* ─── Placeholder resolution (canonical values only) ─── */

export function resolvePlaceholders(text: string): string {
  return text
    .replaceAll("{{CONTACT_EMAIL}}", CONTACT_CHANNELS.support)
    .replaceAll("{{LEGAL_EMAIL}}", CONTACT_CHANNELS.legal)
    .replaceAll("{{PARTNERS_EMAIL}}", CONTACT_CHANNELS.partners)
    .replaceAll("{{SITE}}", CONTACT_CHANNELS.site)
    .replaceAll(
      "{{REFUND_URL}}",
      `${CONTACT_CHANNELS.site}${CONTACT_CHANNELS.guarantees.refundPolicy}`
    );
}

/* ─── Chip constructors ─── */

function intentChip(
  id: string,
  label: string,
  intent: IntentType,
  ctx: IntentContext
): ChipDef {
  return { id, label, kind: "intent", intent, ctx };
}

function humanChip(id: string, label: string): ChipDef {
  return { id, label, kind: "human" };
}

const fitStart = (id: string, label: string): ChipDef => ({
  id,
  label,
  kind: "fit-start",
});
const compareStart = (id: string, label: string): ChipDef => ({
  id,
  label,
  kind: "compare-start",
});
const linkChip = (id: string, label: string, href: string): ChipDef => ({
  id,
  label,
  kind: "link",
  href,
});

/* ─── Widget opening screen ───
 * Greeting copy + quick-action chips verbatim from adviser-flows.md §"Widget
 * opening screen". */

export const GREETING =
  "Hi 👋 I'm the PrismBay AI Adviser.\n\n" +
  "I can help you find the right AI business system, compare products, check compatibility for your company, and answer questions about buying, delivery, and our 14-day guarantee.\n\n" +
  "Everything I say is based on our official product catalogue — I'll never quote a price or promise I can't back up. Pick a starting point below, or just ask me anything.";

export const OPENING_CHIPS: ChipDef[] = [
  { id: "o-fit", kind: "fit-start", label: "🧭 Which product fits my company size?" },
  { id: "o-compare", kind: "compare-start", label: "⚖️ Compare two products" },
  intentChip(
    "o-checkout",
    "💳 How does checkout & delivery work?",
    "checkout_order",
    { issue: "How does checkout and delivery work? Where do I get my download link?" }
  ),
  humanChip("o-human", "🧑💼 Talk to a real person"),
];

export const OPENING_SECONDARY_CHIPS: ChipDef[] = [
  intentChip("o2-blueprint", "Is it software or a blueprint?", "product_qa", {
    slug: "nexusos",
    query: "Is it software or a blueprint?",
  }),
  intentChip("o2-refund", "What's the refund guarantee?", "checkout_order", {
    issue: "What's the refund guarantee?",
  }),
  intentChip("o2-bundles", "View all bundles", "bundle_advisor", {
    query: "Show me the bundles",
  }),
  intentChip("o2-portfolio", "What's the full portfolio price?", "bundle_advisor", {
    query: "I want everything — the Complete AI Business Portfolio. What does it cost?",
  }),
];

/* ─── Clarifying flows (copy verbatim from adviser-flows.md) ─── */

// §4 business_fit clarify
export const FIT_SIZE_QUESTION =
  "Great — to find your best fit, what's your company size?";
export const FIT_SIZE_CHIPS: ChipDef[] = [
  { id: "fs-solo", kind: "fit-size", label: "Just me / small team", value: "Just me / small team" },
  { id: "fs-10", kind: "fit-size", label: "10–250 employees", value: "10–250 employees" },
  { id: "fs-250", kind: "fit-size", label: "250+ employees", value: "250+ employees" },
  { id: "fs-any", kind: "fit-size", label: "Not sure — recommend anyway", value: "not-sure" },
];

export const FIT_NEED_QUESTION =
  "Thanks. And what are you mainly trying to build or accomplish? For example: a business operating system, a no-code app builder, payment/supplier verification, procurement savings, compliance evidence, an AI workforce, or a collaboration marketplace.";
export const FIT_NEED_CHIPS: ChipDef[] = [
  { id: "fn-os", kind: "fit-need", label: "A business operating system", value: "a business operating system" },
  { id: "fn-builder", kind: "fit-need", label: "A no-code app builder", value: "a no-code app builder" },
  { id: "fn-proc", kind: "fit-need", label: "Procurement savings", value: "procurement savings" },
  { id: "fn-pay", kind: "fit-need", label: "Payment / supplier verification", value: "payment fraud protection" },
  { id: "fn-comp", kind: "fit-need", label: "Compliance evidence", value: "compliance evidence" },
  { id: "fn-workforce", kind: "fit-need", label: "An AI workforce", value: "an AI virtual workforce" },
  { id: "fn-market", kind: "fit-need", label: "A collaboration marketplace", value: "a collaboration marketplace" },
];

// §3 comparison clarify
export const COMPARE_QUESTION =
  "I can compare any two or three products from the catalogue. Which two would you like me to compare? (You can also type it, e.g. “Genesis vs NexusOS”.)";
export const COMPARE_CHIPS: ChipDef[] = [
  intentChip("cmp-1", "NexusOS vs Nexus One", "comparison", { query: "NexusOS vs Nexus One" }),
  intentChip("cmp-2", "GuardianOS vs SpendShield AI", "comparison", { query: "GuardianOS vs SpendShield AI" }),
  intentChip("cmp-3", "Digital Humans vs Genesis Platform", "comparison", { query: "Digital Humans vs Genesis Platform" }),
  intentChip("cmp-4", "Empire AI vs Nexus Network", "comparison", { query: "Empire AI vs Nexus Network" }),
];

// §6/7 soft-confirmation note (confidence band 0.3–0.7)
export const SOFT_CONFIRM_NOTE = resolvePlaceholders(
  "If you'd like confirmation from a person, email {{CONTACT_EMAIL}} and we'll verify it for you."
);

/* ─── Deep-link map: canonical product/bundle names → internal routes ─── */

export interface NamedLink {
  name: string;
  href: string;
  kind: "name" | "email";
}

/** Product/bundle names (longest first) for in-answer deep links + real emails. */
export function buildNamedLinks(): NamedLink[] {
  const records: NamedLink[] = getProducts()
    .concat(getBundles())
    .map((r) => ({
      name: r.name,
      href: r.kind === "product" ? `/products/${r.slug}` : `/bundles/${r.slug}`,
      kind: "name" as const,
    }));
  records.push(
    { name: CONTACT_CHANNELS.support, href: `mailto:${CONTACT_CHANNELS.support}`, kind: "email" },
    { name: CONTACT_CHANNELS.legal, href: `mailto:${CONTACT_CHANNELS.legal}`, kind: "email" },
    { name: CONTACT_CHANNELS.partners, href: `mailto:${CONTACT_CHANNELS.partners}`, kind: "email" }
  );
  return records.sort((a, b) => b.name.length - a.name.length);
}

/* ─── Post-answer re-engagement chips (per intent, ground in canon) ─── */

export function nextActionsFor(answer: AdviserAnswer): ChipDef[] {
  const slug = answer.productSlugs[0];
  const rec = slug ? getRecord(slug) : undefined;

  switch (answer.intent) {
    case "recommendation":
      return [
        fitStart("ra-fit", "Check fit for my company"),
        compareStart("ra-compare", "Compare two products"),
        intentChip("ra-bundle", "Show me bundles", "bundle_advisor", {
          query: "Show me the bundles",
        }),
      ];

    case "product_qa": {
      if (rec && rec.kind === "bundle") {
        const constituents = (rec.bundle?.productNames ?? []).slice(0, 3);
        const chips: ChipDef[] = constituents.map((n, i) =>
          intentChip(`pp-const-${i}`, `Tell me about ${n}`, "product_qa", {
            query: `Tell me about ${n}`,
          })
        );
        chips.push(fitStart("pp-fit", "Which bundle fits my company?"));
        return chips;
      }
      if (!slug) return handoffReengage();
      return [
        intentChip("pp-price", "Want the price?", "product_qa", {
          slug,
          query: "What does it cost?",
        }),
        intentChip("pp-bestfor", "Who is it best for?", "product_qa", {
          slug,
          query: "Who is it best for?",
        }),
        intentChip("pp-limits", "What are the limitations?", "product_qa", {
          slug,
          query: "What are the limitations?",
        }),
        fitStart("pp-fit", "Does it fit my company size?"),
      ];
    }

    case "comparison":
      return [
        fitStart("cp-fit", "Check fit for my company"),
        compareStart("cp-another", "Compare a different pair"),
      ];

    case "business_fit": {
      const topTwo = answer.productSlugs.slice(0, 2);
      const chips: ChipDef[] = [];
      if (topTwo.length >= 2) {
        chips.push(
          intentChip(
            "bf-cmp",
            "Compare the top two",
            "comparison",
            { slugs: topTwo }
          )
        );
      }
      chips.push(
        intentChip("bf-bundle", "Show me bundles", "bundle_advisor", {
          query: "Show me the bundles",
        })
      );
      chips.push(fitStart("bf-refine", "Refine my company details"));
      return chips;
    }

    case "bundle_advisor": {
      const constituents = (rec?.bundle?.productNames ?? []).slice(0, 3);
      const chips: ChipDef[] = constituents.map((n, i) =>
        intentChip(`bd-const-${i}`, `Tell me about ${n}`, "product_qa", {
          query: `Tell me about ${n}`,
        })
      );
      const otherBundle = getBundles().find((b) => b.slug !== rec?.slug);
      if (otherBundle && rec) {
        chips.push(
          intentChip(
            "bd-vs",
            "Compare it to another bundle",
            "comparison",
            { query: `Compare ${rec.name} vs ${otherBundle.name}` }
          )
        );
      }
      chips.push(fitStart("bd-fit", "Which bundle fits my company?"));
      return chips;
    }

    case "checkout_order":
      return [
        intentChip("co-refund", "Refund & guarantee?", "checkout_order", {
          issue: "What's the refund guarantee?",
        }),
        intentChip("co-lic", "Licensing for clients?", "checkout_order", {
          issue: "License for clients?",
        }),
        humanChip("co-human", "Talk to a person about my order"),
      ];

    case "handoff":
    default:
      return handoffReengage();
  }
}

function handoffReengage(): ChipDef[] {
  return [
    linkChip("hr-browse", "Browse the full catalogue", "/products"),
    intentChip("hr-refund", "Refund guarantee", "checkout_order", {
      issue: "What's the refund guarantee?",
    }),
    fitStart("hr-fit", "Find a product that fits"),
    humanChip("hr-human", "Talk to a human"),
  ];
}
