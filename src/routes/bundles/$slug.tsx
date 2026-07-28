import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import {
  BUNDLES,
  getProductBySlug,
  type Bundle,
  type Product,
} from "~/data/products";
import CountdownTimer from "~/components/CountdownTimer";
import TrustBadges from "~/components/TrustBadges";

/* ─── Route ─── */
export const Route = createFileRoute("/bundles/$slug")({
  loader: ({ params }) => {
    const bundle = BUNDLES.find((b) => b.slug === params.slug);
    if (!bundle) throw notFound();
    const bundleProducts = bundle.productSlugs
      .map((slug) => getProductBySlug(slug))
      .filter(Boolean) as Product[];
    const otherBundles = BUNDLES.filter((b) => b.slug !== params.slug);
    return { bundle, bundleProducts, otherBundles };
  },
  head: ({ loaderData }) => {
    const { bundle } = loaderData;
    const title = `${bundle.name} — Save $${bundle.saving.toLocaleString()} | PrismBay`;
    let desc = bundle.description;
    if (desc.length > 160) desc = desc.slice(0, 157) + "...";
    const canonicalUrl = `https://prismbay.com/bundles/${bundle.slug}`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "website" },
        { property: "og:image", content: `https://prismbay.com/images/products/${bundle.slug}.png` },
        { property: "og:url", content: canonicalUrl },
      ],
      links: [
        { rel: "canonical", href: canonicalUrl },
      ],
      scripts: [
        {
          tag: "script" as const,
          attrs: { type: "application/ld+json" },
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: bundle.name,
            description: bundle.description,
            sku: bundle.slug,
            brand: { "@type": "Brand", name: "PrismBay" },
            image: `https://prismbay.com/images/products/${bundle.slug}.png`,
            offers: {
              "@type": "Offer",
              price: bundle.launchPrice.toFixed(2),
              priceCurrency: "USD",
              availability: "https://schema.org/InStock",
              url: canonicalUrl,
              priceValidUntil: "2026-08-27",
            },
          }),
        },
        {
          tag: "script" as const,
          attrs: { type: "application/ld+json" },
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "What's included in this bundle?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: `The ${bundle.name} includes ${bundle.productNames.length} complete AI business systems: ${bundle.productNames.join(", ")}. Each includes detailed workflows, technical architecture, revenue models, implementation plans, and commercial launch guidance.`,
                },
              },
              {
                "@type": "Question",
                name: "How is the bundle delivered?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Immediately after purchase, you get instant access to download all bundled products as ZIP files containing comprehensive PDF blueprints and supporting materials. Everything is delivered digitally — nothing is shipped physically.",
                },
              },
              {
                "@type": "Question",
                name: "Can I buy the products individually?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes, all products are available individually on our marketplace. The bundle saves you money compared to buying each product separately.",
                },
              },
              {
                "@type": "Question",
                name: "What is your refund policy?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Due to the digital nature of these business blueprints, all sales are final. We encourage you to review the product details, demo walkthroughs, and included deliverables carefully before purchasing. If you have any pre-sale questions, contact us at support@prismbay.com.",
                },
              },
            ],
          }),
        },
        {
          tag: "script" as const,
          attrs: { type: "application/ld+json" },
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://prismbay.com" },
              { "@type": "ListItem", position: 2, name: "Bundles", item: "https://prismbay.com/bundles" },
              { "@type": "ListItem", position: 3, name: bundle.name, item: canonicalUrl },
            ],
          }),
        },
      ],
    };
  },
  component: BundleDetailPage,
});

/* ─── Icons ─── */
function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="7" fill="#16B3A7" />
      <path d="M5 8.5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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

function ArrowRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8h10m0 0L9 4m4 4l-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ─── FAQ Accordion ─── */
interface FAQItem {
  question: string;
  answer: string;
}

function FAQAccordion({ items }: { items: FAQItem[] }) {
  return (
    <div className="space-y-3">
      {items.map((faq, i) => (
        <FAQRow key={i} faq={faq} defaultOpen={i === 0} />
      ))}
    </div>
  );
}

function FAQRow({ faq, defaultOpen }: { faq: FAQItem; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-semibold text-neutral-800 hover:bg-neutral-50 transition-colors"
      >
        {faq.question}
        <span className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
          <ChevronDownIcon />
        </span>
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm text-neutral-500 leading-relaxed">
          {faq.answer}
        </div>
      )}
    </div>
  );
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
          <Link to="/bundles" className="text-sm font-semibold text-brand-600">Bundles</Link>
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
          <p className="mt-3 text-sm text-neutral-300">Complete AI business systems. Instant access.</p>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          <div>
            <h4 className="mb-4 text-sm font-semibold text-neutral-100">Browse</h4>
            <ul className="space-y-2">
              <li><Link to="/products" className="text-sm text-neutral-300 transition-colors hover:text-white">Products</Link></li>
              <li><Link to="/bundles" className="text-sm text-neutral-300 transition-colors hover:text-white">Bundles</Link></li>
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
        <div className="mt-12 border-t border-neutral-800 pt-8">
          <p className="text-xs text-neutral-500">&copy; PrismBay 2026. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

/* ─── Bundle Detail Page ─── */
function BundleDetailPage() {
  const { bundle, bundleProducts, otherBundles } = Route.useLoaderData();
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  async function handleBundlePurchase(bundleSlug: string) {
    setCheckoutLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productSlug: bundleSlug }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Checkout failed. Please try again.");
      }
    } catch (err) {
      alert("Checkout failed. Please try again.");
    } finally {
      setCheckoutLoading(false);
    }
  }

  const bundleFAQs: FAQItem[] = [
    {
      question: "What's included in this bundle?",
      answer: `The ${bundle.name} includes ${bundle.productNames.length} complete AI business systems: ${bundle.productNames.join(", ")}. Each product is a comprehensive digital blueprint containing detailed workflows, technical architecture diagrams, revenue models, implementation plans, and commercial launch guidance. You get everything you need to evaluate, plan, and launch each AI-powered business.`,
    },
    {
      question: "How is the bundle delivered?",
      answer: "Immediately after purchase, you get instant access to download all bundled products as organized ZIP files containing comprehensive PDF blueprints and supporting materials. Everything is delivered digitally — nothing is shipped physically. You can download your purchases anytime from your account dashboard.",
    },
    {
      question: "Can I buy the products individually?",
      answer: `Yes, all ${bundle.productSlugs.length} products are available individually on our marketplace. The bundle saves you $${bundle.saving.toLocaleString()} compared to buying each product separately. Browse individual products to see if the bundle is right for you.`,
    },
    {
      question: "What is your refund policy?",
      answer: "Due to the digital nature of these business blueprints, all sales are final. We encourage you to review the product details, demo walkthroughs, and included deliverables carefully before purchasing. If you have any pre-sale questions, our team is happy to help at support@prismbay.com.",
    },
    {
      question: "Are these actual working software products?",
      answer: "These are comprehensive AI business system blueprints — detailed plans, architectures, workflows, and implementation guides. They give you the complete blueprint to build, launch, or evaluate these businesses. They are not ready-to-run software applications. Each blueprint is a professional-grade business document package.",
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      {/* Breadcrumb */}
      <div className="bg-navy-900 border-b border-navy-700">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <nav className="flex items-center gap-2 text-sm text-neutral-400">
            <Link to="/" className="hover:text-neutral-300 transition-colors">Home</Link>
            <span>/</span>
            <Link to="/bundles" className="hover:text-neutral-300 transition-colors">Bundles</Link>
            <span>/</span>
            <span className="text-neutral-200 font-medium">{bundle.name}</span>
          </nav>
        </div>
      </div>
      {/* Hero Section */}
      <section className="bg-navy-900 border-b border-navy-700">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-block rounded-full bg-navy-800 px-3 py-1 text-xs font-semibold text-brand-300 mb-3">Bundle</span>
            <div className="flex justify-center mb-6">
              <img
                src={`/images/products/${bundle.slug}.png`}
                alt={`${bundle.name} bundle collection of AI business systems`}
                className="w-full max-w-md rounded-xl shadow-2xl shadow-navy-950/50"
              />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white lg:text-4xl">{bundle.name}</h1>
            <p className="mt-3 text-lg text-neutral-300">{bundle.description}</p>
            {/* Pricing Box */}
            <div className="mt-8 rounded-xl border border-navy-700 bg-navy-800/60 p-6">
              <div className="mb-2 flex justify-center"><CountdownTimer variant="hero" /></div>
              <p className="mt-4 text-sm font-medium text-neutral-400">Regular combined price</p>
              <p className="text-2xl text-neutral-400 line-through">${bundle.regularCombined.toLocaleString()}</p>
              <div className="mt-3 flex items-baseline justify-center gap-3">
                <span className="text-5xl font-bold text-white">${bundle.launchPrice.toLocaleString()}</span>
              </div>
              <p className="mt-2 text-lg font-semibold text-amber-300">You save ${bundle.saving.toLocaleString()}</p>
              <p className="mt-1 text-xs text-neutral-400">
                Introductory pricing — 30 days only.
              </p>
              <button
                onClick={() => handleBundlePurchase(bundle.slug)}
                disabled={checkoutLoading}
                className="mt-5 inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-8 py-4 text-lg font-semibold text-white shadow-sm transition-all duration-200 hover:bg-brand-600 hover:shadow-md hover:-translate-y-px active:bg-brand-700 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900"
              >
                {checkoutLoading ? "Redirecting to Stripe..." : `Get All ${bundle.productSlugs.length} Products for $${bundle.launchPrice.toLocaleString()} — 30-Day Launch Offer`}
              </button>
              <p className="mt-3 text-xs text-neutral-400">Secure payment via Stripe. Instant delivery. Single-business licence.</p>
              <TrustBadges className="mt-4" />
            </div>
          </div>
        </div>
      </section>
      {/* What's Included */}
      <section className="bg-neutral-50">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <h2 className="text-2xl font-bold text-neutral-800 text-center">What's Included in This Bundle</h2>
          <p className="mt-2 text-neutral-500 text-center">Each product is a complete AI business system blueprint — ${bundle.regularCombined.toLocaleString()} value if purchased individually.</p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {bundleProducts.map((product) => (
              product && (
                <Link
                  key={product.slug}
                  to={`/products/${product.slug}`}
                  className="group rounded-xl border border-neutral-200 bg-white p-6 transition-all duration-200 hover:border-brand-200 hover:shadow-sm hover:-translate-y-0.5"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <img
                        src={`/images/products/${product.slug}.png`}
                        alt={product.name}
                        className="h-16 w-24 rounded-lg object-cover border border-neutral-100"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-neutral-800 group-hover:text-brand-600 transition-colors">{product.name}</h3>
                      <p className="mt-0.5 text-sm text-neutral-500 line-clamp-2">{product.tagline}</p>
                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-sm text-neutral-400 line-through">${product.regularPrice}</span>
                        <span className="text-xs font-medium text-brand-600">Included in bundle</span>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            ))}
          </div>
        </div>
      </section>
      {/* Per-Product Savings Breakdown */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <h2 className="text-2xl font-bold text-neutral-800 text-center">Bundle Savings Breakdown</h2>
          <p className="mt-2 text-neutral-500 text-center">See exactly how much you save with this bundle.</p>
          <div className="mt-8 max-w-2xl mx-auto">
            <div className="rounded-xl border border-neutral-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    <th className="text-left px-5 py-3 font-semibold text-neutral-700">Product</th>
                    <th className="text-right px-5 py-3 font-semibold text-neutral-700">Regular Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {bundleProducts.map((product) => (
                    product && (
                      <tr key={product.slug}>
                        <td className="px-5 py-3">
                          <Link to={`/products/${product.slug}`} className="text-neutral-700 hover:text-brand-600 transition-colors">
                            {product.name}
                          </Link>
                        </td>
                        <td className="px-5 py-3 text-right text-neutral-500">${product.regularPrice.toLocaleString()}</td>
                      </tr>
                    )
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-neutral-50 border-t-2 border-neutral-200">
                    <td className="px-5 py-3 font-semibold text-neutral-800">Combined regular price</td>
                    <td className="px-5 py-3 text-right font-semibold text-neutral-800">${bundle.regularCombined.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="px-5 py-3 font-bold text-brand-600">Bundle price (30-day launch)</td>
                    <td className="px-5 py-3 text-right font-bold text-brand-600">${bundle.launchPrice.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="px-5 pb-4 font-semibold text-amber-600">Your savings</td>
                    <td className="px-5 pb-4 text-right font-semibold text-amber-600">${bundle.saving.toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </section>
      {/* FAQ */}
      <section className="bg-neutral-50">
        <div className="mx-auto max-w-3xl px-6 py-14">
          <h2 className="text-2xl font-bold text-neutral-800 text-center">Frequently Asked Questions</h2>
          <div className="mt-8">
            <FAQAccordion items={bundleFAQs} />
          </div>
        </div>
      </section>
      {/* Related Bundles */}
      {otherBundles.length > 0 && (
        <section className="bg-white">
          <div className="mx-auto max-w-7xl px-6 py-14">
            <h2 className="text-2xl font-bold text-neutral-800 text-center">Other Bundles</h2>
            <p className="mt-2 text-neutral-500 text-center">Explore our other money-saving bundle options.</p>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {otherBundles.map((ob) => (
                <Link
                  key={ob.slug}
                  to={`/bundles/${ob.slug}`}
                  className="group rounded-xl border border-neutral-200 bg-white p-6 transition-all duration-200 hover:border-brand-200 hover:shadow-sm hover:-translate-y-0.5"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={`/images/products/${ob.slug}.png`}
                      alt={ob.name}
                      className="h-12 w-20 rounded-md object-cover border border-neutral-100"
                      loading="lazy"
                    />
                    <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">Bundle</span>
                  </div>
                  <h3 className="font-semibold text-neutral-800 group-hover:text-brand-600 transition-colors">{ob.name}</h3>
                  <p className="mt-1 text-sm text-neutral-500 line-clamp-2">{ob.description}</p>
                  <p className="mt-2 text-xs text-neutral-400">Includes: {ob.productNames.join(", ")}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-brand-600">${ob.launchPrice.toLocaleString()}</span>
                      <span className="text-xs text-neutral-400 line-through">${ob.regularCombined.toLocaleString()}</span>
                    </div>
                    <span className="text-xs font-medium text-brand-600 inline-flex items-center gap-1">
                      View <ArrowRightIcon />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
      {/* Bottom CTA */}
      <section className="bg-navy-900">
        <div className="mx-auto max-w-3xl px-6 py-14 text-center">
          <h2 className="text-2xl font-bold text-white">Ready to save ${bundle.saving.toLocaleString()}?</h2>
          <p className="mt-2 text-neutral-300">Get all {bundle.productSlugs.length} AI business systems at the launch price. Instant access after purchase.</p>
          <button
            onClick={() => handleBundlePurchase(bundle.slug)}
            disabled={checkoutLoading}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-8 py-4 text-lg font-semibold text-white shadow-sm transition-all duration-200 hover:bg-brand-600 hover:shadow-md hover:-translate-y-px active:bg-brand-700 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {checkoutLoading ? "Redirecting to Stripe..." : `Get the ${bundle.name} — $${bundle.launchPrice.toLocaleString()}`}
          </button>
          <p className="mt-3 text-xs text-neutral-500">30-day launch pricing. Secure payment via Stripe.</p>
        </div>
      </section>
      <Footer />
    </div>
  );
}
