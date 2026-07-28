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
  return "https://prismbay.com";
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
   to this email or write to support@prismbay.com — a real person will
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
support@prismbay.com`,
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
support@prismbay.com`,
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
support@prismbay.com`,
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
support@prismbay.com`,
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
support@prismbay.com`,
  };
}
