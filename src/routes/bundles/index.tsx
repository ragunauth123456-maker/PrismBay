import { createFileRoute, Link } from "@tanstack/react-router";
import { BUNDLES } from "~/data/products";
import CountdownTimer from "~/components/CountdownTimer";
import Navbar from '~/components/Navbar';
import Footer from '~/components/Footer';
import { twitterMeta } from '~/utils/seo';

export const Route = createFileRoute("/bundles/")({
  head: () => ({
    meta: [
      { title: "AI Business System Bundles — Save Up to $1,542 | PrismBay" },
      { name: "description", content: "Save big with PrismBay bundles. Get multiple complete AI business systems at a discount — each includes workflows, architecture, revenue models, and implementation plans." },
      { property: "og:title", content: "AI Business System Bundles — Save Up to $1,542 | PrismBay" },
      { property: "og:description", content: "Save big with PrismBay bundles. Get multiple complete AI business systems at a discount — each includes workflows, architecture, revenue models, and implementation plans." },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://www.prismbayai.com/images/og-default.png" },
      { property: "og:url", content: "https://www.prismbayai.com/bundles" },
      ...twitterMeta("AI Business System Bundles — Save Up to $1,542 | PrismBay", "Save big with PrismBay bundles. Get multiple complete AI business systems at a discount — each includes workflows, architecture, revenue models, and implementation plans."),
    ],
    links: [
      { rel: "canonical", href: "https://www.prismbayai.com/bundles" },
    ],
    scripts: [
      {
        tag: "script" as const,
        attrs: { type: "application/ld+json" },
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://www.prismbayai.com" },
            { "@type": "ListItem", position: 2, name: "Bundles", item: "https://www.prismbayai.com/bundles" },
          ],
        }),
      },
    ],
  }),
  component: BundlesPage,
});

/* ─── Icons ─── */
function ArrowRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8h10m0 0L9 4m4 4l-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
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

function StackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M2 12l8 4 8-4M2 8l8 4 8-4M10 2L2 6l8 4 8-4-8-4z" stroke="#16B3A7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ─── Bundle Listing Page ─── */
function BundlesPage() {
  const maxSaving = Math.max(...BUNDLES.map((b) => b.saving));

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      {/* Hero Section */}
      <section className="bg-navy-900 border-b border-navy-700">
        <div className="mx-auto max-w-7xl px-6 py-14 lg:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-block rounded-full bg-navy-800 px-3 py-1 text-xs font-semibold text-brand-300 mb-4">Bundles</span>
            <h1 className="text-3xl font-bold tracking-tight text-white lg:text-4xl">Complete AI Business Bundles</h1>
            <p className="mt-4 text-lg text-neutral-300">
              Save up to <span className="font-semibold text-amber-300">${maxSaving.toLocaleString()}</span> by purchasing multiple complete AI business systems together. Each bundle includes full blueprints with detailed workflows, technical architecture, revenue models, implementation plans, and commercial launch guidance.
            </p>
            <div className="mt-6 flex justify-center">
              <CountdownTimer variant="hero" />
            </div>
          </div>
        </div>
      </section>
      {/* Why Bundle */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-5">
              <div className="flex-shrink-0 mt-0.5"><StackIcon /></div>
              <div>
                <h3 className="text-sm font-semibold text-neutral-800">Buy More, Save More</h3>
                <p className="mt-1 text-sm text-neutral-500">Bundle pricing saves you up to 36% compared to individual purchases.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-5">
              <div className="flex-shrink-0 mt-0.5"><DownloadIcon /></div>
              <div>
                <h3 className="text-sm font-semibold text-neutral-800">Instant Delivery</h3>
                <p className="mt-1 text-sm text-neutral-500">All products delivered immediately after purchase via your account dashboard.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-5">
              <div className="flex-shrink-0 mt-0.5"><ShieldIcon /></div>
              <div>
                <h3 className="text-sm font-semibold text-neutral-800">Single Licence</h3>
                <p className="mt-1 text-sm text-neutral-500">One licence covers all bundled products for your business.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Bundle Grid */}
      <section className="bg-neutral-50">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <h2 className="text-2xl font-bold text-neutral-800 text-center">
            {BUNDLES.length} Bundles Available
          </h2>
          <p className="mt-2 text-neutral-500 text-center">Choose the bundle that fits your business needs.</p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {BUNDLES.map((bundle) => (
              <Link
                key={bundle.slug}
                to={`/bundles/${bundle.slug}`}
                className="group cursor-pointer rounded-xl border-2 border-amber-200 bg-amber-50/30 p-0 transition-all duration-200 hover:border-amber-300 hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="relative flex aspect-[16/10] items-center justify-center rounded-t-xl bg-gradient-to-br from-amber-50 via-amber-100/50 to-brand-50">
                  <img
                    src={`/images/products/${bundle.slug}.png`}
                    alt={`${bundle.name} bundle collection`}
                    className="h-full w-full object-cover rounded-t-xl"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3 rounded-lg bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                    Bundle
                  </div>
                  <div className="absolute top-3 right-3 rounded-full bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-700">
                    Save ${bundle.saving.toLocaleString()}
                  </div>
                  <div className="absolute bottom-3 left-3 rounded-lg bg-amber-50/90 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                    30-day launch offer
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-base font-semibold text-neutral-800 group-hover:text-brand-600 transition-colors">{bundle.name}</h3>
                  <p className="mt-1 text-sm text-neutral-600 line-clamp-2">{bundle.description}</p>
                  <p className="mt-2 text-xs text-neutral-400">
                    Includes: {bundle.productNames.join(", ")}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold text-brand-600">${bundle.launchPrice.toLocaleString()}</span>
                      <span className="text-sm text-neutral-400 line-through">${bundle.regularCombined.toLocaleString()}</span>
                    </div>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-100">
                      <ArrowRightIcon />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      {/* Comparison Table */}
      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-6 py-14">
          <h2 className="text-2xl font-bold text-neutral-800 text-center">Bundle Comparison</h2>
          <p className="mt-2 text-neutral-500 text-center">Find the right bundle for your needs.</p>
          <div className="mt-8 overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-neutral-200">
                  <th className="text-left py-3 px-4 font-semibold text-neutral-700">Bundle</th>
                  <th className="text-center py-3 px-4 font-semibold text-neutral-700">Products</th>
                  <th className="text-right py-3 px-4 font-semibold text-neutral-700">Regular Price</th>
                  <th className="text-right py-3 px-4 font-semibold text-neutral-700">Launch Price</th>
                  <th className="text-right py-3 px-4 font-semibold text-neutral-700">You Save</th>
                  <th className="py-3 px-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {BUNDLES.map((bundle) => (
                  <tr key={bundle.slug} className="hover:bg-neutral-50 transition-colors">
                    <td className="py-3 px-4">
                      <Link to={`/bundles/${bundle.slug}`} className="font-semibold text-neutral-800 hover:text-brand-600 transition-colors">
                        {bundle.name}
                      </Link>
                    </td>
                    <td className="text-center py-3 px-4 text-neutral-600">{bundle.productSlugs.length}</td>
                    <td className="text-right py-3 px-4 text-neutral-400 line-through">${bundle.regularCombined.toLocaleString()}</td>
                    <td className="text-right py-3 px-4 font-bold text-brand-600">${bundle.launchPrice.toLocaleString()}</td>
                    <td className="text-right py-3 px-4 font-semibold text-amber-600">${bundle.saving.toLocaleString()}</td>
                    <td className="text-right py-3 px-4">
                      <Link
                        to={`/bundles/${bundle.slug}`}
                        className="inline-flex items-center gap-1 rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-600 transition-colors hover:bg-brand-100"
                      >
                        View <ArrowRightIcon />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
      {/* Bottom CTA */}
      <section className="bg-navy-900">
        <div className="mx-auto max-w-3xl px-6 py-14 text-center">
          <h2 className="text-2xl font-bold text-white">Ready to build smarter?</h2>
          <p className="mt-2 text-neutral-300">Get multiple AI business systems at the 30-day launch price. Instant access after purchase.</p>
          <Link
            to="/products"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-8 py-4 text-lg font-semibold text-white shadow-sm transition-all duration-200 hover:bg-brand-600 hover:shadow-md hover:-translate-y-px"
          >
            Browse All Products
          </Link>
        </div>
      </section>
      <Footer />
    </div>
  );
}
