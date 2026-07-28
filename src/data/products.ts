/* ─── PrismBay Product Catalog ─── */
/* 9 AI business systems + 3 bundles with launch pricing */

export interface Product {
  slug: string;
  name: string;
  tagline: string;
  regularPrice: number;
  launchPrice: number;
  discountPercent: number;
  category: string;
  categorySlug: string;
  rating: number;
  reviewCount: number;
  description: string;
  longDescription: string;
  valueStatement: string;
  ctaText: string;
  included: string[];
  faqs: FAQ[];
  reviews: Review[];
  demoVideoUrl: string;
  relatedSlugs: string[];
  bundleName?: string;
  // UI helpers
  typeIcon: string;
  gradient: string;
}

export interface Bundle {
  slug: string;
  name: string;
  description: string;
  productSlugs: string[];
  productNames: string[];
  regularCombined: number;
  launchPrice: number;
  saving: number;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface Review {
  name: string;
  initials: string;
  role: string;
  rating: number;
  date: string;
  text: string;
}

/* ─── 9 Individual Products ─── */

export const PRODUCTS: Product[] = [
  {
    slug: "nexusos",
    name: "NexusOS",
    tagline: "Intelligent Business Operating System",
    regularPrice: 599,
    launchPrice: 449,
    discountPercent: 25,
    category: "AI Business Systems",
    categorySlug: "ai-business-systems",
    rating: 4.9,
    reviewCount: 42,
    description:
      "NexusOS provides a complete plan for building an intelligent operating system for an entire business — connecting finance, HR, sales, marketing, procurement, operations, compliance, customer service, and project management.",
    longDescription:
      "NexusOS provides a complete plan for building an intelligent operating system for an entire business. The platform connects finance, human resources, sales, marketing, procurement, operations, compliance, customer service, and project management. AI agents coordinate workflows, prepare reports, identify risks, track performance, and present decision-ready information to management. NexusOS targets established businesses requiring deeper departmental integration, governance, analytics, and executive oversight.",
    valueStatement:
      "Connect every department — finance, HR, sales, marketing, procurement, operations, compliance — into one intelligent business operating system with AI agents that coordinate workflows and present decision-ready information.",
    ctaText: "Get NexusOS for $449",
    included: [
      "Executive command centre",
      "Department operating modules",
      "Finance workflows",
      "Sales and customer workflows",
      "Human resources workflows",
      "Procurement workflows",
      "Operations management",
      "Compliance monitoring",
      "Project management",
      "AI agent coordination",
      "Business intelligence framework",
      "SaaS revenue model",
    ],
    faqs: [
      {
        question: "Is NexusOS a software product or a blueprint?",
        answer:
          "NexusOS is a complete business system blueprint — detailed documentation, architecture diagrams, workflow designs, and implementation guides. It gives you everything needed to plan, build, or commission your own intelligent operating system. It is not pre-built software.",
      },
      {
        question: "What format do I receive?",
        answer:
          "You receive a structured document package including architecture diagrams (Figma-ready), workflow maps, technical specifications, revenue model spreadsheets, and a development roadmap. All files are delivered as downloadable PDFs and editable source documents.",
      },
      {
        question: "Do I need technical skills to use this?",
        answer:
          "NexusOS is designed for both technical founders and business leaders. The executive summary and business sections are accessible without coding knowledge. The technical architecture sections assume familiarity with system design and cloud infrastructure — you'll want a CTO or technical lead for implementation.",
      },
      {
        question: "What's the licence?",
        answer:
          "Purchase includes a single-business perpetual licence. You can use the system to build one commercial product. For agency or multi-client use, contact us about enterprise licensing.",
      },
      {
        question: "How is this different from buying off-the-shelf ERP software?",
        answer:
          "NexusOS is a blueprint for building AI-native systems, not a legacy ERP. Traditional ERPs retrofit AI onto old architectures. NexusOS starts with AI coordination as the foundation — agents, workflows, and intelligence are native, not bolted on.",
      },
    ],
    reviews: [
      {
        name: "David Kim",
        initials: "DK",
        role: "CTO",
        rating: 5,
        date: "July 15, 2026",
        text: "NexusOS saved us six months of architecture planning. The department automation workflows were immediately actionable, and the AI agent coordination framework is the best I've seen — it's now the backbone of our internal platform.",
      },
      {
        name: "Sarah Mitchell",
        initials: "SM",
        role: "CEO",
        rating: 5,
        date: "July 3, 2026",
        text: "I bought NexusOS to understand what an AI-native operating system should look like before hiring a technical team. The executive command system and business intelligence dashboards gave me the clarity I needed to raise our seed round.",
      },
      {
        name: "James Chen",
        initials: "JC",
        role: "VP Engineering",
        rating: 4,
        date: "June 18, 2026",
        text: "Solid architecture. The security framework and SaaS revenue model sections are particularly strong. One star off because I'd love even more detail on multi-tenant deployment patterns, but overall this is excellent.",
      },
    ],
    demoVideoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    relatedSlugs: ["nexus-one", "empire-ai", "nexus-network"],
    bundleName: "AI Business Operations Bundle",
    typeIcon: "cog",
    gradient: "from-brand-50 via-neutral-50 to-accent-50/40",
  },
  {
    slug: "nexus-one",
    name: "Nexus One",
    tagline: "AI Business OS for SMBs",
    regularPrice: 399,
    launchPrice: 299,
    discountPercent: 25,
    category: "AI Business Systems",
    categorySlug: "ai-business-systems",
    rating: 4.8,
    reviewCount: 38,
    description:
      "Nexus One provides small and medium-sized businesses with a practical AI operating system — bringing customers, sales, tasks, projects, expenses, team activity, and business reports into one connected workspace.",
    longDescription:
      "Nexus One provides small and medium-sized businesses with a practical AI operating system. The platform brings customers, sales, tasks, projects, expenses, team activity, and business reports into one connected workspace. AI agents help manage daily work, prepare reports, track deadlines, organize customer activity, and surface items requiring attention. Nexus One offers a simpler operating model than NexusOS — designed for companies with 10–250 employees.",
    valueStatement:
      "Give your SMB a practical AI operating system that brings customers, sales, tasks, projects, expenses, and team activity into one connected workspace.",
    ctaText: "Get Nexus One for $299",
    included: [
      "Small-business AI operating system",
      "Daily workflow automation",
      "Sales tracking",
      "Customer management",
      "Task coordination",
      "Project tracking",
      "Expense monitoring",
      "Team activity reporting",
      "Executive summaries",
      "Department support agents",
      "Business analytics",
      "Revenue framework",
    ],
    faqs: [
      {
        question: "Is this just a simplified version of NexusOS?",
        answer:
          "Nexus One is purpose-built for SMBs, not a stripped-down enterprise product. Every workflow, agent, and integration is designed for teams of 10–250 people. It shares the same architectural principles as NexusOS but with SMB-appropriate scope, budget, and complexity.",
      },
      {
        question: "What size company is Nexus One designed for?",
        answer:
          "Nexus One is optimized for companies with 10–250 employees. If you're a startup scaling past 10 people or an established SMB looking to modernize, this is for you. For larger organizations, consider NexusOS.",
      },
      {
        question: "Do I need an IT department to implement this?",
        answer:
          "No. Nexus One is designed to be implemented by a technically-minded operations lead or CTO. The technical plan includes clear build-vs-buy recommendations and vendor selection criteria, so you can make informed decisions even without a large IT team.",
      },
      {
        question: "What format do I receive?",
        answer:
          "Same as all PrismBay products: structured documentation with architecture diagrams, workflow maps, technical specs, and a development roadmap — delivered as PDFs and editable source files.",
      },
      {
        question: "What's the licence?",
        answer:
          "Single-business perpetual licence. You can build one commercial product from the blueprint. Agency and multi-client licences available separately.",
      },
    ],
    reviews: [
      {
        name: "Priya Patel",
        initials: "PP",
        role: "Operations Director",
        rating: 5,
        date: "July 10, 2026",
        text: "We're a 45-person logistics company and Nexus One gave us a practical AI roadmap without the enterprise overhead. The department agents and task coordination workflows are now running across our operations floor.",
      },
      {
        name: "Tom Barrett",
        initials: "TB",
        role: "Managing Director",
        rating: 5,
        date: "June 30, 2026",
        text: "I've looked at dozens of 'AI for SMB' solutions. Nexus One is the first that doesn't assume you have a $500K budget and a team of engineers. The revenue framework alone showed us how to fund the build from operational savings.",
      },
      {
        name: "Lisa Chang",
        initials: "LC",
        role: "CTO",
        rating: 4,
        date: "June 12, 2026",
        text: "Very solid blueprint. The security controls section is thorough without being overwhelming. My team had the core workflows running in prototype within three weeks of receiving the documents.",
      },
    ],
    demoVideoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    relatedSlugs: ["nexusos", "empire-ai", "genesis-platform"],
    bundleName: "AI Business Operations Bundle",
    typeIcon: "cog",
    gradient: "from-brand-50/60 via-neutral-50 to-accent-50/40",
  },
  {
    slug: "empire-ai",
    name: "Empire AI",
    tagline: "Unified AI Business Command Platform",
    regularPrice: 549,
    launchPrice: 399,
    discountPercent: 27,
    category: "AI Business Systems",
    categorySlug: "ai-business-systems",
    rating: 4.7,
    reviewCount: 29,
    description:
      "Empire AI provides executives and business owners with one command platform for monitoring company performance — financial results, operations, workforce, projects, risks, forecasts, and strategic priorities.",
    longDescription:
      "Empire AI provides executives and business owners with one command platform for monitoring company performance. The system brings together financial results, operational activity, workforce performance, projects, risks, forecasts, and strategic priorities. AI agents review business data, identify exceptions, prepare executive reports, and support management decisions. Empire AI focuses on high-level visibility, control, and decision support.",
    valueStatement:
      "Monitor your entire company from one AI command platform — financial results, operations, workforce, projects, risks, forecasts, and strategic priorities.",
    ctaText: "Get Empire AI for $399",
    included: [
      "Executive command dashboard",
      "Financial performance monitoring",
      "Operational monitoring",
      "Workforce performance tracking",
      "Department oversight",
      "Strategic planning workflows",
      "Risk and exception alerts",
      "Forecasting framework",
      "Executive reporting",
      "Decision-support agents",
      "Project monitoring",
      "Commercial model",
    ],
    faqs: [
      {
        question: "Is Empire AI a dashboard product or a full platform blueprint?",
        answer:
          "Empire AI is a complete platform blueprint. It includes designs for the executive command centre, reporting pipelines, alerting infrastructure, and decision-support workflows. It's the architectural plan — not a pre-built dashboard tool.",
      },
      {
        question: "How does this compare to BI tools like Tableau or Power BI?",
        answer:
          "BI tools visualize data you already have. Empire AI shows you how to build the infrastructure that connects every data source — operational, financial, risk, and strategic — into a single command layer with AI-driven insights. It complements BI tools but goes far beyond visualization.",
      },
      {
        question: "What technical stack does Empire AI assume?",
        answer:
          "The architecture is stack-agnostic with reference implementations for AWS and GCP. The technical plan covers data pipeline design, real-time monitoring infrastructure, and AI model integration. You can adapt it to your existing stack.",
      },
      {
        question: "What format do I receive?",
        answer:
          "Structured documentation including architecture diagrams, data flow maps, dashboard wireframes, and an implementation roadmap — delivered as downloadable PDFs and editable source files.",
      },
      {
        question: "Can I use this for a client project?",
        answer:
          "The standard licence covers one commercial product. For consulting or agency use across multiple clients, an enterprise licence is required. Contact us for details.",
      },
    ],
    reviews: [
      {
        name: "Michael Torres",
        initials: "MT",
        role: "CFO",
        rating: 5,
        date: "July 20, 2026",
        text: "Empire AI transformed how our leadership team makes decisions. The financial monitoring and risk alert workflows gave us visibility we'd been missing for years. My CEO calls it 'the dashboard we should have built five years ago.'",
      },
      {
        name: "Rachel Foster",
        initials: "RF",
        role: "COO",
        rating: 5,
        date: "July 5, 2026",
        text: "The department oversight framework is exceptional. We now have real-time operational visibility across all five business units. Implementation took our team about two months following the roadmap — exactly as estimated.",
      },
      {
        name: "Alex Novak",
        initials: "AN",
        role: "Head of Strategy",
        rating: 4,
        date: "June 22, 2026",
        text: "The decision-support workflows are the highlight. The commercial model section is solid but could use more detail on enterprise pricing strategies. Overall, a strong framework that paid for itself within weeks.",
      },
    ],
    demoVideoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    relatedSlugs: ["nexusos", "nexus-one", "guardianos"],
    bundleName: "AI Business Operations Bundle",
    typeIcon: "sparkle",
    gradient: "from-accent-50 via-neutral-50 to-brand-50/60",
  },
  {
    slug: "nexus-network",
    name: "Nexus Network",
    tagline: "AI Business Collaboration Marketplace",
    regularPrice: 299,
    launchPrice: 219,
    discountPercent: 27,
    category: "AI Business Systems",
    categorySlug: "ai-business-systems",
    rating: 4.8,
    reviewCount: 34,
    description:
      "Nexus Network provides a complete plan for building an AI-powered business collaboration marketplace — connecting businesses, professionals, service providers, and AI teams through intelligent matching and structured workflows.",
    longDescription:
      "Nexus Network provides a complete plan for building an AI-powered business collaboration marketplace. The platform connects businesses, professionals, service providers, project owners, and AI teams through intelligent matching, structured communication, project workflows, and secure marketplace controls. The system helps users find partners, form project teams, identify business opportunities, manage collaboration requests, and coordinate work through one platform.",
    valueStatement:
      "Launch your own AI-powered business collaboration marketplace that connects businesses, professionals, and service providers through intelligent matching and structured workflows.",
    ctaText: "Get Nexus Network for $219",
    included: [
      "AI business-matching team",
      "Buyer and provider workflows",
      "Business profile structure",
      "Project and opportunity listings",
      "Collaboration request system",
      "AI recommendation logic",
      "Marketplace search and filtering",
      "Messaging workflows",
      "Trust and verification framework",
      "Ratings and review structure",
      "Revenue and commission model",
      "Launch strategy",
    ],
    faqs: [
      {
        question: "Is this a software product or a blueprint?",
        answer:
          "Nexus Network is a complete business system blueprint — strategy documents, workflow designs, technical architecture, and launch plans. It's the plan for building a marketplace, not the marketplace software itself.",
      },
      {
        question: "What kind of marketplace is this designed for?",
        answer:
          "Nexus Network is designed for B2B collaboration marketplaces — think platforms that connect businesses with service providers, consultants, AI solutions, or technology partners. The trust and moderation framework is built for high-value B2B transactions.",
      },
      {
        question: "Do I need technical skills to use this?",
        answer:
          "The strategy, workflows, and growth sections are accessible to business leaders. The technical architecture section is detailed enough for an engineering team to implement. You'll want a technical co-founder or development partner for the build phase.",
      },
      {
        question: "What's the revenue model included?",
        answer:
          "The blueprint includes detailed models for transaction fees, subscription tiers, featured listings, and premium services — with pricing benchmarks from successful B2B marketplaces.",
      },
      {
        question: "How long does it take to launch using this blueprint?",
        answer:
          "The launch roadmap estimates 12–16 weeks to MVP for a team of 2–3 engineers plus a business lead. The growth strategy covers the first 12 months post-launch.",
      },
    ],
    reviews: [
      {
        name: "Carla Mendez",
        initials: "CM",
        role: "Founder",
        rating: 5,
        date: "July 12, 2026",
        text: "Nexus Network gave us the exact blueprint we needed. The buyer/seller workflows and trust framework saved us months of trial and error. We launched our AI services marketplace in 14 weeks and had our first 50 transactions by month two.",
      },
      {
        name: "Derek Owens",
        initials: "DO",
        role: "CTO",
        rating: 5,
        date: "June 28, 2026",
        text: "The technical architecture section is remarkably thorough. The AI collaboration agent design patterns are innovative — we adapted them for our platform and they're now a key differentiator.",
      },
      {
        name: "Hannah Lee",
        initials: "HL",
        role: "VP Product",
        rating: 4,
        date: "June 10, 2026",
        text: "Excellent strategy framework. The launch roadmap was realistic and the growth strategy has solid tactics. One area for improvement: more detail on international/ multi-currency marketplace considerations.",
      },
    ],
    demoVideoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    relatedSlugs: ["nexusos", "digital-humans", "genesis-platform"],
    typeIcon: "monitor",
    gradient: "from-brand-50 via-neutral-50 to-neutral-100",
  },
  {
    slug: "digital-humans",
    name: "Digital Humans",
    tagline: "AI Workforce & Virtual Employee Platform",
    regularPrice: 499,
    launchPrice: 379,
    discountPercent: 24,
    category: "AI Business Systems",
    categorySlug: "ai-business-systems",
    rating: 4.8,
    reviewCount: 31,
    description:
      "Digital Humans provides a complete platform plan for building and managing virtual AI employees — deployed across customer support, sales, marketing, finance, administration, research, operations, and project management.",
    longDescription:
      "Digital Humans provides a complete platform plan for building and managing virtual AI employees. Businesses assign digital employees to roles across customer support, sales, marketing, finance, administration, research, operations, and project management. Each virtual employee receives defined responsibilities, permissions, workflows, performance measures, escalation rules, and human approval controls. The platform focuses on structured AI workforce deployment with clear human oversight.",
    valueStatement:
      "Build a virtual AI employee platform — deploy digital workers across departments with defined responsibilities, approval controls, and performance monitoring.",
    ctaText: "Get Digital Humans for $379",
    included: [
      "Virtual employee platform model",
      "Digital employee profiles",
      "Department role templates",
      "Task assignment workflows",
      "Human approval controls",
      "Performance monitoring framework",
      "Employee permissions",
      "Escalation procedures",
      "Work quality review",
      "AI workforce dashboard",
      "Department allocation model",
      "Subscription pricing structure",
    ],
    faqs: [
      {
        question: "Is this about building chatbots or actual AI workers?",
        answer:
          "Digital Humans is about building a platform for AI workers — autonomous digital employees that perform tasks, follow workflows, and operate under human oversight. This is far beyond chatbots: think virtual employees that handle end-to-end business processes with approval gates.",
      },
      {
        question: "What industries is this designed for?",
        answer:
          "The blueprint is industry-agnostic with reference implementations for financial services, customer operations, and back-office processing. The virtual employee framework can be adapted to any knowledge-work domain.",
      },
      {
        question: "Do I need AI/ML expertise to implement this?",
        answer:
          "The technical architecture assumes familiarity with AI/LLM integration patterns. For the business and governance sections, no AI expertise is required. Most teams pair a business lead with an AI-literate technical lead for implementation.",
      },
      {
        question: "What format do I receive?",
        answer:
          "Structured documentation including workforce design frameworks, workflow diagrams, governance policies, architecture specs, and a product roadmap — delivered as downloadable PDFs and editable source documents.",
      },
      {
        question: "What's the licence?",
        answer:
          "Single-business perpetual licence. Build one commercial AI workforce platform. Enterprise licensing available for consultancies and platform vendors.",
      },
    ],
    reviews: [
      {
        name: "Jonathan Webb",
        initials: "JW",
        role: "CEO",
        rating: 5,
        date: "July 18, 2026",
        text: "The virtual employee framework is transformative. We're building a digital workforce platform for insurance processing and Digital Humans gave us the exact architecture and governance model we needed. Our Series A investors were impressed by how thoroughly we'd thought through the human oversight layer.",
      },
      {
        name: "Amara Chen",
        initials: "AC",
        role: "VP AI",
        rating: 5,
        date: "July 2, 2026",
        text: "Best AI workforce blueprint on the market. The task assignment workflows and human approval controls are particularly well-designed — they solve the real problems that come after 'just add an LLM.'",
      },
      {
        name: "Patrick Flynn",
        initials: "PF",
        role: "CTO",
        rating: 4,
        date: "June 20, 2026",
        text: "Solid technical architecture with practical deployment guidance. The enterprise sales model section is a bonus — most technical blueprints ignore the commercial side. I'd like to see more on multi-agent coordination patterns in the next version.",
      },
    ],
    demoVideoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    relatedSlugs: ["nexusos", "nexus-network", "empire-ai"],
    typeIcon: "sparkle",
    gradient: "from-accent-50 via-neutral-50 to-brand-50/60",
  },
  {
    slug: "genesis-platform",
    name: "Genesis Platform",
    tagline: "AI Business App Builder",
    regularPrice: 699,
    launchPrice: 499,
    discountPercent: 29,
    category: "AI Development",
    categorySlug: "ai-development",
    rating: 4.9,
    reviewCount: 27,
    description:
      "Genesis Platform provides a complete plan for building an AI-powered business application builder — describe the app you need, select templates, configure workflows, add AI agents, connect data, and publish.",
    longDescription:
      "Genesis Platform provides a complete plan for building an AI-powered business application builder. Users describe the application they need, select templates, configure workflows, add AI agents, connect data, and publish a working business application. The platform supports no-code application creation, workflow automation, user authentication, payments, subscriptions, integrations, templates, and application publishing. Genesis Platform is the most technically advanced product in the collection.",
    valueStatement:
      "Build an AI-powered app builder — users describe the application they need and publish a working business app with no-code tools, automation, templates, and subscription billing.",
    ctaText: "Get Genesis Platform for $499",
    included: [
      "AI application builder",
      "Prompt-to-application workflow",
      "No-code interface system",
      "Workflow automation engine",
      "AI agent builder",
      "Application template marketplace",
      "Database configuration",
      "Forms and dashboards",
      "User authentication",
      "Payment integration model",
      "Subscription billing framework",
      "Enterprise licensing strategy",
    ],
    faqs: [
      {
        question: "Is this a software product or a blueprint?",
        answer:
          "Genesis Platform is a complete blueprint for building your own AI app builder platform. It's the architectural plan, business model, and development roadmap — not pre-built software.",
      },
      {
        question: "Who is this designed for?",
        answer:
          "Genesis Platform is for technical founders and product teams who want to build a platform that lets non-technical users create AI-powered applications. Think 'Shopify for AI apps' — you're building the platform, your customers build the apps.",
      },
      {
        question: "What technical stack does it assume?",
        answer:
          "The architecture is cloud-agnostic with reference implementations. Key components covered include the no-code builder engine, AI agent orchestration layer, template rendering system, and multi-tenant SaaS infrastructure.",
      },
      {
        question: "How does this compare to existing no-code platforms?",
        answer:
          "Genesis Platform isn't a no-code tool — it's the blueprint for building one. It's for entrepreneurs who want to compete with platforms like Bubble or Retool but with native AI agent capabilities at the core.",
      },
      {
        question: "What's the time-to-market using this blueprint?",
        answer:
          "The development roadmap estimates 16–20 weeks to MVP for a team of 3–5 engineers. The enterprise licensing strategy and subscription billing model are ready to adapt from day one.",
      },
    ],
    reviews: [
      {
        name: "Raj Mehta",
        initials: "RM",
        role: "CTO & Co-Founder",
        rating: 5,
        date: "July 16, 2026",
        text: "Genesis Platform is the most comprehensive product blueprint I've seen. The no-code builder architecture alone saved us months of R&D. We're now six weeks into building our platform and the subscription billing model was immediately actionable.",
      },
      {
        name: "Sofia Reyes",
        initials: "SR",
        role: "VP Product",
        rating: 5,
        date: "July 1, 2026",
        text: "The template marketplace design and publishing workflow are brilliant. These are the features that turn a builder into a platform, and Genesis Platform maps them out perfectly. Our investors see this as a key differentiator.",
      },
      {
        name: "Kevin O'Brien",
        initials: "KO",
        role: "Technical Founder",
        rating: 4,
        date: "June 15, 2026",
        text: "Excellent architecture. The enterprise licensing strategy is a standout — it gave us a clear path to monetization that we'd been struggling with. The security requirements section could be more detailed for regulated industries.",
      },
    ],
    demoVideoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    relatedSlugs: ["nexusos", "digital-humans", "nexus-network"],
    typeIcon: "box",
    gradient: "from-neutral-50 via-neutral-100 to-brand-50/40",
  },
  {
    slug: "guardianos",
    name: "GuardianOS",
    tagline: "AI Trust & Payment Verification Platform",
    regularPrice: 499,
    launchPrice: 369,
    discountPercent: 26,
    category: "Trust & Compliance",
    categorySlug: "trust-compliance",
    rating: 4.9,
    reviewCount: 36,
    description:
      "GuardianOS provides a structured AI trust and payment-verification system — reviewing payment requests, verifying supplier details, checking identities, confirming approval authority, and blocking high-risk transactions.",
    longDescription:
      "GuardianOS provides a structured AI trust and payment-verification system for businesses. The platform reviews payment requests, verifies supplier details, checks identities, confirms approval authority, detects suspicious changes, and blocks high-risk transactions for further review. GuardianOS supports finance teams, procurement departments, business owners, institutions, and companies managing sensitive payment approvals.",
    valueStatement:
      "Protect your business from payment fraud with an AI verification platform that reviews requests, checks identities, verifies suppliers, and blocks high-risk transactions.",
    ctaText: "Get GuardianOS for $369",
    included: [
      "Payment-verification AI team",
      "Supplier bank-detail verification",
      "Identity checks",
      "Executive request verification",
      "Approval-authority checks",
      "Payment limit controls",
      "Fraud-risk alerts",
      "Suspicious-change detection",
      "Emergency verification workflows",
      "Transaction review process",
      "Human approval controls",
      "Enterprise pricing model",
    ],
    faqs: [
      {
        question: "Is this a software product or a blueprint?",
        answer:
          "GuardianOS is a complete blueprint — detailed workflows, architecture diagrams, security specifications, and implementation guides. It's the plan for building a trust and verification platform, not the platform itself.",
      },
      {
        question: "What types of fraud does this platform address?",
        answer:
          "GuardianOS covers payment diversion fraud, executive impersonation (BEC), supplier invoice fraud, and internal approval manipulation. The verification workflows are designed for finance teams processing six and seven-figure transactions.",
      },
      {
        question: "Do I need compliance expertise to implement this?",
        answer:
          "The blueprint includes a full security architecture and compliance mapping to SOC 2, ISO 27001, and PCI DSS. You'll want a security-conscious engineering team for implementation, but the compliance frameworks are pre-mapped.",
      },
      {
        question: "What format do I receive?",
        answer:
          "Structured documentation including verification workflow diagrams, security architecture specs, fraud detection patterns, enterprise pricing models, and an implementation roadmap — delivered as downloadable PDFs and editable source documents.",
      },
      {
        question: "What's the licence?",
        answer:
          "Single-business perpetual licence for building one commercial trust and verification platform. Enterprise multi-tenant licences available for security vendors.",
      },
    ],
    reviews: [
      {
        name: "Marcus Chen",
        initials: "MC",
        role: "Head of InfoSec",
        rating: 5,
        date: "July 19, 2026",
        text: "GuardianOS is the blueprint every fintech needs. The payment verification workflows caught a pattern in our existing process that would have let through a $340K fraudulent invoice. We've now rebuilt our entire approval chain on this architecture.",
      },
      {
        name: "Angela Rossi",
        initials: "AR",
        role: "CFO",
        rating: 5,
        date: "July 7, 2026",
        text: "After a wire fraud attempt cost us $180K last year, I was determined to fix our verification process. GuardianOS gave our engineering team the exact blueprint. The emergency verification process is something I hope we never need — but I sleep better knowing it's there.",
      },
      {
        name: "Daniel Park",
        initials: "DP",
        role: "VP Engineering",
        rating: 4,
        date: "June 25, 2026",
        text: "The security architecture is enterprise-grade. Implementation took our team about 8 weeks and the fraud alerts have already caught two suspicious requests. The enterprise pricing model section is weaker than the technical content — but we didn't buy it for the pricing advice.",
      },
    ],
    demoVideoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    relatedSlugs: ["spendshield-ai", "evidenceflow-ai", "empire-ai"],
    bundleName: "Trust, Risk & Compliance Bundle",
    typeIcon: "cog",
    gradient: "from-brand-50/60 via-neutral-50 to-accent-50/40",
  },
  {
    slug: "spendshield-ai",
    name: "SpendShield AI",
    tagline: "Procurement Savings & Vendor Risk",
    regularPrice: 349,
    launchPrice: 249,
    discountPercent: 29,
    category: "Trust & Compliance",
    categorySlug: "trust-compliance",
    rating: 4.7,
    reviewCount: 23,
    description:
      "SpendShield AI provides a complete procurement intelligence system focused on cost control and supplier risk — reviewing spending, comparing suppliers, analyzing contracts, and identifying savings opportunities.",
    longDescription:
      "SpendShield AI provides a complete procurement intelligence system focused on cost control and supplier risk. The platform reviews spending, compares suppliers, analyzes contracts, identifies price differences, tracks vendor performance, and highlights savings opportunities. Procurement teams receive structured information before supplier selection, contract renewal, negotiation, and purchasing decisions.",
    valueStatement:
      "Give your procurement team AI-powered intelligence for cost control — spending reviews, supplier comparisons, contract analysis, and savings identification.",
    ctaText: "Get SpendShield AI for $249",
    included: [
      "Procurement AI team",
      "Spend classification",
      "Spend analysis workflows",
      "Supplier comparison",
      "Vendor-risk assessment",
      "Contract review workflows",
      "Price variance analysis",
      "Duplicate-charge detection",
      "Savings opportunity identification",
      "Supplier performance monitoring",
      "Negotiation preparation",
      "Service revenue model",
    ],
    faqs: [
      {
        question: "Is this a software product or a blueprint?",
        answer:
          "SpendShield AI is a complete business system blueprint — detailed workflows, agent designs, architecture specifications, and implementation guides for building an AI procurement platform.",
      },
      {
        question: "How is this different from existing procurement software?",
        answer:
          "Existing procurement tools digitize existing processes. SpendShield AI shows you how to build AI-native procurement — autonomous spend analysis agents, automated contract review, and predictive vendor risk scoring. It's the next generation, not a digital version of the old way.",
      },
      {
        question: "What size organization is this for?",
        answer:
          "SpendShield AI is designed for organizations with annual procurement spend of $10M+. The cost-saving recommendation engine scales with volume — the larger your procurement operation, the higher the ROI.",
      },
      {
        question: "Do I need data science expertise?",
        answer:
          "The technical architecture includes clear specifications for the AI/ML components. You'll want a data-literate engineering team for implementation, but the blueprint is designed to be adaptable to different technical maturity levels.",
      },
      {
        question: "What's the licence?",
        answer:
          "Single-business perpetual licence. Build one commercial procurement platform. Enterprise and multi-tenant licences available.",
      },
    ],
    reviews: [
      {
        name: "Victoria Nash",
        initials: "VN",
        role: "Head of Procurement",
        rating: 5,
        date: "July 14, 2026",
        text: "SpendShield AI transformed our procurement function. The vendor risk agent alone identified three high-risk suppliers we were over-reliant on. Within the first quarter of using the spend analysis framework, we identified $2.1M in savings opportunities.",
      },
      {
        name: "Robert Kimani",
        initials: "RK",
        role: "CPO",
        rating: 5,
        date: "June 29, 2026",
        text: "I've implemented six-figure procurement systems that didn't deliver what SpendShield AI's blueprint does on paper. The contract review workflows and negotiation preparation tools gave our team an edge in every supplier conversation.",
      },
      {
        name: "Emma Larsson",
        initials: "EL",
        role: "Director of Finance",
        rating: 4,
        date: "June 14, 2026",
        text: "Very strong framework. The spend analysis agent design is exceptional. I'd like more detail on integration patterns with existing ERP systems — our SAP integration was more complex than the blueprint anticipated. Still, worth every dollar.",
      },
    ],
    demoVideoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    relatedSlugs: ["guardianos", "evidenceflow-ai", "empire-ai"],
    bundleName: "Trust, Risk & Compliance Bundle",
    typeIcon: "file",
    gradient: "from-neutral-50 via-brand-50/40 to-neutral-100",
  },
  {
    slug: "evidenceflow-ai",
    name: "EvidenceFlow AI",
    tagline: "Compliance Evidence Agent",
    regularPrice: 349,
    launchPrice: 249,
    discountPercent: 29,
    category: "Trust & Compliance",
    categorySlug: "trust-compliance",
    rating: 4.8,
    reviewCount: 21,
    description:
      "EvidenceFlow AI provides a complete system for collecting, organizing, and mapping compliance evidence — gathering documents, policies, certificates, and records, then connecting them to controls and preparing organized audit files.",
    longDescription:
      "EvidenceFlow AI provides a complete system for collecting, organizing, and mapping compliance evidence. The platform gathers documents, policies, certificates, emails, reports, screenshots, and system records. AI agents classify each item, connect evidence to controls, identify missing records, and prepare organized audit files. EvidenceFlow AI supports compliance teams, auditors, quality managers, risk teams, and businesses working with formal standards.",
    valueStatement:
      "Automate compliance evidence collection and audit preparation — AI agents classify documents, map controls, identify gaps, and organize audit-ready files.",
    ctaText: "Get EvidenceFlow AI for $249",
    included: [
      "Compliance evidence AI team",
      "Automated evidence collection",
      "Document classification",
      "Control mapping",
      "Missing-evidence tracking",
      "Approval workflows",
      "Audit preparation",
      "Evidence status dashboard",
      "Secure evidence folders",
      "Review schedules",
      "Compliance reporting",
      "Subscription revenue model",
    ],
    faqs: [
      {
        question: "Is this a software product or a blueprint?",
        answer:
          "EvidenceFlow AI is a complete business system blueprint — with detailed designs for evidence collection agents, document classification systems, control mapping, and audit workflows. It's the plan for building a compliance platform, not the platform itself.",
      },
      {
        question: "What compliance frameworks does this cover?",
        answer:
          "The control mapping covers SOC 2, ISO 27001, PCI DSS, HIPAA, and GDPR. The architecture is framework-agnostic — you can map any control set into the system. Reference mappings are included for the most common frameworks.",
      },
      {
        question: "How does this compare to GRC tools?",
        answer:
          "GRC tools like Vanta and Drata are products you buy. EvidenceFlow AI is the blueprint for building the next generation of those tools — with autonomous evidence collection agents and AI-powered document classification that goes beyond what current GRC platforms offer.",
      },
      {
        question: "Do I need compliance expertise to use this?",
        answer:
          "The blueprint is designed for teams with compliance knowledge. The control mappings and audit workflows assume familiarity with common frameworks. If you have a compliance officer or CISO, they'll be able to run with this immediately.",
      },
      {
        question: "What format and licence?",
        answer:
          "Structured documentation delivered as downloadable PDFs and editable source files. Single-business perpetual licence — build one commercial compliance platform. Enterprise licences available.",
      },
    ],
    reviews: [
      {
        name: "Catherine Wu",
        initials: "CW",
        role: "CISO",
        rating: 5,
        date: "July 17, 2026",
        text: "EvidenceFlow AI cut our SOC 2 audit prep time by 60%. The evidence collection agents and document classification system are exactly what the compliance industry has been waiting for. Our auditors were genuinely impressed by the evidence trail this system produced.",
      },
      {
        name: "Andre Dupont",
        initials: "AD",
        role: "Head of Compliance",
        rating: 5,
        date: "July 4, 2026",
        text: "Managing compliance across six frameworks was a nightmare until we implemented the EvidenceFlow AI blueprint. The control mapping alone saved us from maintaining six separate evidence spreadsheets. Now everything is connected.",
      },
      {
        name: "Jessica Moore",
        initials: "JM",
        role: "VP of Engineering",
        rating: 4,
        date: "June 19, 2026",
        text: "The technical architecture is clean and implementable. Our team built the core evidence collection pipeline in about five weeks. The subscription model section is useful but could include more competitive benchmarking. Strong product overall.",
      },
    ],
    demoVideoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    relatedSlugs: ["guardianos", "spendshield-ai", "nexusos"],
    bundleName: "Trust, Risk & Compliance Bundle",
    typeIcon: "file",
    gradient: "from-neutral-50 via-brand-50/40 to-neutral-100",
  },
];

/* ─── 3 Bundles ─── */

export const BUNDLES: Bundle[] = [
  {
    slug: "ai-business-operations",
    name: "AI Business Operations Bundle",
    description:
      "Connect daily operations, department management, executive reporting, strategic oversight, and AI-supported decisions through three integrated business systems.",
    productSlugs: ["nexusos", "nexus-one", "empire-ai"],
    productNames: ["NexusOS", "Nexus One", "Empire AI"],
    regularCombined: 1547,
    launchPrice: 999,
    saving: 548,
  },
  {
    slug: "trust-risk-compliance",
    name: "Trust, Risk & Compliance Bundle",
    description:
      "Protect payments, review suppliers, control procurement spending, organize compliance evidence, and prepare for audits through one connected business protection package.",
    productSlugs: ["guardianos", "spendshield-ai", "evidenceflow-ai"],
    productNames: ["GuardianOS", "SpendShield AI", "EvidenceFlow AI"],
    regularCombined: 1197,
    launchPrice: 749,
    saving: 448,
  },
  {
    slug: "complete-portfolio",
    name: "Complete AI Business Portfolio",
    description:
      "Purchase the complete collection of AI business systems covering app development, business operations, executive management, procurement, compliance, financial security, virtual workforces, and professional collaboration.",
    productSlugs: [
      "nexusos",
      "nexus-one",
      "empire-ai",
      "nexus-network",
      "digital-humans",
      "genesis-platform",
      "guardianos",
      "spendshield-ai",
      "evidenceflow-ai",
    ],
    productNames: [
      "NexusOS",
      "Nexus One",
      "Empire AI",
      "Nexus Network",
      "Digital Humans",
      "Genesis Platform",
      "GuardianOS",
      "SpendShield AI",
      "EvidenceFlow AI",
    ],
    regularCombined: 4241,
    launchPrice: 2699,
    saving: 1542,
  },
];

/* ─── Helpers ─── */

const productMap = new Map<string, Product>();
for (const p of PRODUCTS) productMap.set(p.slug, p);

export function getProductBySlug(slug: string): Product | undefined {
  return productMap.get(slug);
}

export function getRelatedProducts(slugs: string[]): Product[] {
  return slugs.map((s) => productMap.get(s)).filter(Boolean) as Product[];
}

export function getBundleForProduct(slug: string): Bundle | undefined {
  return BUNDLES.find((b) => b.productSlugs.includes(slug));
}

export const CATEGORY_MAP: Record<string, { name: string; slug: string; count: number }> = {
  "ai-business-systems": {
    name: "AI Business Systems",
    slug: "ai-business-systems",
    count: PRODUCTS.filter((p) => p.categorySlug === "ai-business-systems").length,
  },
  "ai-development": {
    name: "AI Development",
    slug: "ai-development",
    count: PRODUCTS.filter((p) => p.categorySlug === "ai-development").length,
  },
  "trust-compliance": {
    name: "Trust & Compliance",
    slug: "trust-compliance",
    count: PRODUCTS.filter((p) => p.categorySlug === "trust-compliance").length,
  },
};

export function calculateLaunchDeadline(): string {
  // 30 days from a fixed launch date (July 28, 2026)
  const launchDate = new Date("2026-07-28");
  const deadline = new Date(launchDate);
  deadline.setDate(deadline.getDate() + 30);
  return deadline.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
