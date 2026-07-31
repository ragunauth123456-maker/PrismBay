import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import Navbar from "~/components/Navbar";
import Footer from "~/components/Footer";
import { getProductBySlug } from "~/data/products";
import { getPreviewContent } from "~/data/previews";

export const Route = createFileRoute("/preview/$slug")({
  loader: ({ params }) => {
    const product = getProductBySlug(params.slug);
    if (!product) throw notFound();
    const preview = getPreviewContent(params.slug);
    if (!preview) throw notFound();
    return { product, preview };
  },
  head: ({ loaderData }) => {
    const { product } = loaderData;
    const title = `${product.name} \u2014 Sample Content Preview | PrismBay`;
    const desc = `See what's inside ${product.name}: table of contents, sample pages from the implementation guide, and a full breakdown of deliverables.`;
    const canonicalUrl = `https://www.prismbayai.com/preview/${product.slug}`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "website" },
        { property: "og:url", content: canonicalUrl },
        { property: "og:image", content: `https://www.prismbayai.com/images/products/${product.slug}.png` },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc },
        { name: "robots", content: "index, follow" },
      ],
      links: [{ rel: "canonical", href: canonicalUrl }],
      scripts: [
        {
          tag: "script",
          attrs: { type: "application/ld+json" },
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://www.prismbayai.com" },
              { "@type": "ListItem", position: 2, name: "Products", item: "https://www.prismbayai.com/products" },
              { "@type": "ListItem", position: 3, name: product.name, item: `https://www.prismbayai.com/products/${product.slug}` },
              { "@type": "ListItem", position: 4, name: "Preview", item: canonicalUrl },
            ],
          }),
        },
      ],
    };
  },
  component: PreviewPage,
  notFoundComponent: PreviewNotFound,
});

function PreviewNotFound() {
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-6 py-24">
        <div className="text-center max-w-lg">
          <p className="text-8xl font-bold text-brand-500 mb-4">404</p>
          <h1 className="text-3xl font-bold text-neutral-800 mb-3">Preview not found</h1>
          <p className="text-neutral-600 mb-8 leading-relaxed">
            We don't have a preview for that product yet. Browse our available products to find what you're looking for.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-6 py-3 text-base font-semibold text-white shadow-sm transition-all duration-200 hover:bg-brand-600"
          >
            Browse Products
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function PreviewPage() {
  const { product, preview } = Route.useLoaderData();
  const [tocExpanded, setTocExpanded] = useState(true);
  const [deliverablesExpanded, setDeliverablesExpanded] = useState(true);

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <Navbar />

      <section className="bg-navy-900 text-white">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <nav className="flex items-center gap-2 text-sm text-neutral-400 mb-6">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <Link to="/products" className="hover:text-white transition-colors">Products</Link>
            <span>/</span>
            <Link to={`/products/${product.slug}`} className="hover:text-white transition-colors">{product.name}</Link>
            <span>/</span>
            <span className="text-brand-300">Preview</span>
          </nav>

          <p className="text-sm font-semibold text-brand-300 uppercase tracking-wider mb-3">
            Sample Content Preview
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            {product.name}: What's Inside
          </h1>
          <p className="text-lg text-neutral-300 max-w-2xl leading-relaxed">
            See exactly what you'll receive when you purchase {product.name}. Browse the table of contents, read a
            sample chapter from the implementation guide, and review the complete list of deliverables.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-neutral-400">
            <div className="flex items-center gap-2">
              <DocIcon />
              <span>{preview.deliverables.pages}+ pages</span>
            </div>
            <div className="flex items-center gap-2">
              <TemplateIcon />
              <span>{preview.deliverables.templates} templates</span>
            </div>
            <div className="flex items-center gap-2">
              <DiagramIcon />
              <span>{preview.deliverables.diagrams} architecture diagrams</span>
            </div>
            <div className="flex items-center gap-2">
              <PriceIcon />
              <span className="text-white font-semibold">${product.launchPrice}</span>
              <span className="line-through">${product.regularPrice}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="flex-1 bg-white">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <div className="grid gap-10 lg:grid-cols-3">
            <aside className="lg:col-span-1">
              <div className="lg:sticky lg:top-8 space-y-6">
                <div className="rounded-xl border border-neutral-200 bg-neutral-50 overflow-hidden">
                  <button
                    onClick={() => setTocExpanded(!tocExpanded)}
                    className="flex w-full items-center justify-between px-5 py-4 text-left"
                  >
                    <h3 className="text-sm font-bold text-neutral-800 uppercase tracking-wider">Table of Contents</h3>
                    <ChevronToggle expanded={tocExpanded} />
                  </button>
                  {tocExpanded && (
                    <div className="px-5 pb-5 space-y-4">
                      {preview.toc.map((part: any, i: number) => (
                        <div key={i}>
                          <p className="text-xs font-bold text-brand-600 uppercase tracking-wide mb-2">{part.part}</p>
                          <ul className="space-y-1.5">
                            {part.chapters.map((ch: string, j: number) => (
                              <li key={j} className="text-sm text-neutral-600 pl-3 border-l-2 border-neutral-200">{ch}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-neutral-200 bg-neutral-50 overflow-hidden">
                  <button
                    onClick={() => setDeliverablesExpanded(!deliverablesExpanded)}
                    className="flex w-full items-center justify-between px-5 py-4 text-left"
                  >
                    <h3 className="text-sm font-bold text-neutral-800 uppercase tracking-wider">What's Included</h3>
                    <ChevronToggle expanded={deliverablesExpanded} />
                  </button>
                  {deliverablesExpanded && (
                    <div className="px-5 pb-5 space-y-3">
                      <DeliverableRow label="Documents" value={`${preview.deliverables.documents} structured documents`} />
                      <DeliverableRow label="Pages" value={`${preview.deliverables.pages} pages of content`} />
                      <DeliverableRow label="Templates" value={`${preview.deliverables.templates} reusable templates`} />
                      <DeliverableRow label="Diagrams" value={`${preview.deliverables.diagrams} architecture & workflow diagrams`} />
                      <DeliverableRow label="Spreadsheets" value={`${preview.deliverables.spreadsheets} financial models & trackers`} />
                      {preview.deliverables.extras.length > 0 && (
                        <div className="pt-2 border-t border-neutral-200">
                          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Also includes</p>
                          <ul className="space-y-1.5">
                            {preview.deliverables.extras.map((extra: string, i: number) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-neutral-600">
                                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-brand-400 flex-shrink-0" />
                                {extra}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <Link
                  to={`/products/${product.slug}`}
                  className="block w-full rounded-xl bg-brand-500 px-5 py-4 text-center text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-brand-600"
                >
                  View Full Product Details &rarr;
                </Link>
              </div>
            </aside>

            <main className="lg:col-span-2">
              <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden shadow-sm">
                <div className="border-b border-neutral-200 bg-neutral-50 px-6 py-4">
                  <p className="text-xs font-semibold text-brand-600 uppercase tracking-wider mb-1">Sample Chapter</p>
                  <h2 className="text-xl font-bold text-neutral-800">{preview.excerptTitle}</h2>
                  <p className="mt-1 text-sm text-neutral-500">
                    From the {product.name} Implementation Guide &mdash; included in full with every purchase.
                  </p>
                </div>

                <div className="px-6 py-8">
                  <article className="prose prose-neutral max-w-none">
                    {preview.excerptBody.split("\n\n").map((paragraph: string, i: number) => {
                      const trimmed = paragraph.trim();
                      const isHeader = /^(Stage \d|Layer \d|Phase \d|Pipeline \d):/.test(trimmed);
                      if (isHeader) {
                        return <h3 key={i} className="text-lg font-bold text-navy-800 mt-8 mb-3">{trimmed}</h3>;
                      }
                      return <p key={i} className="text-neutral-700 leading-relaxed mb-4 text-[15px]">{paragraph}</p>;
                    })}
                  </article>

                  <div className="relative mt-4">
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent -top-20 pointer-events-none" />
                    <div className="relative pt-12 text-center">
                      <p className="text-neutral-500 text-sm mb-4">
                        This is a sample excerpt. The complete {product.name} implementation guide
                        includes {preview.deliverables.pages} pages of detailed content.
                      </p>
                      <Link
                        to={`/products/${product.slug}`}
                        className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-6 py-3 text-base font-semibold text-white shadow-sm transition-all duration-200 hover:bg-brand-600"
                      >
                        Get {product.name} for ${product.launchPrice}
                        <ArrowRightIcon />
                      </Link>
                      <p className="mt-3 text-xs text-neutral-400">
                        Secure payment via Stripe. Instant delivery. 14-day refund policy.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </section>

      <section className="bg-neutral-50 border-t border-neutral-200">
        <div className="mx-auto max-w-4xl px-6 py-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-neutral-500">Want to see the full product?</p>
              <Link to={`/products/${product.slug}`} className="text-brand-600 font-semibold hover:text-brand-700 transition-colors">
                &larr; Back to {product.name} product page
              </Link>
            </div>
            <div className="text-right">
              <p className="text-sm text-neutral-500">See it in action</p>
              <Link to={product.demoVideoUrl} className="text-brand-600 font-semibold hover:text-brand-700 transition-colors">
                {product.name} interactive demo &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function ChevronToggle({ expanded }: { expanded: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
      className={`transition-transform duration-200 text-neutral-400 ${expanded ? "rotate-180" : ""}`}>
      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DeliverableRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="text-sm font-medium text-neutral-700">{label}</span>
      <span className="text-sm text-neutral-500 text-right">{value}</span>
    </div>
  );
}

function DocIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 1.5h5.5L13 5v9.5H4V1.5z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.5 1.5V5H13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 8.5h4M6 11h4M6 6h2" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

function TemplateIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="2" y="2.5" width="5" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.2" />
      <rect x="9" y="2.5" width="5" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.2" />
      <rect x="2" y="9.5" width="5" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.2" />
      <rect x="9" y="9.5" width="5" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function DiagramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="3" r="1.25" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="4" cy="8" r="1.25" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="12" cy="8" r="1.25" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="8" cy="13" r="1.25" stroke="currentColor" strokeWidth="1.2" />
      <path d="M7.2 4.1L4.8 7M11.2 7L8.8 4.1M7.2 11.9L4.8 9M11.2 9L8.8 11.9M7.5 4.5v4M8.5 4.5v4" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

function PriceIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M8 4.5v7M5.5 6.5h5M5.5 9.5h5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
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
