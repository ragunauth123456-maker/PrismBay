import { createFileRoute, Link } from "@tanstack/react-router";
import { getAllDemos } from "~/data/demos";
import { getProductBySlug } from "~/data/products";

export const Route = createFileRoute("/demo/")({
  head: () => ({
    meta: [
      { title: "Product Demos — Guided Walkthroughs | PrismBay" },
      {
        name: "description",
        content:
          "Interactive guided tours for all 9 PrismBay AI business systems. Step-by-step walkthroughs covering features, architecture, and pricing for each product.",
      },
      {
        property: "og:title",
        content: "Product Demos — Guided Walkthroughs | PrismBay",
      },
      {
        property: "og:description",
        content:
          "Interactive guided tours for all 9 PrismBay AI business systems. Step-by-step walkthroughs covering features, architecture, and pricing for each product.",
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://prismbay.com/images/og-default.png" },
      { property: "og:url", content: "https://prismbay.com/demo" },
    ],
    links: [{ rel: "canonical", href: "https://prismbay.com/demo" }],
  }),
  component: DemoIndexPage,
});

/* ─── Category icons ─── */

function DemoPlayIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="10" cy="10" r="9" stroke="#16B3A7" strokeWidth="1.5" />
      <path
        d="M8 6.5l5 3.5-5 3.5V6.5z"
        fill="#16B3A7"
        stroke="#16B3A7"
        strokeWidth="0.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 8h10M9 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="7" cy="7" r="5.5" stroke="#9F9E99" strokeWidth="1.2" />
      <path d="M7 4.5V7l2 1.5" stroke="#9F9E99" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Navbar() {
  return (
    <header className="sticky top-0 z-50 h-16 border-b border-neutral-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-navy-900">
          <span className="text-brand-500">◆</span> PrismBay
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium text-neutral-600">
          <Link to="/products" className="hover:text-brand-600 transition-colors">
            Products
          </Link>
          <Link to="/compare" className="hover:text-brand-600 transition-colors">
            Compare
          </Link>
          <Link to="/demo" className="text-brand-600 hover:text-brand-700 transition-colors">
            Demos
          </Link>
          <Link to="/resources" className="hover:text-brand-600 transition-colors">
            Resources
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default function DemoIndexPage() {
  const demos = getAllDemos();

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {/* Hero */}
        <section className="bg-navy-900 text-white">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-400 mb-3">
              Interactive Walkthroughs
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              Product Demos
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-neutral-300 leading-relaxed">
              Step-by-step guided tours for every PrismBay AI business system.
              See what's included, how it works, and who it's for — in about
              three minutes per product.
            </p>
          </div>
        </section>

        {/* Demo Grid */}
        <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {demos.map((demo) => {
              const product = getProductBySlug(demo.productSlug);
              const stepCount = demo.totalSteps;
              return (
                <Link
                  key={demo.productSlug}
                  to="/demo/$slug"
                  params={{ slug: demo.productSlug }}
                  className="group block rounded-xl border border-neutral-200 bg-white p-6 transition-all hover:border-brand-300 hover:shadow-lg hover:-translate-y-0.5"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center">
                      <DemoPlayIcon />
                    </div>
                    <div className="flex items-center gap-1 text-xs text-neutral-400">
                      <ClockIcon />
                      <span>{stepCount} steps</span>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-navy-900 group-hover:text-brand-600 transition-colors">
                    {demo.productName}
                  </h3>

                  {product && (
                    <p className="mt-1 text-sm text-neutral-500">
                      {product.tagline}
                    </p>
                  )}

                  <p className="mt-3 text-sm text-neutral-600 leading-relaxed line-clamp-2">
                    {demo.steps[0]?.narration}
                  </p>

                  <div className="mt-4 flex items-center gap-2">
                    {product && (
                      <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">
                        {product.launchPrice ? `$${product.launchPrice}` : ""}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 group-hover:gap-2 transition-all">
                      View demo <ArrowRightIcon />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* CTA footer */}
          <div className="mt-16 text-center rounded-2xl bg-navy-50 border border-navy-100 p-10">
            <h2 className="text-xl font-bold text-navy-900">
              Ready to build?
            </h2>
            <p className="mt-2 text-sm text-neutral-600 max-w-md mx-auto">
              After exploring the demos, browse all products and find the right
              AI business system for your organization.
            </p>
            <Link
              to="/products"
              search={{ category: "all" }}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-brand-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-600 hover:shadow-md"
            >
              Browse All Products <ArrowRightIcon />
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
