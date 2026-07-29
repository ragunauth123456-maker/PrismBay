/* ─── PrismBay Demo Walkthrough Data ─── */
/* Extracted from demo-video-scripts.md — web-based guided tours for each product. */

export interface DemoStep {
  /** Short heading shown above the visual */
  title: string;
  /** Narration text — the "spoken" walkthrough content */
  narration: string;
  /** Visual cue: which section / feature is being highlighted */
  visualLabel: string;
  /** Optional icon name for the step category */
  icon?: "hook" | "overview" | "feature" | "value" | "close";
}

export interface DemoWalkthrough {
  productSlug: string;
  productName: string;
  totalSteps: number;
  steps: DemoStep[];
  /** Path to the screen-recorded demo video webm, e.g. /videos/demos/nexusos.webm */
  videoUrl?: string;
}

/* ─── 1. Nexus Network ─── */

const nexusNetworkSteps: DemoStep[] = [
  {
    title: "The B2B Collaboration Gap",
    narration:
      "You've seen two-sided marketplaces work for rides, rooms, and freelance gigs — but nobody has cracked B2B collaboration marketplaces yet. Here's the complete blueprint for building one, with AI-powered matching, trust systems, and revenue models already mapped out.",
    visualLabel: "Title page / cover",
    icon: "hook",
  },
  {
    title: "What You Receive",
    narration:
      "When you purchase Nexus Network, you receive a structured document package — architecture diagrams, workflow maps, technical specifications, and a launch roadmap. Everything is delivered as downloadable PDFs and editable source files.",
    visualLabel: "Document package overview",
    icon: "overview",
  },
  {
    title: "AI Business-Matching Engine",
    narration:
      "The core engine: detailed AI agent role definitions — the matching agent, the recommendation agent, the vetting agent. Each one has defined responsibilities, operating instructions, and integration points. This isn't 'add an AI chatbot' thinking. It's a structured AI team design with clear handoffs between agents.",
    visualLabel: "AI Business-Matching Team section",
    icon: "feature",
  },
  {
    title: "Buyer & Provider Workflows",
    narration:
      "End-to-end workflows mapped from project posting through proposal, selection, contracting, delivery, and payment release. Every state transition is documented. If you've ever tried to design marketplace workflows from scratch, you know how many edge cases there are. This section handles them.",
    visualLabel: "Buyer and Provider Workflows",
    icon: "feature",
  },
  {
    title: "Trust & Verification Framework",
    narration:
      "This is where Nexus Network separates from generic marketplace templates. A complete trust and verification framework — identity verification flows, business credential checks, tiered verification levels, ratings and review structure, and marketplace moderation controls. B2B transactions are high-stakes. The trust layer has to be serious.",
    visualLabel: "Trust and Verification Framework",
    icon: "feature",
  },
  {
    title: "Revenue & Commission Model",
    narration:
      "Transaction fees, subscription tiers, featured listings, and premium services — with pricing benchmarks drawn from successful B2B marketplaces. Includes the commercial logic: when to charge commission versus subscription, how to structure free tiers, and what conversion rates to model.",
    visualLabel: "Revenue and Commission Model",
    icon: "feature",
  },
  {
    title: "Launch Strategy & Growth Roadmap",
    narration:
      "A twelve-to-sixteen-week MVP timeline for a team of two to three engineers plus a business lead. A cold-start plan for seeding both sides of the marketplace. A twelve-month growth roadmap with milestones. This isn't theory — it's a sequenced plan you can hand to a development team.",
    visualLabel: "Launch Strategy and Growth Roadmap",
    icon: "feature",
  },
  {
    title: "Real-World Results",
    narration:
      "One of our buyers, Carla Mendez, a founder, launched her AI services marketplace in fourteen weeks using this blueprint. She had her first fifty transactions by month two. Nexus Network is for founders and product teams who see the gap in B2B collaboration marketplaces and want to build something real.",
    visualLabel: "Buyer success story",
    icon: "value",
  },
  {
    title: "Get Nexus Network",
    narration:
      "Two hundred nineteen dollars during our thirty-day launch — two ninety-nine after. You get the architecture, the trust framework, the monetization model, and the launch plan — everything that takes months to figure out through trial and error.",
    visualLabel: "Pricing and CTA",
    icon: "close",
  },
];

/* ─── 2. Digital Humans ─── */

const digitalHumansSteps: DemoStep[] = [
  {
    title: "Beyond Chatbots",
    narration:
      "Most companies are still using AI like a smarter search bar. The next wave is autonomous digital employees that own workflows end-to-end — and here's the complete platform blueprint for building that.",
    visualLabel: "Document title page",
    icon: "hook",
  },
  {
    title: "The Virtual Employee Model",
    narration:
      "Digital Humans is a platform blueprint for building and managing virtual AI employees. Not chatbots. Not copilots. Digital employees with defined roles, responsibilities, permissions, performance measures, and human oversight — deployed across customer support, sales, marketing, finance, administration, research, operations, and project management.",
    visualLabel: "Virtual Employee Platform Model",
    icon: "overview",
  },
  {
    title: "Pre-Built Role Templates",
    narration:
      "Eight department areas, each with pre-built role definitions. The finance department template includes roles for accounts payable agent, expense review agent, and financial reporting agent — each with task boundaries, approval gates, and escalation rules. You can adapt all of these, but you're not starting from a blank page.",
    visualLabel: "Digital Employee Profiles and Department Role Templates",
    icon: "feature",
  },
  {
    title: "Task Assignment Workflows",
    narration:
      "How work flows from detection to assignment, execution, quality review, and human sign-off. Every workflow includes defined approval points. The system doesn't let digital employees act without oversight — it's designed to make human approval lightweight and well-structured, not to bypass it.",
    visualLabel: "Task Assignment Workflows",
    icon: "feature",
  },
  {
    title: "Human Approval & Governance",
    narration:
      "The permission system defines what each digital employee can do autonomously, what requires approval, and what's permanently off-limits. Escalation procedures define what happens when a digital employee encounters something it can't handle. This is the governance layer that separates a controlled AI workforce from a risky experiment.",
    visualLabel: "Human Approval Controls and Permissions",
    icon: "feature",
  },
  {
    title: "Performance Monitoring",
    narration:
      "Each digital employee role has defined KPIs, quality thresholds, and review cadences. The AI workforce dashboard framework shows utilization, accuracy rates, exception counts, and approval patterns — so you can actually manage a mixed human-AI workforce, not just deploy agents and hope.",
    visualLabel: "Performance Monitoring Framework",
    icon: "feature",
  },
  {
    title: "AI Governance & Risk Framework",
    narration:
      "The governance section covers risk classification, model selection criteria, testing protocols, and an ethics review framework. If you're deploying AI in regulated industries, this section alone is worth the purchase. It addresses the questions your compliance team and board will ask before approving any AI workforce deployment.",
    visualLabel: "AI Governance Framework",
    icon: "feature",
  },
  {
    title: "Real-World Validation",
    narration:
      "Jonathan Webb, a CEO building an insurance processing platform, told us his Series A investors were impressed by how thoroughly the human oversight layer was designed. Amara Chen, a VP of AI, said the task assignment workflows and approval controls 'solve the real problems that come after just add an LLM.'",
    visualLabel: "Buyer testimonials",
    icon: "value",
  },
  {
    title: "Get Digital Humans",
    narration:
      "Three seventy-nine during launch, four ninety-nine regular. Digital Humans is for technical founders and platform teams who want to build the infrastructure layer for the AI workforce — not just another chatbot.",
    visualLabel: "Pricing and CTA",
    icon: "close",
  },
];

/* ─── 3. NexusOS ─── */

const nexusosSteps: DemoStep[] = [
  {
    title: "One System, Every Department",
    narration:
      "Your business runs on twenty different tools and none of them talk to each other. NexusOS is the complete plan for building one intelligent operating system that connects every department — finance, HR, sales, operations, compliance — into a single coordinated platform.",
    visualLabel: "Document title page",
    icon: "hook",
  },
  {
    title: "The Executive Command Centre",
    narration:
      "The top-level interface where leadership sees the entire business at a glance. Wireframes, dashboard layouts, and the data architecture that feeds them. Designed for CEOs, COOs, and CFOs who need financials, operations, risk, and strategic progress in one place.",
    visualLabel: "Executive Command Centre",
    icon: "overview",
  },
  {
    title: "Department Operating Modules",
    narration:
      "Finance, human resources, sales, marketing, procurement, operations, compliance, customer service, and project management — each one gets its own module specification. For each module, you get workflow designs, AI agent definitions, data schemas, and integration points with the other modules.",
    visualLabel: "Department Operating Modules",
    icon: "feature",
  },
  {
    title: "Cross-Department AI Coordination",
    narration:
      "AI agents that work across departments — a finance agent that talks to the procurement agent, a sales agent that coordinates with operations. The orchestration framework defines how agents share context, escalate issues, and present unified recommendations to management.",
    visualLabel: "AI Agent Coordination and Workflow Orchestration",
    icon: "feature",
  },
  {
    title: "Business Intelligence Framework",
    narration:
      "Reporting pipelines, analytics models, and decision-support dashboards. Performance indicators mapped to each department, cross-functional metrics, and executive summary formats. If you've ever spent weeks preparing a board deck from scattered data sources, this section shows you how to make that a daily, automated output.",
    visualLabel: "Business Intelligence Framework and Performance Dashboards",
    icon: "feature",
  },
  {
    title: "Security, Governance & Compliance",
    narration:
      "Role-based access controls, audit logging, approval hierarchies, and compliance mappings to SOC 2, ISO 27001, and GDPR. For any company that takes compliance seriously, this is essential reading.",
    visualLabel: "Security, Governance, and Approval Controls",
    icon: "feature",
  },
  {
    title: "Revenue Model & Implementation",
    narration:
      "How to commercialize NexusOS — pricing tiers, enterprise sales motion, and unit economics. Includes a build-versus-buy analysis if you're building for internal use. The implementation roadmap estimates phases, teams, and timelines.",
    visualLabel: "SaaS Revenue Model and Implementation Roadmap",
    icon: "feature",
  },
  {
    title: "Proven Impact",
    narration:
      "David Kim, a CTO, told us it saved his team six months of architecture planning — the AI agent coordination framework became the backbone of their internal platform. Sarah Mitchell, a CEO, used the executive command system to clarify her vision before raising a seed round.",
    visualLabel: "Buyer testimonials",
    icon: "value",
  },
  {
    title: "Get NexusOS",
    narration:
      "Four forty-nine during our thirty-day launch, five ninety-nine after. NexusOS is for companies with fifty-plus employees who've outgrown their tool stack and need a unified system.",
    visualLabel: "Pricing and CTA",
    icon: "close",
  },
];

/* ─── 4. Empire AI ─── */

const empireAiSteps: DemoStep[] = [
  {
    title: "Decisions Without Blind Spots",
    narration:
      "As a CEO or COO, you're making decisions with incomplete information from disconnected reports. Empire AI is the blueprint for a single command platform that brings financial results, operations, workforce data, projects, risks, and forecasts into one place — with AI agents that surface what actually needs your attention.",
    visualLabel: "Document title page",
    icon: "hook",
  },
  {
    title: "The Executive Command Dashboard",
    narration:
      "Detailed wireframes and data architecture for a dashboard showing financial performance, operational activity, workforce metrics, project status, risk indicators, and strategic priorities. The design prioritizes exception-based reporting — it surfaces what's off track, not everything that's fine.",
    visualLabel: "Executive Command Dashboard",
    icon: "overview",
  },
  {
    title: "Financial Performance Monitoring",
    narration:
      "How to connect your accounting systems, ERP, and banking data into a unified view. Revenue tracking, cost monitoring, cash flow projections, budget variance alerts. The agent design includes a financial analyst agent that prepares weekly summaries and flags anomalies.",
    visualLabel: "Financial Performance Monitoring",
    icon: "feature",
  },
  {
    title: "Operational & Workforce Visibility",
    narration:
      "Production, logistics, and service delivery data in one place. Workforce performance tracking goes beyond headcount — productivity metrics, capacity planning, and attrition risk. Designed for COOs who need the entire operational picture without logging into five different systems.",
    visualLabel: "Operational and Workforce Monitoring",
    icon: "feature",
  },
  {
    title: "Strategic Planning & Forecasting",
    narration:
      "OKR tracking, initiative monitoring, and priority alignment. The forecasting framework includes revenue projections, resource planning, and scenario modeling. AI agents support these by identifying leading indicators, comparing actuals to forecasts, and flagging when strategic assumptions need revisiting.",
    visualLabel: "Strategic Planning and Forecasting",
    icon: "feature",
  },
  {
    title: "Decision-Support Agents",
    narration:
      "These aren't dashboards — they're AI agents that review business data, prepare executive briefings, and surface decision-ready information. Agent designs for financial review, operational exception detection, risk monitoring, and strategic analysis. Each agent has defined inputs, analysis patterns, and output formats.",
    visualLabel: "Decision-Support Agents",
    icon: "feature",
  },
  {
    title: "Risk & Exception Alerts",
    narration:
      "The risk framework covers financial risk, operational risk, compliance risk, and strategic risk — with alert thresholds and escalation paths. The system is designed to catch problems before they appear in monthly reports, when it's often too late.",
    visualLabel: "Risk and Exception Alerts",
    icon: "feature",
  },
  {
    title: "Leadership Impact",
    narration:
      "Michael Torres, a CFO, told us it transformed how his leadership team makes decisions — the financial monitoring and risk alerts gave them visibility they'd been missing for years. Rachel Foster, a COO, implemented it across five business units and had real-time operational visibility within two months.",
    visualLabel: "Buyer testimonials",
    icon: "value",
  },
  {
    title: "Get Empire AI",
    narration:
      "Three ninety-nine during launch, five forty-nine regular. Empire AI is for CEOs, COOs, CFOs, and leadership teams who need better decision infrastructure.",
    visualLabel: "Pricing and CTA",
    icon: "close",
  },
];

/* ─── 5. Genesis Platform ─── */

const genesisPlatformSteps: DemoStep[] = [
  {
    title: "The AI App Builder Era",
    narration:
      "The no-code market is worth billions, but AI-native app builders don't exist yet. Genesis Platform is the complete blueprint for building one — a platform where users describe the app they need and publish a working business application with AI agents, workflows, and subscription billing built in.",
    visualLabel: "Document title page",
    icon: "hook",
  },
  {
    title: "Prompt-to-Application Pipeline",
    narration:
      "The core innovation: a user describes what they need — 'I need a customer onboarding app with document collection and approval routing' — and the system generates a configured application. This section covers the entire pipeline: prompt parsing, template matching, workflow generation, agent configuration, and deployment.",
    visualLabel: "Prompt-to-Application Workflow",
    icon: "overview",
  },
  {
    title: "No-Code Builder Interface",
    narration:
      "Visual interface design — drag-and-drop page composition, form builders, dashboard designers, and data model configuration. A user who prefers to build visually has full control. Component libraries, layout engines, and the real-time preview system are all specified.",
    visualLabel: "No-Code Interface System",
    icon: "feature",
  },
  {
    title: "AI Agent Builder & Workflow Engine",
    narration:
      "Users define custom AI agents for their applications — agents that handle customer inquiries, process documents, route approvals, or generate reports. The agent configuration system is accessible to non-technical users while powerful enough for complex workflows.",
    visualLabel: "AI Agent Builder and Workflow Automation Engine",
    icon: "feature",
  },
  {
    title: "Template Marketplace Ecosystem",
    narration:
      "Users can publish, share, and sell application templates. Template packaging, versioning, marketplace listings, review systems, and revenue sharing. This is the ecosystem layer that makes the platform defensible.",
    visualLabel: "Application Template Marketplace",
    icon: "feature",
  },
  {
    title: "Monetization Infrastructure",
    narration:
      "Stripe integration, subscription management, usage-based billing, and enterprise licensing. If your customers are building apps on your platform, you need flexible monetization that works for both sides.",
    visualLabel: "Payment Integration and Subscription Billing",
    icon: "feature",
  },
  {
    title: "Enterprise Deployment",
    narration:
      "Multi-tenant architecture, white-label deployment, SLA frameworks, and enterprise sales motion. Platform security requirements cover authentication, data isolation, and compliance. Kevin O'Brien, a technical founder, called the enterprise licensing strategy 'a standout' that gave his team 'a clear path to monetization.'",
    visualLabel: "Enterprise Licensing Strategy and Security",
    icon: "feature",
  },
  {
    title: "Developer Validation",
    narration:
      "Raj Mehta, a CTO and co-founder, said the no-code builder architecture alone saved his team months of R&D. The roadmap estimates sixteen to twenty weeks to MVP for a team of three to five engineers.",
    visualLabel: "Buyer testimonials",
    icon: "value",
  },
  {
    title: "Get Genesis Platform",
    narration:
      "Four ninety-nine during launch, six ninety-nine regular. Genesis Platform is for technical founders and product teams building the next generation of application platforms — think 'Shopify for AI apps.'",
    visualLabel: "Pricing and CTA",
    icon: "close",
  },
];

/* ─── 6. Nexus One ─── */

const nexusOneSteps: DemoStep[] = [
  {
    title: "AI for SMBs, Finally",
    narration:
      "Most AI business tools are built for enterprises with million-dollar budgets. Nexus One is the blueprint for giving your small or mid-size business a practical AI operating system — without the enterprise complexity or price tag.",
    visualLabel: "Document title page",
    icon: "hook",
  },
  {
    title: "One Connected Workspace",
    narration:
      "Customers, sales, tasks, projects, expenses, team activity, and business reports — all connected in one workspace. Not a collection of separate tools. One system where information flows between functions.",
    visualLabel: "Small-Business AI Operating System Overview",
    icon: "overview",
  },
  {
    title: "Daily Workflow Automation",
    narration:
      "Task handoffs between team members, deadline tracking, customer follow-up reminders, expense approvals. The workflows remove friction without requiring a dedicated operations team.",
    visualLabel: "Daily Workflow Automation",
    icon: "feature",
  },
  {
    title: "Sales & Customer Management",
    narration:
      "Pipeline tracking, activity logging, and relationship management — but for SMBs where the sales team might be two people and the founder. No bloated CRM workflows. Just what you actually need.",
    visualLabel: "Sales Tracking and Customer Management",
    icon: "feature",
  },
  {
    title: "Project & Task Coordination",
    narration:
      "Who's doing what, what's due, what's blocked. AI agents surface items that are stuck, overdue, or need a decision — so the owner doesn't chase status updates.",
    visualLabel: "Project Tracking and Task Coordination",
    icon: "feature",
  },
  {
    title: "Expense Monitoring & Analytics",
    narration:
      "Spending data with anomaly detection, duplicate charges, and budget overruns. Business analytics cover revenue tracking, customer metrics, and profitability views. The numbers an SMB owner actually needs — not fifty dashboards, but the five that matter.",
    visualLabel: "Expense Monitoring and Business Analytics",
    icon: "feature",
  },
  {
    title: "Executive Summaries & Support Agents",
    narration:
      "AI agents prepare weekly summaries: what happened, what needs attention, what decisions are pending. Department support agents cover key functions without the full enterprise module set. Designed for the owner who doesn't have time to read reports.",
    visualLabel: "Executive Summaries and Department Support Agents",
    icon: "feature",
  },
  {
    title: "SMB Impact",
    narration:
      "Priya Patel, an operations director at a forty-five-person logistics company, had department agents and task coordination running across her operations floor. Lisa Chang, a CTO, had core workflows in prototype within three weeks. Designed to be implemented by a technically-minded operations lead, not a large IT department.",
    visualLabel: "Buyer testimonials",
    icon: "value",
  },
  {
    title: "Get Nexus One",
    narration:
      "Two ninety-nine during launch, three ninety-nine regular. Nexus One is for SMB owners and operators who want AI capability without enterprise overhead.",
    visualLabel: "Pricing and CTA",
    icon: "close",
  },
];

/* ─── 7. SpendShield AI ─── */

const spendShieldAiSteps: DemoStep[] = [
  {
    title: "Millions Left on the Table",
    narration:
      "Most companies leave millions on the table in procurement — duplicate charges, unused contract leverage, and vendor risk that nobody is tracking. SpendShield AI is the complete blueprint for an AI procurement intelligence system that finds the savings and flags the risks before they become problems.",
    visualLabel: "Document title page",
    icon: "hook",
  },
  {
    title: "The Procurement AI Team",
    narration:
      "A spend analysis agent, supplier comparison agent, contract review agent, vendor risk agent, and savings identification agent. Each has defined responsibilities, data sources, analysis patterns, and output formats. Together, they form a procurement intelligence function that works continuously — not just during annual reviews.",
    visualLabel: "Procurement AI Team",
    icon: "overview",
  },
  {
    title: "Spend Classification & Analysis",
    narration:
      "Every procurement transaction mapped into categories, suppliers, and cost centres. Analysis workflows identify patterns: categories growing fastest, suppliers increasing prices above market, spend fragmented across too many vendors. Analysis that takes procurement teams weeks to produce manually — the blueprint shows how to make it real-time.",
    visualLabel: "Spend Classification and Analysis",
    icon: "feature",
  },
  {
    title: "Supplier Comparison & Vendor Risk",
    narration:
      "Supplier comparison factors in delivery performance, quality metrics, contract terms, and relationship history. Vendor risk assessment covers financial health, geographic concentration, compliance status, and dependency scoring — so you know which suppliers pose a concentration risk before it becomes a crisis.",
    visualLabel: "Supplier Comparison and Vendor Risk Assessment",
    icon: "feature",
  },
  {
    title: "Contract Review & Price Variance",
    narration:
      "Automated extraction of key terms, renewal tracking, price escalation clauses, and termination rights. Price variance analysis identifies when charges don't match contracted rates and when pricing has drifted from agreed terms.",
    visualLabel: "Contract Review and Price Variance Analysis",
    icon: "feature",
  },
  {
    title: "Duplicate Detection & Savings Engine",
    narration:
      "Same-invoice resubmissions, charges above contracted rates, and pricing drift identification. The savings opportunity engine quantifies potential savings from consolidation, renegotiation, and alternative sourcing — with dollar figures, not vague recommendations.",
    visualLabel: "Duplicate-Charge Detection and Savings Identification",
    icon: "feature",
  },
  {
    title: "Negotiation Intelligence",
    narration:
      "Structured briefs for supplier negotiations: current spend, contract terms, market benchmarks, alternative suppliers, recommended positions. Victoria Nash, a head of procurement, said the contract review workflows and negotiation tools 'gave our team an edge in every supplier conversation.'",
    visualLabel: "Negotiation Preparation and Procurement Reporting",
    icon: "feature",
  },
  {
    title: "Real Savings Achieved",
    narration:
      "Victoria's team identified two-point-one million dollars in savings opportunities in the first quarter. Robert Kimani, a CPO who's implemented six-figure procurement systems, said the SpendShield blueprint delivered what those expensive systems didn't.",
    visualLabel: "Buyer testimonials",
    icon: "value",
  },
  {
    title: "Get SpendShield AI",
    narration:
      "Two forty-nine during launch, three forty-nine regular. Designed for organizations with annual procurement spend of ten million dollars or more — the cost-saving recommendation engine scales with volume.",
    visualLabel: "Pricing and CTA",
    icon: "close",
  },
];

/* ─── 8. GuardianOS ─── */

const guardianosSteps: DemoStep[] = [
  {
    title: "The Billion-Dollar Fraud Problem",
    narration:
      "Payment fraud is a billion-dollar problem — and most companies still rely on manual verification that a single distracted employee can miss. GuardianOS is the blueprint for an AI trust and payment verification platform that catches fraudulent requests before money leaves your account.",
    visualLabel: "Document title page",
    icon: "hook",
  },
  {
    title: "The Verification AI Team",
    narration:
      "An identity verification agent, supplier verification agent, approval authority agent, fraud detection agent, and emergency response agent. Each has defined triggers, verification steps, confidence scoring, and escalation paths. Multi-layered verification, not a single check.",
    visualLabel: "Payment-Verification AI Team",
    icon: "overview",
  },
  {
    title: "Supplier Bank-Detail Verification",
    narration:
      "The frontline defense against payment diversion. The system checks that bank details match verified supplier records, flags changes for manual review, and cross-references against known fraud patterns — new suppliers with changed details, last-minute bank information changes, details that don't match the supplier's registered jurisdiction.",
    visualLabel: "Supplier Bank-Detail Verification",
    icon: "feature",
  },
  {
    title: "Identity & Executive Verification",
    narration:
      "Identity checks verify the person requesting payment is who they claim to be. Executive request verification is designed for business email compromise — when fraudsters impersonate the CEO or CFO to authorize urgent payments. Additional verification layers for executive requests, especially those marked urgent or involving new payees.",
    visualLabel: "Identity Checks and Executive Request Verification",
    icon: "feature",
  },
  {
    title: "Approval Authority & Payment Controls",
    narration:
      "Approval authority checks ensure the approver has actual authority and the chain is intact. The system detects approvals from unusual devices, locations, or times. Payment limit controls: transactions above defined thresholds require multi-person verification, regardless of who approves.",
    visualLabel: "Approval Authority Checks and Payment Limit Controls",
    icon: "feature",
  },
  {
    title: "Fraud Detection & Suspicious Changes",
    narration:
      "Fraud-risk alerts cover known attack patterns. Suspicious-change detection monitors for subtle signals: a supplier's bank details changed before a large payment, an approval pattern that doesn't match history, a payment just below an approval threshold. The things manual review misses.",
    visualLabel: "Fraud-Risk Alerts and Suspicious-Change Detection",
    icon: "feature",
  },
  {
    title: "Emergency Response Protocol",
    narration:
      "What happens when the system flags a transaction as high-risk — a structured process for rapid investigation, evidence collection, and decision-making. Marcus Chen, a head of InfoSec, said these workflows caught a pattern that would have let through a three-hundred-forty-thousand-dollar fraudulent invoice.",
    visualLabel: "Emergency Verification and Human Approval Controls",
    icon: "feature",
  },
  {
    title: "Protection That Pays for Itself",
    narration:
      "Angela Rossi, a CFO who lost one hundred eighty thousand dollars to wire fraud, said this blueprint gave her engineering team the exact plan they needed. The security architecture maps to SOC 2, ISO 27001, and PCI DSS.",
    visualLabel: "Buyer testimonials",
    icon: "value",
  },
  {
    title: "Get GuardianOS",
    narration:
      "Three sixty-nine during launch, four ninety-nine regular. GuardianOS is for finance teams, security teams, and business owners processing significant payments — where one prevented fraud incident pays for the blueprint many times over.",
    visualLabel: "Pricing and CTA",
    icon: "close",
  },
];

/* ─── 9. EvidenceFlow AI ─── */

const evidenceflowAiSteps: DemoStep[] = [
  {
    title: "The Audit Preparation Nightmare",
    narration:
      "If you've ever prepared for a SOC 2 audit, you know the nightmare: hunting through Slack, email, and shared drives for evidence that proves your controls work. EvidenceFlow AI is the blueprint for a system that collects, classifies, and maps compliance evidence automatically — so audit prep goes from weeks to days.",
    visualLabel: "Document title page",
    icon: "hook",
  },
  {
    title: "The Compliance Evidence AI Team",
    narration:
      "A collection agent, classification agent, control mapping agent, gap detection agent, and audit preparation agent. Each operates continuously — not just when an audit approaches. The system maintains audit readiness as an ongoing state, not a quarterly fire drill.",
    visualLabel: "Compliance Evidence AI Team",
    icon: "overview",
  },
  {
    title: "Automated Evidence Collection",
    narration:
      "Connects to your existing tools — cloud infrastructure, HR systems, code repositories, communication platforms — and continuously gathers relevant records. Connectors, scheduling, deduplication, secure storage. The system pulls what it needs; you're not uploading documents manually.",
    visualLabel: "Automated Evidence Collection",
    icon: "feature",
  },
  {
    title: "Document Classification & Control Mapping",
    narration:
      "AI-powered classification understands what each piece of evidence is — a policy document, an access review, a change management record, a training certificate — and tags it accordingly. Control mapping connects evidence to the specific controls it supports. One piece of evidence can map to multiple controls across different frameworks automatically.",
    visualLabel: "Document Classification and Control Mapping",
    icon: "feature",
  },
  {
    title: "Gap Detection & Proactive Compliance",
    narration:
      "Identifies what's missing. A control requiring quarterly access reviews where the last review is five months old. A framework requiring evidence of data encryption where none has been collected. Find gaps before the auditor does. Approval workflows let compliance teams review and sign off on evidence packages.",
    visualLabel: "Missing-Evidence Tracking and Approval Workflows",
    icon: "feature",
  },
  {
    title: "Audit-Ready Packages",
    narration:
      "The audit preparation module generates organized evidence packages — complete with index, control mappings, and evidence summaries. The evidence status dashboard shows real-time compliance posture: what's covered, what's missing, what's due for renewal. Catherine Wu, a CISO, told us EvidenceFlow AI cut her SOC 2 audit prep time by sixty percent.",
    visualLabel: "Audit Preparation and Evidence Status Dashboard",
    icon: "feature",
  },
  {
    title: "Compliance Reporting & Commercialization",
    narration:
      "Internal reports, board summaries, and auditor-ready exports. The subscription revenue model covers how to commercialize this as a SaaS product — pricing tiers, customer segments, and competitive positioning.",
    visualLabel: "Compliance Reporting and Subscription Revenue Model",
    icon: "feature",
  },
  {
    title: "Compliance Teams Love It",
    narration:
      "Andre Dupont, managing compliance across six frameworks, said the control mapping alone saved his team from maintaining six separate evidence spreadsheets. Jessica Moore, a VP of engineering, built the core evidence collection pipeline in about five weeks.",
    visualLabel: "Buyer testimonials",
    icon: "value",
  },
  {
    title: "Get EvidenceFlow AI",
    narration:
      "Two forty-nine during launch, three forty-nine regular. EvidenceFlow AI is for compliance teams, CISOs, auditors, and risk managers. If compliance is part of your job and you dread audit season, this is built for you.",
    visualLabel: "Pricing and CTA",
    icon: "close",
  },
];

/* ─── Master lookup ─── */

const DEMOS_BY_SLUG: Record<string, DemoWalkthrough> = {
  "nexus-network": {
    productSlug: "nexus-network",
    productName: "Nexus Network",
    totalSteps: nexusNetworkSteps.length,
    steps: nexusNetworkSteps,
  },
  "digital-humans": {
    productSlug: "digital-humans",
    productName: "Digital Humans",
    totalSteps: digitalHumansSteps.length,
    steps: digitalHumansSteps,
  },
  "nexusos": {
    productSlug: "nexusos",
    productName: "NexusOS",
    totalSteps: nexusosSteps.length,
    steps: nexusosSteps,
  },
  "empire-ai": {
    productSlug: "empire-ai",
    productName: "Empire AI",
    totalSteps: empireAiSteps.length,
    steps: empireAiSteps,
  },
  "genesis-platform": {
    productSlug: "genesis-platform",
    productName: "Genesis Platform",
    totalSteps: genesisPlatformSteps.length,
    steps: genesisPlatformSteps,
  },
  "nexus-one": {
    productSlug: "nexus-one",
    productName: "Nexus One",
    totalSteps: nexusOneSteps.length,
    steps: nexusOneSteps,
  },
  "spendshield-ai": {
    productSlug: "spendshield-ai",
    productName: "SpendShield AI",
    totalSteps: spendShieldAiSteps.length,
    steps: spendShieldAiSteps,
  },
  "guardianos": {
    productSlug: "guardianos",
    productName: "GuardianOS",
    totalSteps: guardianosSteps.length,
    steps: guardianosSteps,
  },
  "evidenceflow-ai": {
    productSlug: "evidenceflow-ai",
    productName: "EvidenceFlow AI",
    totalSteps: evidenceflowAiSteps.length,
    steps: evidenceflowAiSteps,
  },
};

export function getDemoBySlug(slug: string): DemoWalkthrough | undefined {
  return DEMOS_BY_SLUG[slug];
}

export function getAllDemos(): DemoWalkthrough[] {
  return Object.values(DEMOS_BY_SLUG);
}
