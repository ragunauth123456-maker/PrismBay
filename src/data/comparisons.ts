/* ─── PrismBay Comparison Data ─── */
/* Defines all product comparison configurations used by /compare routes. */

import { PRODUCTS, BUNDLES, getProductBySlug } from "~/data/products";

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
    titleC?: string;
    descriptionC?: string;
  };
  /** Quick comparison rows */
  quickComparison: ComparisonDimension[];
  /** Detailed feature groups */
  featureGroups: FeatureGroup[];
  /** Bundle that contains both/all products, if applicable */
  bundleSlug?: string;
}

/* ─── Comparison configurations ─── */

const RAW_COMPARISONS: ComparisonConfig[] = [
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
        values: [ /* derived from products.ts — see COMPARISONS derivation below */ ],
      },
      {
        name: "Launch price",
        values: [ /* derived from products.ts — see COMPARISONS derivation below */ ],
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
          { name: "Launch savings", values: [ /* derived from products.ts — see COMPARISONS derivation below */ ] },
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
      { name: "Regular price", values: [ /* derived from products.ts — see COMPARISONS derivation below */ ] },
      {
        name: "Launch price",
        values: [ /* derived from products.ts — see COMPARISONS derivation below */ ],
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
      { name: "Regular price", values: [ /* derived from products.ts — see COMPARISONS derivation below */ ] },
      { name: "Launch price", values: [ /* derived from products.ts — see COMPARISONS derivation below */ ] },
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
          { name: "Launch savings", values: [ /* derived from products.ts — see COMPARISONS derivation below */ ] },
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
      { name: "Regular price", values: [ /* derived from products.ts — see COMPARISONS derivation below */ ] },
      { name: "Launch price", values: [ /* derived from products.ts — see COMPARISONS derivation below */ ] },
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
          { name: "Launch savings", values: [ /* derived from products.ts — see COMPARISONS derivation below */ ] },
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
      { name: "Regular price", values: [ /* derived from products.ts — see COMPARISONS derivation below */ ] },
      { name: "Launch price", values: [ /* derived from products.ts — see COMPARISONS derivation below */ ] },
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
      { name: "Regular price", values: [ /* derived from products.ts — see COMPARISONS derivation below */ ] },
      { name: "Launch price", values: [ /* derived from products.ts — see COMPARISONS derivation below */ ] },
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
          { name: "Launch savings", values: [ /* derived from products.ts — see COMPARISONS derivation below */ ] },
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
      titleC: "Choose Empire AI",
      descriptionC:
        "You need one command centre to monitor financial results, operations, workforce, projects, risks, and forecasts — with strategic planning and decision-support agents.",
    },
    quickComparison: [
      { name: "Target company size", values: ["250+ employees", "10–250 employees", "Any size"] },
      { name: "Primary user", values: ["COO / Operations lead", "SMB owner / ops lead", "CEO / Executive"] },
      { name: "Regular price", values: [ /* derived from products.ts — see COMPARISONS derivation below */ ] },
      { name: "Launch price", values: [ /* derived from products.ts — see COMPARISONS derivation below */ ] },
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
          { name: "Launch savings", values: [ /* derived from products.ts — see COMPARISONS derivation below */ ] },
          { name: "Bundle price", values: [ /* derived from products.ts — see COMPARISONS derivation below */ ] },
          { name: "Bundle savings", values: [ /* derived from products.ts — see COMPARISONS derivation below */ ] },
        ],
      },
    ],
    bundleSlug: "ai-business-operations",
  },
  {
    slug: "spendshield-ai-vs-evidenceflow-ai",
    title: "SpendShield AI vs EvidenceFlow AI: Procurement Intelligence or Compliance Automation?",
    productSlugs: ["spendshield-ai", "evidenceflow-ai"],
    oneLiner: "Control costs before you spend vs prove compliance after the fact — same bundle, different mandate.",
    seoDescription:
// TODO: replace with dynamic pricing from products.ts
      "Compare SpendShield AI and EvidenceFlow AI: AI procurement intelligence for cost control vs AI compliance automation for audit readiness. Both in the Trust, Risk & Compliance bundle at the same $249 launch price — which fits your team?",
    decisionGuide: {
      titleA: "Choose SpendShield AI if you need to control procurement spending",
      descriptionA:
        "Your team reviews purchases, compares suppliers, analyses contracts, and identifies savings opportunities. Your priority is reducing costs and managing vendor risk before money leaves the organisation.",
      titleB: "Choose EvidenceFlow AI if you need to prove compliance after the fact",
      descriptionB:
        "Your compliance team collects evidence for audits — policies, certificates, screenshots, and records. AI agents classify, map to controls, and prepare audit-ready files. Your priority is documentation and audit readiness.",
    },
    quickComparison: [
      { name: "Primary mandate", values: ["Cost control & savings", "Audit readiness & evidence"] },
      { name: "Regular price", values: [ /* derived from products.ts — see COMPARISONS derivation below */ ] },
      { name: "Launch price", values: [ /* derived from products.ts — see COMPARISONS derivation below */ ] },
      { name: "Timing", values: ["Before procurement decisions", "Before auditors arrive"] },
      { name: "Key strength", values: ["Supplier analysis & savings ID", "Evidence classification & control mapping"] },
    ],
    featureGroups: [
      {
        groupName: "Core Capability",
        features: [
          { name: "Spend analysis", values: ["✓", "—"] },
          { name: "Supplier comparison", values: ["✓", "—"] },
          { name: "Contract review", values: ["✓", "—"] },
          { name: "Document classification", values: ["—", "✓"] },
          { name: "Control-to-evidence mapping", values: ["—", "✓"] },
          { name: "Audit package export", values: ["—", "✓"] },
        ],
      },
      {
        groupName: "Risk & Monitoring",
        features: [
          { name: "Vendor risk assessment", values: ["✓", "—"] },
          { name: "Price variance analysis", values: ["✓", "—"] },
          { name: "Duplicate charge detection", values: ["✓", "—"] },
          { name: "Missing evidence tracking", values: ["—", "✓"] },
          { name: "Evidence status dashboard", values: ["—", "✓"] },
        ],
      },
      {
        groupName: "Buyer Persona",
        features: [
          { name: "Primary user", values: ["Procurement manager / CFO", "Compliance officer / CISO"] },
          { name: "Reports to", values: ["CFO", "CFO / Board"] },
          { name: "Launch savings", values: [ /* derived from products.ts — see COMPARISONS derivation below */ ] },
          { name: "Complementary use case", values: ["Find savings, then prove controls around procurement process are compliant"] },
        ],
      },
    ],
    bundleSlug: "trust-risk-compliance",
  },
  {
    slug: "digital-humans-vs-nexusos",
    title: "Digital Humans vs NexusOS: AI Workforce or AI Operating System?",
    productSlugs: ["digital-humans", "nexusos"],
    oneLiner: "Build AI employees that do the work, or an AI OS that connects departments — the C-suite's strategic choice.",
    seoDescription:
// TODO: replace with dynamic pricing from products.ts
      "Compare Digital Humans and NexusOS: AI virtual workforce platform vs intelligent business operating system. Both are premium products at $379–$449 launch — which strategic investment fits your organisation?",
    decisionGuide: {
      titleA: "Choose Digital Humans if you need AI employees that execute",
      descriptionA:
        "You want role-based AI workers — sales agents, support agents, analysts — that perform tasks, handle workflows, and deliver measurable output. Your focus is on building execution capacity through an AI workforce.",
      titleB: "Choose NexusOS if you need an intelligent operating system that coordinates",
      descriptionB:
        "You need to connect finance, HR, sales, procurement, operations, and compliance into one coordinated platform. AI agents orchestrate workflows across departments, prepare reports, and surface exceptions. Your focus is on building systems that connect your existing teams.",
    },
    quickComparison: [
      { name: "Core concept", values: ["AI employees that do work", "AI system that coordinates work"] },
      { name: "Regular price", values: [ /* derived from products.ts — see COMPARISONS derivation below */ ] },
      { name: "Launch price", values: [ /* derived from products.ts — see COMPARISONS derivation below */ ] },
      { name: "Strategic question", values: ["'Who does the work?'", "'How does work flow?'"] },
      { name: "Key strength", values: ["Execution capacity at scale", "Cross-department integration"] },
    ],
    featureGroups: [
      {
        groupName: "What You're Building",
        features: [
          { name: "Output", values: ["AI workforce with defined roles", "Connected departmental OS"] },
          { name: "Agent type", values: ["Role-based virtual employees", "Coordination & orchestration agents"] },
          { name: "Primary benefit", values: ["Scale output without hiring", "Eliminate departmental friction"] },
          { name: "Complexity level", values: ["High — agent role design", "High — multi-department rollout"] },
        ],
      },
      {
        groupName: "Organisational Fit",
        features: [
          { name: "Best for", values: ["Organisations scaling output", "Organisations fixing coordination"] },
          { name: "Pain point addressed", values: ["Labour capacity constraints", "Departmental silos & friction"] },
          { name: "Departments covered", values: ["Role-based (sales, support, ops)", "Full suite (8+ departments)"] },
          { name: "Implementation approach", values: ["Role-by-role deployment", "Department-by-department rollout"] },
        ],
      },
      {
        groupName: "Strategic Value",
        features: [
          { name: "Launch savings", values: [ /* derived from products.ts — see COMPARISONS derivation below */ ] },
          { name: "Long-term impact", values: ["Permanent capacity expansion", "Permanent operational efficiency"] },
          { name: "C-suite champion", values: ["COO / CPO", "COO / CIO"] },
        ],
      },
    ],
  },
  {
    slug: "nexus-network-vs-genesis-platform",
    title: "Nexus Network vs Genesis Platform: Build a Marketplace or an App Builder?",
    productSlugs: ["nexus-network", "genesis-platform"],
    oneLiner: "Two platform-creation blueprints for founders — collaboration marketplace or no-code app builder?",
    seoDescription:
      "Compare Nexus Network and Genesis Platform: build an AI business collaboration marketplace vs build a no-code AI app builder platform. Both are platform-creation blueprints for founders — which model fits your vision?",
    decisionGuide: {
      titleA: "Choose Nexus Network if you want to build a collaboration marketplace",
      descriptionA:
        "You're building a platform where AI businesses connect, collaborate, and transact. Your customers come for the network — to find partners, list services, and build relationships. You're creating a community-driven marketplace at the most accessible price point.",
      titleB: "Choose Genesis Platform if you want to build an app creation platform",
      descriptionB:
        "You're building a no-code AI app builder where users create and deploy AI-powered applications. Your customers come to build — using templates, agent builders, and workflow designers. You're creating the tool that lets others create.",
    },
    quickComparison: [
      { name: "Platform type", values: ["Collaboration marketplace", "No-code app builder"] },
      { name: "Regular price", values: [ /* derived from products.ts — see COMPARISONS derivation below */ ] },
      { name: "Launch price", values: [ /* derived from products.ts — see COMPARISONS derivation below */ ] },
      { name: "Your customers", values: ["AI businesses & service providers", "App creators & domain experts"] },
      { name: "Key strength", values: ["Network effects & community", "Tool creation & extensibility"] },
    ],
    featureGroups: [
      {
        groupName: "Platform Model",
        features: [
          { name: "Core offering", values: ["Business discovery & matching", "App builder engine & templates"] },
          { name: "Revenue model", values: ["Marketplace fees + listings", "Subscription billing + enterprise"] },
          { name: "User activity", values: ["Browsing, connecting, transacting", "Building, configuring, deploying"] },
          { name: "Network effects", values: ["Strong — more users attract more businesses", "Moderate — more templates attract more builders"] },
        ],
      },
      {
        groupName: "Technical Scope",
        features: [
          { name: "No-code builder", values: ["—", "✓"] },
          { name: "Template marketplace", values: ["Service listings", "App templates"] },
          { name: "Multi-tenant SaaS", values: ["Vendor storefronts", "End-user app hosting"] },
          { name: "Est. time to MVP", values: ["12–16 weeks", "16–20 weeks"] },
        ],
      },
      {
        groupName: "Founder Fit",
        features: [
          { name: "Launch savings", values: [ /* derived from products.ts — see COMPARISONS derivation below */ ] },
          { name: "Best for founders who", values: ["Understand community dynamics", "Have technical platform experience"] },
          { name: "Risk profile", values: ["Lower technical risk, higher adoption risk", "Higher technical risk, clearer monetisation path"] },
        ],
      },
    ],
  },
  {
    slug: "digital-humans-vs-empire-ai",
    title: "Digital Humans vs Empire AI: Do the Work or Oversee the Work?",
    productSlugs: ["digital-humans", "empire-ai"],
    oneLiner: "AI agents that execute vs AI agents that observe — workforce deployment or executive oversight?",
    seoDescription:
// TODO: replace with dynamic pricing from products.ts
      "Compare Digital Humans and Empire AI: AI virtual workforce for execution vs AI command platform for oversight. Similar launch pricing ($379–$399) — do you need AI that does the work or AI that helps you oversee it?",
    decisionGuide: {
      titleA: "Choose Digital Humans if you need AI that executes",
      descriptionA:
        "You want role-based AI employees — sales agents, support agents, operations agents — that perform tasks and deliver output. Your focus is on building execution capacity: getting more work done through an AI workforce.",
      titleB: "Choose Empire AI if you need AI that oversees",
      descriptionB:
        "You want a unified command centre that monitors financial results, operations, workforce, projects, and risks. AI agents observe, report, and surface exceptions. Your focus is on executive visibility and strategic oversight.",
    },
    quickComparison: [
      { name: "Agent role", values: ["Execute tasks & workflows", "Monitor, report & alert"] },
      { name: "Regular price", values: [ /* derived from products.ts — see COMPARISONS derivation below */ ] },
      { name: "Launch price", values: [ /* derived from products.ts — see COMPARISONS derivation below */ ] },
      { name: "Metaphor", values: ["COO tool — gets things done", "CEO tool — sees everything"] },
      { name: "Key strength", values: ["Workforce deployment at scale", "Strategic visibility & decision support"] },
    ],
    featureGroups: [
      {
        groupName: "What the AI Does",
        features: [
          { name: "Primary function", values: ["Performs work in defined roles", "Monitors work across departments"] },
          { name: "Output", values: ["Completed tasks & workflows", "Reports, alerts & forecasts"] },
          { name: "Interaction model", values: ["Agents act on your behalf", "Agents inform your decisions"] },
          { name: "Value metric", values: ["Output volume & quality", "Decision speed & accuracy"] },
        ],
      },
      {
        groupName: "Organisational Impact",
        features: [
          { name: "Best for", values: ["Scaling operations without hiring", "Improving executive decision-making"] },
          { name: "Teams affected", values: ["Operations, sales, support", "Executive team, department heads"] },
          { name: "Implementation focus", values: ["Role design & agent training", "Dashboard configuration & data integration"] },
          { name: "Risk if over-adopted", values: ["Over-automation without oversight", "Analysis paralysis without execution"] },
        ],
      },
      {
        groupName: "Strategic Fit",
        features: [
          { name: "Launch savings", values: [ /* derived from products.ts — see COMPARISONS derivation below */ ] },
          { name: "C-suite champion", values: ["COO / VP Operations", "CEO / CFO"] },
          { name: "Complementary?", values: ["Digital Humans execute; Empire AI monitors the execution — they work best together"] },
        ],
      },
    ],
  },
  {
    slug: "genesis-platform-vs-digital-humans",
    title: "Genesis Platform vs Digital Humans: Build Apps or Build Workers?",
    productSlugs: ["genesis-platform", "digital-humans"],
    oneLiner: "Two meta-platform products — build a platform where others create apps, or a platform where AI employees work?",
    seoDescription:
      "Compare Genesis Platform and Digital Humans: build a no-code AI app builder vs build an AI virtual workforce platform. Both are technically ambitious meta-platform products — which direction fits your vision?",
    decisionGuide: {
      titleA: "Choose Genesis Platform if you want to build an app creation platform",
      descriptionA:
        "You're a technical founder building a no-code AI app builder for others to use. Your customers create applications — you provide the platform, templates, builder engine, and infrastructure. You're building the tool that empowers creation.",
      titleB: "Choose Digital Humans if you want to build an AI workforce platform",
      descriptionB:
        "You're building a platform where AI employees — virtual sales agents, support agents, analysts — perform work in defined roles. Your customers deploy AI workers into their operations. You're building the workforce, not the tools.",
    },
    quickComparison: [
      { name: "What you build", values: ["A platform for creating apps", "A platform for deploying AI workers"] },
      { name: "Regular price", values: [ /* derived from products.ts — see COMPARISONS derivation below */ ] },
      { name: "Launch price", values: [ /* derived from products.ts — see COMPARISONS derivation below */ ] },
      { name: "Your customer does", values: ["Builds apps without code", "Deploys AI employees into roles"] },
      { name: "Key strength", values: ["App builder engine & templates", "Role-based AI workforce design"] },
    ],
    featureGroups: [
      {
        groupName: "Platform Architecture",
        features: [
          { name: "Core engine", values: ["No-code app builder", "Virtual employee deployment"] },
          { name: "User output", values: ["AI-powered applications", "Completed business tasks"] },
          { name: "Templates", values: ["App templates & components", "Agent role definitions & workflows"] },
          { name: "Technical complexity", values: ["Very high — builder platform", "Very high — workforce orchestration"] },
        ],
      },
      {
        groupName: "Business Model",
        features: [
          { name: "Revenue model", values: ["Subscription billing + enterprise", "Service revenue + enterprise pricing"] },
          { name: "Target customer", values: ["Domain experts & citizen developers", "Operations leaders & department heads"] },
          { name: "Go-to-market", values: ["Platform adoption playbook", "Workforce transformation playbook"] },
        ],
      },
      {
        groupName: "Founder Considerations",
        features: [
          { name: "Launch savings", values: [ /* derived from products.ts — see COMPARISONS derivation below */ ] },
          { name: "Best for founders who", values: ["Love building tools for builders", "Love designing systems of work"] },
          { name: "Technical prerequisite", values: ["Platform engineering experience", "AI/ML + operations experience"] },
        ],
      },
    ],
  },
  {
    slug: "digital-humans-vs-nexus-network",
    title: "Digital Humans vs Nexus Network: Build a Workforce or a Marketplace?",
    productSlugs: ["digital-humans", "nexus-network"],
    oneLiner: "Deploy AI employees into your business, or build a marketplace where AI businesses connect — two founder paths, two different products.",
    seoDescription:
      "Compare Digital Humans and Nexus Network: build an AI virtual workforce platform vs build an AI business collaboration marketplace. Features, pricing, founder fit, and which platform model matches your vision.",
    decisionGuide: {
      titleA: "Choose Digital Humans if you want to deploy AI workers",
      descriptionA:
        "You're building a platform where AI employees — sales agents, support agents, analysts — perform work in defined roles with clear permissions and approval controls. Your focus is on creating execution capacity through an AI workforce that operates inside your business or your customers' businesses.",
      titleB: "Choose Nexus Network if you want to build a collaboration marketplace",
      descriptionB:
        "You're building a platform where AI businesses, service providers, and professionals discover each other, collaborate, and transact. Your focus is on creating the network — intelligent matching, trust frameworks, and marketplace dynamics that attract both buyers and providers.",
    },
    quickComparison: [
      { name: "Platform model", values: ["AI workforce deployment", "Business collaboration marketplace"] },
      { name: "Regular price", values: [ /* derived from products.ts — see COMPARISONS derivation below */ ] },
      { name: "Launch price", values: [ /* derived from products.ts — see COMPARISONS derivation below */ ] },
      { name: "Your customer does", values: ["Deploys AI employees into roles", "Finds partners & collaborates"] },
      { name: "Key strength", values: ["AI workforce at scale", "Network effects & community"] },
    ],
    featureGroups: [
      {
        groupName: "What You're Building",
        features: [
          { name: "Core concept", values: ["Virtual AI employee platform", "AI-powered marketplace platform"] },
          { name: "User activity", values: ["Assigning roles, managing AI workers", "Browsing listings, connecting, transacting"] },
          { name: "Value driver", values: ["Execution capacity without hiring", "Business discovery & matching"] },
          { name: "Technical focus", values: ["Agent role design & orchestration", "Search, matching & trust systems"] },
        ],
      },
      {
        groupName: "Platform Mechanics",
        features: [
          { name: "AI agents", values: ["Role-based virtual employees", "AI recommendation & matching"] },
          { name: "Trust layer", values: ["Human approval controls", "Verification & ratings framework"] },
          { name: "Workflow type", values: ["Task execution & escalation", "Collaboration requests & messaging"] },
          { name: "Multi-tenancy", values: ["Department-level allocation", "Vendor storefronts & profiles"] },
        ],
      },
      {
        groupName: "Business Model",
        features: [
          { name: "Revenue model", values: ["Service revenue + enterprise", "Marketplace fees + subscriptions"] },
          { name: "Launch savings", values: [ /* derived from products.ts — see COMPARISONS derivation below */ ] },
          { name: "Risk profile", values: ["Higher technical risk — AI orchestration", "Lower technical risk — adoption risk"] },
        ],
      },
      {
        groupName: "Founder Fit",
        features: [
          { name: "Best for founders who", values: ["Love designing systems of work", "Understand community dynamics"] },
          { name: "Go-to-market", values: ["Workforce transformation playbook", "Marketplace launch strategy"] },
          { name: "Long-term moat", values: ["Workforce quality & reliability", "Network effects & liquidity"] },
        ],
      },
    ],
  },
];

/* ─── Dynamic pricing derivation ─── */
/*
 * Prices, discounts, and bundle figures in comparison rows are derived from
 * the product database (products.ts) rather than hardcoded, so the comparison
 * pages stay in sync with the catalogue.
 */
function priceValues(slugs: string[], type: "regular" | "launch"): string[] {
  return slugs.map((slug) => {
    const p = PRODUCTS.find((x) => x.slug === slug);
    return p ? `$${type === "regular" ? p.regularPrice : p.launchPrice}` : "—";
  });
}
function savingsValues(slugs: string[]): string[] {
  return slugs.map((slug) => {
    const p = PRODUCTS.find((x) => x.slug === slug);
    return p ? `$${p.regularPrice - p.launchPrice} (${p.discountPercent}%)` : "—";
  });
}
function bundlePriceValues(slugs: string[], bundleSlug: string | undefined): string[] {
  const b = bundleSlug ? BUNDLES.find((x) => x.slug === bundleSlug) : undefined;
  const label = b ? `$${b.launchPrice} for all ${b.productSlugs.length}` : "—";
  return slugs.map(() => label);
}
function bundleSavingsValues(slugs: string[], bundleSlug: string | undefined): string[] {
  const b = bundleSlug ? BUNDLES.find((x) => x.slug === bundleSlug) : undefined;
  const label = b ? `$${b.saving} total` : "—";
  return slugs.map(() => label);
}
export const COMPARISONS: ComparisonConfig[] = RAW_COMPARISONS.map((c) => ({
  ...c,
  quickComparison: c.quickComparison.map((d) => {
    if (d.name === "Regular price") return { ...d, values: priceValues(c.productSlugs, "regular") };
    if (d.name === "Launch price") return { ...d, values: priceValues(c.productSlugs, "launch") };
    return d;
  }),
  featureGroups: c.featureGroups.map((g) => ({
    ...g,
    features: g.features.map((f) => {
      if (f.name === "Launch savings") return { ...f, values: savingsValues(c.productSlugs) };
      if (f.name === "Bundle price") return { ...f, values: bundlePriceValues(c.productSlugs, c.bundleSlug) };
      if (f.name === "Bundle savings") return { ...f, values: bundleSavingsValues(c.productSlugs, c.bundleSlug) };
      return f;
    }),
  })),
}));

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
