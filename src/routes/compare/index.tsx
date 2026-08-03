import { createFileRoute, Link } from "@tanstack/react-router";
import { COMPARISONS, type ComparisonConfig } from "~/data/comparisons";
import { getProductBySlug, PRODUCTS } from "~/data/products";
import Navbar from '~/components/Navbar';
import Footer from '~/components/Footer';
import { breadcrumbListScript, twitterMeta } from "~/utils/seo";

export const Route = createFileRoute("/compare/")({
  head: () => ({
    meta: [
      { title: "Compare AI Business Systems — PrismBay" },
      { name: "description", content: "Compare PrismBay AI business systems side by side. See features, pricing, and find the right system for your organization. 13 detailed comparisons available." },
      { property: "og:title", content: "Compare AI Business Systems — PrismBay" },
      { property: "og:description", content: "Compare PrismBay AI business systems side by side. See features, pricing, and find the right system for your organization." },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://www.prismbayai.com/images/og-default.png" },
      { property: "og:url", content: "https://www.prismbayai.com/compare" },
      ...twitterMeta("Compare AI Business Systems — PrismBay", "Compare PrismBay AI business systems side by side. See features, pricing, and find the right system for your organization."),
    ],
    links: [
      { rel: "canonical", href: "https://www.prismbayai.com/compare" },
    ],
    scripts: [
      breadcrumbListScript([
        { name: "Home", url: "https://www.prismbayai.com" },
        { name: "Compare", url: "https://www.prismbayai.com/compare" },
      ]),
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
              to="/bundles"
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
