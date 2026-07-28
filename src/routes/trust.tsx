import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/trust")({
  head: () => ({
    meta: [
      { title: "Trust Centre — Secure Payments, Privacy & Quality | PrismBay" },
      { name: "description", content: "Learn how PrismBay protects your data and transactions: Stripe PCI-DSS Level 1 payments, bcrypt password hashing, SSL/TLS encryption, demo-first philosophy, and 14-day refund policy." },
    ],
    links: [
      { rel: "canonical", href: "https://prismbay.com/trust" },
    ],
  }),
  component: TrustPage,
});

/* ─── Inline SVG Icons ─── */

function ShieldCheckIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <path d="M14 3l8 4v7c0 5-3.4 9.6-8 11-4.6-1.4-8-6-8-11V7l8-4z" stroke="#16B3A7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 14l3 3 6-6" stroke="#16B3A7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <rect x="5" y="12" width="18" height="13" rx="3" stroke="#16B3A7" strokeWidth="1.8" />
      <path d="M9 12V8a5 5 0 0110 0v4" stroke="#16B3A7" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="14" cy="19" r="1.5" fill="#16B3A7" />
    </svg>
  );
}

function UserCheckIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <circle cx="14" cy="10" r="4" stroke="#16B3A7" strokeWidth="1.8" />
      <path d="M6 24c0-4.4 3.6-8 8-8 1.8 0 3.5.6 4.8 1.7" stroke="#16B3A7" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M19 20l2 2 4-4" stroke="#16B3A7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <path d="M14 4v16m0 0l-5-5m5 5l5-5" stroke="#16B3A7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 22v2a2 2 0 002 2h16a2 2 0 002-2v-2" stroke="#16B3A7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <path d="M17.94 17.94A5.98 5.98 0 0114 19c-3.87 0-7.36-2.68-9-6.5.73-1.7 1.84-3.14 3.22-4.22" stroke="#16B3A7" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M10.06 10.06A5.98 5.98 0 0114 7c3.87 0 7.36 2.68 9 6.5a13.7 13.7 0 01-3.22 4.22" stroke="#16B3A7" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M10.06 17.94L4 24m20-20l-6.06 6.06" stroke="#16B3A7" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <path d="M14 2l3.09 8.18L25 10.82l-6 5.18 1.82 8.5L14 20.13 7.18 24.5 9 16l-6-5.18 7.91-.64L14 2z" stroke="#16B3A7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MessageIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <path d="M22 18v2a2 2 0 01-2 2H8l-4 4V8a2 2 0 012-2h2" stroke="#16B3A7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 16h8a2 2 0 002-2V6a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" stroke="#16B3A7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DocIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <path d="M16 2H8a2 2 0 00-2 2v20a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="#16B3A7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 2v6h6" stroke="#16B3A7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 14h8m-8 4h8m-8 4h5" stroke="#16B3A7" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <path d="M2 14a12 12 0 0112-12c2.7 0 5.3.9 7.4 2.6L24 7" stroke="#16B3A7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M26 14a12 12 0 01-12 12c-2.7 0-5.3-.9-7.4-2.6L4 21" stroke="#16B3A7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M24 3v4h-4M4 25v-4h4" stroke="#16B3A7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function UndoIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <path d="M4 10h13a7 7 0 010 14h-4" stroke="#16B3A7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 6L4 10l4 4" stroke="#16B3A7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ─── Trust Section Data ─── */
const TRUST_SECTIONS = [
  {
    icon: LockIcon,
    title: "Secure Payments",
    body: "All transactions on PrismBay are processed through Stripe, a PCI-DSS Level 1 certified payment processor — the highest level of security certification in the payments industry. Every connection uses TLS 1.3 encryption (SSL/TLS), and we never see, store, or log your full credit card details. Stripe handles the entire payment flow, so your sensitive financial data never touches our servers.",
    takeaway: "Your payment information is protected by bank-grade security — not by us, but by Stripe, the world's most trusted payment infrastructure.",
  },
  {
    icon: UserCheckIcon,
    title: "Customer Accounts",
    body: "When you create a PrismBay account, your password is hashed using bcrypt with a per-user salt — the industry gold standard for password storage. Your sessions are secured with httpOnly, SameSite-strict cookies, preventing cross-site request forgery and session hijacking. You have full control over your account data: view your purchase history, re-download any product at any time, and request account deletion whenever you choose.",
    takeaway: "Industry-standard password hashing and secure session management keep your account protected — and you're always in control.",
  },
  {
    icon: DownloadIcon,
    title: "Instant Digital Delivery",
    body: "The moment your payment is confirmed, you get immediate access to your purchase. Each product download is protected by a unique, time-limited download token that's generated on-the-fly — no shared links, no public URLs. You can re-download any product you've purchased at any time from your account dashboard, so you never have to worry about losing files or expired links.",
    takeaway: "Your products are always available, always secure — instant access today, re-download anytime tomorrow.",
  },
  {
    icon: EyeOffIcon,
    title: "Privacy by Design",
    body: "We collect only the data we need to operate the marketplace: your email for account identification and purchase receipts, and your name so we know who to address. We don't use third-party tracking scripts without your explicit consent, and our cookie consent banner gives you granular control. PrismBay is designed with GDPR and CCPA principles in mind — you have the right to access, correct, export, or delete your data at any time.",
    takeaway: "Minimal data collection, no hidden tracking, and full compliance awareness — your privacy isn't an afterthought.",
  },
  {
    icon: StarIcon,
    title: "Product Quality",
    body: "Every product on PrismBay includes detailed feature breakdowns, technical requirements, and FAQ content so you can make an informed decision with no surprises. Our product pages are designed for transparency — complete architecture descriptions, workflow details, licensing terms, and upfront pricing so you know exactly what you're getting before you buy.",
    takeaway: "Full transparency — we believe you should know exactly what you're buying.",
  },
  {
    icon: MessageIcon,
    title: "Customer Support",
    body: "We respond to every support inquiry within 24 hours — typically much faster. You can reach us directly by email at support@prismbay.com, and every message goes to a real human on our team. Whether you have a pre-sale question, a technical issue, or just want to understand which product fits your needs, we're here to help. No chatbots, no ticket systems that go into a void — just direct, helpful responses from people who know the products.",
    takeaway: "Real human support, within 24 hours — direct email, no runaround.",
  },
  {
    icon: DocIcon,
    title: "Clear Licensing",
    body: "Every PrismBay product comes with a single-business perpetual licence. That means you pay once and can use the blueprint within your business forever — no recurring subscriptions, no seat-count limitations, no hidden renewal fees. You can use the system to build your own products and services. The licence is clear, simple, and included with every purchase at no extra cost.",
    takeaway: "One payment, perpetual use — no subscription traps, no licence surprises.",
  },
  {
    icon: RefreshIcon,
    title: "Continuous Improvement",
    body: "Our products don't sit still. Based on buyer feedback and real-world usage, we release updates to our blueprints — improved workflows, updated architecture patterns, new revenue model insights, and expanded implementation guides. When you purchase a product, you get access to the latest version, and we notify existing customers when significant updates are available so you always have the best version.",
    takeaway: "Your blueprint evolves with the technology — updates based on real feedback, not theoretical roadmaps.",
  },
  {
    icon: UndoIcon,
    title: "Fair Refunds",
    body: "We offer a 14-day refund policy. If a product doesn't meet your expectations — if the blueprint wasn't what you expected, if the scope doesn't fit your needs, or if you simply change your mind — you can request a full refund within 14 days of purchase. No interrogations, no hoops to jump through. We believe in our products, but we also believe that trust means giving you a genuine safety net.",
    takeaway: "14 days to decide — if it's not right for you, you get your money back, no questions asked.",
  },
];

/* ─── Navbar (matching existing pattern) ─── */
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

/* ─── Trust Page ─── */
function TrustPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero — navy background */}
      <section className="bg-navy-900">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-400">Trust Centre</p>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Your trust is earned, not assumed
            </h1>
            <p className="mt-6 text-lg text-neutral-300 sm:text-xl">
              Every decision we make — from payment processing to password storage to how we handle your data — is designed to earn and keep your trust. Here's exactly how we protect you, your information, and your purchases.
            </p>
          </div>
        </div>
      </section>

      {/* Trust sections — alternating backgrounds */}
      {TRUST_SECTIONS.map((section, i) => (
        <section key={section.title} className={i % 2 === 0 ? "bg-white" : "bg-neutral-50"}>
          <div className="mx-auto max-w-4xl px-6 py-16 sm:py-20">
            <div className="flex gap-6 sm:gap-8">
              {/* Icon column */}
              <div className="flex-shrink-0 mt-1">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50">
                  <section.icon />
                </div>
              </div>
              {/* Text column */}
              <div>
                <h2 className="text-xl font-bold text-neutral-800 sm:text-2xl">{section.title}</h2>
                <p className="mt-4 text-neutral-600 leading-relaxed">{section.body}</p>
                <p className="mt-4 font-semibold text-neutral-700">{section.takeaway}</p>
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* Final CTA */}
      <section className="bg-navy-900">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center sm:py-20">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">Ready to build with confidence?</h2>
          <p className="mt-4 text-lg text-neutral-300">Every product is backed by the trust commitments on this page.</p>
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
