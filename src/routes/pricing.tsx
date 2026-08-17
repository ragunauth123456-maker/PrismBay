import { createFileRoute, Link } from "@tanstack/react-router";
import { PRODUCTS, BUNDLES, calculateLaunchDeadline } from "~/data/products";
import Navbar from "~/components/Navbar";
import Footer from "~/components/Footer";

/* ─── Sort helpers ─── */
const sortedProducts = [...PRODUCTS].sort(
  (a, b) => a.launchPrice - b.launchPrice
);
const sortedBundles = [...BUNDLES].sort(
  (a, b) => a.launchPrice - b.launchPrice
);

/* ─── Route ─── */
export const Route = createFileRoute("/pricing")({
  head: () => {
    const metaTitle = "Pricing — PrismBay";
    const metaDesc =
      "Complete pricing for all 9 AI business system blueprints and 3 bundles. Launch pricing available through August 27, 2026. Secure Stripe checkout.";

    // Build JSON-LD Product schemas for each product
    const priceValidUntil = "2026-08-27";
    const productSchemas = sortedProducts.map((p) => ({
      "@context": "https://schema.org",
      "@type": "Product",
      name: p.name,
      description: p.description,
      sku: p.slug,
      brand: { "@type": "Brand", name: "PrismBay" },
      image: `https://www.prismbayai.com/images/products/${p.slug}.png`,
      offers: {
        "@type": "Offer",
        price: p.launchPrice.toFixed(2),
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url: `https://www.prismbayai.com/products/${p.slug}`,
        priceValidUntil,
      },
    }));

    const jsonLdScripts = [
      // BreadcrumbList
      {
        tag: "script" as const,
        attrs: { type: "application/ld+json" },
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: "https://www.prismbayai.com",
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Pricing",
              item: "https://www.prismbayai.com/pricing",
            },
          ],
        }),
      },
      // Product schemas (combined into one script for cleanliness)
      ...productSchemas.map((schema) => ({
        tag: "script" as const,
        attrs: { type: "application/ld+json" },
        children: JSON.stringify(schema),
      })),
    ];

    return {
      meta: [
        { title: metaTitle },
        { name: "description", content: metaDesc },
        { property: "og:title", content: metaTitle },
        { property: "og:description", content: metaDesc },
        { property: "og:type", content: "website" },
        {
          property: "og:image",
          content: "https://www.prismbayai.com/images/og-default.png",
        },
        { property: "og:url", content: "https://www.prismbayai.com/pricing" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: metaTitle },
        { name: "twitter:description", content: metaDesc },
        { name: "twitter:image", content: "https://www.prismbayai.com/images/og-default.png" },
      ],
      links: [
        { rel: "canonical", href: "https://www.prismbayai.com/pricing" },
      ],
      scripts: jsonLdScripts,
    };
  },
  component: PricingPage,
});

/* ─── Icons ─── */
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
        d="M3 8h10m0 0L9 4m4 4l-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 8.5l3 3 7-7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M8 1.5S3.5 3.5 3.5 6v4L8 14.5 12.5 10V6C12.5 3.5 8 1.5 8 1.5z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ─── Page Component ─── */
function PricingPage() {
  const deadline = calculateLaunchDeadline();

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <Navbar />

      {/* ── Hero ── */}
      <section className="bg-white border-b border-neutral-200">
        <div className="mx-auto max-w-7xl px-6 py-16 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-600 mb-4">
              Launch Pricing
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-neutral-900 md:text-5xl">
              PrismBay Pricing
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-neutral-600">
              30-day launch pricing. Every product includes the complete AI
              business system blueprint — architecture, workflows, revenue
              model, implementation guide, demo video, and 30 days of support.
            </p>
            <p className="mt-3 text-sm text-neutral-500">
              Launch pricing valid through{" "}
              <span className="font-semibold text-neutral-700">{deadline}</span>
              . Regular pricing applies after.
            </p>
          </div>
        </div>
      </section>

      {/* ── Individual Products ── */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12">
            <h2 className="text-2xl font-bold tracking-tight text-neutral-900 md:text-3xl">
              Individual AI Business Systems
            </h2>
            <p className="mt-3 text-neutral-600">
              9 complete blueprints — buy individual systems or save with a
              bundle.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sortedProducts.map((product) => (
              <div
                key={product.slug}
                className="group relative flex flex-col rounded-xl border border-neutral-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                {/* Savings badge */}
                <div className="absolute -top-3 right-4 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 border border-brand-200">
                  Save {product.discountPercent}%
                </div>

                {/* Product name */}
                <h3 className="text-lg font-bold text-neutral-900">
                  {product.name}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-neutral-600 line-clamp-2">
                  {product.description}
                </p>

                {/* Pricing */}
                <div className="mt-5 flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-neutral-900">
                    ${product.launchPrice}
                  </span>
                  <span className="text-lg text-neutral-400 line-through">
                    ${product.regularPrice}
                  </span>
                </div>
                <p className="mt-1 text-xs text-neutral-500">
                  Launch price — {product.discountPercent}% off
                </p>

                {/* Spacer to push CTA to bottom */}
                <div className="mt-6 flex-1" />

                {/* CTA */}
                <Link
                  to="/products/$slug"
                  params={{ slug: product.slug }}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
                >
                  Get {product.name}
                  <ArrowRightIcon />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bundles ── */}
      <section className="border-t border-neutral-200 bg-white py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12">
            <h2 className="text-2xl font-bold tracking-tight text-neutral-900 md:text-3xl">
              Save More with Bundles
            </h2>
            <p className="mt-3 text-neutral-600">
              Get multiple complete AI business systems at a deeper discount.
            </p>
          </div>

          {/* Bundle comparison table */}
          <div className="overflow-x-auto rounded-xl border border-neutral-200">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50">
                  <th className="px-6 py-4 font-semibold text-neutral-800">
                    Bundle Name
                  </th>
                  <th className="px-6 py-4 font-semibold text-neutral-800">
                    Products Included
                  </th>
                  <th className="px-6 py-4 font-semibold text-neutral-800 text-right">
                    Regular Combined Price
                  </th>
                  <th className="px-6 py-4 font-semibold text-neutral-800 text-right">
                    Bundle Price
                  </th>
                  <th className="px-6 py-4 font-semibold text-neutral-800 text-right">
                    You Save
                  </th>
                  <th className="px-6 py-4" />
                </tr>
              </thead>
              <tbody>
                {sortedBundles.map((bundle) => (
                  <tr
                    key={bundle.slug}
                    className="border-b border-neutral-100 last:border-b-0 hover:bg-neutral-50/50 transition-colors"
                  >
                    <td className="px-6 py-5 font-semibold text-neutral-900 whitespace-nowrap">
                      {bundle.name}
                    </td>
                    <td className="px-6 py-5 text-neutral-600">
                      <ul className="space-y-0.5">
                        {bundle.productNames.map((name) => (
                          <li key={name} className="flex items-center gap-1.5">
                            <span className="text-brand-500 flex-shrink-0">
                              <CheckIcon />
                            </span>
                            {name}
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-6 py-5 text-right text-neutral-400 line-through whitespace-nowrap">
                      ${bundle.regularCombined.toLocaleString()}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <span className="text-xl font-bold text-neutral-900">
                        ${bundle.launchPrice.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="text-sm font-semibold text-green-600">
                        ${bundle.saving.toLocaleString()}
                      </div>
                      <div className="text-xs text-green-500">
                        (
                        {Math.round(
                          (bundle.saving / bundle.regularCombined) * 100
                        )}
                        %)
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <Link
                        to="/products/$slug"
                        params={{ slug: bundle.slug }}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-700 whitespace-nowrap"
                      >
                        Get Bundle
                        <ArrowRightIcon />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile card fallback for bundles */}
          <div className="mt-8 grid gap-6 lg:hidden sm:grid-cols-1">
            {sortedBundles.map((bundle) => (
              <div
                key={bundle.slug + "-mobile"}
                className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm"
              >
                <h3 className="text-lg font-bold text-neutral-900">
                  {bundle.name}
                </h3>
                <ul className="mt-3 space-y-1">
                  {bundle.productNames.map((name) => (
                    <li
                      key={name}
                      className="flex items-center gap-1.5 text-sm text-neutral-600"
                    >
                      <span className="text-brand-500 flex-shrink-0">
                        <CheckIcon />
                      </span>
                      {name}
                    </li>
                  ))}
                </ul>
                <div className="mt-5 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-neutral-900">
                    ${bundle.launchPrice.toLocaleString()}
                  </span>
                  <span className="text-base text-neutral-400 line-through">
                    ${bundle.regularCombined.toLocaleString()}
                  </span>
                </div>
                <p className="mt-1 text-sm font-semibold text-green-600">
                  Save ${bundle.saving.toLocaleString()} (
                  {Math.round(
                    (bundle.saving / bundle.regularCombined) * 100
                  )}
                  %)
                </p>
                <Link
                  to="/products/$slug"
                  params={{ slug: bundle.slug }}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
                >
                  Get Bundle
                  <ArrowRightIcon />
                </Link>
              </div>
            ))}
          </div>

          {/* Hide mobile cards on desktop — the table is shown */}
          <style>{`
            @media (min-width: 1024px) {
              .lg\\:hidden {
                display: none !important;
              }
            }
          `}</style>
        </div>
      </section>

      {/* ── Trust Message ── */}
      <section className="border-t border-neutral-200 bg-neutral-50 py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-center sm:text-left">
            <div className="flex-shrink-0 rounded-full bg-brand-50 p-3 text-brand-600">
              <ShieldIcon />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-700">
                Secure checkout powered by Stripe. Instant delivery after
                purchase.
              </p>
              <p className="mt-1 text-xs text-neutral-500">
                14-day refund policy on all products. Questions?{" "}
                <a
                  href="mailto:support@prismbayai.com"
                  className="text-brand-600 hover:text-brand-700 underline"
                >
                  Contact support
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ teaser ── */}
      <section className="border-t border-neutral-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h3 className="text-lg font-semibold text-neutral-800">
            Have questions about pricing?
          </h3>
          <p className="mt-2 text-sm text-neutral-600">
            Check our{" "}
            <Link
              to="/faq"
              className="text-brand-600 hover:text-brand-700 underline font-medium"
            >
              FAQ page
            </Link>{" "}
            or read our{" "}
            <Link
              to="/refunds"
              className="text-brand-600 hover:text-brand-700 underline font-medium"
            >
              refund policy
            </Link>
            .
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
