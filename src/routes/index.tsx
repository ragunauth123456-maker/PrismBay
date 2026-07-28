import { createFileRoute, Link } from "@tanstack/react-router";
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
  { slug: "ai-business-systems", name: "AI Business Systems", description: "Complete AI operating systems, workforce platforms, and command centres", icon: "cog" },
  { slug: "ai-development", name: "AI Development", description: "App builders, agent platforms, and no-code AI creation tools", icon: "box" },
  { slug: "trust-compliance", name: "Trust & Compliance", description: "Verification, procurement intelligence, and compliance evidence systems", icon: "file" },
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

/* ─── Navbar ─── */
function Navbar() {
  return (
    <header className="sticky top-0 z-50 h-16 border-b border-neutral-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6">
        <LogoHorizontal />
        <nav className="hidden items-center gap-8 lg:flex">
          <Link to="/products" className="text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900">
            Products
          </Link>
          <Link to="/products" search={{ category: "bundles" }} className="text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900">
            Bundles
          </Link>
        </nav>
        <div className="flex items-center gap-5">
          <Link to="/sign-in" className="text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900">
            Sign In
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ─── Hero Section ─── */
function HeroSection() {
  return (
    <section className="bg-neutral-50">
      <div className="mx-auto max-w-6xl px-6 pb-20 pt-20 sm:pt-28 sm:pb-24">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-neutral-800 sm:text-5xl lg:text-6xl">
            Build Smarter AI Businesses Without Starting From Zero
          </h1>
          <p className="mt-6 text-lg text-neutral-500 sm:text-xl">
            Complete AI business systems with detailed workflows, architecture, revenue models, and implementation plans. Every product has a demo, clear launch pricing, and real reviews.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              to="/products"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-8 py-4 text-lg font-semibold text-white shadow-sm transition-all duration-200 hover:bg-brand-600 hover:shadow-md hover:-translate-y-px active:bg-brand-700 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30 focus-visible:ring-offset-2"
            >
              Browse products
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M4 10h12m0 0l-5-5m5 5l-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <Link
              to="/how-it-works"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-neutral-100 px-8 py-4 text-lg font-semibold text-neutral-700 transition-all duration-200 hover:bg-neutral-200 active:bg-neutral-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30 focus-visible:ring-offset-2"
            >
              How it works
            </Link>
          </div>
          <div className="mt-6 flex flex-col items-center gap-2">
            <p className="text-xs font-medium text-neutral-500">30-Day Launch Offer — Save up to 29%</p>
            <CountdownTimer variant="banner" />
            <p className="text-xs text-neutral-400">Launch pricing ends August 27, 2026</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Featured Products Section ─── */
function FeaturedProducts() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">Marketplace</p>
          <h2 className="mt-2 text-3xl font-bold text-neutral-800">Featured products</h2>
          <p className="mt-3 text-lg text-neutral-500">Complete AI business systems our buyers are investing in right now.</p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURED.map((product) => {
            const Icon = typeIcons[product.typeIcon] ?? CogIcon;
            const gradient = typeGradients[product.category] ?? "from-neutral-50 to-neutral-100";
            return (
              <Link
                key={product.slug}
                to={`/products/${product.slug}`}
                className="group cursor-pointer rounded-xl border border-neutral-200 bg-white p-0 transition-all duration-200 hover:border-brand-200 hover:shadow-md hover:-translate-y-0.5"
              >
                <div className={`relative flex aspect-[16/10] items-center justify-center rounded-t-xl bg-gradient-to-br ${gradient}`}>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/80 shadow-sm">
                    <Icon />
                  </div>
                  <div className="absolute top-3 left-3 rounded-lg bg-white/90 px-2 py-0.5 text-xs font-medium text-neutral-600 shadow-sm">
                    {product.category}
                  </div>
                  <div className="absolute top-3 right-3 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                    Save {product.discountPercent}%
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-base font-semibold text-neutral-800">{product.name}</h3>
                  <p className="mt-1 text-sm text-neutral-500 truncate">{product.tagline}</p>
                  <div className="mt-2">
                    <StarRating rating={product.rating} count={product.reviewCount} />
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold text-brand-600">${product.launchPrice}</span>
                      <span className="text-sm text-neutral-400 line-through">${product.regularPrice}</span>
                    </div>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-100">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path d="M3 8h10m0 0L9 4m4 4l-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
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
      <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">How It Works</p>
          <h2 className="mt-2 text-3xl font-bold text-neutral-800">Three steps to your next AI business</h2>
          <p className="mt-3 text-lg text-neutral-500">No mystery boxes. No surprise subscriptions. Just transparent buying.</p>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          {steps.map((step) => (
            <div key={step.number} className="rounded-xl border border-neutral-200 bg-white p-6 transition-shadow duration-200 hover:shadow-sm">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-sm font-bold text-brand-600">{step.number}</div>
              <h3 className="text-lg font-semibold text-neutral-800">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-500">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Trust Bar ─── */
function TrustBar() {
  const items = ["Secure checkout via Stripe", "Instant delivery after purchase", "Verified reviews from real buyers", "Clear licence terms included"];

  return (
    <section className="border-y border-neutral-200 bg-brand-50/50">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {items.map((item) => (
            <div key={item} className="flex items-center gap-1.5">
              <CheckIcon />
              <span className="text-sm font-medium text-brand-700">{item}</span>
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
      <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">Categories</p>
          <h2 className="mt-2 text-3xl font-bold text-neutral-800">Browse by category</h2>
          <p className="mt-3 text-lg text-neutral-500">Find exactly what you need — every product is organized by type.</p>
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
                  <p className="mt-1 text-sm text-neutral-500">{cat.description}</p>
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
      <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">Testimonials</p>
          <h2 className="mt-2 text-3xl font-bold text-neutral-800">What buyers say</h2>
          <p className="mt-3 text-lg text-neutral-500">Honest feedback from founders and executives who purchased through PrismBay.</p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {REVIEWS.map((review) => (
            <div key={review.author} className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md">
              <div className="mb-4 flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <StarIcon key={i} filled={true} />
                ))}
              </div>
              <blockquote className="text-sm leading-relaxed text-neutral-600">&ldquo;{review.quote}&rdquo;</blockquote>
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

/* ─── Final CTA ─── */
function FinalCTA() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-neutral-800 sm:text-4xl">Ready to build smarter?</h2>
          <p className="mt-4 text-lg text-neutral-500">Browse the marketplace, watch demos, and find the AI business system that fits your vision.</p>
          <div className="mt-8">
            <Link
              to="/products"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-8 py-4 text-lg font-semibold text-white shadow-sm transition-all duration-200 hover:bg-brand-600 hover:shadow-md hover:-translate-y-px active:bg-brand-700 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30 focus-visible:ring-offset-2"
            >
              Browse all products
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M4 10h12m0 0l-5-5m5 5l-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
          <p className="mt-4 text-xs text-neutral-400">
            Launch pricing ends August 27, 2026. After that, regular prices apply. <CountdownTimer variant="compact" />
          </p>
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ─── */
function Footer() {
  return (
    <footer className="bg-neutral-900">
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
          <p className="mt-3 text-sm text-neutral-400">Complete AI business systems. Instant access.</p>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          <div>
            <h4 className="mb-4 text-sm font-semibold text-neutral-100">Categories</h4>
            <ul className="space-y-2">
              {CATEGORIES.map((cat) => (
                <li key={cat.slug}>
                  <Link to="/products" search={{ category: cat.slug }} className="text-sm text-neutral-400 transition-colors hover:text-white">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold text-neutral-100">Company</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-sm text-neutral-400 transition-colors hover:text-white">About</Link></li>
              <li><Link to="/how-it-works" className="text-sm text-neutral-400 transition-colors hover:text-white">How It Works</Link></li>
              <li><Link to="/contact" className="text-sm text-neutral-400 transition-colors hover:text-white">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold text-neutral-100">Legal</h4>
            <ul className="space-y-2">
              <li><Link to="/terms" className="text-sm text-neutral-400 transition-colors hover:text-white">Terms</Link></li>
              <li><Link to="/privacy" className="text-sm text-neutral-400 transition-colors hover:text-white">Privacy</Link></li>
              <li><Link to="/cookies" className="text-sm text-neutral-400 transition-colors hover:text-white">Cookies</Link></li>
              <li><Link to="/refunds" className="text-sm text-neutral-400 transition-colors hover:text-white">Refunds</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-neutral-800 pt-8">
          <p className="text-xs text-neutral-500">&copy; PrismBay 2026. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

/* ─── Home ─── */
function Home() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      <HeroSection />
      <FeaturedProducts />
      <HowItWorks />
      <TrustBar />
      <CategoryBrowse />
      <ReviewsSection />
      <FinalCTA />
      <Footer />
    </div>
  );
}
