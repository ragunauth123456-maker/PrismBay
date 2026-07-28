/* ─── PrismBay Comparison Data ─── */
/* Defines all product comparison configurations used by /compare routes. */

import { PRODUCTS, BUNDLES, getProductBySlug, type Product, type Bundle } from "~/data/products";

export interface ComparisonDimension {
  /** Label for the dimension row */
  name: string;
  /** One value per product in order */
  values: string[];
  /** Optional: index of winning product for this dimension */
  winnerIndex?: number;
}

export interface FeatureGroup {
  groupName: string;
  features: ComparisonDimension[];
}

export interface ComparisonConfig {
  /** URL slug — e.g. "nexusos-vs-nexus-one" */
  slug: string;
  /** Page title — e.g. "NexusOS vs Nexus One" */
  title: string;
  /** Product slugs to compare */
  productSlugs: string[];
  /** One-sentence differentiator for SEO + hero */
  oneLiner: string;
  /** SEO meta description */
  seoDescription: string;
  /** Decision guide: chooseA for product[0], chooseB for product[1] */
  decisionGuide: {
    titleA: string;
    descriptionA: string;
    titleB: string;
    descriptionB: string;
  };
  /** Quick comparison rows */
  quickComparison: ComparisonDimension[];
  /** Detailed feature groups */
  featureGroups: FeatureGroup[];
  /** Bundle that contains both/all products, if applicable */
  bundleSlug?: string;
}

/* ─── Comparison configurations ─── */

export const COMPARISONS: ComparisonConfig[] = [
  {
    slug: "nexusos-vs-nexus-one",
    title: "NexusOS vs Nexus One",
    productSlugs: ["nexusos", "nexus-one"],
    oneLiner: "Enterprise operating system vs SMB-friendly business OS — same family name, different scale.",
    seoDescription:
      "Compare NexusOS and Nexus One side by side: enterprise business operating system vs SMB AI workspace. See features, pricing, target company size, and find which fits your organization.",
    decisionGuide: {
      titleA: "Choose NexusOS if you run a large organization",
      descriptionA:
        "You have multiple departments (finance, HR, procurement, operations, compliance, sales, marketing) that need deep integration, governance controls, and executive oversight through an intelligent business operating system.",
      titleB: "Choose Nexus One if you run an SMB (10–250 people)",
      descriptionB:
        "You need a practical, connected workspace that brings customers, sales, tasks, projects, expenses, and team activity into one view — without the complexity of enterprise departmental modules.",
    },
    quickComparison: [
      {
        name: "Target company size",
        values: ["250+ employees", "10–250 employees"],
      },
      {
        name: "Regular price",
        values: ["$599", "$399"],
      },
      {
        name: "Launch price",
        values: ["$449", "$299"],
        winnerIndex: 1,
      },
      {
        name: "Implementation complexity",
        values: ["Higher — multi-department rollout", "Moderate — single unified workspace"],
      },
      {
        name: "Key strength",
        values: ["Deep departmental integration", "SMB simplicity and speed"],
      },
    ],
    featureGroups: [
      {
        groupName: "Core Business Management",
        features: [
          {
            name: "Department modules",
            values: ["Full suite (fin, HR, sales, mktg, procurement, ops, compliance, PM)",
              "Core modules (sales, tasks, projects, expenses, team)"],
          },
          { name: "Executive command centre", values: ["✓", "—"] },
          { name: "Daily workflow automation", values: ["✓", "✓"] },
          { name: "Business analytics", values: ["✓", "✓"] },
          { name: "Team activity reporting", values: ["✓", "✓"] },
        ],
      },
      {
        groupName: "AI & Intelligence",
        features: [
          { name: "AI agent coordination", values: ["Multi-agent orchestration", "Single-agent assistance"] },
          { name: "Business intelligence framework", values: ["Advanced BI", "Executive summaries"] },
          { name: "Risk identification", values: ["Automated risk monitoring", "Exception alerts"] },
          { name: "Decision-support agents", values: ["Cross-department", "Daily operations"] },
        ],
      },
      {
        groupName: "Pricing & Commercial",
        features: [
          { name: "SaaS revenue model", values: ["Enterprise-tier", "SMB-tier"] },
          { name: "Launch savings", values: ["$150 (25%)", "$100 (25%)"] },
          { name: "Licence", values: ["Single-business perpetual", "Single-business perpetual"] },
        ],
      },
    ],
    bundleSlug: "ai-business-operations",
  },
  {
    slug: "nexusos-vs-empire-ai",
    title: "NexusOS vs Empire AI",
    productSlugs: ["nexusos", "empire-ai"],
    oneLiner: "Run the business vs oversee it — operational platform or executive command centre?",
    seoDescription:
      "Compare NexusOS and Empire AI: intelligent business OS for running the company vs executive command platform for overseeing it. Pricing, features, and which fits your role.",
    decisionGuide: {
      titleA: "Choose NexusOS if you're building the operational backbone",
      descriptionA:
        "You need to connect every department — finance, HR, sales, procurement, compliance — into one intelligent system. Your focus is on how the business runs day to day.",
      titleB: "Choose Empire AI if you need executive visibility and control",
      descriptionB:
        "You need one command centre to monitor financial results, operations, workforce, projects, risks, and forecasts. Your focus is on strategic oversight and decision support.",
    },
    quickComparison: [
      { name: "Primary user", values: ["COO / Operations leadership", "CEO / Executive leadership"] },
      { name: "Regular price", values: ["$599", "$549"] },
      {
        name: "Launch price",
        values: ["$449", "$399"],
        winnerIndex: 1,
      },
      { name: "Focus", values: ["Running the business", "Overseeing the business"] },
      { name: "Key strength", values: ["Departmental integration", "Strategic visibility"] },
    ],
    featureGroups: [
      {
        groupName: "Scope & Coverage",
        features: [
          { name: "Finance", values: ["Full workflows", "Performance monitoring"] },
          { name: "HR / Workforce", values: ["Workflows + management", "Performance tracking"] },
          { name: "Operations", values: ["Full operations management", "Operational monitoring"] },
          { name: "Sales & Marketing", values: ["Full workflows", "—"] },
          { name: "Procurement", values: ["Full workflows", "—"] },
        ],
      },
      {
        groupName: "Intelligence Layer",
        features: [
          { name: "AI agent coordination", values: ["Multi-agent orchestration", "Decision-support agents"] },
          { name: "Reporting", values: ["Operational reports", "Executive reports"] },
          { name: "Risk & exceptions", values: ["Automated risk monitoring", "Risk + exception alerts"] },
          { name: "Forecasting", values: ["Department-level", "Company-wide framework"] },
        ],
      },
      {
        groupName: "Strategic Tools",
        features: [
          { name: "Strategic planning", values: ["—", "Full strategic planning workflows"] },
          { name: "Project monitoring", values: ["Project management", "Project monitoring"] },
          { name: "Command dashboard", values: ["Department dashboards", "Unified executive dashboard"] },
        ],
      },
    ],
    bundleSlug: "ai-business-operations",
  },
  {
    slug: "spendshield-ai-vs-guardianos",
    title: "SpendShield AI vs GuardianOS",
    productSlugs: ["spendshield-ai", "guardianos"],
    oneLiner: "Procurement cost control vs payment fraud prevention — both protect your money, in different ways.",
    seoDescription:
      "Compare SpendShield AI and GuardianOS: AI procurement intelligence for cost savings vs AI trust & payment verification for fraud prevention. Features, pricing, and use cases.",
    decisionGuide: {
      titleA: "Choose SpendShield AI if you need to control procurement spending",
      descriptionA:
        "Your team reviews purchases, compares suppliers, analyzes contracts, and identifies savings opportunities. Your priority is reducing costs and managing vendor risk across procurement.",
      titleB: "Choose GuardianOS if you need to verify payments and prevent fraud",
      descriptionB:
        "Your team processes high-value payments and needs to verify supplier bank details, check identities, confirm approval authority, and block suspicious transactions before money moves.",
    },
    quickComparison: [
      { name: "Primary risk", values: ["Wasted procurement spend", "Payment fraud"] },
      { name: "Regular price", values: ["$349", "$499"] },
      { name: "Launch price", values: ["$249", "$369"] },
      { name: "Integration", values: ["Procurement workflows", "Finance / AP workflows"] },
      { name: "Key strength", values: ["Savings identification", "Fraud detection & blocking"] },
    ],
    featureGroups: [
      {
        groupName: "Core Capability",
        features: [
          { name: "Spend analysis", values: ["✓", "—"] },
          { name: "Supplier comparison", values: ["✓", "—"] },
          { name: "Contract review", values: ["✓", "—"] },
          { name: "Payment verification", values: ["—", "✓"] },
          { name: "Identity checks", values: ["—", "✓"] },
          { name: "Fraud risk alerts", values: ["—", "✓"] },
        ],
      },
      {
        groupName: "Risk & Control",
        features: [
          { name: "Vendor risk assessment", values: ["✓", "—"] },
          { name: "Approval authority checks", values: ["—", "✓"] },
          { name: "Duplicate charge detection", values: ["✓", "—"] },
          { name: "Suspicious change detection", values: ["—", "✓"] },
          { name: "Price variance analysis", values: ["✓", "—"] },
          { name: "Emergency verification workflows", values: ["—", "✓"] },
        ],
      },
      {
        groupName: "Business Model",
        features: [
          { name: "Revenue model", values: ["Service revenue", "Enterprise pricing"] },
          { name: "Launch savings", values: ["$100 (29%)", "$130 (26%)"] },
          { name: "Target org spend", values: ["$10M+ procurement", "Any transaction volume"] },
        ],
      },
    ],
    bundleSlug: "trust-risk-compliance",
  },
  {
    slug: "genesis-platform-vs-nexusos",
    title: "Genesis Platform vs NexusOS",
    productSlugs: ["genesis-platform", "nexusos"],
    oneLiner: "Build a platform for others vs run your own company — two of our most ambitious products.",
    seoDescription:
      "Compare Genesis Platform and NexusOS: build an AI app builder platform vs run your business with an intelligent OS. Features, pricing, target audience, and implementation.",
    decisionGuide: {
      titleA: "Choose Genesis Platform if you want to build a platform business",
      descriptionA:
        "You're a technical founder building a no-code AI app builder for others to use. Your customers will create applications — you provide the platform, templates, and infrastructure.",
      titleB: "Choose NexusOS if you want to run your own company better",
      descriptionB:
        "You're an operational leader connecting your business departments into one intelligent system. AI agents coordinate workflows, reports, and decisions across your organization.",
    },
    quickComparison: [
      { name: "Your role", values: ["Platform founder", "Business operator"] },
      { name: "End user", values: ["Your customers (app creators)", "Your team (department staff)"] },
      { name: "Regular price", values: ["$699", "$599"] },
      { name: "Launch price", values: ["$499", "$449"] },
      { name: "Key strength", values: ["Platform business model", "Operational integration"] },
    ],
    featureGroups: [
      {
        groupName: "What You're Building",
        features: [
          { name: "Product type", values: ["AI app builder platform", "Internal business OS"] },
          { name: "AI agents", values: ["Agent builder tools", "Pre-built agent coordination"] },
          { name: "Workflows", values: ["Configurable by end users", "Pre-designed departmental"] },
          { name: "User auth & billing", values: ["Multi-tenant SaaS", "Internal team access"] },
        ],
      },
      {
        groupName: "Technical Scope",
        features: [
          { name: "No-code builder engine", values: ["✓", "—"] },
          { name: "Template marketplace", values: ["✓", "—"] },
          { name: "Database config", values: ["End-user configurable", "Pre-configured"] },
          { name: "Department modules", values: ["—", "Full suite (8+ depts)"] },
        ],
      },
      {
        groupName: "Commercial",
        features: [
          { name: "Revenue model", values: ["Subscription billing + enterprise", "SaaS revenue"] },
          { name: "Launch savings", values: ["$200 (29%)", "$150 (25%)"] },
          { name: "Est. time to MVP", values: ["16–20 weeks", "12–16 weeks"] },
        ],
      },
    ],
  },
  {
    slug: "guardianos-vs-evidenceflow-ai",
    title: "GuardianOS vs EvidenceFlow AI",
    productSlugs: ["guardianos", "evidenceflow-ai"],
    oneLiner: "Active fraud prevention vs passive compliance evidence — two sides of trust & compliance.",
    seoDescription:
      "Compare GuardianOS and EvidenceFlow AI: active payment fraud prevention vs automated compliance evidence management. Features, pricing, and which fits your security needs.",
    decisionGuide: {
      titleA: "Choose GuardianOS if you need to stop fraud before it happens",
      descriptionA:
        "Your finance team processes high-value payments and needs active verification — checking bank details, identities, and approval authority before funds move. You prevent loss, not document it.",
      titleB: "Choose EvidenceFlow AI if you need to prove compliance after the fact",
      descriptionB:
        "Your compliance team collects evidence for audits — policies, certificates, screenshots, and records. AI agents classify, map to controls, and prepare audit-ready files. You document proof, not block threats.",
    },
    quickComparison: [
      { name: "Primary function", values: ["Real-time fraud prevention", "Evidence collection & audit prep"] },
      { name: "Regular price", values: ["$499", "$349"] },
      { name: "Launch price", values: ["$369", "$249"] },
      { name: "Timing", values: ["Before money moves", "Before auditors arrive"] },
      { name: "Key strength", values: ["Active threat blocking", "Automated evidence organization"] },
    ],
    featureGroups: [
      {
        groupName: "Core Capability",
        features: [
          { name: "Payment verification", values: ["✓", "—"] },
          { name: "Identity checks", values: ["✓", "—"] },
          { name: "Supplier verification", values: ["✓", "—"] },
          { name: "Document classification", values: ["—", "✓"] },
          { name: "Control mapping", values: ["—", "✓"] },
          { name: "Audit preparation", values: ["—", "✓"] },
        ],
      },
      {
        groupName: "Detection & Alerts",
        features: [
          { name: "Fraud risk alerts", values: ["✓", "—"] },
          { name: "Suspicious change detection", values: ["✓", "—"] },
          { name: "Missing evidence tracking", values: ["—", "✓"] },
          { name: "Evidence status dashboard", values: ["—", "✓"] },
        ],
      },
      {
        groupName: "Compliance Frameworks",
        features: [
          { name: "SOC 2", values: ["✓", "✓"] },
          { name: "ISO 27001", values: ["✓", "✓"] },
          { name: "PCI DSS", values: ["✓", "✓"] },
          { name: "Framework coverage", values: ["Security architecture", "Full control mapping"] },
        ],
      },
    ],
    bundleSlug: "trust-risk-compliance",
  },
  {
    slug: "empire-ai-vs-nexus-one",
    title: "Empire AI vs Nexus One",
    productSlugs: ["empire-ai", "nexus-one"],
    oneLiner: "Executive command centre vs SMB operations — similar price, different perspective.",
    seoDescription:
      "Compare Empire AI and Nexus One: executive AI command platform vs SMB business OS. Similar pricing, very different audiences. Features, target users, and what each is built for.",
    decisionGuide: {
      titleA: "Choose Empire AI if you're a CEO or executive",
      descriptionA:
        "You need one dashboard to monitor everything — financial results, operations, workforce, risks, and strategic priorities. Your focus is oversight and decision-making, not daily task management.",
      titleB: "Choose Nexus One if you run an SMB",
      descriptionB:
        "You need a practical operating system that connects daily work — sales tracking, task coordination, expense monitoring, and team reporting. Your focus is getting things done, not executive dashboards.",
    },
    quickComparison: [
      { name: "Primary user", values: ["CEO / Executive", "SMB owner / ops lead"] },
      { name: "Regular price", values: ["$549", "$399"] },
      { name: "Launch price", values: ["$399", "$299"] },
      { name: "Focus", values: ["Strategic oversight", "Daily operations"] },
      { name: "Key strength", values: ["Decision support", "Workflow automation"] },
    ],
    featureGroups: [
      {
        groupName: "What You See",
        features: [
          { name: "Dashboard type", values: ["Executive command centre", "Daily workspace"] },
          { name: "Financial view", values: ["Performance monitoring", "Expense tracking"] },
          { name: "Workforce view", values: ["Performance tracking", "Team activity reporting"] },
          { name: "Risk view", values: ["Risk + exception alerts", "—"] },
        ],
      },
      {
        groupName: "What You Do",
        features: [
          { name: "Strategic planning", values: ["✓", "—"] },
          { name: "Forecasting", values: ["✓", "—"] },
          { name: "Sales tracking", values: ["—", "✓"] },
          { name: "Task coordination", values: ["—", "✓"] },
          { name: "Project management", values: ["Project monitoring", "Project tracking"] },
        ],
      },
      {
        groupName: "Pricing",
        features: [
          { name: "Launch savings", values: ["$150 (27%)", "$100 (25%)"] },
          { name: "Target company size", values: ["Any size", "10–250 employees"] },
          { name: "Implementation complexity", values: ["Moderate", "Lower"] },
        ],
      },
    ],
    bundleSlug: "ai-business-operations",
  },
  {
    slug: "ai-business-operations",
    title: "AI Business Operations: 3-Way Comparison",
    productSlugs: ["nexusos", "nexus-one", "empire-ai"],
    oneLiner: "Three AI business systems, three perspectives — find the one built for your role.",
    seoDescription:
      "Compare NexusOS, Nexus One, and Empire AI side by side: enterprise OS, SMB workspace, and executive command centre. Find the AI business system that matches your organization and role.",
    decisionGuide: {
      titleA: "Choose NexusOS",
      descriptionA:
        "You manage a large organization with multiple departments that need deep integration. You're building the operational backbone that runs the entire company.",
      titleB: "Choose Nexus One",
      descriptionB:
        "You run an SMB (10–250 people) and need a practical connected workspace. Speed and simplicity matter more than enterprise departmental depth.",
    },
    quickComparison: [
      { name: "Target company size", values: ["250+ employees", "10–250 employees", "Any size"] },
      { name: "Primary user", values: ["COO / Operations lead", "SMB owner / ops lead", "CEO / Executive"] },
      { name: "Regular price", values: ["$599", "$399", "$549"] },
      { name: "Launch price", values: ["$449", "$299", "$399"] },
      { name: "Key strength", values: ["Departmental integration", "SMB simplicity", "Strategic oversight"] },
    ],
    featureGroups: [
      {
        groupName: "Business Management",
        features: [
          { name: "Department modules", values: ["Full suite (8+)", "Core modules (5)", "Department oversight"] },
          { name: "Executive dashboard", values: ["Department-level", "—", "Unified command centre"] },
          { name: "Daily operations", values: ["✓", "✓", "—"] },
          { name: "Strategic planning", values: ["—", "—", "✓"] },
        ],
      },
      {
        groupName: "AI Capabilities",
        features: [
          { name: "AI agent type", values: ["Multi-agent orchestration", "Single-agent assistance", "Decision-support agents"] },
          { name: "Reporting", values: ["Operational + BI", "Executive summaries", "Executive reports"] },
          { name: "Risk & exceptions", values: ["Automated monitoring", "Exception alerts", "Risk + exception alerts"] },
          { name: "Forecasting", values: ["Department-level", "—", "Company-wide"] },
        ],
      },
      {
        groupName: "Pricing & Value",
        features: [
          { name: "Launch savings", values: ["$150 (25%)", "$100 (25%)", "$150 (27%)"] },
          { name: "Bundle price", values: ["$999 for all 3", "$999 for all 3", "$999 for all 3"] },
          { name: "Bundle savings", values: ["$548 total", "$548 total", "$548 total"] },
        ],
      },
    ],
    bundleSlug: "ai-business-operations",
  },
];

/* ─── Helpers ─── */

const comparisonMap = new Map<string, ComparisonConfig>();
for (const c of COMPARISONS) comparisonMap.set(c.slug, c);

export function getComparisonBySlug(slug: string): ComparisonConfig | undefined {
  return comparisonMap.get(slug);
}

/** Get comparison slug for a pair of product slugs, or null if no comparison exists */
export function getComparisonSlug(productA: string, productB: string): string | null {
  // Check all 2-way comparisons
  for (const c of COMPARISONS) {
    if (c.productSlugs.length === 2) {
      if (
        (c.productSlugs[0] === productA && c.productSlugs[1] === productB) ||
        (c.productSlugs[0] === productB && c.productSlugs[1] === productA)
      ) {
        return c.slug;
      }
    }
  }
  return null;
}

/** Given a product slug, return comparison links: [{ slug, label, otherProductName }] */
export function getComparisonsForProduct(productSlug: string): Array<{
  slug: string;
  label: string;
  otherProductName: string;
}> {
  const result: Array<{ slug: string; label: string; otherProductName: string }> = [];
  for (const c of COMPARISONS) {
    const idx = c.productSlugs.indexOf(productSlug);
    if (idx === -1) continue;

    if (c.productSlugs.length === 2) {
      const otherIdx = idx === 0 ? 1 : 0;
      const otherProduct = getProductBySlug(c.productSlugs[otherIdx]);
      if (otherProduct) {
        result.push({
          slug: c.slug,
          label: `Compare with ${otherProduct.name}`,
          otherProductName: otherProduct.name,
        });
      }
    } else if (c.productSlugs.length === 3) {
      result.push({
        slug: c.slug,
        label: "See full 3-way comparison",
        otherProductName: "multiple products",
      });
    }
  }
  return result;
}
