import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { COMPARISONS, getComparisonBySlug } from "~/data/comparisons";
import { getProductBySlug } from "~/data/products";
import ComparisonContent from "~/components/ComparisonTable";

export const Route = createFileRoute("/compare/$slug")({
  loader: ({ params }) => {
    const comparison = getComparisonBySlug(params.slug);
    if (!comparison) throw notFound();
    return { comparison };
  },
  head: ({ loaderData }) => {
    const { comparison } = loaderData;
    const title = `${comparison.title} — Comparison | PrismBay`;
    const products = comparison.productSlugs
      .map((s) => getProductBySlug(s))
      .filter(Boolean);
    const canonicalUrl = `https://prismbay.com/compare/${comparison.slug}`;

    return {
      meta: [
        { title },
        { name: "description", content: comparison.seoDescription },
        { property: "og:title", content: title },
        { property: "og:description", content: comparison.seoDescription },
        { property: "og:type", content: "website" },
        { property: "og:url", content: canonicalUrl },
      ],
      links: [
        { rel: "canonical", href: canonicalUrl },
      ],
    };
  },
  component: ComparePage,
  notFoundComponent: CompareNotFound,
});

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

function CompareNotFound() {
  return (
    <div>
      <Navbar />
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h1 className="text-2xl font-bold text-neutral-800">Comparison not found</h1>
        <p className="mt-4 text-neutral-500">
          This comparison doesn't exist. Browse available comparisons below.
        </p>
        <Link to="/compare" className="mt-6 inline-block rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600">
          See all comparisons
        </Link>
      </div>
      <Footer />
    </div>
  );
}

function ComparePage() {
  const { comparison } = Route.useLoaderData();

  return (
    <div>
      <Navbar />
      <ComparisonContent config={comparison} />
      <Footer />
    </div>
  );
}
