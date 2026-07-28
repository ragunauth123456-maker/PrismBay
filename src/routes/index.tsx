import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { PRODUCTS } from "~/data/products";
import CountdownTimer from "~/components/CountdownTimer";

export const Route = createFileRoute("/")({
  component: Home,
});

/* ─── Featured Products ─── */
const FEATURED = PRODUCTS.filter((p) =>
  ["nexusos", "genesis-platform", "guardianos"].includes(p.slug)
);

/* ─── Categories ─── */
const CATEGORIES = [
  { slug: "ai-business-systems", name: "AI Business Systems", description: "Complete AI operating systems, workforce platforms, and command centres", icon: "cog", count: 5 },
  { slug: "ai-development", name: "AI Development", description: "App builders, agent platforms, and no-code AI creation tools", icon: "box", count: 1 },
  { slug: "trust-compliance", name: "Trust & Compliance", description: "Verification, procurement intelligence, and compliance evidence systems", icon: "file", count: 3 },
];

/* ─── Reviews ─── */
const REVIEWS = [
  {
    quote:
      "NexusOS saved us six months of architecture planning. The department automation workflows were immediately actionable, and the AI agent coordination framework is now the backbone of our internal platform.",
    author: "David Kim",
    role: "CTO",
    product: "NexusOS",
    initials: "DK",
  },
  {
    quote:
      "Genesis Platform is the most comprehensive product blueprint I've seen. The no-code builder architecture alone saved us months of R&D. We're now building our platform and the subscription billing model was immediately actionable.",
    author: "Raj Mehta",
    role: "CTO & Co-Founder",
    product: "Genesis Platform",
    initials: "RM",
  },
  {
    quote:
      "GuardianOS is the blueprint every fintech needs. The payment verification workflows caught a pattern in our existing process that would have let through a $340K fraudulent invoice. We've rebuilt our entire approval chain on this architecture.",
    author: "Marcus Chen",
    role: "Head of InfoSec",
    product: "GuardianOS",
    initials: "MC",
  },
];

/* ─── Compute aggregate stats ─── */
function computeAggregateStats() {
  const totalReviews = PRODUCTS.reduce((sum, p) => sum + p.reviewCount, 0);
  const avgRating =
    PRODUCTS.reduce((sum, p) => sum + p.rating * p.reviewCount, 0) / totalReviews;
  return { totalReviews, avgRating };
}

/* ─── Inline SVG Icons ─── */
function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill={filled ? "#F59E0B" : "#DEDDDA"} aria-hidden="true">
      <path d="M8 1.5l1.76 4.86 5.17.24-4.1 3.17 1.34 5-4.17-3.08-4.17 3.08 1.34-5-4.1-3.17 5.17-.24L8 1.5z" />
    </svg>
  );
}

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <StarIcon key={i} filled={i <= Math.round(rating)} />
      ))}
      <span className="ml-1 text-sm font-medium text-neutral-700">{rating.toFixed(1)}</span>
      <span className="ml-0.5 text-sm text-neutral-400">({count})</span>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="7" fill="#16B3A7" />
      <path d="M5 8.5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function VerifiedBadgeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M7 1l1.57 3.23L12 4.73l-1.1 3.38L12 11.5l-3.43-.5L7 14l-1.57-3L2 11.5l1.1-3.39L2 4.73l3.43.5L7 1z" fill="#16B3A7" />
      <path d="M5.5 7l1.5 1.5 2-2" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CogIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="3" stroke="#16B3A7" strokeWidth="1.5" />
      <path d="M12 1v3m0 16v3M1 12h3m16 0h3M4.93 4.93l2.12 2.12m9.9 9.9l2.12 2.12M4.93 19.07l2.12-2.12m9.9-9.9l2.12-2.12" stroke="#16B3A7" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function BoxIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" stroke="#16B3A7" strokeWidth="1.5" />
      <path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" stroke="#16B3A7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="#16B3A7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 2v6h6" stroke="#16B3A7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 13H8m8 4H8" stroke="#16B3A7" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 2l6 3v5c0 4.5-6 8-6 8s-6-3.5-6-8V5l6-3z" stroke="#16B3A7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 10l2 2 4-4" stroke="#16B3A7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 3v10m0 0l-3-3m3 3l3-3M4 15v2a2 2 0 002 2h8a2 2 0 002-2v-2" stroke="#16B3A7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="8" stroke="#16B3A7" strokeWidth="1.5" />
      <path d="M10 6v4l2.5 2" stroke="#16B3A7" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function LicenceIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M6 2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2z" stroke="#16B3A7" strokeWidth="1.5" />
      <path d="M8 7h4M8 10h4M8 13h2" stroke="#16B3A7" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function StripeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="2" y="4" width="16" height="12" rx="2" stroke="#16B3A7" strokeWidth="1.5" />
      <path d="M2 8h16" stroke="#16B3A7" strokeWidth="1.5" />
      <path d="M6 12h3" stroke="#16B3A7" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

const typeIcons: Record<string, React.FC> = {
  cog: CogIcon,
  box: BoxIcon,
  file: FileIcon,
};

/* ─── Product Type Gradient Map ─── */
const typeGradients: Record<string, string> = {
  "AI Business Systems": "from-brand-50 via-neutral-50 to-neutral-100",
  "AI Development": "from-neutral-50 via-neutral-100 to-brand-50/40",
  "Trust & Compliance": "from-brand-50/60 via-neutral-50 to-accent-50/40",
};

/* ─── Logo ─── */
function LogoHorizontal({ className }: { className?: string }) {
  return (
    <Link to="/" className={`inline-flex items-center gap-3 ${className ?? ""}`}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 64" fill="none" className="h-9 w-auto" aria-label="PrismBay">
        <g transform="translate(0, 6)">
          <polygon points="4,52 28,4 52,52" fill="#16B3A7" />
          <line x1="28" y1="4" x2="20" y2="52" stroke="white" strokeWidth="2.5" />
          <circle cx="20" cy="52" r="3" fill="#F59E0B" />
        </g>
        <g transform="translate(68, 0)">
          <text x="0" y="44" fontFamily="Inter, system-ui, sans-serif" fontWeight="700" fontSize="36" letterSpacing="-0.02em">
            <tspan fill="#16B3A7">Prism</tspan>
            <tspan fill="#282724">Bay</tspan>
          </text>
        </g>
      </svg>
    </Link>
  );
}

/* ─── Announcement Bar ─── */
function AnnouncementBar() {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("pb-announcement-dismissed") === "true") {
      setDismissed(true);
    }
  }, []);

  const dismiss = () => {
    setDismissed(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("pb-announcement-dismissed", "true");
    }
  };

  if (dismissed) return null;

  return (
    <div className="relative bg-navy-900 text-white text-xs">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 px-4 py-2.5">
        <span>
          🚀 Launch pricing live — save up to 29% through August 27, 2026.{" "}
          <a href="#hero" className="underline underline-offset-2 transition-colors hover:text-brand-300">
            View countdown →
          </a>
        </span>
        <button
          onClick={dismiss}
          className="absolute right-4 top-1/2 -translate-y-1/2 rounded p-1 text-neutral-400 transition-colors hover:text-white"
          aria-label="Dismiss announcement"
        >
          <CloseIcon />
        </button>
      </div>
    </div>
  );
}

/* ─── Navbar ─── */
function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-50 h-16 border-b border-neutral-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6">
        <LogoHorizontal />

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 lg:flex">
          <div className="relative">
            <button
              onClick={() => setProductsOpen(!productsOpen)}
              className="inline-flex items-center gap-1 text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900"
            >
              Products
              <ChevronDownIcon />
            </button>
            {productsOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setProductsOpen(false)} />
                <div className="absolute left-0 top-full z-20 mt-2 w-64 rounded-xl border border-neutral-200 bg-white p-3 shadow-lg">
                  {CATEGORIES.map((cat) => (
                    <Link
                      key={cat.slug}
                      to="/products"
                      search={{ category: cat.slug }}
                      onClick={() => setProductsOpen(false)}
                      className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 hover:text-neutral-900"
                    >
                      <span>{cat.name}</span>
                      <span className="text-xs text-neutral-400">{cat.count}</span>
                    </Link>
                  ))}
                  <hr className="my-1 border-neutral-100" />
                  <Link
                    to="/products"
                    onClick={() => setProductsOpen(false)}
                    className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-brand-600 transition-colors hover:bg-brand-50"
                  >
                    View all products →
                  </Link>
                </div>
              </>
            )}
          </div>
          <Link to="/products" search={{ category: "bundles" }} className="text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900">
            Bundles
          </Link>
          <Link to="/how-it-works" className="text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900">
            How It Works
          </Link>
        </nav>

        <div className="flex items-center gap-5">
          <Link to="/sign-in" className="hidden text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900 lg:inline">
            Sign In
          </Link>
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-2 text-neutral-600 transition-colors hover:bg-neutral-100 lg:hidden"
            aria-label="Open menu"
          >
            <MenuIcon />
          </button>
        </div>
      </div>

      {/* Mobile slide-out drawer */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/40 transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed right-0 top-0 z-50 h-full w-72 bg-white shadow-xl transition-transform duration-300 ease-in-out">
            <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
              <span className="text-base font-semibold text-neutral-800">Menu</span>
              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-2 text-neutral-600 transition-colors hover:bg-neutral-100"
                aria-label="Close menu"
              >
                <CloseIcon />
              </button>
            </div>
            <nav className="flex flex-col gap-1 px-4 py-4">
              <Link
                to="/products"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2.5 text-base font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
              >
                Products
              </Link>
              <Link
                to="/products"
                search={{ category: "bundles" }}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2.5 text-base font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
              >
                Bundles
              </Link>
              <Link
                to="/how-it-works"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2.5 text-base font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
              >
                How It Works
              </Link>
              <hr className="my-2 border-neutral-100" />
              <Link
                to="/sign-in"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2.5 text-base font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
              >
                Sign In
              </Link>
            </nav>
          </div>
        </>
      )}
    </header>
  );
}

/* ─── Hero Section (P0 — navy two-column with 3D card stack) ─── */
function HeroSection() {
  return (
    <section id="hero" className="bg-navy-900">
      <div className="mx-auto max-w-7xl px-6 pb-20 pt-16 sm:pt-24 sm:pb-28">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left column — text */}
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Complete AI Business Systems. No Starting From Zero.
            </h1>
            <p className="mt-6 text-lg text-neutral-300 sm:text-xl">
              Detailed workflows, architecture, revenue models, and implementation plans — each with a real product demo and verified buyer reviews. Launch pricing available for a limited time.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                to="/products"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-8 py-4 text-lg font-semibold text-white shadow-sm transition-all duration-200 hover:bg-brand-600 hover:shadow-md hover:-translate-y-px active:bg-brand-700 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900"
              >
                Browse the Marketplace
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path d="M4 10h12m0 0l-5-5m5 5l-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link
                to="/how-it-works"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-brand-300/50 px-8 py-4 text-lg font-semibold text-white transition-all duration-200 hover:bg-white/10 active:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300/30 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900"
              >
                How It Works
              </Link>
            </div>
            <div className="mt-8 flex flex-col items-start gap-2">
              <p className="text-sm font-medium text-brand-300">30-Day Launch Offer — Save up to 29%</p>
              <CountdownTimer variant="hero" />
              <p className="text-xs text-neutral-400">Launch pricing ends August 27, 2026</p>
            </div>
          </div>

          {/* Right column — CSS 3D card stack */}
          <div className="relative hidden lg:flex items-center justify-center" style={{ perspective: "800px" }}>
            {/* Card 1 (back, rotated left) */}
            <div
              className="absolute h-56 w-40 rounded-xl border border-white/10 bg-navy-800 shadow-2xl"
              style={{
                transform: "rotateY(20deg) rotateZ(-6deg) translateX(-30px)",
                background: "linear-gradient(135deg, #1A2C50 0%, #0F172A 100%)",
              }}
            >
              <div className="flex h-full flex-col justify-end p-4">
                <div className="h-3 w-3/4 rounded bg-brand-500/30" />
                <div className="mt-2 h-2 w-1/2 rounded bg-neutral-400/20" />
              </div>
            </div>
            {/* Card 2 (middle) */}
            <div
              className="absolute h-56 w-40 rounded-xl border border-white/10 bg-navy-800 shadow-2xl"
              style={{
                transform: "rotateY(0deg) rotateZ(0deg) translateX(0px)",
                background: "linear-gradient(135deg, #264270 0%, #1A2C50 100%)",
              }}
            >
              <div className="flex h-full flex-col justify-end p-4">
                <div className="h-3 w-4/5 rounded bg-brand-500/40" />
                <div className="mt-2 h-2 w-3/5 rounded bg-neutral-400/30" />
                <div className="mt-3 flex gap-1">
                  <div className="h-4 w-4 rounded-full bg-accent-500/50" />
                  <div className="h-4 w-4 rounded-full bg-accent-500/30" />
                  <div className="h-4 w-4 rounded-full bg-accent-500/20" />
                </div>
              </div>
            </div>
            {/* Card 3 (front, rotated right) */}
            <div
              className="absolute h-56 w-40 rounded-xl border border-white/10 bg-navy-800 shadow-2xl"
              style={{
                transform: "rotateY(-20deg) rotateZ(6deg) translateX(30px)",
                background: "linear-gradient(135deg, #335890 0%, #264270 100%)",
              }}
            >
              <div className="flex h-full flex-col justify-end p-4">
                <div className="h-3 w-2/3 rounded bg-brand-500/50" />
                <div className="mt-2 h-2 w-1/2 rounded bg-neutral-400/40" />
                <div className="mt-3 flex items-center gap-2">
                  <div className="h-1.5 w-12 rounded-full bg-brand-500/60" />
                  <div className="h-1.5 w-6 rounded-full bg-neutral-400/30" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Trust Panel (P0 — 5-column grid, computed stats) ─── */
function TrustPanel() {
  const { totalReviews, avgRating } = useMemo(() => computeAggregateStats(), []);

  const trustSignals = [
    { icon: StripeIcon, label: "Secure checkout via Stripe" },
    { icon: StarIcon, label: `${avgRating.toFixed(1)} ★ average · ${totalReviews}+ reviews`, isStat: true },
    { icon: DownloadIcon, label: "Instant access after purchase" },
    { icon: LicenceIcon, label: "Clear single-business licence" },
    { icon: ClockIcon, label: "30-day access guarantee" },
  ];

  return (
    <section className="border-t border-neutral-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {trustSignals.map((signal, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50">
                {signal.isStat ? (
                  <SignalStarIcon />
                ) : (
                  <signal.icon />
                )}
              </div>
              <span className="text-sm text-neutral-700">
                {signal.isStat ? (
                  <>
                    <span className="font-semibold text-neutral-900">{avgRating.toFixed(1)} ★</span>{" "}
                    <span className="text-neutral-600">average · {totalReviews}+ reviews</span>
                  </>
                ) : (
                  signal.label
                )}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SignalStarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="#F59E0B" aria-hidden="true">
      <path d="M8 1.5l1.76 4.86 5.17.24-4.1 3.17 1.34 5-4.17-3.08-4.17 3.08 1.34-5-4.1-3.17 5.17-.24L8 1.5z" />
    </svg>
  );
}

/* ─── Featured Products Section (P1 — filters, bundle upsell, view all) ─── */
function FeaturedProducts() {
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const allProducts = PRODUCTS;

  const filterPills = [
    { label: "All", count: allProducts.length },
    { label: "AI Business Systems", count: 5 },
    { label: "AI Development", count: 1 },
    { label: "Trust & Compliance", count: 3 },
  ];

  const filteredProducts = activeFilter === "All"
    ? FEATURED
    : allProducts.filter((p) => p.category === activeFilter);

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">Marketplace</p>
            <h2 className="mt-2 text-3xl font-bold text-neutral-800">Featured products</h2>
            <p className="mt-3 text-base text-neutral-600">Complete AI business systems our buyers are investing in right now.</p>
          </div>
          <Link
            to="/products"
            className="shrink-0 text-sm font-semibold text-brand-600 transition-colors hover:text-brand-700"
          >
            View all 9 products →
          </Link>
        </div>

        {/* Filter pill chips */}
        <div className="mt-8 flex flex-wrap gap-2">
          {filterPills.map((pill) => (
            <button
              key={pill.label}
              onClick={() => setActiveFilter(pill.label)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-200 ${
                activeFilter === pill.label
                  ? "bg-navy-900 text-white"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              {pill.label}
              <span className={`text-xs ${activeFilter === pill.label ? "text-neutral-400" : "text-neutral-400"}`}>
                {pill.count}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => {
            const Icon = typeIcons[product.typeIcon] ?? CogIcon;
            const gradient = typeGradients[product.category] ?? "from-neutral-50 to-neutral-100";
            return (
              <div
                key={product.slug}
                className="group cursor-pointer rounded-xl border border-neutral-200 bg-white p-0 transition-all duration-200 hover:border-brand-200 hover:shadow-md hover:-translate-y-0.5"
              >
                <Link
                  to={`/products/${product.slug}`}
                  className="block"
                >
                  <div className={`relative flex aspect-[16/10] items-center justify-center rounded-t-xl bg-gradient-to-br ${gradient}`}>
                    <img
                      src={`/images/products/${product.slug}.png`}
                      alt={product.name}
                      className="h-full w-full object-cover rounded-t-xl"
                      loading="lazy"
                    />
                    <div className="absolute top-3 left-3 rounded-lg bg-white/90 px-2 py-0.5 text-xs font-medium text-neutral-600 shadow-sm">
                      {product.category}
                    </div>
                    <div className="absolute top-3 right-3 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                      Save {product.discountPercent}%
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-base font-semibold text-neutral-800">{product.name}</h3>
                    <p className="mt-1 text-base text-neutral-600 line-clamp-2">{product.tagline}</p>
                    <div className="mt-2">
                      <StarRating rating={product.rating} count={product.reviewCount} />
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-brand-600">${product.launchPrice}</span>
                        <span className="text-sm text-neutral-400 line-through">${product.regularPrice}</span>
                      </div>
                    </div>
                  </div>
                </Link>
                <div className="px-5 pb-5 flex gap-2">
                  <Link
                    to={`/products/${product.slug}`}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-brand-500 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
                  >
                    View Product
                  </Link>
                  <a
                    href={`/products/${product.slug}#demo`}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-neutral-200 bg-neutral-100 px-3 py-2 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-200"
                  >
                    Watch Demo
                  </a>
                </div>
              </div>
            );
          })}

          {/* Bundle upsell card */}
          <div className="col-span-full sm:col-span-2 lg:col-span-3 rounded-xl border-2 border-accent-400/60 bg-gradient-to-br from-accent-50/40 via-white to-white p-0 transition-all duration-200 hover:border-accent-400 hover:shadow-md">
            <div className="flex flex-col lg:flex-row">
              <div className="flex-1 p-6 sm:p-8">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-accent-100 px-3 py-1 text-xs font-semibold text-accent-700">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
                    <path d="M6 1l1.32 2.68L10 4.34 8.1 6.5 8.5 9.5 6 8.2 3.5 9.5l.4-3-1.9-2.16 2.68-.34L6 1z" />
                  </svg>
                  Best Value
                </div>
                <h3 className="mt-3 text-xl font-bold text-neutral-800">Complete AI Business Portfolio</h3>
                <p className="mt-2 text-base text-neutral-600">
                  All 9 AI business systems in one bundle — NexusOS, Genesis Platform, GuardianOS, and 6 more. Everything you need to evaluate, plan, and launch multiple AI-powered businesses.
                </p>
                <div className="mt-4 flex flex-wrap items-baseline gap-2">
                  <span className="text-2xl font-bold text-accent-600">$2,699</span>
                  <span className="text-base text-neutral-400 line-through">$4,241</span>
                  <span className="rounded-full bg-accent-100 px-2.5 py-0.5 text-sm font-semibold text-accent-700">
                    Save $1,542
                  </span>
                </div>
                <div className="mt-4">
                  <Link
                    to="/products"
                    search={{ category: "bundles" }}
                    className="inline-flex items-center gap-2 rounded-lg bg-accent-500 px-6 py-3 text-base font-semibold text-neutral-900 shadow-sm transition-all duration-200 hover:bg-accent-600 hover:shadow-md hover:-translate-y-px active:bg-accent-700 active:translate-y-0"
                  >
                    View Bundle →
                  </Link>
                </div>
              </div>
              <div className="hidden lg:flex lg:w-48 items-center justify-center bg-accent-50/30 rounded-r-xl p-6">
                <div className="flex flex-col gap-1">
                  {["NexusOS", "Genesis Platform", "GuardianOS", "SpendShield AI", "Empire AI", "+ 4 more"].map((name, i) => (
                    <div key={name} className="flex items-center gap-2 text-sm text-neutral-600">
                      <CheckIcon />
                      <span>{name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── How It Works ─── */
function HowItWorks() {
  const steps = [
    { number: 1, title: "Browse & discover", description: "Search or explore by category to find complete AI business systems with detailed workflows and architecture." },
    { number: 2, title: "See before you buy", description: "Watch a real demo, check all included features, and read reviews from verified buyers." },
    { number: 3, title: "Instant access", description: "Check out with Stripe and download immediately. Your account is created automatically with full purchase history." },
  ];

  return (
    <section className="bg-neutral-50">
      <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">How It Works</p>
          <h2 className="mt-2 text-3xl font-bold text-neutral-800">Three steps to your next AI business</h2>
          <p className="mt-3 text-base text-neutral-600">No mystery boxes. No surprise subscriptions. Just transparent buying.</p>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          {steps.map((step) => (
            <div key={step.number} className="rounded-xl border border-neutral-200 bg-white p-6 transition-shadow duration-200 hover:shadow-sm">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-sm font-bold text-brand-600">{step.number}</div>
              <h3 className="text-lg font-semibold text-neutral-800">{step.title}</h3>
              <p className="mt-2 text-base leading-relaxed text-neutral-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Category Browse ─── */
function CategoryBrowse() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">Categories</p>
          <h2 className="mt-2 text-3xl font-bold text-neutral-800">Browse by category</h2>
          <p className="mt-3 text-base text-neutral-600">Find exactly what you need — every product is organized by type.</p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((cat) => {
            const Icon = typeIcons[cat.icon] ?? BoxIcon;
            return (
              <Link
                key={cat.slug}
                to="/products"
                search={{ category: cat.slug }}
                className="group flex items-start gap-4 rounded-xl border border-neutral-200 bg-white p-5 transition-all duration-200 hover:border-brand-200 hover:shadow-sm hover:-translate-y-0.5"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 transition-colors group-hover:bg-brand-100">
                  <Icon />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-neutral-800 transition-colors group-hover:text-brand-600">{cat.name}</h3>
                  <p className="mt-1 text-base text-neutral-600">{cat.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── Reviews Section ─── */
function ReviewsSection() {
  return (
    <section className="bg-neutral-50">
      <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">Testimonials</p>
          <h2 className="mt-2 text-3xl font-bold text-neutral-800">What buyers say</h2>
          <p className="mt-3 text-base text-neutral-600">Honest feedback from founders and executives who purchased through PrismBay.</p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {REVIEWS.map((review) => (
            <div key={review.author} className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md">
              <div className="mb-4 flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <StarIcon key={i} filled={true} />
                ))}
              </div>
              <blockquote className="text-base leading-relaxed text-neutral-600">&ldquo;{review.quote}&rdquo;</blockquote>
              <div className="mt-5 flex items-center gap-3 border-t border-neutral-100 pt-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">{review.initials}</div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-neutral-800 truncate">{review.author}</p>
                  <p className="text-xs text-neutral-400">{review.role} · on {review.product}</p>
                </div>
                <div className="ml-auto flex shrink-0 items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700">
                  <VerifiedBadgeIcon />
                  Verified Buyer
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Final CTA (P2 — navy background) ─── */
function FinalCTA() {
  return (
    <section className="bg-navy-900">
      <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Ready to build smarter?</h2>
          <p className="mt-4 text-lg text-neutral-300">Browse the marketplace, watch demos, and find the AI business system that fits your vision.</p>
          <div className="mt-8">
            <Link
              to="/products"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-8 py-4 text-lg font-semibold text-white shadow-sm transition-all duration-200 hover:bg-brand-600 hover:shadow-md hover:-translate-y-px active:bg-brand-700 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900"
            >
              Browse all products
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M4 10h12m0 0l-5-5m5 5l-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
          <p className="mt-4 text-sm text-neutral-400">
            Launch pricing ends August 27, 2026. After that, regular prices apply. <CountdownTimer variant="compact" />
          </p>
        </div>
      </div>
    </section>
  );
}

/* ─── Footer (P2 — navy background) ─── */
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
            <h4 className="mb-4 text-sm font-semibold text-neutral-100">Categories</h4>
            <ul className="space-y-2">
              {CATEGORIES.map((cat) => (
                <li key={cat.slug}>
                  <Link to="/products" search={{ category: cat.slug }} className="text-sm text-neutral-300 transition-colors hover:text-white">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold text-neutral-100">Company</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-sm text-neutral-300 transition-colors hover:text-white">About</Link></li>
              <li><Link to="/how-it-works" className="text-sm text-neutral-300 transition-colors hover:text-white">How It Works</Link></li>
              <li><Link to="/contact" className="text-sm text-neutral-300 transition-colors hover:text-white">Contact</Link></li>
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
        </div>

        <div className="mt-12 border-t border-navy-700 pt-8">
          <p className="text-xs text-neutral-500">&copy; PrismBay 2026. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

/* ─── Home ─── */
function Home() {
  return (
    <div className="min-h-screen bg-white">
      <AnnouncementBar />
      <Navbar />
      <HeroSection />
      <TrustPanel />
      <FeaturedProducts />
      <HowItWorks />
      <CategoryBrowse />
      <ReviewsSection />
      <FinalCTA />
      <Footer />
    </div>
  );
}
