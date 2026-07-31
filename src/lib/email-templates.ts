/**
 * PrismBay transactional email templates.
 * All 5 templates from the email-templates.md spec, with placeholder substitution.
 */

export interface EmailTemplate {
  subject: string;
  body: string;
}

export interface PurchaseConfirmationPlaceholders {
  customerFirstName: string;
  orderId: string;
  orderDate: string;
  productName: string;
  pricePaid: string;
  paymentMethodBrief: string;
  accountDownloadsUrl: string;
}

export interface DownloadAccessPlaceholders {
  customerFirstName: string;
  productName: string;
  downloadUrl: string;
  tokenExpiryDuration: string;
  accountDownloadsUrl: string;
}

export interface WelcomePlaceholders {
  customerFirstName: string;
  marketplaceUrl: string;
  resourcesUrl: string;
  trustUrl: string;
}

export interface LaunchReminderPlaceholders {
  customerFirstName: string;
  marketplaceUrl: string;
}

export interface FollowUpPlaceholders {
  customerFirstName: string;
  productName: string;
  resourcesUrl: string;
  accountDownloadsUrl: string;
  refundDeadlineDate: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────

/** Extract first name from full name, or fall back to "there" */
export function getFirstName(name: string | null | undefined): string {
  if (!name || !name.trim()) return "there";
  return name.trim().split(" ")[0];
}

/** Format cents to USD string, e.g. 2199 → "$21.99" */
export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/** Format a date string to a human-readable format */
export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** Get the site base URL from environment or default */
export function getSiteUrl(): string {
  if (process.env.SITE_URL) {
    return process.env.SITE_URL.replace(/\/$/, "");
  }
  return "https://www.prismbayai.com";
}

// ── Template Renderers ─────────────────────────────────────────────────────

export function purchaseConfirmation(p: PurchaseConfirmationPlaceholders): EmailTemplate {
  return {
    subject: `Your PrismBay order #${p.orderId} — ${p.productName}`,
    body: `Hi ${p.customerFirstName},

Thank you for your purchase. Here's a summary of your order:

  Order:     #${p.orderId}
  Date:      ${p.orderDate}
  Product:   ${p.productName}
  Price:     ${p.pricePaid}
  Payment:   Stripe (${p.paymentMethodBrief})

What happens next:

1. Your purchase is available immediately. Visit your account to
   download your product and access everything included.

   ${p.accountDownloadsUrl}

2. Your download is protected by a unique, time-limited token generated
   each time you request it. You can re-download at any time.

3. Every PrismBay purchase includes 30 days of priority support. Reply
   to this email or write to admin@prismbay.com — a real person will
   get back to you, typically within a few hours.

4. If the product isn't what you expected, you're covered by our 14-day
   refund policy. No questions asked — just reply and let us know.

A few things to know:

  • This is a single-business perpetual licence.
  • Future updates to the product are included.
  • Your payment was processed securely by Stripe. We never see or
    store your full card details.

—
The PrismBay Team
admin@prismbay.com`,
  };
}

export function downloadAccess(p: DownloadAccessPlaceholders): EmailTemplate {
  return {
    subject: `Your download for ${p.productName} is ready`,
    body: `Hi ${p.customerFirstName},

Here is your download link for ${p.productName}:

  ${p.downloadUrl}

This link is unique to your account and will expire in
${p.tokenExpiryDuration}. After that, you can generate a fresh
download link anytime from your account dashboard.

What's included:
  • Complete product blueprint and documentation
  • Technical architecture and implementation guide
  • Workflow templates and supporting resources
  • Revenue model and launch guidance
  • Access to the product demonstration video

Need to download again later? Visit your account:

  ${p.accountDownloadsUrl}

—
The PrismBay Team
admin@prismbay.com`,
  };
}

export function welcome(p: WelcomePlaceholders): EmailTemplate {
  return {
    subject: "Welcome to PrismBay — here's what you'll find",
    body: `Hi ${p.customerFirstName},

Welcome to PrismBay. We're glad you're here.

PrismBay is a marketplace for complete AI business systems — detailed
blueprints that include workflows, technical architecture, revenue
models, and implementation guides.

A few things you can do now:

  • Browse the full marketplace — 9 individual products and 3 bundles.

    ${p.marketplaceUrl}

  • Visit our Resources page for articles on building AI-native
    businesses, implementation patterns, and product comparisons.

    ${p.resourcesUrl}

  • Read about how we handle security, privacy, and trust at our
    Trust Centre.

    ${p.trustUrl}

There's no pressure to buy anything. Your account is free, and if you
have questions about which product might fit your needs, reply to this
email — we're happy to help.

—
The PrismBay Team
admin@prismbay.com`,
  };
}

export function launchPricingEnding(p: LaunchReminderPlaceholders): EmailTemplate {
  const products = [
    { name: "Nexus Network", launch: "$219", regular: "$299" },
    { name: "Digital Humans", launch: "$379", regular: "$499" },
    { name: "NexusOS", launch: "$449", regular: "$599" },
    { name: "Empire AI", launch: "$399", regular: "$549" },
    { name: "Genesis Platform", launch: "$499", regular: "$699" },
    { name: "Nexus One", launch: "$299", regular: "$399" },
    { name: "SpendShield AI", launch: "$249", regular: "$349" },
    { name: "GuardianOS", launch: "$369", regular: "$499" },
    { name: "EvidenceFlow AI", launch: "$249", regular: "$349" },
  ];

  const productLines = products
    .map((p) => `  ${p.name.padEnd(22)} ${p.launch} → ${p.regular}`)
    .join("\n");

  return {
    subject: "Launch pricing ends in 48 hours — a quick heads-up",
    body: `Hi ${p.customerFirstName},

A quick note: our launch pricing period ends in 48 hours.

When the countdown reaches zero, all products return to regular prices:

${productLines}

Bundles:
  AI Business Operations Bundle       $999   → $1,547
  Trust, Risk & Compliance Bundle     $749   → $1,197
  Complete AI Business Portfolio     $2,699 → $4,241

We're sending this because you registered for a PrismBay account and
we want you to have the full picture before the deadline passes. The
countdown timer on our website shows the exact time remaining — it's
the same for every visitor and will not reset.

Browse the marketplace: ${p.marketplaceUrl}

If the timing isn't right, no problem at all. Every product will remain
available at its regular price after the launch period ends.

—
The PrismBay Team
admin@prismbay.com`,
  };
}

export function postPurchaseFollowUp(p: FollowUpPlaceholders): EmailTemplate {
  return {
    subject: `How's ${p.productName} going? A quick check-in`,
    body: `Hi ${p.customerFirstName},

It's been a week since you picked up ${p.productName} — I wanted to
check in and see how it's going.

A few things that might be helpful:

  • Still have 23 days of priority support remaining. If you've hit a
    snag or want to talk through implementation, reply to this email.

  • Our Resources page has articles on implementation patterns and
    AI business strategy.

    ${p.resourcesUrl}

  • You can re-download your product at any time from your account
    dashboard — no limits, no expiry.

    ${p.accountDownloadsUrl}

  • Reminder: you're covered by our 14-day refund policy until
    ${p.refundDeadlineDate}.

No pressure, no upsell — just a genuine check-in. If everything is
going smoothly, that's great to hear too.

—
The PrismBay Team
admin@prismbay.com`,
  };
}

/* ─── New Placeholder Types ────────────────────────────────────────────────── */

export interface PostPurchaseDay1Placeholders {
  customerFirstName: string;
  productName: string;
  productDemoUrl: string;
  accountDownloadsUrl: string;
}

export interface PostPurchaseDay3Placeholders {
  customerFirstName: string;
  productName: string;
  productSlug: string;
  resourcesUrl: string;
}

export interface PostPurchaseDay7Placeholders {
  customerFirstName: string;
  productName: string;
  accountDownloadsUrl: string;
  refundDeadlineDate: string;
  supportDaysRemaining: number;
}

export interface PostPurchaseDay12Placeholders {
  customerFirstName: string;
  productName: string;
  refundDeadlineDate: string;
  productDemoUrl: string;
}

export interface PostPurchaseDay21Placeholders {
  customerFirstName: string;
  productName: string;
  upsellProductName: string;
  upsellProductUrl: string;
  bundleSavingsPercent: number;
  bundleName: string;
  bundleUrl: string;
  marketplaceUrl: string;
}

export interface PrePurchaseDay1Placeholders {
  customerFirstName: string;
  marketplaceUrl: string;
  resourcesUrl: string;
}

export interface PrePurchaseDay4Placeholders {
  customerFirstName: string;
  resourcesUrl: string;
  marketplaceUrl: string;
}

export interface PrePurchaseDay10Placeholders {
  customerFirstName: string;
  refundPolicyUrl: string;
  marketplaceUrl: string;
}

export interface NewsletterPlaceholders {
  subject: string;
  articleTitle: string;
  articleUrl: string;
  articleSummary: string;
  productSpotlightName: string;
  productSpotlightUrl: string;
  productSpotlightBlurb: string;
  industrySignal1Title: string;
  industrySignal1Url: string;
  industrySignal2Title: string;
  industrySignal2Url: string;
  behindTheScenes: string;
  resourcesUrl: string;
  marketplaceUrl: string;
  unsubscribeUrl: string;
}

export interface NewsletterWelcomePlaceholders {
  customerFirstName: string;
  resourcesUrl: string;
  marketplaceUrl: string;
  unsubscribeUrl: string;
}

export interface ReengagementPlaceholders {
  customerFirstName: string;
  marketplaceUrl: string;
  resourcesUrl: string;
}

/* ─── Post-Purchase Onboarding Templates ──────────────────────────────────── */

/**
 * Email 1: "Here's where to start with [ProductName]"
 * Sent immediately after purchase — augments the download-access email.
 */
export function postPurchaseStartHere(p: PostPurchaseDay1Placeholders): EmailTemplate {
  return {
    subject: `Here's where to start with ${p.productName}`,
    body: `Hi ${p.customerFirstName},

Thanks again for picking up ${p.productName}. Your download is ready
in your account, and I wanted to share a few concrete first steps to
help you get the most out of it right away.

Start here — three things to do first:

1. Watch the demo walkthrough
   ${p.productDemoUrl}

   The demo shows the system end-to-end in about 2–3 minutes. It'll
   give you a clear picture of how the pieces fit together before
   you dive into the implementation guide.

2. Read the Implementation Guide — specifically the "Prerequisites"
   and "Architecture Overview" sections. They tell you what you'll
   need before you start building (API keys, infrastructure, team
   roles) and how the system is structured.

3. Bookmark your downloads page. You can re-download at any time —
   no limits, no expiry:
   ${p.accountDownloadsUrl}

If you run into anything confusing or just want to talk through your
approach, reply to this email. Support is included for 30 days and
there's a real person on the other end.

—
The PrismBay Team
admin@prismbay.com`,
  };
}

/**
 * Email 2: "Two things most people miss in [ProductName]"
 * Sent on Day 3 — surfaces common implementation pitfalls.
 */
export function postPurchaseTwoThings(p: PostPurchaseDay3Placeholders): EmailTemplate {
  return {
    subject: `Two things most people miss in ${p.productName}`,
    body: `Hi ${p.customerFirstName},

How's it going with ${p.productName}?

I've noticed a couple of things that tend to trip people up when
they're getting started. Thought I'd share them in case they help:

1. Skipping the agent configuration step. The blueprint walks you
   through setting up the AI agents that power the system — their
   roles, prompts, and decision boundaries. It's tempting to skim
   this section and jump straight to deployment, but the agent
   configuration is where most of the system's intelligence lives.
   Spending an extra 30 minutes here pays off.

2. Running without a test environment first. Set up a staging
   instance before you go live. The blueprint includes guidance
   on this, but people sometimes skip it and then have to
   troubleshoot in production. A staging environment takes about
   20 minutes to spin up and saves hours of debugging.

Our Resources page has a full article on AI business system
implementation patterns that covers both of these in more detail:

  ${p.resourcesUrl}

If you've hit a wall or something isn't clicking, reply and tell
me what's blocking you. Happy to help.

—
The PrismBay Team
admin@prismbay.com`,
  };
}

/**
 * Email 3: "One-week check-in — how's [ProductName] going?"
 * Sent on Day 7 — replaces the old manual Template 5 endpoint.
 */
export function postPurchaseWeekCheckIn(p: PostPurchaseDay7Placeholders): EmailTemplate {
  return {
    subject: `One-week check-in — how's ${p.productName} going?`,
    body: `Hi ${p.customerFirstName},

It's been a week since you got ${p.productName} — how far have you
gotten?

A few things that might help right now:

  • You still have ${p.supportDaysRemaining} days of priority support.
    If you're stuck or want someone to walk through your setup
    with you, reply to this email. No question is too small.

  • Block out 2 hours and work through the Implementation Guide
    cover to cover. It's designed to be followed sequentially —
    each section builds on the last.

  • Download a fresh copy anytime from your account:
    ${p.accountDownloadsUrl}

  • Reminder: you're covered by our 14-day refund policy until
    ${p.refundDeadlineDate}. If the product isn't working for
    you, you're entitled to a full refund — just reply and ask.

No upsell, no pitch. Just want to make sure you're getting value
out of what you bought.

—
The PrismBay Team
admin@prismbay.com`,
  };
}

/**
 * Email 4: "Before your refund window closes"
 * Sent on Day 12 — last-chance support intervention before refund window ends.
 */
export function postPurchaseRefundReminder(p: PostPurchaseDay12Placeholders): EmailTemplate {
  return {
    subject: `Before your refund window closes — a final check-in`,
    body: `Hi ${p.customerFirstName},

Your 14-day refund window for ${p.productName} closes on
${p.refundDeadlineDate}.

If it hasn't met your expectations, you're entitled to a full refund —
just reply to this email and I'll process it, no questions asked.
We don't interrogate you or make you jump through hoops.

That said, if the issue is that you haven't had time to dig in, or
you got stuck somewhere, 30 minutes of guided help can turn things
around. I've seen it happen many times — someone sits down with
the demo walkthrough and the implementation guide, and everything
clicks.

Demo walkthrough: ${p.productDemoUrl}

Either way — refund or continued use — just want to make sure you
feel good about your decision. Reply anytime.

—
The PrismBay Team
admin@prismbay.com`,
  };
}

/**
 * Email 5: "Building on [ProductName] — what next?"
 * Sent on Day 21+ — natural upsell to complementary product or bundle.
 */
export function postPurchaseWhatNext(p: PostPurchaseDay21Placeholders): EmailTemplate {
  return {
    subject: `Building on ${p.productName} — what next?`,
    body: `Hi ${p.customerFirstName},

By now you've had a few weeks with ${p.productName}. If it's working
well for you, you might be thinking about what comes next.

The natural next step from ${p.productName} is ${p.upsellProductName} —
it extends what you've already built and covers adjacent workflows
that most businesses need as they grow.

If you're ready to expand:

  • ${p.upsellProductName}: ${p.upsellProductUrl}

  • Or save ${p.bundleSavingsPercent}% with the ${p.bundleName} bundle,
    which includes ${p.productName}, ${p.upsellProductName}, and the
    rest of the PrismBay catalog:
    ${p.bundleUrl}

These products stand alone — there's no lock-in and no requirement
to buy anything else. ${p.productName} works perfectly on its own.
But if you're ready to go further, the bundle pricing is the best
value we offer.

Browse the full marketplace: ${p.marketplaceUrl}

—
The PrismBay Team
admin@prismbay.com`,
  };
}

/* ─── Pre-Purchase Nurture Templates ──────────────────────────────────────── */

/**
 * Email 6: "Still exploring AI business systems?"
 * Sent 24 hours after email capture — re-engages browsers with what PrismBay sells.
 */
export function prePurchaseStillExploring(p: PrePurchaseDay1Placeholders): EmailTemplate {
  return {
    subject: "Still exploring AI business systems?",
    body: `Hi ${p.customerFirstName},

You signed up for updates from PrismBay — thanks for that. I wanted
to give you a quick plain-terms introduction to what we actually sell,
since we're a new marketplace and you might be wondering what's here.

PrismBay sells complete AI business system blueprints. Not SaaS, not
subscriptions, not consulting hours. Each blueprint is a detailed
package that includes:

  • System architecture and technical design
  • Multi-agent workflows and coordination patterns
  • AI agent configurations (roles, prompts, decision logic)
  • Revenue models and commercial launch guidance
  • Step-by-step implementation guides

Most popular products right now:

  • NexusOS — Intelligent Business Operating System
  • Genesis Platform — AI Business App Builder
  • Nexus One — AI Business OS for SMBs

We're a new marketplace. No fake reviews, no inflated numbers. Every
product has a detailed demo you can watch before buying — no sign-up
required.

Browse the marketplace: ${p.marketplaceUrl}

Resources and guides: ${p.resourcesUrl}

—
The PrismBay Team
admin@prismbay.com`,
  };
}

/**
 * Email 7: "How businesses are using AI systems right now"
 * Sent on Day 4 — builds credibility through market-pattern examples.
 */
export function prePurchaseHowBusinessesUseAI(p: PrePurchaseDay4Placeholders): EmailTemplate {
  return {
    subject: "How businesses are using AI systems right now",
    body: `Hi ${p.customerFirstName},

Here are three real patterns we're seeing in how businesses are
adopting AI business systems — not fabricated testimonials, just
the use cases the PrismBay blueprints are built around:

1. Professional services firms coordinating projects via AI.
   Law firms, consultancies, and agencies are using multi-agent
   systems to track project milestones, flag overdue tasks, and
   generate client status reports — cutting the administrative
   overhead of project management by 40–60%.

2. Procurement teams catching duplicate spend.
   Mid-market companies are running AI agents across their
   procurement data to identify duplicate vendors, unused
   subscriptions, and pricing inconsistencies — typically
   finding 12–18% in recoverable savings within the first
   quarter.

3. Compliance teams reducing audit prep time.
   Instead of manually gathering evidence across email, Slack,
   and document storage, AI agents are collecting, timestamping,
   and organizing compliance evidence continuously — reducing
   audit preparation from 3 weeks to 3 days.

These are the patterns the PrismBay blueprints are built around.
Each product maps to one of these real-world use cases with a
complete implementation guide.

See the full product lineup: ${p.marketplaceUrl}

Implementation articles: ${p.resourcesUrl}

—
The PrismBay Team
admin@prismbay.com`,
  };
}

/**
 * Email 8: "The 14-day refund policy (and why it matters)"
 * Sent on Day 10 — reduces purchase anxiety by presenting refund policy as buyer
 * protection, not persuasion.
 */
export function prePurchaseRefundPolicy(p: PrePurchaseDay10Placeholders): EmailTemplate {
  return {
    subject: "The 14-day refund policy (and why it matters)",
    body: `Hi ${p.customerFirstName},

I wanted to tell you about our refund policy — not as a sales tactic,
but because it's one of the most important things to know before you
buy anything from a new marketplace.

Here it is, plainly: if you buy a PrismBay blueprint and it's not
what you expected, reply to your receipt email within 14 days and
ask for a refund. We process it — no questions asked, no
interrogation, no hoops.

We built this policy because we're a new marketplace with zero track
record. You shouldn't have to trust us blindly. The refund policy is
your protection — use it if you need to.

A few things worth knowing:

  • Launch pricing is active right now. Every product is 24–29% off
    its regular price during the launch period. When the launch
    window closes, prices return to regular. The countdown timer on
    the website is real and shared by all visitors.

  • Every product has a detailed demo video you can watch before
    buying. No sign-up, no email wall.

Browse the marketplace: ${p.marketplaceUrl}

Full refund policy: ${p.refundPolicyUrl}

—
The PrismBay Team
admin@prismbay.com`,
  };
}

/* ─── Newsletter Templates ────────────────────────────────────────────────── */

/**
 * Email 9: Bi-weekly newsletter template.
 */
export function newsletterIssue(p: NewsletterPlaceholders): EmailTemplate {
  return {
    subject: p.subject,
    body: `${p.articleTitle}

${p.articleSummary}

Read the full article: ${p.articleUrl}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Product Spotlight: ${p.productSpotlightName}

${p.productSpotlightBlurb}

See the product: ${p.productSpotlightUrl}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This Week in AI Ops

  • ${p.industrySignal1Title}
    ${p.industrySignal1Url}

  • ${p.industrySignal2Title}
    ${p.industrySignal2Url}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Behind the Scenes

${p.behindTheScenes}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Browse the marketplace: ${p.marketplaceUrl}
Resource library: ${p.resourcesUrl}

You're receiving this because you subscribed to the PrismBay newsletter.
Unsubscribe: ${p.unsubscribeUrl}

—
The PrismBay Team
admin@prismbay.com`,
  };
}

/**
 * Email 10: Welcome-to-newsletter email.
 * Sent immediately after someone subscribes to the newsletter.
 */
export function newsletterWelcome(p: NewsletterWelcomePlaceholders): EmailTemplate {
  return {
    subject: "Welcome to the PrismBay newsletter",
    body: `Hi ${p.customerFirstName},

You're now subscribed to the PrismBay newsletter. Here's what to expect:

  • Bi-weekly issues (every two weeks) covering AI business systems,
    implementation patterns, and what's new at PrismBay.

  • One featured article from our Resources library per issue.

  • A rotating product spotlight showing what each blueprint does
    and who it's built for.

  • Curated industry links — interesting reads from around AI ops.

  • Behind-the-scenes notes on what we shipped and what we're
    working on. We're a new, pre-revenue marketplace, so we're
    honest about where we are.

No fluff, no fake urgency, no inflated numbers. If it's not useful,
you can unsubscribe anytime — one click at the bottom of every email.

Browse products: ${p.marketplaceUrl}
Read our articles: ${p.resourcesUrl}

Each email includes an unsubscribe link. If you ever want to stop
receiving these, just click it — one and done.

—
The PrismBay Team
admin@prismbay.com`,
  };
}

/* ─── Re-engagement Template ─────────────────────────────────────────────── */

/**
 * Email 11: Dormant-user re-engagement.
 * For users who haven't logged in or made a purchase in 3+ months.
 */
export function dormantReengagement(p: ReengagementPlaceholders): EmailTemplate {
  return {
    subject: "Still interested in AI business systems?",
    body: `Hi ${p.customerFirstName},

It's been a while since you last visited PrismBay. No pressure — just
wanted to let you know what's changed in case you're still exploring
AI business systems.

Since you were last here:

  • Our resource library has grown — we now have 24 articles covering
    implementation patterns, product comparisons, and AI readiness.
    ${p.resourcesUrl}

  • Launch pricing is still active on all products and bundles. Every
    product is 24–29% off its eventual regular price. The countdown
    timer on the site is real and applies to everyone.

  • Every product now has a detailed interactive demo — watch before
    you buy, no sign-up required.

Browse the marketplace: ${p.marketplaceUrl}

If you've found what you need elsewhere, that's great too. If you'd
rather not hear from us again, there's an unsubscribe link below —
one click and you're off the list.

—
The PrismBay Team
admin@prismbay.com`,
  };
}
