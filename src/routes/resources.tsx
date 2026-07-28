import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";

export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: [
      { title: "Resources & Guides — AI Business Systems | PrismBay" },
      { name: "description", content: "Explore guides, articles, and resources on AI business systems, digital transformation, AI compliance, AI workforce platforms, and building AI-native businesses." },
    ],
  }),
  component: ResourcesPage,
});

/* ─── Category Definitions ─── */
const CATEGORIES = [
  { slug: "all", name: "All" },
  { slug: "ai-business-systems", name: "AI Business Systems" },
  { slug: "ai-operations", name: "AI Operations" },
  { slug: "ai-compliance", name: "AI Compliance" },
  { slug: "ai-procurement", name: "AI Procurement" },
  { slug: "ai-workforce", name: "AI Workforce" },
  { slug: "ai-payment-security", name: "AI Payment Security" },
  { slug: "ai-app-development", name: "AI App Development" },
  { slug: "digital-transformation", name: "Digital Transformation" },
  { slug: "business-automation", name: "Business Automation" },
  { slug: "product-comparisons", name: "Product Comparisons" },
];

/* ─── Article Data (30 stub entries) ─── */
interface Article {
  slug: string;
  title: string;
  description: string;
  category: string;
  readTime: number; // minutes
  linkedProducts: string[];
}

const ARTICLES: Article[] = [
  // AI Business Systems
  {
    slug: "what-is-an-ai-business-system",
    title: "What Is an AI Business System? A Complete Guide",
    description: "AI business systems combine workflows, architecture, revenue models, and implementation plans into a single complete blueprint — learn how they differ from SaaS tools and why they're the fastest path to an AI-native business.",
    category: "ai-business-systems",
    readTime: 12,
    linkedProducts: ["NexusOS", "Nexus One"],
  },
  {
    slug: "ai-business-systems-vs-saas",
    title: "AI Business Systems vs. Traditional SaaS: What's the Difference?",
    description: "Traditional SaaS gives you a tool; an AI business system gives you the entire operating model. We break down the architectural, operational, and commercial differences that matter for builders.",
    category: "ai-business-systems",
    readTime: 9,
    linkedProducts: ["Genesis Platform", "Empire AI"],
  },
  {
    slug: "how-to-evaluate-ai-business-blueprints",
    title: "How to Evaluate an AI Business Blueprint Before You Buy",
    description: "Not all blueprints are created equal. Learn the six criteria we use at PrismBay to evaluate products — from demo quality to revenue model viability to implementation feasibility.",
    category: "ai-business-systems",
    readTime: 8,
    linkedProducts: [],
  },
  // AI Operations
  {
    slug: "building-an-ai-operating-system",
    title: "Building an AI Operating System for Your Business",
    description: "An AI operating system coordinates agents, automates departments, and manages knowledge — here's how to architect one for your organisation, whether you're a startup or an enterprise.",
    category: "ai-operations",
    readTime: 14,
    linkedProducts: ["NexusOS", "Nexus One"],
  },
  {
    slug: "department-automation-workflows",
    title: "Department Automation Workflows That Actually Work",
    description: "Most department automation projects fail because they automate the wrong things. Learn which workflows deliver the highest ROI when automated with AI agents.",
    category: "ai-operations",
    readTime: 11,
    linkedProducts: ["NexusOS"],
  },
  {
    slug: "multi-agent-coordination-patterns",
    title: "Multi-Agent Coordination: Patterns for AI Workforce Management",
    description: "When you have multiple AI agents working together, coordination becomes the bottleneck. Explore three proven patterns for agent orchestration and task routing.",
    category: "ai-operations",
    readTime: 10,
    linkedProducts: ["Digital Humans", "Empire AI"],
  },
  // AI Compliance
  {
    slug: "ai-compliance-evidence-automation",
    title: "Automating Compliance Evidence Collection with AI",
    description: "Manual compliance evidence collection is slow and error-prone. Learn how AI agents can continuously monitor, collect, and organise compliance evidence across SOC 2, ISO 27001, and GDPR frameworks.",
    category: "ai-compliance",
    readTime: 13,
    linkedProducts: ["EvidenceFlow AI"],
  },
  {
    slug: "regulatory-landscape-ai-business-2026",
    title: "The Regulatory Landscape for AI Businesses in 2026",
    description: "From the EU AI Act to emerging U.S. state-level requirements, here's what every AI business builder needs to know about the current regulatory environment.",
    category: "ai-compliance",
    readTime: 9,
    linkedProducts: ["GuardianOS", "EvidenceFlow AI"],
  },
  {
    slug: "building-trust-through-compliance",
    title: "Building Customer Trust Through Proactive Compliance",
    description: "Compliance isn't just about avoiding fines — it's a competitive advantage. Learn how transparent compliance practices can become your strongest marketing asset.",
    category: "ai-compliance",
    readTime: 7,
    linkedProducts: ["EvidenceFlow AI"],
  },
  // AI Procurement
  {
    slug: "ai-vendor-risk-management",
    title: "AI-Powered Vendor Risk Management: A New Approach",
    description: "Traditional vendor risk assessments are static snapshots. AI procurement systems continuously monitor vendor health, flag anomalies, and predict risk before it materialises.",
    category: "ai-procurement",
    readTime: 11,
    linkedProducts: ["SpendShield AI"],
  },
  {
    slug: "procurement-savings-ai-driven",
    title: "How AI-Driven Procurement Finds Savings Humans Miss",
    description: "AI procurement tools analyse spending patterns across thousands of transactions to surface savings opportunities that even experienced procurement teams overlook.",
    category: "ai-procurement",
    readTime: 8,
    linkedProducts: ["SpendShield AI"],
  },
  {
    slug: "supplier-health-monitoring",
    title: "Continuous Supplier Health Monitoring with AI",
    description: "Instead of annual supplier reviews, AI enables real-time monitoring of financial health, compliance status, and operational performance across your entire supply chain.",
    category: "ai-procurement",
    readTime: 10,
    linkedProducts: ["SpendShield AI"],
  },
  // AI Workforce
  {
    slug: "virtual-employee-platforms-explained",
    title: "Virtual Employee Platforms: The Next Evolution of AI Workforce",
    description: "Virtual employees aren't chatbots — they're AI agents with defined roles, workflows, and performance metrics. Learn how virtual employee platforms are reshaping enterprise operations.",
    category: "ai-workforce",
    readTime: 15,
    linkedProducts: ["Digital Humans"],
  },
  {
    slug: "managing-human-ai-teams",
    title: "Managing Hybrid Human-AI Teams: Best Practices",
    description: "The most effective organisations in 2026 aren't replacing humans with AI — they're building hybrid teams. Here's how to manage them effectively.",
    category: "ai-workforce",
    readTime: 12,
    linkedProducts: ["Digital Humans", "Empire AI"],
  },
  {
    slug: "ai-agent-onboarding",
    title: "Onboarding AI Agents: A Framework for Success",
    description: "Just like human employees, AI agents need onboarding — role definition, access provisioning, performance expectations, and escalation paths. Here's a practical framework.",
    category: "ai-workforce",
    readTime: 9,
    linkedProducts: ["Digital Humans"],
  },
  // AI Payment Security
  {
    slug: "ai-payment-verification-systems",
    title: "How AI Payment Verification Systems Prevent Fraud",
    description: "AI-powered payment verification goes beyond rule-based fraud detection to identify subtle patterns and anomalies that traditional systems miss.",
    category: "ai-payment-security",
    readTime: 10,
    linkedProducts: ["GuardianOS"],
  },
  {
    slug: "trust-escrow-ai-transactions",
    title: "Trust Escrow for AI-Mediated Transactions",
    description: "As AI agents handle more transactions autonomously, trust escrow systems provide a crucial safety layer — verifying, holding, and releasing payments based on verified outcomes.",
    category: "ai-payment-security",
    readTime: 11,
    linkedProducts: ["GuardianOS"],
  },
  {
    slug: "secure-payment-architecture",
    title: "Designing a Secure Payment Architecture for AI Platforms",
    description: "AI platforms have unique payment security requirements — from agent-initiated transactions to usage-based billing. Learn the architectural patterns that keep payments safe.",
    category: "ai-payment-security",
    readTime: 13,
    linkedProducts: ["GuardianOS", "Nexus Network"],
  },
  // AI App Development
  {
    slug: "no-code-ai-app-builders",
    title: "No-Code AI App Builders: Build Without Engineering",
    description: "No-code AI app builders let domain experts create AI-powered applications without writing code. We compare the leading platforms and architectural approaches.",
    category: "ai-app-development",
    readTime: 12,
    linkedProducts: ["Genesis Platform"],
  },
  {
    slug: "from-blueprint-to-production",
    title: "From Blueprint to Production: The AI App Development Lifecycle",
    description: "Having a blueprint is step one. This guide walks through the full lifecycle: environment setup, agent integration, testing, deployment, and monitoring.",
    category: "ai-app-development",
    readTime: 16,
    linkedProducts: ["Genesis Platform", "Empire AI"],
  },
  {
    slug: "api-first-ai-architecture",
    title: "API-First Architecture for AI Business Applications",
    description: "An API-first approach to AI app development ensures your agents, workflows, and data pipelines remain composable and future-proof. Here's the architectural blueprint.",
    category: "ai-app-development",
    readTime: 10,
    linkedProducts: ["Genesis Platform"],
  },
  // Digital Transformation
  {
    slug: "ai-native-business-transformation",
    title: "The AI-Native Business Transformation Playbook",
    description: "Digital transformation was about moving to the cloud. AI-native transformation is about rebuilding around intelligent agents. This playbook covers the strategy, people, and technology dimensions.",
    category: "digital-transformation",
    readTime: 18,
    linkedProducts: ["NexusOS", "Empire AI", "Digital Humans"],
  },
  {
    slug: "legacy-to-ai-native-migration",
    title: "Migrating from Legacy Systems to AI-Native Architecture",
    description: "You don't have to rip and replace. Learn a phased approach to migrating legacy business processes to AI-native systems — starting with the highest-ROI workflows.",
    category: "digital-transformation",
    readTime: 14,
    linkedProducts: ["Nexus One", "NexusOS"],
  },
  {
    slug: "measuring-ai-transformation-roi",
    title: "Measuring ROI on AI Transformation Initiatives",
    description: "How do you measure the return on AI transformation? We present a framework covering efficiency gains, revenue uplift, risk reduction, and competitive positioning.",
    category: "digital-transformation",
    readTime: 11,
    linkedProducts: [],
  },
  // Business Automation
  {
    slug: "end-to-end-business-automation",
    title: "End-to-End Business Automation: Beyond Task Automation",
    description: "Task automation tools handle individual steps. End-to-end business automation orchestrates entire processes across departments — here's the architectural difference.",
    category: "business-automation",
    readTime: 13,
    linkedProducts: ["NexusOS", "Empire AI"],
  },
  {
    slug: "automating-finance-operations",
    title: "Automating Finance Operations with AI Agents",
    description: "From invoice processing to reconciliation to financial reporting, AI agents are transforming finance operations. Learn the workflows with the highest automation potential.",
    category: "business-automation",
    readTime: 10,
    linkedProducts: ["SpendShield AI", "NexusOS"],
  },
  {
    slug: "intelligent-workflow-orchestration",
    title: "Intelligent Workflow Orchestration: Patterns and Anti-Patterns",
    description: "Orchestrating AI-powered workflows requires different patterns than traditional BPM. We cover the patterns that work — and the anti-patterns that create bottlenecks.",
    category: "business-automation",
    readTime: 12,
    linkedProducts: ["NexusOS", "Genesis Platform"],
  },
  // Product Comparisons
  {
    slug: "nexusos-vs-genesis-platform",
    title: "NexusOS vs. Genesis Platform: Which AI Business System Is Right for You?",
    description: "NexusOS is a complete business operating system; Genesis Platform is an AI app builder. We compare them across architecture, use cases, complexity, and ideal buyer profiles.",
    category: "product-comparisons",
    readTime: 10,
    linkedProducts: ["NexusOS", "Genesis Platform"],
  },
  {
    slug: "digital-humans-vs-traditional-rpa",
    title: "Digital Humans vs. Traditional RPA: A Comprehensive Comparison",
    description: "RPA automates repetitive tasks; Digital Humans provide intelligent, role-based AI workers. Understand the capabilities, limitations, and best use cases for each approach.",
    category: "product-comparisons",
    readTime: 9,
    linkedProducts: ["Digital Humans"],
  },
  {
    slug: "spendshield-vs-guardianos",
    title: "SpendShield AI vs. GuardianOS: Procurement Intelligence or Payment Security?",
    description: "Both products operate in the financial operations space but solve different problems. Learn which one matches your business needs — and when you might need both.",
    category: "product-comparisons",
    readTime: 8,
    linkedProducts: ["SpendShield AI", "GuardianOS"],
  },
];

/* ─── Navbar ─── */
function Navbar() {
  return (
    <header className="sticky top-0 z-50 h-16 border-b border-navy-700 bg-navy-900/90 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6">
        <Link to="/" className="inline-flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 64" fill="none" className="h-9 w-auto" aria-label="PrismBay">
            <g transform="translate(0, 6)">
              <polygon points="4,52 28,4 52,52" fill="#16B3A7" />
              <line x1="28" y1="4" x2="20" y2="52" stroke="white" strokeWidth="2.5" />
              <circle cx="20" cy="52" r="3" fill="#F59E0B" />
            </g>
            <g transform="translate(68, 0)">
              <text x="0" y="44" fontFamily="Inter, system-ui, sans-serif" fontWeight="700" fontSize="36" letterSpacing="-0.02em">
                <tspan fill="#16B3A7">Prism</tspan>
                <tspan fill="#EDEDEB">Bay</tspan>
              </text>
            </g>
          </svg>
        </Link>
        <nav className="hidden items-center gap-8 lg:flex">
          <Link to="/products" className="text-sm font-medium text-neutral-300 transition-colors hover:text-white">Products</Link>
          <Link to="/products" search={{ category: "bundles" }} className="text-sm font-medium text-neutral-300 transition-colors hover:text-white">Bundles</Link>
          <Link to="/how-it-works" className="text-sm font-medium text-neutral-300 transition-colors hover:text-white">How It Works</Link>
        </nav>
        <Link to="/sign-in" className="text-sm font-medium text-neutral-300 transition-colors hover:text-white">Sign In</Link>
      </div>
    </header>
  );
}

/* ─── Footer ─── */
function Footer() {
  return (
    <footer className="bg-navy-900">
      <div className="mx-auto max-w-7xl px-6 pt-16 pb-12">
        <div className="mb-12">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 64" fill="none" className="h-9 w-auto" aria-label="PrismBay">
            <g transform="translate(0, 6)">
              <polygon points="4,52 28,4 52,52" fill="#16B3A7" />
              <line x1="28" y1="4" x2="20" y2="52" stroke="white" strokeWidth="2.5" />
              <circle cx="20" cy="52" r="3" fill="#F59E0B" />
            </g>
            <g transform="translate(68, 0)">
              <text x="0" y="44" fontFamily="Inter, system-ui, sans-serif" fontWeight="700" fontSize="36" letterSpacing="-0.02em">
                <tspan fill="#16B3A7">Prism</tspan>
                <tspan fill="#EDEDEB">Bay</tspan>
              </text>
            </g>
          </svg>
          <p className="mt-3 text-sm text-neutral-300">Complete AI business systems. Instant access.</p>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          <div>
            <h4 className="mb-4 text-sm font-semibold text-neutral-100">Company</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-sm text-neutral-300 transition-colors hover:text-white">About</Link></li>
              <li><Link to="/how-it-works" className="text-sm text-neutral-300 transition-colors hover:text-white">How It Works</Link></li>
              <li><Link to="/contact" className="text-sm text-neutral-300 transition-colors hover:text-white">Contact</Link></li>
              <li><Link to="/trust" className="text-sm text-neutral-300 transition-colors hover:text-white">Trust Centre</Link></li>
              <li><Link to="/resources" className="text-sm text-neutral-300 transition-colors hover:text-white">Resources</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold text-neutral-100">Legal</h4>
            <ul className="space-y-2">
              <li><Link to="/terms" className="text-sm text-neutral-300 transition-colors hover:text-white">Terms</Link></li>
              <li><Link to="/privacy" className="text-sm text-neutral-300 transition-colors hover:text-white">Privacy</Link></li>
              <li><Link to="/cookies" className="text-sm text-neutral-300 transition-colors hover:text-white">Cookies</Link></li>
              <li><Link to="/refunds" className="text-sm text-neutral-300 transition-colors hover:text-white">Refunds</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold text-neutral-100">Products</h4>
            <ul className="space-y-2">
              <li><Link to="/products" className="text-sm text-neutral-300 transition-colors hover:text-white">All Products</Link></li>
              <li><Link to="/products" search={{ category: "bundles" }} className="text-sm text-neutral-300 transition-colors hover:text-white">Bundles</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-navy-700 pt-8">
          <p className="text-xs text-neutral-500">&copy; PrismBay 2026. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

/* ─── Inline SVG Icons ─── */
function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="5.5" stroke="#9F9E99" strokeWidth="1.2" />
      <path d="M7 4.5V7l2 1.5" stroke="#9F9E99" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M8 2h4v4" stroke="#9F9E99" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 8l6-6" stroke="#9F9E99" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 8.5V11a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1h2.5" stroke="#9F9E99" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ─── Resources Page ─── */
function ResourcesPage() {
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredArticles = useMemo(() => {
    if (activeCategory === "all") return ARTICLES;
    return ARTICLES.filter((a) => a.category === activeCategory);
  }, [activeCategory]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero — navy background */}
      <section className="bg-navy-900">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-400">Resources</p>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Resources & Guides
            </h1>
            <p className="mt-6 text-lg text-neutral-300 sm:text-xl">
              Learn how to build, operate, and scale with AI business systems — from architecture deep dives to product comparisons and transformation playbooks.
            </p>
          </div>
        </div>
      </section>

      {/* Filter pills */}
      <section className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setActiveCategory(cat.slug)}
                className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  activeCategory === cat.slug
                    ? "bg-navy-900 text-white shadow-sm"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-800"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Article grid */}
      <section className="bg-neutral-50">
        <div className="mx-auto max-w-7xl px-6 py-16">
          {filteredArticles.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-lg text-neutral-500">No articles found in this category yet.</p>
              <button
                onClick={() => setActiveCategory("all")}
                className="mt-4 text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                View all articles →
              </button>
            </div>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {filteredArticles.map((article) => (
                <article
                  key={article.slug}
                  className="group flex flex-col rounded-xl border border-neutral-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                >
                  {/* Category pill */}
                  <div className="mb-3">
                    <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">
                      {CATEGORIES.find((c) => c.slug === article.category)?.name ?? article.category}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold text-neutral-800 group-hover:text-brand-600 transition-colors">
                    {article.title}
                  </h3>

                  {/* Description */}
                  <p className="mt-2 flex-grow text-sm text-neutral-500 leading-relaxed">
                    {article.description}
                  </p>

                  {/* Read time + Coming soon badge */}
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-1 text-xs text-neutral-400">
                        <ClockIcon />
                        {article.readTime} min read
                      </span>
                      {article.linkedProducts.length > 0 && (
                        <span className="inline-flex items-center gap-1 text-xs text-neutral-400">
                          <LinkIcon />
                          {article.linkedProducts.length} {article.linkedProducts.length === 1 ? "product" : "products"}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-medium text-brand-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      Coming soon
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Subtle "coming soon" notice at bottom */}
          <div className="mt-12 text-center">
            <p className="text-sm text-neutral-400">
              These articles are currently in development. Full guides with detailed walkthroughs, diagrams, and downloadable resources are coming soon.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-navy-900">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center sm:py-20">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">Ready to put these ideas into practice?</h2>
          <p className="mt-4 text-lg text-neutral-300">Browse complete AI business system blueprints — each with detailed architecture, workflows, and implementation plans.</p>
          <Link
            to="/products"
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-8 py-4 text-lg font-semibold text-white shadow-sm transition-all duration-200 hover:bg-brand-600 hover:shadow-md hover:-translate-y-px active:bg-brand-700 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900"
          >
            Browse the Marketplace
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M4 10h12m0 0l-5-5m5 5l-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
