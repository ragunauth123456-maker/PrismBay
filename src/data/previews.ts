/* ─── PrismBay Product Preview Content ─── */
/* Table of contents, sample excerpts, and deliverable summaries for each product */

export interface PreviewTocItem {
  part: string;
  chapters: string[];
}

export interface PreviewContent {
  slug: string;
  /** Deliverable summary */
  deliverables: {
    documents: number;
    pages: number;
    templates: number;
    diagrams: number;
    spreadsheets: number;
    extras: string[];
  };
  /** Table of contents — parts and chapters */
  toc: PreviewTocItem[];
  /** Sample excerpt — shown as formatted prose */
  excerptTitle: string;
  excerptBody: string;
}

const PREVIEWS: Record<string, PreviewContent> = {
  /* ────── 1. NexusOS ────── */
  nexusos: {
    slug: "nexusos",
    deliverables: {
      documents: 12,
      pages: 340,
      templates: 18,
      diagrams: 24,
      spreadsheets: 6,
      extras: [
        "Department workflow maps (PDF + editable Figma)",
        "AI agent coordination specification",
        "SaaS revenue model spreadsheet",
        "90-day implementation roadmap",
        "Executive summary presentation deck",
      ],
    },
    toc: [
      {
        part: "Part I — Platform Overview & Strategy",
        chapters: [
          "Executive Summary",
          "The Intelligent OS Vision",
          "Target Market & Use Cases",
          "Competitive Landscape",
          "Business Model & Revenue Strategy",
        ],
      },
      {
        part: "Part II — Department Operating Modules",
        chapters: [
          "Finance Module — Workflows & Agent Design",
          "Sales & Customer Module — Pipeline Intelligence",
          "Human Resources Module — People Operations",
          "Procurement Module — Spend Intelligence",
          "Operations Module — Process Orchestration",
          "Compliance Module — Regulatory Monitoring",
          "Project Management Module — Portfolio Visibility",
        ],
      },
      {
        part: "Part III — AI Agent Architecture",
        chapters: [
          "Agent Coordination Layer",
          "Department-Specific Agent Personas",
          "Cross-Department Workflow Routing",
          "Exception Escalation & Human-in-the-Loop",
          "Performance Monitoring & Agent Analytics",
        ],
      },
      {
        part: "Part IV — Technical Architecture",
        chapters: [
          "System Architecture Overview",
          "Data Integration Layer",
          "Real-Time Event Processing",
          "Security & Governance Framework",
          "Multi-Tenant SaaS Infrastructure",
          "API Design & Integration Patterns",
        ],
      },
      {
        part: "Part V — Implementation & Launch",
        chapters: [
          "90-Day Implementation Roadmap",
          "Team Structure & Skills Required",
          "Vendor Selection Criteria",
          "Migration Strategy for Legacy Systems",
          "Launch Checklist & Go-to-Market Plan",
        ],
      },
    ],
    excerptTitle: "Chapter 3: Finance Module — Workflows & Agent Design",
    excerptBody: `The Finance Module is the financial nerve centre of NexusOS. It connects accounts payable, accounts receivable, general ledger, budgeting, and financial reporting into a single intelligent workflow layer. AI agents monitor transactions, flag anomalies, prepare reconciliation summaries, and surface cash-flow insights to the executive command centre.

At the heart of the module is the Transaction Intelligence Pipeline — a four-stage workflow that processes every financial event through classification, validation, enrichment, and reporting.

Stage 1: Classification. When a transaction enters the system — whether from a bank feed, invoice processor, or manual entry — the classification agent assigns it to the correct general ledger account, cost centre, and project code. The agent uses a combination of rule-based mapping (for recurring, predictable entries) and a fine-tuned classification model trained on the organisation's chart of accounts. The model achieves >97% accuracy after a two-week tuning period and routes the remaining 3% to a finance team member for review.

Stage 2: Validation. Once classified, the validation agent checks the transaction against budget thresholds, approval policies, and historical patterns. For example, a marketing expense above $5,000 triggers a budget-availability check against the quarterly marketing allocation. An invoice from a new supplier triggers a vendor-verification workflow — the agent cross-references the supplier against the procurement module's approved vendor list and flags any mismatch. Transactions that clear all checks proceed automatically; exceptions generate a structured alert with the specific policy violation, recommended action, and a link to the relevant approval workflow.

Stage 3: Enrichment. Validated transactions are enriched with contextual metadata — department, project, vendor category, payment terms, and cash-flow impact. The enrichment agent pulls data from connected systems (HR for department mapping, procurement for vendor profiles, project management for project codes) and attaches it to the transaction record. This enrichment step is what makes downstream reporting possible — without it, financial data is just numbers without context.

Stage 4: Reporting. Enriched transactions flow into the financial reporting engine, where they update real-time dashboards, feed into the monthly close workflow, and populate the executive command centre. The reporting agent generates a daily finance briefing — cash position, top 5 transactions by value, budget variance alerts, and upcoming payment obligations — and delivers it to the CFO and finance team via the NexusOS interface.

The module includes twelve pre-built agent personas: Accounts Payable Agent, Accounts Receivable Agent, General Ledger Agent, Budget Controller, Cash Flow Analyst, Tax Compliance Agent, Audit Trail Agent, Expense Report Reviewer, Vendor Payment Scheduler, Revenue Recognition Agent, Financial Close Coordinator, and Management Reporting Agent. Each agent has defined responsibilities, escalation rules, and performance metrics.

Implementation of the Finance Module typically takes 3-4 weeks for a mid-market organisation, including chart-of-accounts mapping, bank-feed integration, and agent tuning. The blueprint includes detailed integration specifications for QuickBooks, Xero, NetSuite, and SAP — plus a generic API adapter pattern for any REST-based accounting system.`,
  },

  /* ────── 2. Nexus One ────── */
  "nexus-one": {
    slug: "nexus-one",
    deliverables: {
      documents: 9,
      pages: 245,
      templates: 14,
      diagrams: 16,
      spreadsheets: 4,
      extras: [
        "SMB workflow templates (PDF + editable)",
        "Department support agent specs",
        "Revenue framework spreadsheet",
        "60-day implementation roadmap",
        "Quick-start guide for teams of 10-250",
      ],
    },
    toc: [
      {
        part: "Part I — Platform Overview",
        chapters: [
          "Executive Summary for SMB Leaders",
          "The Connected Workspace Vision",
          "Who Nexus One Is For (and Who It Isn't)",
          "How Nexus One Differs from NexusOS",
        ],
      },
      {
        part: "Part II — Core Modules",
        chapters: [
          "Customer Management — CRM Without Complexity",
          "Sales Tracking — Pipeline & Forecasting",
          "Task Coordination — Daily Work Management",
          "Project Tracking — Milestones & Deliverables",
          "Expense Monitoring — Spend Visibility",
          "Team Activity — Performance & Collaboration",
          "Executive Summaries — Decision-Ready Briefings",
        ],
      },
      {
        part: "Part III — AI Agent Design",
        chapters: [
          "SMB Agent Architecture",
          "Daily Workflow Automation Agents",
          "Department Support Agents",
          "Alert & Notification System",
          "Agent Performance & Tuning",
        ],
      },
      {
        part: "Part IV — Technical Implementation",
        chapters: [
          "Lightweight Architecture for SMBs",
          "Integration Patterns (QuickBooks, Slack, Gmail, etc.)",
          "Security & Access Controls",
          "60-Day Implementation Plan",
          "Build-vs-Buy Decision Framework",
        ],
      },
    ],
    excerptTitle: "Chapter 5: Task Coordination — Daily Work Management",
    excerptBody: `The Task Coordination module is where work actually gets done in Nexus One. Unlike traditional task managers that require manual entry and constant updating, Nexus One's task system is AI-assisted — agents create tasks from emails, meeting notes, customer interactions, and project milestones, then route them to the right person with the right context.

When a sales call ends, the Customer Management agent creates a follow-up task for the account owner. When a project milestone approaches its deadline, the Project Tracking agent surfaces it in the daily briefing. When an expense report needs approval, the Expense Monitoring agent routes it to the designated approver with a one-click review interface.

The task coordination system has four layers:

Layer 1: Inbox. Every team member has a unified task inbox that aggregates tasks from all sources — manual entries, agent-created tasks, delegated tasks from colleagues, and system-generated reminders. The inbox is priority-sorted by an AI model that considers deadline proximity, task dependencies, and the user's historical response patterns.

Layer 2: Context. Each task carries full context — the originating event (email, meeting, customer interaction), related documents, previous task history, and relevant KPIs. When a team member opens a task, they see not just the action item but the full story around it. No more digging through email threads or Slack channels to understand what a task is about.

Layer 3: Execution. Tasks include inline action capabilities — approve/reject for review tasks, update-status for project tasks, and respond for customer-facing tasks. Agents monitor execution and escalate tasks that sit idle beyond their SLA threshold.

Layer 4: Reflection. Completed tasks feed into the analytics engine, building a picture of team velocity, bottleneck patterns, and workload distribution. The weekly team briefing includes a task-completion summary, overdue-task analysis, and recommendations for workload rebalancing.

The module includes five task-specific agents: Inbox Organizer, Deadline Monitor, Dependency Tracker, Workload Balancer, and Follow-Up Agent. Together they reduce the administrative overhead of task management by an estimated 40-60% compared to manual systems — based on pilot deployments with SMB teams of 15-80 people.`,
  },

  /* ────── 3. Empire AI ────── */
  "empire-ai": {
    slug: "empire-ai",
    deliverables: {
      documents: 10,
      pages: 280,
      templates: 15,
      diagrams: 20,
      spreadsheets: 5,
      extras: [
        "Executive dashboard wireframes (Figma)",
        "KPI framework & metric definitions",
        "Decision-support agent specifications",
        "Forecasting model spreadsheet",
        "Executive reporting templates",
      ],
    },
    toc: [
      {
        part: "Part I — The Command Platform Vision",
        chapters: [
          "Executive Summary",
          "Why Traditional BI Falls Short",
          "The AI Command Platform Architecture",
          "Target Buyer Personas (CEO, CFO, COO, Board)",
        ],
      },
      {
        part: "Part II — Monitoring Domains",
        chapters: [
          "Financial Performance Monitoring",
          "Operational Activity Tracking",
          "Workforce Performance & Capacity",
          "Project Portfolio Oversight",
          "Risk & Exception Management",
          "Strategic Initiative Tracking",
        ],
      },
      {
        part: "Part III — AI Decision Support",
        chapters: [
          "Exception Detection & Alerting",
          "Forecasting & Scenario Modelling",
          "Executive Briefing Generation",
          "Decision-Support Agent Design",
          "Board Reporting Automation",
        ],
      },
      {
        part: "Part IV — Technical Architecture",
        chapters: [
          "Data Pipeline Design (Batch & Real-Time)",
          "Unified Data Model",
          "Dashboard & Visualization Engine",
          "Security & Access Controls",
          "Cloud Reference Architecture (AWS/GCP)",
        ],
      },
      {
        part: "Part V — Implementation & Commercial Model",
        chapters: [
          "Implementation Roadmap (12-16 Weeks)",
          "Team & Skills Required",
          "Commercial Model & Pricing Strategy",
          "Enterprise Sales Playbook",
        ],
      },
    ],
    excerptTitle: "Chapter 7: Exception Detection & Alerting",
    excerptBody: `The exception detection system is the intelligence layer that transforms Empire AI from a monitoring dashboard into a decision-support platform. Rather than requiring executives to hunt through dashboards for problems, Empire AI's agents hunt for them automatically and deliver structured alerts with context, impact analysis, and recommended actions.

The system operates on three detection modes:

Threshold-Based Detection. The simplest but most critical layer. Each KPI in the platform has configurable thresholds — yellow (warning) and red (critical). When revenue dips below 90% of monthly target, a yellow alert fires. When it dips below 75%, red. But Empire AI goes beyond simple threshold crossing: the agents analyse velocity (how fast is the metric changing?) and trajectory (where will it be in two weeks at current velocity?). A metric that's 95% of target but declining at 3% per week is more concerning than one that's 85% but stable.

Pattern-Based Detection. Machine learning models trained on historical data identify anomalous patterns that threshold rules would miss. A sudden drop in sales conversion rate on Tuesday afternoons. An unusual spike in customer churn from a specific segment. A procurement category where costs are creeping up 2% month-over-month — invisible in any single month but clear across a quarter. The pattern detection models run continuously and surface anomalies ranked by statistical significance and business impact.

Predictive Detection. The most sophisticated layer uses forecasting models to predict problems before they materialize. The cash-flow forecasting agent models expected inflows and outflows over the next 90 days and alerts when the projected balance dips below safety thresholds. The churn prediction agent analyses customer behaviour signals and identifies accounts at risk of leaving — weeks before they actually churn.

Each alert includes a structured payload: the affected metric, the detection method, the severity level, the estimated financial impact, related metrics for context, a recommended action, and the relevant approval workflow if action requires authorization. Alerts are delivered through the command centre interface, with optional push notifications for critical items.

The blueprint includes detailed specifications for 15 detection agents spanning financial, operational, workforce, risk, and strategic domains — each with configurable sensitivity, escalation paths, and false-positive reduction strategies.`,
  },

  /* ────── 4. Nexus Network ────── */
  "nexus-network": {
    slug: "nexus-network",
    deliverables: {
      documents: 8,
      pages: 220,
      templates: 12,
      diagrams: 15,
      spreadsheets: 4,
      extras: [
        "Marketplace workflow diagrams",
        "Revenue & commission model spreadsheet",
        "Trust & verification framework",
        "Launch strategy playbook",
        "Buyer & provider profile templates",
      ],
    },
    toc: [
      {
        part: "Part I — Marketplace Strategy",
        chapters: [
          "Executive Summary",
          "The B2B Collaboration Marketplace Opportunity",
          "Target Verticals & Use Cases",
          "Competitive Analysis",
          "Revenue & Commission Model",
        ],
      },
      {
        part: "Part II — Platform Design",
        chapters: [
          "Buyer & Provider Workflows",
          "Business Profile Structure",
          "Project & Opportunity Listings",
          "Collaboration Request System",
          "Messaging & Communication Framework",
        ],
      },
      {
        part: "Part III — AI-Powered Matching",
        chapters: [
          "AI Recommendation Engine",
          "Search & Filtering Architecture",
          "Matching Quality & Feedback Loops",
          "Trust & Verification Framework",
        ],
      },
      {
        part: "Part IV — Marketplace Operations",
        chapters: [
          "Ratings & Review System",
          "Dispute Resolution Workflows",
          "Moderation & Quality Controls",
          "Technical Architecture",
          "Launch Strategy & Growth Roadmap",
        ],
      },
    ],
    excerptTitle: "Chapter 6: AI Recommendation Engine",
    excerptBody: `The AI recommendation engine is what makes Nexus Network more than a directory — it's the intelligence layer that actively connects the right buyers with the right providers at the right time. Rather than relying on keyword searches and filter-based browsing, the engine analyses buyer needs, provider capabilities, and contextual signals to surface the most relevant matches.

The engine operates on a multi-signal recommendation model with four input categories:

Project Requirements Signal. When a buyer posts a project — whether it's a detailed RFP or a brief opportunity description — the engine extracts structured requirements: industry domain, required skills, budget range, timeline, team size, and preferred engagement model. Natural language processing parses unstructured briefs into structured requirement vectors that can be matched against provider profiles.

Provider Capability Signal. Each provider profile includes structured capability data: services offered, industry experience, team composition, past project portfolio, availability windows, and pricing models. The engine maintains a dynamic capability score for each provider across multiple dimensions, updated as they complete projects and receive ratings.

Behavioural Signal. The engine tracks which providers buyers view, shortlist, message, and hire — building preference models that improve recommendations over time. A buyer who consistently hires providers with financial-services experience will see those providers ranked higher in future searches, even before they specify the industry.

Contextual Signal. Time-sensitive factors influence recommendations: a provider who typically closes projects in 2 weeks but is currently at capacity gets a temporary availability penalty. A provider who just completed a similar project for a similar buyer gets a relevance boost. The contextual layer ensures recommendations reflect current reality, not just historical averages.

The recommendation pipeline runs in two modes: active (triggered by a buyer search or project post) and passive (the engine proactively suggests matches when high-probability pairings are detected — for example, when a provider's availability window aligns with a new project's timeline).

The blueprint includes the full matching algorithm specification, training data requirements, cold-start strategies for new marketplaces, and A/B testing frameworks for tuning recommendation quality. An initial marketplace with 500 providers and 200 active projects can achieve >80% relevance in top-5 recommendations after three months of feedback-loop training.`,
  },

  /* ────── 5. Digital Humans ────── */
  "digital-humans": {
    slug: "digital-humans",
    deliverables: {
      documents: 11,
      pages: 310,
      templates: 20,
      diagrams: 22,
      spreadsheets: 5,
      extras: [
        "Virtual employee role templates (8 departments)",
        "Workforce governance framework",
        "Performance monitoring dashboards (Figma)",
        "Subscription pricing model spreadsheet",
        "AI ethics & governance policy template",
      ],
    },
    toc: [
      {
        part: "Part I — The AI Workforce Vision",
        chapters: [
          "Executive Summary",
          "Beyond Chatbots — What Digital Employees Actually Are",
          "The Business Case for AI Workforces",
          "Industry Applications & Use Cases",
        ],
      },
      {
        part: "Part II — Workforce Design",
        chapters: [
          "Digital Employee Profiles & Role Definitions",
          "Department Role Templates (8 Departments)",
          "Task Assignment & Workflow Design",
          "Human Approval Controls & Escalation Rules",
          "Permissions & Access Management",
        ],
      },
      {
        part: "Part III — Platform Architecture",
        chapters: [
          "Virtual Employee Runtime Environment",
          "AI Agent Orchestration Layer",
          "Work Quality Review System",
          "Performance Monitoring & Analytics",
          "AI Workforce Dashboard Design",
        ],
      },
      {
        part: "Part IV — Governance & Operations",
        chapters: [
          "AI Governance Framework",
          "Ethics & Compliance Considerations",
          "Department Allocation & Capacity Planning",
          "Subscription Pricing & Commercial Model",
          "Implementation Roadmap (14-18 Weeks)",
        ],
      },
    ],
    excerptTitle: "Chapter 4: Human Approval Controls & Escalation Rules",
    excerptBody: `Human oversight is not an afterthought in Digital Humans — it is the structural foundation that makes the platform viable for enterprise deployment. Every digital employee operates within a defined approval framework that specifies which actions they can take autonomously, which require human review, and which are prohibited entirely.

The approval framework is organized into four tiers:

Tier 1 — Autonomous Actions. Routine, low-risk, high-volume tasks that digital employees execute without human intervention. Examples: a Customer Support Digital Employee responding to a password-reset request with a verified email link; a Finance Digital Employee categorizing a recurring software subscription expense under $500; a Research Digital Employee compiling a daily industry news digest. These actions are logged and auditable but require no human approval.

Tier 2 — Notification Actions. Tasks where the digital employee executes but notifies a human supervisor. Examples: a Sales Digital Employee sending a follow-up email to a prospect after a demo (notification to the account executive); a Marketing Digital Employee scheduling a social media post (notification to the marketing manager); an Operations Digital Employee updating a project status to "at risk" (notification to the project owner). The action proceeds immediately but the human has a window to intervene if needed.

Tier 3 — Approval-Required Actions. Tasks that require explicit human approval before execution. Examples: a Finance Digital Employee initiating a payment above $5,000; an HR Digital Employee scheduling a performance review meeting; a Procurement Digital Employee selecting a vendor for a contract above $50,000. The digital employee prepares the action, presents it with supporting context (why this vendor, what are the alternatives, what is the budget impact), and waits for approval.

Tier 4 — Prohibited Actions. Tasks that digital employees are never permitted to execute, regardless of approval. Examples: terminating an employee, signing a legal contract, making a strategic acquisition decision, overriding a security policy. These actions are hard-coded into the agent's permission set and cannot be overridden through the approval workflow.

Escalation rules define what happens when actions stall: if a Tier 3 approval request isn't acted on within 4 business hours, it escalates to the approver's manager. If still unaddressed after 8 hours, it reaches the department head. Emergency actions (suspected fraud, security breach, system failure) bypass the normal escalation chain and route directly to a designated incident response team.

The blueprint includes a full permission matrix template covering all eight department role templates, with configurable thresholds, escalation chains, and override protocols. Organizations can customize every threshold and approval path to match their risk tolerance and operational tempo.`,
  },

  /* ────── 6. Genesis Platform ────── */
  "genesis-platform": {
    slug: "genesis-platform",
    deliverables: {
      documents: 13,
      pages: 370,
      templates: 22,
      diagrams: 28,
      spreadsheets: 7,
      extras: [
        "No-code builder interface wireframes (Figma)",
        "AI agent builder specification",
        "Template marketplace design",
        "Multi-tenant SaaS architecture diagrams",
        "Enterprise licensing strategy document",
        "Sample application templates (5)",
      ],
    },
    toc: [
      {
        part: "Part I — Platform Vision & Strategy",
        chapters: [
          "Executive Summary",
          "The AI App Builder Opportunity",
          "Target Market & Competitive Positioning",
          "Business Model & Revenue Architecture",
        ],
      },
      {
        part: "Part II — The Builder Experience",
        chapters: [
          "Prompt-to-Application Workflow",
          "No-Code Interface Design",
          "Template Marketplace Architecture",
          "AI Agent Builder & Configuration",
          "Forms, Dashboards & UI Components",
        ],
      },
      {
        part: "Part III — Platform Infrastructure",
        chapters: [
          "Workflow Automation Engine",
          "Database Configuration & Data Modelling",
          "User Authentication & Authorization",
          "Payment Integration & Subscription Billing",
          "Application Publishing & Deployment",
        ],
      },
      {
        part: "Part IV — Technical Architecture",
        chapters: [
          "Multi-Tenant SaaS Architecture",
          "AI Agent Orchestration Layer",
          "Template Rendering & Versioning System",
          "Platform Security Requirements",
          "Scalability & Performance Design",
        ],
      },
      {
        part: "Part V — Commercialisation",
        chapters: [
          "Enterprise Licensing Strategy",
          "Developer Ecosystem & API Strategy",
          "Development Roadmap (16-20 Weeks)",
          "Go-to-Market Playbook",
        ],
      },
    ],
    excerptTitle: "Chapter 3: Prompt-to-Application Workflow",
    excerptBody: `The prompt-to-application workflow is the defining feature of Genesis Platform — the mechanism by which a non-technical user describes what they want to build and the platform generates a working application. This chapter details the five-stage pipeline that transforms natural language into deployed software.

Stage 1: Intent Parsing. When a user types "I need a customer portal where clients can view their invoices, submit support tickets, and track project progress," the Intent Parser breaks this into structured components. It identifies three feature requirements (invoice viewing, ticket submission, project tracking), two user roles (client, support agent), and one data domain (customer/project data). The parser uses a combination of named-entity recognition and a domain-specific intent classification model trained on thousands of business-application descriptions.

Stage 2: Template Matching. The parsed intent is matched against the template marketplace to find the closest starting point. The invoice-viewing requirement maps to a "Client Billing Portal" template; ticket submission maps to a "Help Desk" template; project tracking maps to a "Project Dashboard" template. The matching engine calculates a composite similarity score across all requirements and selects the best template or template combination. If no single template covers all requirements, the engine proposes a composite application built from multiple template modules.

Stage 3: Configuration Generation. With templates selected, the configuration engine generates the application scaffold: database schema (tables for invoices, tickets, projects, users), page layouts (client dashboard, ticket form, project view), workflow definitions (ticket creation → assignment → resolution), and access-control rules (clients see their own data; support agents see assigned tickets). The configuration is expressed as a declarative specification that the platform's rendering engine can execute.

Stage 4: AI Agent Assignment. Based on the application type, the system assigns pre-built AI agents: a Ticket Routing Agent for the help desk, a Status Update Agent for project tracking, a Payment Reminder Agent for the billing portal. Users can customize agent behaviour through a visual configuration panel — adjusting response tone, escalation thresholds, and working hours — without writing code.

Stage 5: Review & Publish. The generated application is presented in a preview environment where the user can interact with it, make adjustments, and refine the configuration. An AI-powered review agent checks for common issues — missing validation rules, unhandled error states, accessibility gaps — and suggests fixes. When satisfied, the user clicks Publish, and the application is deployed to the platform's multi-tenant infrastructure with a unique URL, authentication, and billing configuration.

The blueprint includes the full specification for each stage, including model architecture recommendations, training-data strategies, template-authoring guidelines, and quality-assurance frameworks. A reference implementation processes a typical 3-feature application description in under 90 seconds from prompt to preview.`,
  },

  /* ────── 7. GuardianOS ────── */
  guardianos: {
    slug: "guardianos",
    deliverables: {
      documents: 9,
      pages: 260,
      templates: 14,
      diagrams: 18,
      spreadsheets: 4,
      extras: [
        "Payment verification workflow diagrams",
        "Fraud detection pattern library",
        "Security architecture specification",
        "Enterprise pricing model spreadsheet",
        "Compliance mapping (SOC 2, ISO 27001, PCI DSS)",
      ],
    },
    toc: [
      {
        part: "Part I — Platform Overview",
        chapters: [
          "Executive Summary",
          "The Payment Fraud Landscape",
          "How GuardianOS Protects Organizations",
          "Target Buyers & Use Cases",
        ],
      },
      {
        part: "Part II — Verification Workflows",
        chapters: [
          "Supplier Bank-Detail Verification",
          "Identity Verification & Authentication",
          "Executive Request Verification (BEC Protection)",
          "Approval-Authority Validation",
          "Payment Limit Controls & Thresholds",
        ],
      },
      {
        part: "Part III — Detection & Response",
        chapters: [
          "Suspicious-Change Detection",
          "Fraud-Risk Scoring & Alerting",
          "Emergency Verification Workflows",
          "Transaction Review & Investigation",
        ],
      },
      {
        part: "Part IV — Technical Architecture",
        chapters: [
          "Security Architecture & Encryption",
          "Activity Logging & Audit Trail",
          "Integration Patterns (ERP, Banking, Payment)",
          "Implementation Roadmap",
        ],
      },
    ],
    excerptTitle: "Chapter 4: Executive Request Verification (BEC Protection)",
    excerptBody: `Business Email Compromise (BEC) is the most financially damaging form of cybercrime, costing organizations billions annually. The attack pattern is simple and devastating: an attacker impersonates an executive — typically the CEO or CFO — and sends an urgent payment instruction to the finance team. The email looks legitimate, the tone is authoritative, and the pressure is high. Without structured verification, finance teams often comply.

GuardianOS addresses BEC through a multi-layered verification system that introduces friction only for high-risk requests while keeping legitimate executive payments flowing smoothly.

Layer 1: Request Authentication. Every payment request entering the system — whether from email, messaging platform, or direct system entry — is authenticated at the source. The authentication agent verifies the sender's identity using multiple signals: email headers and SPF/DKIM/DMARC validation, sender behaviour patterns (does this executive typically send payment requests at 11 PM on a Saturday?), device and location fingerprinting, and message-content analysis (does the language match this executive's typical communication style?). Requests that fail authentication are blocked immediately and flagged for security review.

Layer 2: Dual-Channel Verification. For any payment request above a configurable threshold (typically $10,000), the system requires verification through a second, independent channel. If the request arrived via email, the executive must confirm it through the GuardianOS mobile app with biometric authentication. If the request arrived through a messaging platform, confirmation must come through email or phone. Attackers who compromise one channel rarely control two — dual-channel verification breaks the BEC attack chain.

Layer 3: Anomaly Detection. Even authenticated, dual-channel-verified requests are compared against historical patterns. Is this payment amount unusual for this executive's approval history? Is the beneficiary a new supplier with no prior relationship? Is the payment destination in a jurisdiction the organization has never sent funds to before? Anomalies don't block the payment automatically but trigger a mandatory secondary review by a different finance team member — creating a "four eyes" check that catches sophisticated social-engineering attempts.

Layer 4: Cooling-Off Period. The highest-risk transactions — six-figure payments, new international beneficiaries, requests received outside business hours — enter a mandatory cooling-off period. The payment is queued but not executed for a configurable window (typically 2-4 hours). During this window, the requesting executive receives a summary of the payment and can cancel it. The cooling-off period defeats urgency-based social engineering, where attackers pressure finance teams to act before anyone questions the request.

The blueprint includes detailed specifications for each layer, integration guides for common ERP and banking systems, and configuration templates calibrated for organizations processing $10M-$500M in annual payments.`,
  },

  /* ────── 8. SpendShield AI ────── */
  "spendshield-ai": {
    slug: "spendshield-ai",
    deliverables: {
      documents: 8,
      pages: 235,
      templates: 12,
      diagrams: 16,
      spreadsheets: 5,
      extras: [
        "Spend classification taxonomy",
        "Vendor risk assessment framework",
        "Contract review workflow diagrams",
        "Savings opportunity playbook",
        "Procurement reporting templates",
      ],
    },
    toc: [
      {
        part: "Part I — Platform Overview",
        chapters: [
          "Executive Summary",
          "The Procurement Intelligence Opportunity",
          "How SpendShield AI Transforms Procurement",
          "Target Organizations & ROI Model",
        ],
      },
      {
        part: "Part II — Spend Analysis",
        chapters: [
          "Spend Classification & Taxonomy",
          "Spend Analysis Workflows",
          "Price Variance Detection",
          "Duplicate-Charge Identification",
          "Savings Opportunity Engine",
        ],
      },
      {
        part: "Part III — Supplier Intelligence",
        chapters: [
          "Supplier Comparison Framework",
          "Vendor Risk Assessment",
          "Supplier Performance Monitoring",
          "Contract Review & Renewal Intelligence",
        ],
      },
      {
        part: "Part IV — Procurement Operations",
        chapters: [
          "Negotiation Preparation & Playbooks",
          "Procurement Reporting & Dashboards",
          "Technical Architecture & Integration",
          "Implementation Roadmap (10-14 Weeks)",
        ],
      },
    ],
    excerptTitle: "Chapter 5: Savings Opportunity Engine",
    excerptBody: `The Savings Opportunity Engine is where SpendShield AI delivers its measurable ROI. It continuously analyses procurement data — purchase orders, invoices, contracts, and supplier records — to identify specific, actionable opportunities for cost reduction. Unlike traditional spend-analysis tools that produce reports for humans to interpret, the engine produces ranked recommendations with estimated savings, implementation difficulty, and recommended actions.

The engine runs five analysis pipelines in parallel:

Pipeline 1: Price Variance Analysis. The system compares unit prices paid to the same supplier over time and across different business units. When the marketing department pays $12.50/unit for a SaaS licence that the engineering department negotiated to $9.80/unit, the engine flags the variance and recommends licence consolidation. When a supplier increases prices 8% year-over-year while the market rate for comparable services is flat, the engine flags the discrepancy with recommended negotiation talking points.

Pipeline 2: Supplier Consolidation. Organizations frequently maintain relationships with multiple suppliers providing overlapping services — different office-supply vendors for different locations, multiple temporary-staffing agencies, redundant software tools. The consolidation analysis identifies overlap, calculates the volume-discount potential from consolidation, and recommends specific suppliers to retain based on price, performance, and risk scores.

Pipeline 3: Contract Optimisation. The contract analysis pipeline ingests supplier contracts (via OCR and structured extraction), identifies unfavourable terms — auto-renewal clauses without price caps, termination penalties that exceed industry norms, payment terms that disadvantage the buyer — and generates recommended renegotiation positions. The pipeline also tracks contract expiration dates and triggers renewal-preparation workflows 90 days before expiry.

Pipeline 4: Demand Management. Some of the largest savings come not from paying less but from buying less. The demand analysis identifies categories where consumption can be reduced without business impact — underutilized software licences, excess inventory, premium service tiers where standard tiers would suffice. The engine estimates consumption-reduction potential and recommends specific policy changes.

Pipeline 5: Maverick Spend Detection. Maverick spend — purchases made outside approved procurement channels — typically represents 15-30% of total organizational spend and carries a 10-20% price premium. The engine identifies maverick-spend patterns by comparing purchase data against approved supplier lists and contract pricing, then quantifies the savings potential from bringing that spend into managed channels.

Each recommendation includes: estimated annual savings (with confidence interval), implementation effort (low/medium/high), stakeholder impact, and a pre-written business case for internal approval. The blueprint includes the full algorithm specifications, data requirements, and calibration guidelines. Organizations typically identify savings opportunities of 8-15% of addressable spend within the first full quarter of operation.`,
  },

  /* ────── 9. EvidenceFlow AI ────── */
  "evidenceflow-ai": {
    slug: "evidenceflow-ai",
    deliverables: {
      documents: 8,
      pages: 230,
      templates: 16,
      diagrams: 14,
      spreadsheets: 3,
      extras: [
        "Compliance control mapping (SOC 2, ISO 27001, PCI DSS, HIPAA, GDPR)",
        "Evidence collection workflow diagrams",
        "Audit-readiness checklist templates",
        "Document classification taxonomy",
        "Compliance reporting templates",
      ],
    },
    toc: [
      {
        part: "Part I — Platform Overview",
        chapters: [
          "Executive Summary",
          "The Compliance Evidence Challenge",
          "How EvidenceFlow AI Automates Audit Preparation",
          "Supported Frameworks & Standards",
        ],
      },
      {
        part: "Part II — Evidence Collection & Organization",
        chapters: [
          "Automated Evidence Collection",
          "Document Classification System",
          "Control Mapping Engine",
          "Missing-Evidence Tracking",
          "Secure Evidence Storage & Access",
        ],
      },
      {
        part: "Part III — Audit & Compliance Workflows",
        chapters: [
          "Audit Preparation Workflows",
          "Evidence Review & Approval",
          "Evidence Status Dashboard",
          "Review Schedules & Recurring Collections",
          "Compliance Reporting & Export",
        ],
      },
      {
        part: "Part IV — Technical Implementation",
        chapters: [
          "Technical Architecture",
          "Integration Patterns (Cloud Services, HR, Security Tools)",
          "Security & Encryption Design",
          "Implementation Roadmap (8-12 Weeks)",
        ],
      },
    ],
    excerptTitle: "Chapter 4: Control Mapping Engine",
    excerptBody: `The Control Mapping Engine is the intelligence layer that transforms a collection of documents into an audit-ready evidence package. Its job is to answer the question every auditor asks: "Show me the evidence that this control is operating effectively." Without mapping, evidence is just a pile of files. With mapping, it becomes a structured demonstration of compliance.

The engine supports five control frameworks out of the box — SOC 2, ISO 27001, PCI DSS, HIPAA, and GDPR — with an extensible mapping architecture that accommodates any control set the organization needs to demonstrate.

The mapping process operates in three phases:

Phase 1: Control Registration. The organization loads its control set into the platform — either by selecting from pre-built framework templates or by importing a custom control catalogue. Each control is registered with its ID, description, framework reference, testing frequency, and evidence requirements. For example, SOC 2 CC6.1 ("The entity implements logical access security software, infrastructure, and architectures") requires evidence including access-review records, firewall configurations, network diagrams, and user-access policies.

Phase 2: Evidence-to-Control Mapping. As documents enter the system — policies from the policy manager, screenshots from the engineering team, reports from cloud providers, certificates from training platforms — the classification agent assigns each document a type, a date, and a source. The mapping agent then analyses each document against the registered controls and proposes connections: "This quarterly access review report appears to satisfy the access-review requirement for CC6.1. Map it?" A compliance analyst confirms or adjusts the mapping with a single click. Over time, the mapping agent learns the organization's evidence patterns and achieves >90% auto-mapping accuracy.

Phase 3: Gap Analysis. Once evidence is mapped, the engine produces a gap analysis: which controls have sufficient evidence, which have partial evidence, and which have none. The gap report includes specific recommendations — "You need a firewall configuration document dated within the last 6 months" — and estimated effort to close each gap. A control-readiness score (0-100%) provides an at-a-glance measure of audit preparedness.

The engine also manages evidence freshness. SOC 2 requires evidence of ongoing control operation, not just point-in-time documentation. The engine tracks when each piece of evidence was last collected, flags evidence approaching expiration, and triggers re-collection workflows. A control supported by a policy reviewed 13 months ago when the requirement is annual review gets flagged as stale, and the policy owner receives an automated review request.

The blueprint includes the complete control-to-evidence mapping specification for all five frameworks, the gap-analysis algorithm, and the freshness-tracking system — plus an extensible control-framework schema that organizations can use to add custom frameworks or industry-specific standards (FedRAMP, NIST, CMMC, etc.).`,
  },
};

export function getPreviewContent(slug: string): PreviewContent | undefined {
  return PREVIEWS[slug];
}

export function getAllPreviewSlugs(): string[] {
  return Object.keys(PREVIEWS);
}
