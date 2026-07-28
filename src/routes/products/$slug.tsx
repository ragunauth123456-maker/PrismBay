import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import {
  PRODUCTS,
  BUNDLES,
  getProductBySlug,
  getRelatedProducts,
  getBundleForProduct,
  type Review,
  type FAQ,
  type Bundle,
  type Product,
} from "~/data/products";
import CountdownTimer from "~/components/CountdownTimer";

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
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "product" },
      ],
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
        <ChevronDownIcon />
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
          <Link to="/products" className="text-sm font-semibold text-brand-600">Products</Link>
          <Link to="/products" search={{ category: "bundles" }} className="text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900">Bundles</Link>
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
          <div><h4 className="mb-4 text-sm font-semibold text-neutral-100">Company</h4><ul className="space-y-2"><li><Link to="/about" className="text-sm text-neutral-400 transition-colors hover:text-white">About</Link></li><li><Link to="/how-it-works" className="text-sm text-neutral-400 transition-colors hover:text-white">How It Works</Link></li><li><Link to="/contact" className="text-sm text-neutral-400 transition-colors hover:text-white">Contact</Link></li></ul></div>
          <div><h4 className="mb-4 text-sm font-semibold text-neutral-100">Legal</h4><ul className="space-y-2"><li><Link to="/terms" className="text-sm text-neutral-400 transition-colors hover:text-white">Terms</Link></li><li><Link to="/privacy" className="text-sm text-neutral-400 transition-colors hover:text-white">Privacy</Link></li><li><Link to="/cookies" className="text-sm text-neutral-400 transition-colors hover:text-white">Cookies</Link></li><li><Link to="/refunds" className="text-sm text-neutral-400 transition-colors hover:text-white">Refunds</Link></li></ul></div>
        </div>
        <div className="mt-12 border-t border-neutral-800 pt-8"><p className="text-xs text-neutral-500">&copy; PrismBay 2026. All rights reserved.</p></div>
      </div>
    </footer>
  );
}

/* ─── Product Page ─── */
function ProductPage() {
  const { product, related, bundle } = Route.useLoaderData();

  // Handle bundle page
  if (!product && bundle) {
    return <BundlePage bundle={bundle} />;
  }

  if (!product) throw notFound();

  const relatedProducts = related;

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

      {/* Hero Section */}
      <section className="bg-white border-b border-neutral-200">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:py-16">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            {/* Left: Demo video */}
            <div className="aspect-video rounded-xl bg-neutral-100 overflow-hidden shadow-sm">
              <iframe
                src={product.demoVideoUrl}
                title={`${product.name} demo`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Right: Product info */}
            <div className="flex flex-col justify-center">
              <div className="mb-3">
                <span className="inline-block rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
                  {product.category}
                </span>
                <span className="ml-2 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                  Save {product.discountPercent}%
                </span>
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-neutral-800 lg:text-4xl">
                {product.name}
              </h1>
              <p className="mt-2 text-lg text-brand-600 font-medium">{product.tagline}</p>

              <div className="mt-3">
                <StarRating rating={product.rating} count={product.reviewCount} />
              </div>

              <p className="mt-5 text-neutral-600 leading-relaxed">{product.longDescription}</p>

              {/* Launch Pricing */}
              <div className="mt-6 rounded-xl border-2 border-amber-200 bg-amber-50/50 p-5">
                <div className="mb-2 flex items-center gap-2"><CountdownTimer variant="compact" /></div>
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold text-brand-600">${product.launchPrice}</span>
                  <span className="text-lg text-neutral-400 line-through">${product.regularPrice}</span>
                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-sm font-semibold text-amber-700">
                    Save {product.discountPercent}%
                  </span>
                </div>
                <p className="mt-1 text-xs text-neutral-500">
                  Introductory pricing — 30 days only. After that, regular price of ${product.regularPrice} applies.
                </p>
              </div>

              {/* CTA */}
              <div className="mt-5 flex flex-col sm:flex-row gap-3">
                <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-8 py-4 text-lg font-semibold text-white shadow-sm transition-all duration-200 hover:bg-brand-600 hover:shadow-md hover:-translate-y-px active:bg-brand-700 active:translate-y-0">
                  {product.ctaText}
                </button>
              </div>

              <p className="mt-3 text-xs text-neutral-400">
                Secure payment via Stripe. Instant delivery. Single-business licence.
              </p>

              {/* Bundle Callout */}
              {bundle && (
                <div className="mt-5 rounded-lg border border-brand-200 bg-brand-50/50 p-4">
                  <p className="text-sm font-semibold text-brand-700">
                    💰 Also available in the {bundle.name}
                  </p>
                  <p className="mt-1 text-xs text-brand-600">
                    Get {bundle.productNames.join(", ")} for ${bundle.launchPrice.toLocaleString()} — save ${bundle.saving.toLocaleString()}
                  </p>
                  <Link
                    to="/products"
                    search={{ category: "bundles" }}
                    className="mt-2 inline-block text-xs font-semibold text-brand-600 hover:text-brand-700"
                  >
                    View bundles →
                  </Link>
                </div>
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

      {/* FAQs */}
      <section className="bg-white">
        <div className="mx-auto max-w-3xl px-6 py-14">
          <h2 className="text-2xl font-bold text-neutral-800 text-center">Frequently Asked Questions</h2>
          <div className="mt-8">
            <FAQAccordion faqs={product.faqs} />
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="bg-neutral-50">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <h2 className="text-2xl font-bold text-neutral-800 text-center">Customer Reviews</h2>
          <p className="mt-2 text-neutral-500 text-center">Feedback from verified buyers who purchased {product.name}.</p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {product.reviews.map((review: Review, i: number) => (
              <div key={i} className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                <div className="mb-3 flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <StarIcon key={s} filled={s <= review.rating} />
                  ))}
                </div>
                <blockquote className="text-sm leading-relaxed text-neutral-600">
                  &ldquo;{review.text}&rdquo;
                </blockquote>
                <div className="mt-4 flex items-center gap-3 border-t border-neutral-100 pt-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
                    {review.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-neutral-800">{review.name}</p>
                    <p className="text-xs text-neutral-400">{review.role}</p>
                  </div>
                  <div className="ml-auto flex shrink-0 items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700">
                    <VerifiedBadgeIcon />
                    Verified
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

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
  const bundleProducts = bundle.productSlugs
    .map((slug) => getProductBySlug(slug))
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />

      <div className="bg-white border-b border-neutral-200">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <nav className="flex items-center gap-2 text-sm text-neutral-400">
            <Link to="/" className="hover:text-neutral-600 transition-colors">Home</Link>
            <span>/</span>
            <Link to="/products" className="hover:text-neutral-600 transition-colors">Products</Link>
            <span>/</span>
            <Link to="/products" search={{ category: "bundles" }} className="hover:text-neutral-600 transition-colors">Bundles</Link>
            <span>/</span>
            <span className="text-neutral-600 font-medium">{bundle.name}</span>
          </nav>
        </div>
      </div>

      <section className="bg-white border-b border-neutral-200">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 mb-3">Bundle</span>
            <h1 className="text-3xl font-bold tracking-tight text-neutral-800 lg:text-4xl">{bundle.name}</h1>
            <p className="mt-3 text-lg text-neutral-500">{bundle.description}</p>

            <div className="mt-8 rounded-xl border-2 border-amber-200 bg-amber-50/50 p-6">
              <p className="text-sm font-medium text-neutral-500">Regular combined price</p>
              <p className="text-2xl text-neutral-400 line-through">${bundle.regularCombined.toLocaleString()}</p>
              <div className="mt-3 flex items-baseline justify-center gap-3">
                <span className="text-5xl font-bold text-brand-600">${bundle.launchPrice.toLocaleString()}</span>
              </div>
              <div className="mt-2 flex justify-center"><CountdownTimer variant="compact" /></div>
              <p className="mt-2 text-lg font-semibold text-brand-700">You save ${bundle.saving.toLocaleString()}</p>
              <p className="mt-1 text-xs text-neutral-500">
                Introductory pricing — 30 days only.
              </p>
              <button className="mt-5 inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-8 py-4 text-lg font-semibold text-white shadow-sm transition-all duration-200 hover:bg-brand-600 hover:shadow-md hover:-translate-y-px active:bg-brand-700 active:translate-y-0">
                Get All {bundle.productSlugs.length} Products for ${bundle.launchPrice.toLocaleString()} — 30-Day Launch Offer
              </button>
              <p className="mt-3 text-xs text-neutral-400">Secure payment via Stripe. Instant delivery. Single-business licence.</p>
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
