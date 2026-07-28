import { createFileRoute, Link } from "@tanstack/react-router";
import { COMPARISONS, type ComparisonConfig } from "~/data/comparisons";
import { getProductBySlug, PRODUCTS } from "~/data/products";

export const Route = createFileRoute("/compare/")({
  head: () => ({
    meta: [
      { title: "Compare AI Business Systems — PrismBay" },
      { name: "description", content: "Compare PrismBay AI business systems side by side. See features, pricing, and find the right system for your organization. 7 detailed comparisons available." },
      { property: "og:title", content: "Compare AI Business Systems — PrismBay" },
      { property: "og:description", content: "Compare PrismBay AI business systems side by side. See features, pricing, and find the right system for your organization." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://prismbay.com/compare" },
    ],
    links: [
      { rel: "canonical", href: "https://prismbay.com/compare" },
    ],
  }),
  component: CompareIndexPage,
});

/* ─── Inline SVG Icons ─── */
function CompareIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="2" y="3" width="7" height="6" rx="1.5" stroke="#16B3A7" strokeWidth="1.5" />
      <rect x="11" y="11" width="7" height="6" rx="1.5" stroke="#F59E0B" strokeWidth="1.5" />
      <path d="M5.5 9v2m9-9v2" stroke="#9F9E99" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ─── Helpers ─── */
function getComparisonProducts(config: ComparisonConfig) {
  return config.productSlugs.map((s) => getProductBySlug(s)).filter(Boolean);
}

/* ─── Navbar ─── */
function Navbar() {
  return (
    <header className="sticky top-0 z-50 h-16 border-b border-neutral-200 bg-white/90 backdrop-blur-md">
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
                <tspan fill="#282724">Bay</tspan>
              </text>
            </g>
          </svg>
        </Link>
        <nav className="hidden items-center gap-8 lg:flex">
          <Link to="/products" className="text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900">Products</Link>
          <Link to="/products" search={{ category: "bundles" }} className="text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900">Bundles</Link>
          <Link to="/compare" className="text-sm font-semibold text-brand-600">Compare</Link>
        </nav>
        <div className="flex items-center gap-5">
          <Link to="/sign-in" className="text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900">Sign In</Link>
        </div>
      </div>
    </header>
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
          <div><h4 className="mb-4 text-sm font-semibold text-neutral-100">Categories</h4><ul className="space-y-2"><li><Link to="/products" search={{ category: "ai-business-systems" }} className="text-sm text-neutral-400 transition-colors hover:text-white">AI Business Systems</Link></li><li><Link to="/products" search={{ category: "ai-development" }} className="text-sm text-neutral-400 transition-colors hover:text-white">AI Development</Link></li><li><Link to="/products" search={{ category: "trust-compliance" }} className="text-sm text-neutral-400 transition-colors hover:text-white">Trust & Compliance</Link></li></ul></div>
          <div><h4 className="mb-4 text-sm font-semibold text-neutral-100">Company</h4><ul className="space-y-2"><li><Link to="/about" className="text-sm text-neutral-400 transition-colors hover:text-white">About</Link></li><li><Link to="/how-it-works" className="text-sm text-neutral-400 transition-colors hover:text-white">How It Works</Link></li><li><Link to="/compare" className="text-sm text-neutral-400 transition-colors hover:text-white">Compare Products</Link></li><li><Link to="/contact" className="text-sm text-neutral-400 transition-colors hover:text-white">Contact</Link></li></ul></div>
          <div><h4 className="mb-4 text-sm font-semibold text-neutral-100">Legal</h4><ul className="space-y-2"><li><Link to="/terms" className="text-sm text-neutral-400 transition-colors hover:text-white">Terms</Link></li><li><Link to="/privacy" className="text-sm text-neutral-400 transition-colors hover:text-white">Privacy</Link></li><li><Link to="/cookies" className="text-sm text-neutral-400 transition-colors hover:text-white">Cookies</Link></li><li><Link to="/refunds" className="text-sm text-neutral-400 transition-colors hover:text-white">Refunds</Link></li></ul></div>
        </div>
        <div className="mt-10 border-t border-neutral-800 pt-8 text-sm text-neutral-500 text-center">
          © 2026 PrismBay. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

function CompareIndexPage() {
  return (
    <div>
      <Navbar />

      {/* Hero */}
      <section className="bg-navy-900">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:py-20">
          <h1 className="text-3xl font-bold text-white lg:text-4xl">
            Compare AI Business Systems
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-navy-200">
            Side-by-side comparisons to help you find the right system for your organization.
            Decision-first, not feature-first.
          </p>
        </div>
      </section>

      {/* Comparison Cards */}
      <section className="bg-neutral-50">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {COMPARISONS.map((comp) => {
              const products = getComparisonProducts(comp);
              const isThreeWay = comp.productSlugs.length === 3;
              return (
                <Link
                  key={comp.slug}
                  to={`/compare/${comp.slug}`}
                  className="group flex flex-col rounded-xl border border-neutral-200 bg-white p-6 transition-all duration-200 hover:border-brand-200 hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <CompareIcon />
                    <span className="text-xs font-semibold uppercase tracking-wider text-brand-600">
                      {isThreeWay ? "3-Way Comparison" : "Head to Head"}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-neutral-800 group-hover:text-brand-700 transition-colors">
                    {comp.title}
                  </h2>
                  <p className="mt-2 text-sm text-neutral-500 leading-relaxed flex-1">
                    {comp.oneLiner}
                  </p>
                  <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-brand-600">
                    View comparison
                    <ArrowRightIcon />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Browse all products */}
      <section className="bg-white">
        <div className="mx-auto max-w-3xl px-6 py-14 text-center">
          <h2 className="text-2xl font-bold text-neutral-800">Not sure where to start?</h2>
          <p className="mt-2 text-neutral-500">
            Browse the full product catalog or explore bundles for the best value.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/products"
              className="rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
            >
              Browse all products
            </Link>
            <Link
              to="/products"
              search={{ category: "bundles" }}
              className="rounded-lg border border-neutral-200 bg-white px-6 py-2.5 text-sm font-semibold text-neutral-700 transition-all hover:border-brand-200 hover:text-brand-600"
            >
              View bundles
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
