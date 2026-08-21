import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import {
  PRODUCTS,
  BUNDLES,
  getProductBySlug,
  getRelatedProducts,
  getBundleForProduct,
  type FAQ,
  type Bundle,
  type Product,
  calculateLaunchDeadline,
} from "~/data/products";
import CountdownTimer from "~/components/CountdownTimer";
import TrustBadges from "~/components/TrustBadges";
import { getComparisonsForProduct } from "~/data/comparisons";
import { twitterMeta } from "~/utils/seo";
import Navbar from '~/components/Navbar';
import Footer from '~/components/Footer';
import { DEEP_DIVES } from "~/data/deep-dives";

function DeepDiveText({ text }: { text: string }) {
  // Render verbatim deep-dive prose, converting markdown **bold** emphasis
  // into <strong> (the source uses paired **...** markers).
  const parts = text.split("**");
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <strong key={i} className="font-semibold text-neutral-800">{part}</strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

/* ─── Route ─── */
export const Route = createFileRoute("/products/$slug")({
  loader: ({ params }) => {
    const product = getProductBySlug(params.slug);
    if (!product) {
      // Check if it's a bundle
      const bundle = BUNDLES.find((b) => b.slug === params.slug);
      if (!bundle) throw notFound();
      return { product: null, related: [], bundle };
    }
    const related = getRelatedProducts(product.relatedSlugs);
    const bundle = getBundleForProduct(params.slug) ?? null;
    return { product, related, bundle };
  },
  head: ({ loaderData }) => {
    const { product, bundle } = loaderData;
    const slug = product?.slug ?? bundle?.slug ?? "";
    const defaultTitle = "Product | PrismBay";
    const defaultDesc = "Complete AI business systems with detailed workflows, architecture, and implementation plans. Instant delivery.";
    let title = defaultTitle;
    let desc = defaultDesc;
    if (product) {
      title = `${product.name} — ${product.tagline} | PrismBay`;
      desc = product.description;
      if (desc.length > 160) desc = desc.slice(0, 157) + "...";
    } else if (bundle) {
      title = `${bundle.name} — Save $${bundle.saving.toLocaleString()} | PrismBay`;
      desc = bundle.description;
      if (desc.length > 160) desc = desc.slice(0, 157) + "...";
    }
    const canonicalPath = product ? `/products/${product.slug}` : bundle ? `/products/${bundle.slug}` : "";
    const canonicalUrl = `https://www.prismbayai.com${canonicalPath}`;

    // Build JSON-LD scripts
    const jsonLdScripts = [];

    // Price valid until: launch day + 30 (Aug 27, 2026)
    const priceValidUntil = "2026-08-27";

    if (product) {
      // --- Product schema ---
      jsonLdScripts.push({
        tag: "script",
        attrs: { type: "application/ld+json" },
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          description: product.description,
          sku: product.slug,
          brand: { "@type": "Brand", name: "PrismBay" },
          image: `https://www.prismbayai.com/images/products/${product.slug}.png`,
          offers: {
            "@type": "Offer",
            price: product.launchPrice.toFixed(2),
            priceCurrency: "USD",
            availability: "https://schema.org/InStock",
            url: canonicalUrl,
            priceValidUntil,
          },
        }),
      });

      // --- FAQPage schema ---
      if (product.faqs && product.faqs.length > 0) {
        jsonLdScripts.push({
          tag: "script",
          attrs: { type: "application/ld+json" },
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: product.faqs.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: {
                "@type": "Answer",
                text: faq.answer,
              },
            })),
          }),
        });
      }

      // --- BreadcrumbList ---
      jsonLdScripts.push({
        tag: "script",
        attrs: { type: "application/ld+json" },
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://www.prismbayai.com" },
            { "@type": "ListItem", position: 2, name: "Products", item: "https://www.prismbayai.com/products" },
            { "@type": "ListItem", position: 3, name: product.name, item: canonicalUrl },
          ],
        }),
      });
    } else if (bundle) {
      // --- Product schema for bundle ---
      jsonLdScripts.push({
        tag: "script",
        attrs: { type: "application/ld+json" },
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          name: bundle.name,
          description: bundle.description,
          sku: bundle.slug,
          brand: { "@type": "Brand", name: "PrismBay" },
          image: `https://www.prismbayai.com/images/products/${bundle.slug}.png`,
          offers: {
            "@type": "Offer",
            price: bundle.launchPrice.toFixed(2),
            priceCurrency: "USD",
            availability: "https://schema.org/InStock",
            url: canonicalUrl,
            priceValidUntil,
          },
        }),
      });

      // --- BreadcrumbList for bundle ---
      jsonLdScripts.push({
        tag: "script",
        attrs: { type: "application/ld+json" },
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://www.prismbayai.com" },
            { "@type": "ListItem", position: 2, name: "Products", item: "https://www.prismbayai.com/products" },
            { "@type": "ListItem", position: 3, name: "Bundles", item: "https://www.prismbayai.com/bundles" },
            { "@type": "ListItem", position: 4, name: bundle.name, item: canonicalUrl },
          ],
        }),
      });
    }

    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "product" },
        { property: "og:url", content: canonicalUrl },
        { property: "og:image", content: `https://www.prismbayai.com/images/products/${slug}.png` },
        ...twitterMeta(title, desc, `https://www.prismbayai.com/images/products/${slug}.png`),
      ],
      links: [
        { rel: "canonical", href: canonicalUrl },
      ],
      scripts: jsonLdScripts,
    };
  },
  component: ProductPage,
  notFoundComponent: ProductNotFound,
});


/* ─── Inline SVG Icons ─── */
function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill={filled ? "#F59E0B" : "#DEDDDA"} aria-hidden="true">
      <path d="M8 1.5l1.76 4.86 5.17.24-4.1 3.17 1.34 5-4.17-3.08-4.17 3.08 1.34-5-4.1-3.17 5.17-.24L8 1.5z" />
    </svg>
  );
}

function StarRating({ rating, count }: { rating: number; count: number }) {
  // No reviews yet — hide the rating UI entirely rather than showing "No reviews yet" or empty stars.
  if (rating === 0 || count === 0) {
    return null;
  }
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

function ChevronDownIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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

/* ─── FAQ Accordion ─── */
function FAQAccordion({ faqs }: { faqs: FAQ[] }) {
  return (
    <div className="space-y-3">
      {faqs.map((faq, i) => (
        <FAQItem key={i} faq={faq} defaultOpen={i === 0} />
      ))}
    </div>
  );
}

function FAQItem({ faq, defaultOpen }: { faq: FAQ; defaultOpen: boolean }) {
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

/* ─── Product Page ─── */
function ProductPage() {
  const { product, related, bundle } = Route.useLoaderData();
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  async function handlePurchase(productSlug: string) {
    setCheckoutLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productSlug }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Checkout failed. Please try again.");
        setCheckoutLoading(false);
      }
    } catch (err) {
      alert("Checkout failed. Please try again.");
      setCheckoutLoading(false);
    }
  }

  // Handle bundle page
  if (!product && bundle) {
    return <BundlePage bundle={bundle} />;
  }

  if (!product) throw notFound();

  const relatedProducts = related;
  const deepDive = product ? DEEP_DIVES[product.slug] : undefined;

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-neutral-200">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <nav className="flex items-center gap-2 text-sm text-neutral-400">
            <Link to="/" className="hover:text-neutral-600 transition-colors">Home</Link>
            <span>/</span>
            <Link to="/products" className="hover:text-neutral-600 transition-colors">Products</Link>
            <span>/</span>
            <span className="text-neutral-600 font-medium">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Hero Section — Navy */}
      <section className="bg-navy-900 border-b border-navy-700">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
            {/* Left: Product info + pricing + CTA */}
            <div className="flex flex-col justify-center order-2 lg:order-1">
              <div className="mb-3">
                <span className="inline-block rounded-full bg-navy-800 px-3 py-1 text-xs font-medium text-brand-300">
                  {product.category}
                </span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white lg:text-4xl">
                {product.name}
              </h1>
              <p className="mt-2 text-lg text-neutral-300">{product.tagline}</p>
              <p className="mt-3 text-xl font-semibold leading-relaxed text-brand-200">{product.valueStatement}</p>
              <div className="mt-3">
                <StarRating rating={product.rating} count={product.reviewCount} />
              </div>
              <p className="mt-5 text-neutral-300 leading-relaxed">{product.longDescription}</p>
              {/* Launch Pricing */}
              <div className="mt-6 rounded-xl border border-navy-700 bg-navy-800/60 p-5">
                <div className="mb-2"><CountdownTimer variant="hero" /></div>
                <p className="text-sm font-medium text-amber-200">Launch pricing ends {calculateLaunchDeadline()}</p>
                <div className="flex items-baseline gap-3 mt-3">
                  <span className="text-2xl font-bold text-white">${product.launchPrice}</span>
                  <span className="text-lg text-neutral-400 line-through">${product.regularPrice}</span>
                  <span className="rounded-full bg-amber-100/20 px-2.5 py-0.5 text-sm font-semibold text-amber-300">
                    Save {product.discountPercent}%
                  </span>
                </div>
                <p className="mt-2 text-xs text-neutral-400">
                  Introductory pricing — 30 days only. After that, regular price of ${product.regularPrice} applies.
                </p>
              </div>
              {/* CTA */}
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => handlePurchase(product.slug)}
                  disabled={checkoutLoading}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-8 py-4 text-lg font-semibold text-white shadow-sm transition-all duration-200 hover:bg-brand-600 hover:shadow-md hover:-translate-y-px active:bg-brand-700 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900"
                >
                  {checkoutLoading ? "Redirecting to Stripe..." : `Purchase Now — $${product.launchPrice}`}
                </button>
                {product.demoVideoUrl ? (
                  <Link
                    to={product.demoVideoUrl}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-brand-300/50 px-8 py-4 text-lg font-semibold text-white transition-all duration-200 hover:bg-white/10 active:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300/30 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900"
                  >
                    View Demo
                  </Link>
                ) : (
                  <Link
                    to="/how-it-works"
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-brand-300/50 px-8 py-4 text-lg font-semibold text-white transition-all duration-200 hover:bg-white/10 active:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300/30 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900"
                  >
                    Explore how our products work →
                  </Link>
                )}
              </div>
              <p className="mt-3 text-xs text-neutral-400">
                Secure payment via Stripe. Instant delivery. Single-business licence.
              </p>
              <Link to="/how-it-works" className="mt-2 text-sm text-brand-200 underline underline-offset-4 hover:text-brand-100">See how purchase and download works →</Link>
              <p className="mt-2 text-xs text-neutral-400">
                Purchased products remain available through your PrismBay account. Security-protected email download links expire, while account access continues under the applicable licence terms.
              </p>
              <TrustBadges className="mt-4" />
              {/* Preview what's inside */}
              <div className="mt-4">
                <Link
                  to={`/preview/${product.slug}`}
                  className="inline-flex items-center gap-2 text-sm font-medium text-brand-300 hover:text-brand-200 transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M3 2.5h4l1.5 1.5H13a1 1 0 011 1V12a1 1 0 01-1 1H3a1 1 0 01-1-1V3.5a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M6 8l2 2 4-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Preview what's inside — table of contents & sample pages
                </Link>
              </div>
              {/* Bundle Callout */}
              {bundle && (
                <div className="mt-5 rounded-lg border border-navy-700 bg-navy-800/40 p-4">
                  <p className="text-sm font-semibold text-brand-300">
                    💰 Also available in the {bundle.name}
                  </p>
                  <p className="mt-1 text-xs text-neutral-300">
                    Get {bundle.productNames.join(", ")} for ${bundle.launchPrice.toLocaleString()} — save ${bundle.saving.toLocaleString()}
                  </p>
                  <Link
                    to="/bundles"
                    className="mt-2 inline-block text-xs font-semibold text-brand-300 hover:text-brand-200"
                  >
                    View bundles →
                  </Link>
                </div>
              )}
            </div>
            {/* Right: Product image (falls back to demo on error) */}
            <div className="order-1 lg:order-2">
              <img
                src={`/images/products/${product.slug}.png`}
                alt={`${product.name} AI business system dashboard interface and implementation blueprint`}
                className="w-full max-w-sm mx-auto rounded-xl shadow-2xl shadow-navy-950/50"
                onError={(e) => {
                  const target = e.currentTarget;
                  target.style.display = "none";
                }}
              />
              {/* Demo preview — links to interactive walkthrough */}
              {product.demoVideoUrl ? (
                <Link
                  to={product.demoVideoUrl}
                  className="mt-6 block rounded-xl bg-navy-800 overflow-hidden shadow-2xl group transition-shadow hover:shadow-brand-500/10"
                >
                  <div className="aspect-video flex items-center justify-center relative">
                    <img
                      src={`/images/products/${product.slug}.png`}
                      alt={`${product.name} preview`}
                      className="absolute inset-0 w-full h-full object-cover opacity-25"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-navy-900/40 to-transparent" />
                    <div className="relative z-10 text-center p-6">
                      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-brand-500/20 border border-brand-400/40 mb-4 group-hover:scale-110 transition-transform">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path d="M8 5l11 7-11 7V5z" fill="#16B3A7" stroke="#16B3A7" strokeWidth="1" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <p className="text-lg font-semibold text-white">
                        View Interactive Demo
                      </p>
                      <p className="text-sm text-brand-200/70 mt-1">
                        Step-by-step guided walkthrough of {product.name}
                      </p>
                    </div>
                  </div>
                </Link>
              ) : (
                <Link
                  to="/how-it-works"
                  className="mt-6 aspect-video rounded-xl bg-navy-800 overflow-hidden shadow-2xl flex items-center justify-center group transition-shadow hover:shadow-brand-500/10"
                >
                  <div className="text-center">
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true" className="mx-auto mb-3">
                      <circle cx="24" cy="24" r="22" stroke="#16B3A7" strokeWidth="1.5" opacity="0.4" />
                      <path d="M19 16l14 8-14 8V16z" fill="#16B3A7" opacity="0.5" />
                    </svg>
                    <p className="text-brand-200/70 font-medium">Explore how our products work →</p>
                    <p className="text-xs text-neutral-500 mt-1">Learn about the platform, delivery, and what's included in every product.</p>
                  </div>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
      {/* Features Section */}
      <section className="bg-neutral-50">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <h2 className="text-2xl font-bold text-neutral-800 text-center">What's Included</h2>
          <p className="mt-2 text-neutral-500 text-center">Every purchase includes the complete business system blueprint.</p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {product.included.map((item, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-white p-4">
                <CheckIcon />
                <span className="text-sm font-medium text-neutral-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who It's For */}
      {(product.bestFor ||
        product.technicalRequirements ||
        (product.limitations && product.limitations.length > 0)) && (
        <section className="bg-white">
          <div className="mx-auto max-w-3xl px-6 py-14">
            <h2 className="text-2xl font-bold text-neutral-800 text-center">Who It's For</h2>
            <p className="mt-2 text-neutral-500 text-center">
              Who this blueprint is built for, what you'll need to use it, and what it doesn't include.
            </p>
            <div className="mt-8 rounded-xl border border-neutral-200 bg-neutral-50 p-6 sm:p-8 space-y-8">
              {product.bestFor && (
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-brand-600">Best for</h3>
                  <p className="mt-2 text-neutral-600 leading-relaxed">{product.bestFor}</p>
                </div>
              )}
              {product.technicalRequirements && (
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-brand-600">What you'll need</h3>
                  <p className="mt-2 text-neutral-600 leading-relaxed">{product.technicalRequirements}</p>
                </div>
              )}
              {product.limitations && product.limitations.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-brand-600">What's not included</h3>
                  <ul className="mt-3 space-y-2">
                    {product.limitations.map((limitation, i) => (
                      <li key={i} className="flex items-start gap-2 text-neutral-600 leading-relaxed">
                        <span
                          className="mt-2.5 h-1 w-1 flex-shrink-0 rounded-full bg-neutral-400"
                          aria-hidden="true"
                        />
                        {limitation}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Deep Dive */}
      {deepDive && (
        <section className="bg-neutral-50">
          <div className="mx-auto max-w-3xl px-6 py-14">
            <h2 className="text-2xl font-bold text-neutral-800 text-center">Deep Dive</h2>
            <p className="mt-2 text-neutral-500 text-center">
              A closer look at how {product.name} works in practice, how it is implemented, and its architecture.
            </p>
            <div className="mt-8 space-y-4">
              {[
                { id: "workflow", label: "Workflow overview", body: deepDive.workflow },
                { id: "implementation", label: "Implementation stages", body: deepDive.implementation },
                { id: "architecture", label: "Architecture overview", body: deepDive.architecture },
              ].map((section) => (
                <details
                  key={section.id}
                  className="group rounded-xl border border-neutral-200 bg-white p-6 sm:p-8 open:shadow-sm"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-brand-600">
                      {section.label}
                    </h3>
                    <span
                      aria-hidden="true"
                      className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-neutral-300 text-neutral-500 transition-transform duration-200 group-open:rotate-45"
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </span>
                  </summary>
                  <div className="mt-4">
                    <p className="text-neutral-600 leading-relaxed">
                      <DeepDiveText text={section.body} />
                    </p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}
      {/* FAQs */}
      <section className="bg-white">
        <div className="mx-auto max-w-3xl px-6 py-14">
          <h2 className="text-2xl font-bold text-neutral-800 text-center">Frequently Asked Questions</h2>
          <div className="mt-8">
            <FAQAccordion faqs={product.faqs} />
          </div>
        </div>
      </section>
      {/* Compare Products */}
      {(() => {
        const comparisons = getComparisonsForProduct(product.slug);
        if (comparisons.length === 0) return null;
        return (
          <section className="bg-white">
            <div className="mx-auto max-w-3xl px-6 py-14">
              <h2 className="text-2xl font-bold text-neutral-800 text-center">Compare Products</h2>
              <p className="mt-2 text-neutral-500 text-center">See how {product.name} stacks up against similar products.</p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                {comparisons.map((comp) => (
                  <Link
                    key={comp.slug}
                    to={`/compare/${comp.slug}`}
                    className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 transition-all hover:border-brand-200 hover:text-brand-600 hover:shadow-sm"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <rect x="2" y="3" width="5" height="4" rx="1" stroke="#16B3A7" strokeWidth="1.5" />
                      <rect x="9" y="9" width="5" height="4" rx="1" stroke="#F59E0B" strokeWidth="1.5" />
                      <path d="M4.5 7v2m7-6v2" stroke="#9F9E99" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    {comp.label} →
                  </Link>
                ))}
              </div>
            </div>
          </section>
        );
      })()}





      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="bg-white">
          <div className="mx-auto max-w-7xl px-6 py-14">
            <h2 className="text-2xl font-bold text-neutral-800 text-center">Related Products</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedProducts.map((rp) => (
                <Link
                  key={rp.slug}
                  to={`/products/${rp.slug}`}
                  className="group rounded-xl border border-neutral-200 bg-white p-5 transition-all duration-200 hover:border-brand-200 hover:shadow-sm hover:-translate-y-0.5"
                >
                  <h3 className="font-semibold text-neutral-800">{rp.name}</h3>
                  <p className="mt-1 text-sm text-neutral-500 line-clamp-2">{rp.tagline}</p>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="font-bold text-brand-600">${rp.launchPrice}</span>
                    <span className="text-xs text-neutral-400 line-through">${rp.regularPrice}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}

/* ─── Bundle Page ─── */
function BundlePage({ bundle }: { bundle: Bundle }) {
  const [bundleCheckoutLoading, setBundleCheckoutLoading] = useState(false);

  async function handleBundlePurchase(bundleSlug: string) {
    setBundleCheckoutLoading(true);
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
      setBundleCheckoutLoading(false);
    }
  }

  const bundleProducts = bundle.productSlugs
    .map((slug) => getProductBySlug(slug))
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />

      {/* Breadcrumb */}
      <div className="bg-navy-900 border-b border-navy-700">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <nav className="flex items-center gap-2 text-sm text-neutral-400">
            <Link to="/" className="hover:text-neutral-300 transition-colors">Home</Link>
            <span>/</span>
            <Link to="/products" className="hover:text-neutral-300 transition-colors">Products</Link>
            <span>/</span>
            <Link to="/bundles" className="hover:text-neutral-300 transition-colors">Bundles</Link>
            <span>/</span>
            <span className="text-neutral-200 font-medium">{bundle.name}</span>
          </nav>
        </div>
      </div>
      {/* Hero Section — Navy */}
      <section className="bg-navy-900 border-b border-navy-700">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-block rounded-full bg-navy-800 px-3 py-1 text-xs font-semibold text-brand-300 mb-3">Bundle</span>
            {/* Bundle image */}
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
                disabled={bundleCheckoutLoading}
                className="mt-5 inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-8 py-4 text-lg font-semibold text-white shadow-sm transition-all duration-200 hover:bg-brand-600 hover:shadow-md hover:-translate-y-px active:bg-brand-700 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900"
              >
                {bundleCheckoutLoading ? "Redirecting to Stripe..." : `Get All ${bundle.productSlugs.length} Products for $${bundle.launchPrice.toLocaleString()} — 30-Day Launch Offer`}
              </button>
              <p className="mt-3 text-xs text-neutral-400">Secure payment via Stripe. Instant delivery. Single-business licence.</p>
              <TrustBadges className="mt-4" />
            </div>
          </div>
        </div>
      </section>
      {/* Bundle product list */}
      <section className="bg-neutral-50">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <h2 className="text-2xl font-bold text-neutral-800 text-center">What's Included in This Bundle</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {bundleProducts.map((product) => (
              product && (
                <Link
                  key={product.slug}
                  to={`/products/${product.slug}`}
                  className="group rounded-xl border border-neutral-200 bg-white p-5 transition-all duration-200 hover:border-brand-200 hover:shadow-sm hover:-translate-y-0.5"
                >
                  <h3 className="font-semibold text-neutral-800">{product.name}</h3>
                  <p className="mt-1 text-sm text-neutral-500">{product.tagline}</p>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-sm text-neutral-400 line-through">${product.regularPrice}</span>
                    <span className="text-sm text-neutral-400">→ included in bundle</span>
                  </div>
                </Link>
              )
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

/* ─── 404 Page ─── */
function ProductNotFound() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      <div className="flex flex-col items-center justify-center py-32 px-6">
        <h1 className="text-4xl font-bold text-neutral-800">Product Not Found</h1>
        <p className="mt-4 text-lg text-neutral-500 text-center max-w-md">
          The product you're looking for doesn't exist or may have been removed. Browse our full catalog instead.
        </p>
        <Link
          to="/products"
          className="mt-8 inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-6 py-3 text-base font-semibold text-white shadow-sm transition-all duration-200 hover:bg-brand-600"
        >
          Browse Products
        </Link>
      </div>
      <Footer />
    </div>
  );
}
