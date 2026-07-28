import {
  createFileRoute,
  Link,
  notFound,
} from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

/* ─── Types ─── */
interface ProductDetail {
  slug: string;
  name: string;
  price: number;
  category: string;
  categorySlug: string;
  rating: number;
  reviewCount: number;
  description: string;
  longDescription: string;
  typeIcon: string;
  gradient: string;
  highlights: string[];
  features: Feature[];
  howItWorks: Step[];
  faqs: FAQ[];
  reviews: Review[];
  demoVideoUrl: string;
  relatedSlugs: string[];
}

interface Feature {
  emoji: string;
  name: string;
  description: string;
}

interface Step {
  step: number;
  title: string;
  description: string;
}

interface FAQ {
  question: string;
  answer: string;
}

interface Review {
  name: string;
  initials: string;
  rating: number;
  date: string;
  text: string;
}

/* ─── Extended Product Data ─── */
const PRODUCTS: ProductDetail[] = [
  {
    slug: "mergekit",
    name: "MergeKit",
    price: 49,
    category: "Software Tools",
    categorySlug: "software-tools",
    rating: 4.8,
    reviewCount: 127,
    description: "Merge multiple Notion workspaces without losing data or formatting",
    longDescription:
      "MergeKit is a desktop tool that intelligently merges Notion workspaces, databases, and pages without duplicating content or breaking links. Built for teams migrating between workspaces or consolidating after acquisitions, it preserves formatting, relations, and backlinks while giving you full control over what gets merged.",
    typeIcon: "monitor",
    gradient: "from-brand-50 via-neutral-50 to-neutral-100",
    highlights: [
      "Supports Notion workspaces of any size — merge 100+ databases in one pass",
      "Visual conflict resolution — see exactly what will change before you commit",
      "Preserves relations, rollups, and backlinks across merged databases",
      "One-time purchase — no subscription, no usage limits",
    ],
    features: [
      {
        emoji: "🔄",
        name: "Intelligent merging",
        description:
          "Automatically detects and merges duplicate pages, databases, and properties across workspaces.",
      },
      {
        emoji: "🔍",
        name: "Visual conflict resolver",
        description:
          "Side-by-side view shows conflicts before merging, so you always stay in control.",
      },
      {
        emoji: "🔗",
        name: "Relation preservation",
        description:
          "Keeps all database relations, rollups, and linked databases intact after merging.",
      },
      {
        emoji: "⚡",
        name: "Bulk operations",
        description:
          "Merge 100+ databases in a single pass — no per-page manual work needed.",
      },
      {
        emoji: "📋",
        name: "Audit log",
        description:
          "Every merge action is logged with a full diff so you can review or roll back changes.",
      },
    ],
    howItWorks: [
      {
        step: 1,
        title: "Connect your workspaces",
        description:
          "Authenticate with Notion and select the source and destination workspaces you want to merge.",
      },
      {
        step: 2,
        title: "Review the merge plan",
        description:
          "MergeKit scans both workspaces and presents a detailed preview of what will be created, updated, or skipped.",
      },
      {
        step: 3,
        title: "Resolve any conflicts",
        description:
          "Walk through conflicts visually — choose which version to keep for each page or property.",
      },
      {
        step: 4,
        title: "Execute and verify",
        description:
          "Run the merge, review the audit log, and start using your consolidated workspace immediately.",
      },
    ],
    faqs: [
      {
        question: "Does MergeKit work with Notion's latest API?",
        answer:
          "Yes, MergeKit uses the official Notion API and is tested against the latest version. We release updates within 48 hours of any breaking API changes.",
      },
      {
        question: "Can I undo a merge if something goes wrong?",
        answer:
          "MergeKit never modifies your source workspace — it only writes to the destination. If you're unhappy with the result, simply revert the destination workspace or restore from a Notion backup.",
      },
      {
        question: "How are duplicate pages handled?",
        answer:
          "MergeKit uses title matching and content fingerprinting to detect duplicates. You can configure the sensitivity in settings, and you always get a visual preview before any action is taken.",
      },
      {
        question: "Is there a limit on workspace size?",
        answer:
          "No limits. MergeKit has been tested with workspaces containing over 10,000 pages and 200+ databases. Performance scales with your hardware.",
      },
      {
        question: "Does this work on both Mac and Windows?",
        answer:
          "Yes, MergeKit runs on macOS 12+, Windows 10+, and Linux (AppImage). All platforms receive updates simultaneously.",
      },
    ],
    reviews: [
      {
        name: "Sarah Chen",
        initials: "SC",
        rating: 5,
        date: "July 12, 2026",
        text: "MergeKit saved us weeks of manual migration work when consolidating three team workspaces. The conflict resolution is brilliant — I could see exactly what would change before committing. Worth every dollar.",
      },
      {
        name: "Marcus Johnson",
        initials: "MJ",
        rating: 5,
        date: "June 28, 2026",
        text: "I was skeptical that any tool could handle our messy workspace with 200+ databases. MergeKit handled it flawlessly and preserved every relation. The audit log is a nice touch for peace of mind.",
      },
      {
        name: "Aisha Patel",
        initials: "AP",
        rating: 4,
        date: "June 15, 2026",
        text: "Really solid tool. The UI is clean and intuitive. Took about 10 minutes to figure out the merge flow. Only giving 4 stars because I'd love to see support for Confluence migrations in a future update.",
      },
      {
        name: "David Kim",
        initials: "DK",
        rating: 5,
        date: "May 30, 2026",
        text: "Used this to merge our product and engineering wikis into one workspace. Handled 8,000+ pages without breaking a sweat. The visual diff alone is worth the price — no more guessing what will happen.",
      },
    ],
    demoVideoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    relatedSlugs: ["datasweep", "codeloom", "launchkit"],
  },
  {
    slug: "clientflow-os",
    name: "ClientFlow OS",
    price: 79,
    category: "Business Systems",
    categorySlug: "business-systems",
    rating: 4.9,
    reviewCount: 89,
    description:
      "Complete CRM, invoicing, and project tracking system for freelancers",
    longDescription:
      "ClientFlow OS is a complete business operating system built in Notion, designed for freelancers and small agencies who want to stop juggling spreadsheets, email threads, and invoice tools. It combines CRM, project tracking, invoicing, and client onboarding into one streamlined dashboard that grows with your business.",
    typeIcon: "cog",
    gradient: "from-brand-50/60 via-neutral-50 to-accent-50/40",
    highlights: [
      "All-in-one: CRM, project tracking, invoicing, and onboarding in one Notion workspace",
      "Client portal included — your clients get a read-only view of their project status",
      "Email templates for every stage: proposal, onboarding, check-in, and offboarding",
      "Built-in analytics dashboard tracks revenue, pipeline, and project margins",
    ],
    features: [
      {
        emoji: "📋",
        name: "Client CRM",
        description:
          "Track every client, conversation, and deal stage in a searchable database with custom fields.",
      },
      {
        emoji: "📊",
        name: "Project dashboard",
        description:
          "See all active projects, deadlines, and deliverables at a glance with color-coded status indicators.",
      },
      {
        emoji: "💰",
        name: "Invoicing engine",
        description:
          "Generate branded invoices from project data, track payments, and send automatic reminders.",
      },
      {
        emoji: "🚀",
        name: "Onboarding workflows",
        description:
          "Pre-built templates for client intake, contracts, and kickoff — customizable to your process.",
      },
      {
        emoji: "📧",
        name: "Email templates",
        description:
          "Ready-to-send templates for proposals, onboarding, check-ins, and project wrap-up.",
      },
      {
        emoji: "📈",
        name: "Revenue analytics",
        description:
          "Track monthly revenue, pipeline value, and project profitability in auto-updating charts.",
      },
    ],
    howItWorks: [
      {
        step: 1,
        title: "Import the Notion template",
        description:
          "Duplicating the ClientFlow OS template creates your own private workspace — fully customizable.",
      },
      {
        step: 2,
        title: "Add your first client",
        description:
          "Enter client details and ClientFlow OS automatically generates a project space, onboarding checklist, and contract template.",
      },
      {
        step: 3,
        title: "Track work and send invoices",
        description:
          "Log hours, update project status, and generate invoices directly from tracked work — no double-entry.",
      },
    ],
    faqs: [
      {
        question: "Do I need a paid Notion plan to use ClientFlow OS?",
        answer:
          "The free Notion plan works for most solo freelancers. If you need guest access for client portals or larger file uploads, Notion's Plus plan ($10/month) is recommended.",
      },
      {
        question: "Can I customize the templates for my brand?",
        answer:
          "Absolutely. Every page, database, and template is fully editable. Add your logo, brand colors, and custom fields to match your workflow.",
      },
      {
        question: "Does this integrate with Stripe or other payment processors?",
        answer:
          "Invoices are generated as Notion pages and PDFs — you can send them through your existing payment processor. Native Stripe integration is on our roadmap for Q4 2026.",
      },
      {
        question: "How does the client portal work?",
        answer:
          "You can share a read-only view of project status, timelines, and deliverables with clients via Notion's guest access. They see only what you choose to share.",
      },
      {
        question: "Is there onboarding support available?",
        answer:
          "Yes, the purchase includes a 30-minute setup guide video and access to our community forum. One-on-one setup calls are available as an add-on.",
      },
    ],
    reviews: [
      {
        name: "Rachel Torres",
        initials: "RT",
        rating: 5,
        date: "July 20, 2026",
        text: "ClientFlow OS genuinely gave me back my weekends. Onboarding a new client used to take 3 hours — now it's 20 minutes. The fact that clients can see their project status without me emailing them is a game-changer.",
      },
      {
        name: "James Wright",
        initials: "JW",
        rating: 5,
        date: "July 8, 2026",
        text: "As a freelance designer juggling 12 active clients, this system is exactly what I needed. The invoice generation from tracked work alone saves me 5+ hours a month. Highly recommend.",
      },
      {
        name: "Nina Okafor",
        initials: "NO",
        rating: 4,
        date: "June 22, 2026",
        text: "Really well thought-out system. The email templates are a nice touch and the analytics dashboard helps me see which clients are most profitable. One star off because I'd love more integration options.",
      },
    ],
    demoVideoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    relatedSlugs: ["launchkit", "pitchforge", "plain-talk"],
  },
  {
    slug: "plain-talk",
    name: "Plain Talk",
    price: 59,
    category: "AI Solutions",
    categorySlug: "ai-solutions",
    rating: 4.6,
    reviewCount: 203,
    description:
      "Transform robotic AI text into natural, brand-consistent writing",
    longDescription:
      "Plain Talk is an AI-powered writing assistant that takes robotic, stiff, or overly formal text and rewrites it in clear, natural language that sounds like you. Unlike grammar checkers, Plain Talk focuses on tone, rhythm, and authenticity — making your writing feel human, not generated. It learns your brand voice from examples and applies it consistently across every piece of content.",
    typeIcon: "sparkle",
    gradient: "from-accent-50 via-neutral-50 to-brand-50/60",
    highlights: [
      "Powered by a fine-tuned language model trained on 50,000+ human-edited examples",
      "Brand voice profiles — define your tone once and apply it everywhere",
      "Works inside your existing tools via browser extension and API",
      "Built-in readability scoring and before/after comparisons",
    ],
    features: [
      {
        emoji: "🎯",
        name: "Tone transformation",
        description:
          "Convert stiff AI-generated text into warm, natural prose that matches your preferred tone — professional, friendly, or anything in between.",
      },
      {
        emoji: "🏷️",
        name: "Brand voice profiles",
        description:
          "Upload 3-5 writing samples and Plain Talk learns your brand's voice, applying it consistently across all future outputs.",
      },
      {
        emoji: "🔌",
        name: "Works everywhere",
        description:
          "Browser extension for Chrome and Edge, plus API access for integrating into your content pipeline or CMS.",
      },
      {
        emoji: "📊",
        name: "Readability scoring",
        description:
          "See Flesch-Kincaid scores, sentence variety metrics, and a before/after comparison for every piece of text you transform.",
      },
      {
        emoji: "📚",
        name: "Style guides included",
        description:
          "Pre-built style profiles for common formats: blog posts, emails, social media, technical docs, and more.",
      },
    ],
    howItWorks: [
      {
        step: 1,
        title: "Paste or type your text",
        description:
          "Drop any block of writing into Plain Talk — an email draft, blog post, AI-generated content, or technical document.",
      },
      {
        step: 2,
        title: "Choose your voice",
        description:
          "Select a pre-built style guide or create a custom brand profile from your own writing samples.",
      },
      {
        step: 3,
        title: "Review and refine",
        description:
          "See a side-by-side comparison of the original and transformed text, with highlighted changes and readability scores.",
      },
      {
        step: 4,
        title: "Copy and use anywhere",
        description:
          "Copy the transformed text with one click. The browser extension lets you transform text directly in Gmail, Notion, or Google Docs.",
      },
    ],
    faqs: [
      {
        question: "How is Plain Talk different from Grammarly or Hemingway?",
        answer:
          "Grammarly focuses on grammar and spelling, Hemingway on readability. Plain Talk focuses on tone and authenticity — making AI-generated or stiff text sound naturally human. Many users pair Plain Talk with a grammar checker for complete editing.",
      },
      {
        question: "What happens to my text? Is it stored?",
        answer:
          "Your text is processed in-memory and never stored on our servers. We don't use your content to train models. Privacy is built into the architecture — text is encrypted in transit and discarded after processing.",
      },
      {
        question: "How does the brand voice learning work?",
        answer:
          "You provide 3-5 writing samples (emails, blog posts, etc.) that represent your ideal voice. Plain Talk analyzes sentence structure, vocabulary, formality level, and rhythm patterns to create a custom transformation profile.",
      },
      {
        question: "Does it support languages other than English?",
        answer:
          "Currently, Plain Talk is optimized for English only. Support for Spanish, French, and German is planned for 2027.",
      },
      {
        question: "Can I use Plain Talk with my team?",
        answer:
          "Yes, team licenses are available at $149 for up to 5 users. Team plans include shared brand voice profiles and an admin dashboard to manage access.",
      },
    ],
    reviews: [
      {
        name: "Tomás Rivera",
        initials: "TR",
        rating: 5,
        date: "July 25, 2026",
        text: "I run a content agency and Plain Talk has cut our editing time by at least 40%. AI drafts come in and we run them through Plain Talk — the output is clean, natural, and on-brand. Our clients have noticed the consistency.",
      },
      {
        name: "Emily Cho",
        initials: "EC",
        rating: 4,
        date: "July 14, 2026",
        text: "The brand voice feature is genuinely impressive. I uploaded a few of my blog posts and now everything I write comes out sounding like me, not a robot. One star off for the limited browser support — would love a Firefox extension.",
      },
      {
        name: "Kwame Asante",
        initials: "KA",
        rating: 5,
        date: "June 30, 2026",
        text: "As a non-native English speaker, this tool is invaluable. It doesn't just fix grammar — it makes my writing flow naturally. The before/after view helps me learn what sounds better and why.",
      },
    ],
    demoVideoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    relatedSlugs: ["datasweep", "mergekit", "codeloom"],
  },
  {
    slug: "pitchforge",
    name: "PitchForge",
    price: 89,
    category: "Templates",
    categorySlug: "templates",
    rating: 4.7,
    reviewCount: 54,
    description:
      "Build compelling investor pitch decks with battle-tested templates",
    longDescription:
      "PitchForge is a collection of 12 battle-tested pitch deck templates, each designed for a specific fundraising scenario — from pre-seed to Series A. Created in collaboration with venture partners who have reviewed over 2,000 decks, each template includes the structure investors actually want to see, with copy prompts and financial model placeholders.",
    typeIcon: "file",
    gradient: "from-neutral-50 via-brand-50/40 to-neutral-100",
    highlights: [
      "12 templates covering pre-seed, seed, Series A, and industry-specific pitches",
      "Each template includes investor-tested narrative structure and copy prompts",
      "Financial model templates with pre-built formulas and scenario planning",
      "Compatible with Google Slides, PowerPoint, and Figma",
    ],
    features: [
      {
        emoji: "📐",
        name: "12 pitch deck templates",
        description:
          "Covers every stage: problem/solution, traction, market sizing, competitive landscape, team, and financials.",
      },
      {
        emoji: "✍️",
        name: "Copy prompts built in",
        description:
          "Each slide includes placeholder copy written by fundraising consultants — just replace with your specifics.",
      },
      {
        emoji: "📊",
        name: "Financial model included",
        description:
          "Pre-built spreadsheet with revenue projections, burn rate, unit economics, and scenario planning tabs.",
      },
      {
        emoji: "🎨",
        name: "Multi-format compatible",
        description:
          "Templates available for Google Slides, PowerPoint, and Figma — use whichever tool your team prefers.",
      },
      {
        emoji: "🗺️",
        name: "Investor narrative guide",
        description:
          "A 20-page guide explaining what investors look for at each stage and how to structure your story.",
      },
    ],
    howItWorks: [
      {
        step: 1,
        title: "Choose your template",
        description:
          "Browse 12 templates organized by stage (pre-seed, seed, Series A) and industry (SaaS, consumer, deep tech, marketplace).",
      },
      {
        step: 2,
        title: "Customize with your data",
        description:
          "Replace placeholder copy with your specifics. Each slide has copy prompts that guide you through what investors want to see.",
      },
      {
        step: 3,
        title: "Practice with the pitch guide",
        description:
          "Use the included narrative guide to structure your verbal pitch around the deck — with timing suggestions for each slide.",
      },
    ],
    faqs: [
      {
        question: "Are these templates different from what I'd find for free online?",
        answer:
          "Yes — significantly. Free templates give you slide layouts. PitchForge gives you investor-tested narrative structure, copy prompts written by fundraising consultants, and financial models built by a former VC analyst. The templates were developed with venture partners who have collectively reviewed 2,000+ decks.",
      },
      {
        question: "What stage of fundraising is this best for?",
        answer:
          "PitchForge covers pre-seed through Series A. For later stages (Series B+), the financial model templates and narrative structure are still useful, but you may want to supplement with more detailed market data.",
      },
      {
        question: "Can I use these for non-investor presentations?",
        answer:
          "Absolutely. The templates work well for any high-stakes presentation — partnership proposals, board updates, or strategic planning. The narrative structure principles apply universally.",
      },
      {
        question: "Do I get updates when new templates are added?",
        answer:
          "Yes, all template purchases include free updates for 12 months. We release new industry-specific templates quarterly based on user requests.",
      },
      {
        question: "What format are the files delivered in?",
        answer:
          "You get direct links to Google Slides templates, plus downloadable .pptx and .fig files. The financial model comes as both Google Sheets and Excel (.xlsx) formats.",
      },
    ],
    reviews: [
      {
        name: "Alex Nguyen",
        initials: "AN",
        rating: 5,
        date: "July 18, 2026",
        text: "Our seed round closed in 6 weeks and two investors specifically mentioned how clear our deck was. I credit PitchForge's narrative structure — it forced us to think about the story, not just the slides. The financial model alone is worth the price.",
      },
      {
        name: "Julia Hartmann",
        initials: "JH",
        rating: 5,
        date: "July 3, 2026",
        text: "I was drowning in free templates that all looked and felt different. PitchForge gave us a cohesive deck with a logical flow. Investors commented that it was one of the cleanest pre-seed decks they'd seen.",
      },
      {
        name: "Derrick Mwangi",
        initials: "DM",
        rating: 4,
        date: "June 18, 2026",
        text: "Great templates and the narrative guide is genuinely helpful. The copy prompts saved me hours of staring at blank slides. Wished there were more B2B SaaS-specific examples, but the general ones still worked well.",
      },
    ],
    demoVideoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    relatedSlugs: ["launchkit", "clientflow-os", "learnfast"],
  },
  {
    slug: "datasweep",
    name: "DataSweep",
    price: 39,
    category: "Software Tools",
    categorySlug: "software-tools",
    rating: 4.5,
    reviewCount: 78,
    description:
      "Automate data cleaning and normalization across spreadsheets and databases",
    longDescription:
      "DataSweep is a desktop app that automates the tedious work of cleaning and normalizing messy data. Point it at any CSV, Excel file, or database table and it detects inconsistencies, duplicates, formatting errors, and outliers — then fixes them with a single click. Built for analysts, operations teams, and anyone who spends too much time in 'find and replace.'",
    typeIcon: "monitor",
    gradient: "from-brand-50 via-neutral-50 to-neutral-100",
    highlights: [
      "Detects 40+ types of data quality issues automatically — no rules to write",
      "Works with CSV, Excel, JSON, SQL databases, and Google Sheets",
      "Preview all changes before applying — full diff view with undo support",
      "One-time purchase, no usage limits or per-row pricing",
    ],
    features: [
      {
        emoji: "🔍",
        name: "Auto-detect issues",
        description:
          "Scans for 40+ data quality problems: duplicates, missing values, inconsistent formatting, outliers, and whitespace issues.",
      },
      {
        emoji: "🧹",
        name: "One-click cleaning",
        description:
          "Review the detected issues and apply all fixes with one click — or cherry-pick specific fixes to apply.",
      },
      {
        emoji: "📂",
        name: "Multi-format support",
        description:
          "CSV, Excel (.xlsx, .xls), JSON, PostgreSQL, MySQL, SQLite, and Google Sheets — all from one interface.",
      },
      {
        emoji: "🔄",
        name: "Transformation recipes",
        description:
          "Save cleaning steps as reusable recipes and apply them to new datasets automatically.",
      },
      {
        emoji: "📋",
        name: "Full audit trail",
        description:
          "Every change is logged with a before/after diff. Export the audit log or undo any batch of changes.",
      },
    ],
    howItWorks: [
      {
        step: 1,
        title: "Import your data",
        description:
          "Drag and drop a CSV, Excel file, or connect to a database. DataSweep auto-detects the schema and column types.",
      },
      {
        step: 2,
        title: "Review detected issues",
        description:
          "DataSweep scans your data and presents a prioritized list of quality issues, grouped by type and severity.",
      },
      {
        step: 3,
        title: "Apply fixes",
        description:
          "Review each suggested fix in a side-by-side diff view, choose which to apply, and clean your entire dataset in one go.",
      },
    ],
    faqs: [
      {
        question: "Can DataSweep handle large datasets?",
        answer:
          "Yes. DataSweep is built on a streaming architecture that processes data in chunks, so it handles files with millions of rows without loading everything into memory. Performance depends on your hardware, but 1M rows typically process in under 30 seconds.",
      },
      {
        question: "Does it modify my original data files?",
        answer:
          "Never. DataSweep always creates a new cleaned output file. Your original data stays untouched. For database connections, you choose whether to write to a new table or overwrite the existing one.",
      },
      {
        question: "What kind of data quality issues does it catch?",
        answer:
          "DataSweep detects 40+ issue types including: duplicate rows, inconsistent date formats, mixed units, leading/trailing whitespace, encoding problems, outlier values, missing data patterns, inconsistent capitalization, and schema mismatches.",
      },
      {
        question: "Can I automate cleaning for recurring data imports?",
        answer:
          "Yes, the CLI version (included) lets you run cleaning recipes on a schedule. Point it at a folder or database and it processes new files automatically — great for ETL pipelines.",
      },
      {
        question: "Is there a team license available?",
        answer:
          "Yes, team licenses start at $99 for up to 5 users and include shared cleaning recipes and a central audit dashboard.",
      },
    ],
    reviews: [
      {
        name: "Priya Sharma",
        initials: "PS",
        rating: 5,
        date: "July 22, 2026",
        text: "DataSweep replaces at least three different scripts I was maintaining for data cleaning. The auto-detection is surprisingly accurate — it catches things I would have missed in a manual review. Saved our team ~15 hours a month.",
      },
      {
        name: "Carlos Mendez",
        initials: "CM",
        rating: 4,
        date: "July 10, 2026",
        text: "Solid tool that does exactly what it promises. The interface is clean and the diff view makes it easy to trust the automated fixes. Only request: better support for nested JSON structures.",
      },
      {
        name: "Leah Robertson",
        initials: "LR",
        rating: 5,
        date: "June 25, 2026",
        text: "As a data analyst, cleaning data is 60% of my job. DataSweep handles the grunt work so I can focus on actual analysis. The transformation recipes are a killer feature for recurring reports.",
      },
    ],
    demoVideoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    relatedSlugs: ["mergekit", "plain-talk", "codeloom"],
  },
  {
    slug: "launchkit",
    name: "LaunchKit",
    price: 149,
    category: "Business Systems",
    categorySlug: "business-systems",
    rating: 4.8,
    reviewCount: 36,
    description:
      "Complete product launch playbook with checklists, timelines, and templates",
    longDescription:
      "LaunchKit is the complete product launch system used by indie makers and startup teams to take products from build to launch day — on time and without chaos. It includes a Notion-based launch command center with 60+ checklist items across 6 phases, email sequences, press kit templates, social media calendars, and post-launch analytics dashboards.",
    typeIcon: "cog",
    gradient: "from-brand-50/60 via-neutral-50 to-accent-50/40",
    highlights: [
      "60+ launch checklist items organized across 6 phases with timeline tracking",
      "Pre-built email sequences for waitlist, launch day, and post-launch follow-up",
      "Press kit and outreach templates used in 200+ successful product launches",
      "Post-launch analytics dashboard to track signups, conversion, and retention",
    ],
    features: [
      {
        emoji: "📋",
        name: "6-phase launch system",
        description:
          "Pre-launch prep, building buzz, launch week, launch day, post-launch momentum, and retrospective — each with detailed checklists.",
      },
      {
        emoji: "📅",
        name: "Dynamic timeline generator",
        description:
          "Enter your target launch date and LaunchKit builds a week-by-week timeline with deadlines and owner assignments.",
      },
      {
        emoji: "📧",
        name: "Email sequence library",
        description:
          "12 email templates for waitlist onboarding, launch announcement, social proof sharing, and post-launch nurturing.",
      },
      {
        emoji: "📰",
        name: "Press kit builder",
        description:
          "Templates for press releases, media one-pagers, founder bios, and outreach emails — designed to get journalist responses.",
      },
      {
        emoji: "📊",
        name: "Launch analytics",
        description:
          "Dashboard templates to track signups, conversion rates, traffic sources, and retention through launch week and beyond.",
      },
    ],
    howItWorks: [
      {
        step: 1,
        title: "Set your launch date",
        description:
          "Enter your target date and LaunchKit generates a complete timeline with weekly milestones and task owners.",
      },
      {
        step: 2,
        title: "Work through the phases",
        description:
          "Follow 60+ checklist items across 6 phases — from pre-launch prep to post-launch retrospective.",
      },
      {
        step: 3,
        title: "Execute launch week",
        description:
          "Use the launch day playbook with hour-by-hour task schedule, email sequences, and social media posting calendar.",
      },
      {
        step: 4,
        title: "Track and iterate",
        description:
          "Use the analytics dashboard to measure launch performance and the retrospective template to capture learnings for next time.",
      },
    ],
    faqs: [
      {
        question: "Is LaunchKit only for digital products?",
        answer:
          "While LaunchKit was designed for digital products (SaaS, apps, courses), the system works for any product launch — physical products, service launches, or event launches. You can customize every checklist to your context.",
      },
      {
        question: "How is this different from a free launch checklist?",
        answer:
          "Free checklists tell you what to do. LaunchKit gives you when to do it (dynamic timeline), how to do it (templates for every asset), and how to measure it (analytics dashboards). It's the system, not just the list.",
      },
      {
        question: "Can I use this with my team?",
        answer:
          "Yes, the Notion workspace supports multiple users. Assign checklist items to team members, set deadlines, and track progress together. Team licenses include up to 5 workspace members.",
      },
      {
        question: "What if my launch date changes?",
        answer:
          "Simply update the launch date and the timeline automatically recalculates all milestones and deadlines. Nothing is lost — tasks shift forward or backward accordingly.",
      },
      {
        question: "Do the email templates work with my email provider?",
        answer:
          "Email templates are provided as plain text and Markdown, compatible with any email platform (ConvertKit, Mailchimp, Substack, etc.). Just copy, paste, and personalize.",
      },
    ],
    reviews: [
      {
        name: "Ryan Park",
        initials: "RP",
        rating: 5,
        date: "July 15, 2026",
        text: "LaunchKit turned our chaotic launch process into something we could actually manage. The timeline generator alone saved us from the last-minute scramble we'd experienced with our first two products. Launched on time and hit 800 signups on day one.",
      },
      {
        name: "Maria Santos",
        initials: "MS",
        rating: 5,
        date: "June 30, 2026",
        text: "Worth every cent. As a solo founder, I didn't know what I didn't know about launching. LaunchKit's checklists caught things I would have completely missed — like having a status page ready before sending emails. Our launch was smooth because of it.",
      },
      {
        name: "Omar Hassan",
        initials: "OH",
        rating: 4,
        date: "June 12, 2026",
        text: "Comprehensive system that covers everything. The email templates are great and the press kit saved me hours. Would have given 5 stars if there was more guidance on pricing strategy as part of the launch prep.",
      },
    ],
    demoVideoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    relatedSlugs: ["clientflow-os", "pitchforge", "learnfast"],
  },
  {
    slug: "codeloom",
    name: "CodeLoom",
    price: 29,
    category: "Resources",
    categorySlug: "resources",
    rating: 4.4,
    reviewCount: 162,
    description:
      "Searchable library of production-ready code snippets across 12 languages",
    longDescription:
      "CodeLoom is a curated, searchable library of 500+ production-ready code snippets spanning 12 programming languages and frameworks. Each snippet is peer-reviewed, documented with context about when to use it, and includes test cases. It's the reference you wish you had when you're stuck on a pattern you know exists but can't quite remember how to write.",
    typeIcon: "box",
    gradient: "from-neutral-50 via-neutral-100 to-brand-50/40",
    highlights: [
      "500+ snippets across JavaScript, TypeScript, Python, Go, Rust, Ruby, and more",
      "Every snippet includes documentation, use-case notes, and test cases",
      "Search by language, framework, pattern, or use case — with fuzzy matching",
      "Regularly updated with new snippets based on community requests",
    ],
    features: [
      {
        emoji: "🔎",
        name: "Powerful search",
        description:
          "Search by language, pattern name, use case, or even a description of what you're trying to do. Fuzzy matching finds what you need.",
      },
      {
        emoji: "📝",
        name: "Documented context",
        description:
          "Every snippet explains when to use it, what tradeoffs to consider, and includes real-world examples from production codebases.",
      },
      {
        emoji: "🧪",
        name: "Test cases included",
        description:
          "Each snippet ships with test cases so you can verify it works before integrating into your project.",
      },
      {
        emoji: "📦",
        name: "Copy-paste ready",
        description:
          "All snippets are self-contained with clear dependency lists. Copy, paste, and adapt — no hunting for imports or setup.",
      },
      {
        emoji: "🔄",
        name: "Regular updates",
        description:
          "New snippets added monthly based on community voting. Updates are free for 12 months after purchase.",
      },
    ],
    howItWorks: [
      {
        step: 1,
        title: "Search for what you need",
        description:
          "Type a pattern name ('debounce'), use case ('retry with backoff'), or language ('Python async') into the search bar.",
      },
      {
        step: 2,
        title: "Browse results with context",
        description:
          "Each result shows the snippet, language badges, a use-case description, and community rating — so you pick the right one.",
      },
      {
        step: 3,
        title: "Copy, test, and use",
        description:
          "Copy the snippet with included test cases, run it to verify, and integrate into your project. Each snippet is MIT-licensed.",
      },
    ],
    faqs: [
      {
        question: "What languages and frameworks are covered?",
        answer:
          "JavaScript/TypeScript, Python, Go, Rust, Ruby, Java, C#, Swift, Kotlin, PHP, and SQL. Framework-specific snippets exist for React, Next.js, FastAPI, Gin, Rails, and Spring Boot.",
      },
      {
        question: "How is this different from searching Stack Overflow or GitHub?",
        answer:
          "CodeLoom snippets are curated, peer-reviewed, tested, and documented with context about tradeoffs and alternatives. Stack Overflow gives you answers — CodeLoom gives you the right answer with explanation.",
      },
      {
        question: "Can I access CodeLoom offline?",
        answer:
          "Yes, the purchase includes a downloadable JSON export and an offline-ready web app (PWA). Search, browse, and copy snippets even without an internet connection.",
      },
      {
        question: "How are new snippets added?",
        answer:
          "The community submits and votes on new snippet requests each month. We write, test, and document the most-requested snippets and push them as free updates to all users.",
      },
      {
        question: "Are the snippets production-ready?",
        answer:
          "Every snippet is reviewed by at least two experienced developers before inclusion. They include edge-case handling, error management, and test coverage. That said, always review code before deploying to production.",
      },
    ],
    reviews: [
      {
        name: "Sofia Lindström",
        initials: "SL",
        rating: 5,
        date: "July 19, 2026",
        text: "CodeLoom has become my go-to when I need a pattern I haven't written in a while. The 'when to use' notes on each snippet are incredibly helpful — they've saved me from picking the wrong approach more than once. At $29, it's a steal.",
      },
      {
        name: "Kenji Tanaka",
        initials: "KT",
        rating: 4,
        date: "July 5, 2026",
        text: "Great reference library. The search is fast and the snippets are well-documented. Would love to see more Go and Rust snippets in future updates, but the quality of what's there is excellent.",
      },
      {
        name: "Fatima Abdi",
        initials: "FA",
        rating: 4,
        date: "June 20, 2026",
        text: "Really useful for someone who works across multiple languages. The test cases are a nice touch — I can verify a snippet works before adapting it. Only complaint is that I wish there were more AI/ML-specific snippets.",
      },
    ],
    demoVideoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    relatedSlugs: ["mergekit", "datasweep", "plain-talk"],
  },
  {
    slug: "learnfast",
    name: "LearnFast",
    price: 199,
    category: "Courses",
    categorySlug: "courses",
    rating: 4.9,
    reviewCount: 41,
    description:
      "Everything you need to build, market, and sell an online course",
    longDescription:
      "LearnFast is a comprehensive video course and resource toolkit that teaches you how to create, market, and sell an online course — from topic selection to six-figure launch. Created by course creators who collectively have generated over $3M in course sales, it covers curriculum design, video production, pricing strategy, launch marketing, and student engagement.",
    typeIcon: "cap",
    gradient: "from-neutral-50 via-accent-50/40 to-neutral-100",
    highlights: [
      "12+ hours of video content across 8 modules with lifetime access",
      "Includes templates for curriculum design, sales pages, and email sequences",
      "Real case studies from creators who built $50K–$500K course businesses",
      "Private community access for feedback and accountability during your build",
    ],
    features: [
      {
        emoji: "🎥",
        name: "8-module video course",
        description:
          "12+ hours of video covering topic selection, curriculum design, video production, pricing, launch, and scale.",
      },
      {
        emoji: "📐",
        name: "Curriculum design toolkit",
        description:
          "Templates and frameworks for structuring courses that keep students engaged and improve completion rates.",
      },
      {
        emoji: "💰",
        name: "Pricing & launch playbook",
        description:
          "Proven pricing models, launch timelines, and marketing strategies from creators with $3M+ in combined course sales.",
      },
      {
        emoji: "📊",
        name: "Real case studies",
        description:
          "Deep dives into 5 successful course businesses — from a $50K side project to a $500K full-time business.",
      },
      {
        emoji: "👥",
        name: "Private community",
        description:
          "Access to a community of fellow course creators for feedback, accountability, and collaboration opportunities.",
      },
      {
        emoji: "🔧",
        name: "Tool stack guides",
        description:
          "Detailed comparisons of hosting platforms, email tools, and community platforms — with setup tutorials for each.",
      },
    ],
    howItWorks: [
      {
        step: 1,
        title: "Choose your course topic",
        description:
          "Module 1 walks you through audience research, topic validation, and competitive analysis to pick a topic that sells.",
      },
      {
        step: 2,
        title: "Design your curriculum",
        description:
          "Use the curriculum templates to structure your course for maximum engagement and completion — not just content dumping.",
      },
      {
        step: 3,
        title: "Record and produce",
        description:
          "Video production guides cover equipment, recording setup, editing workflows, and how to create professional-looking content on a budget.",
      },
      {
        step: 4,
        title: "Launch and sell",
        description:
          "The launch playbook walks you through pre-launch audience building, pricing strategy, sales page creation, and launch-week execution.",
      },
    ],
    faqs: [
      {
        question: "Is this course suitable for complete beginners?",
        answer:
          "Yes, absolutely. Module 1 starts with 'do you have something worth teaching?' and builds from there. No prior teaching, marketing, or video production experience is needed. Every concept is explained from scratch.",
      },
      {
        question: "How long does it take to complete the course?",
        answer:
          "The video content is about 12 hours. Most students complete it in 2-4 weeks while working on their own course in parallel. You have lifetime access, so there's no rush.",
      },
      {
        question: "What if I don't have an audience yet?",
        answer:
          "Modules 2 and 6 specifically cover audience building — from zero. You'll learn how to validate your topic, build an email list, and create a pre-launch audience even if you're starting with no following.",
      },
      {
        question: "Is there a refund policy?",
        answer:
          "Yes, we offer a 30-day money-back guarantee. If you complete the first 3 modules and don't feel you're getting value, we'll refund your purchase — no questions asked.",
      },
      {
        question: "Do I get updates when the course content is refreshed?",
        answer:
          "Yes, all updates are included for life. We refresh modules quarterly to reflect changes in tools, platforms, and market trends. You'll always have access to the latest version.",
      },
      {
        question: "How is this different from free YouTube content about course creation?",
        answer:
          "Free content gives you tactics. LearnFast gives you a complete, sequenced system — from topic validation to post-launch scaling — with templates, case studies, and a community for accountability. Most importantly, it's been tested across 200+ student launches.",
      },
    ],
    reviews: [
      {
        name: "Jordan Blake",
        initials: "JB",
        rating: 5,
        date: "July 24, 2026",
        text: "I launched my first course 8 weeks after starting LearnFast and made $12K in the first week. The launch playbook and email templates were worth the price alone. The curriculum design module changed how I think about teaching — my completion rates are 3x what I expected.",
      },
      {
        name: "Wei Zhang",
        initials: "WZ",
        rating: 5,
        date: "July 11, 2026",
        text: "The case studies alone justified the price for me. Seeing exactly how other creators built their course businesses — revenue numbers, funnel details, mistakes made — gave me the confidence to start. The community has been incredibly supportive too.",
      },
      {
        name: "Amara Osei",
        initials: "AO",
        rating: 5,
        date: "June 28, 2026",
        text: "I've taken other course-creation courses. LearnFast is the most practical by far. No fluff, no 'just believe in yourself' — it's all actionable frameworks, templates, and real numbers. I used the pricing module to raise my course price by 40% with no drop in conversions.",
      },
    ],
    demoVideoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    relatedSlugs: ["pitchforge", "launchkit", "clientflow-os"],
  },
];

/* ─── Lookup map ─── */
const PRODUCTS_MAP: Record<string, ProductDetail> = {};
for (const p of PRODUCTS) {
  PRODUCTS_MAP[p.slug] = p;
}

/* ─── Route ─── */
export const Route = createFileRoute("/products/$slug")({
  loader: ({ params }) => {
    const product = PRODUCTS_MAP[params.slug];
    if (!product) throw notFound();
    const related = product.relatedSlugs
      .map((s) => PRODUCTS_MAP[s])
      .filter(Boolean);
    return { product, related };
  },
  component: ProductPage,
  notFoundComponent: ProductNotFound,
});
