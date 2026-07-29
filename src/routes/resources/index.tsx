import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { ARTICLES, CATEGORIES, isPublished } from "~/data/articles";
import Navbar from '~/components/Navbar';
import Footer from '~/components/Footer';

export const Route = createFileRoute("/resources/")({
  head: () => ({
    meta: [
      { title: "Resources & Guides — AI Business Systems | PrismBay" },
      {
        name: "description",
        content:
          "Explore guides, articles, and resources on AI business systems, digital transformation, AI compliance, AI workforce platforms, and building AI-native businesses.",
      },
      {
        property: "og:title",
        content: "Resources & Guides — AI Business Systems | PrismBay",
      },
      {
        property: "og:description",
        content:
          "Explore guides, articles, and resources on AI business systems, digital transformation, AI compliance, AI workforce platforms, and building AI-native businesses.",
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://prismbay.com/images/og-default.png" },
      { property: "og:url", content: "https://prismbay.com/resources" },
    ],
    links: [{ rel: "canonical", href: "https://prismbay.com/resources" }],
  }),
  component: ResourcesPage,
});

/* ─── Inline SVG Icons ─── */
function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="5.5" stroke="#9F9E99" strokeWidth="1.2" />
      <path d="M7 4.5V7l2 1.5" stroke="#9F9E99" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M8 2h4v4" stroke="#9F9E99" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 8l6-6" stroke="#9F9E99" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 8.5V11a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1h2.5" stroke="#9F9E99" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ─── Resources Page ─── */
function ResourcesPage() {
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredArticles = useMemo(() => {
    if (activeCategory === "all") return ARTICLES;
    return ARTICLES.filter((a) => a.category === activeCategory);
  }, [activeCategory]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="bg-navy-900">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-400">Resources</p>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Resources & Guides
            </h1>
            <p className="mt-6 text-lg text-neutral-300 sm:text-xl">
              Learn how to build, operate, and scale with AI business systems — from architecture deep dives to product comparisons and transformation playbooks.
            </p>
          </div>
        </div>
      </section>

      {/* Filter pills */}
      <section className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setActiveCategory(cat.slug)}
                className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  activeCategory === cat.slug
                    ? "bg-navy-900 text-white shadow-sm"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-800"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Article grid */}
      <section className="bg-neutral-50">
        <div className="mx-auto max-w-7xl px-6 py-16">
          {filteredArticles.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-lg text-neutral-500">No articles found in this category yet.</p>
              <button
                onClick={() => setActiveCategory("all")}
                className="mt-4 text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                View all articles →
              </button>
            </div>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {filteredArticles.map((article) => {
                const published = isPublished(article);
                const CardContent = (
                  <article
                    className={`group flex flex-col rounded-xl border border-neutral-200 bg-white p-6 shadow-sm transition-all duration-200 ${
                      published
                        ? "cursor-pointer hover:shadow-md hover:-translate-y-0.5 hover:border-brand-200"
                        : ""
                    }`}
                  >
                    {/* Category pill */}
                    <div className="mb-3">
                      <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">
                        {CATEGORIES.find((c) => c.slug === article.category)?.name ?? article.category}
                      </span>
                    </div>

                    {/* Title */}
                    <h3
                      className={`text-lg font-semibold transition-colors ${
                        published
                          ? "text-neutral-800 group-hover:text-brand-600"
                          : "text-neutral-800"
                      }`}
                    >
                      {article.title}
                    </h3>

                    {/* Description */}
                    <p className="mt-2 flex-grow text-sm text-neutral-500 leading-relaxed">
                      {article.description}
                    </p>

                    {/* Footer: read time + badge */}
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1 text-xs text-neutral-400">
                          <ClockIcon />
                          {article.readTime} min read
                        </span>
                        {article.linkedProducts.length > 0 && (
                          <span className="inline-flex items-center gap-1 text-xs text-neutral-400">
                            <LinkIcon />
                            {article.linkedProducts.length}{" "}
                            {article.linkedProducts.length === 1 ? "product" : "products"}
                          </span>
                        )}
                      </div>
                      {published ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 group-hover:text-brand-700 transition-colors">
                          Read article
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                            <path d="M3 9l4.5-4.5L3 0" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M7.5 9V0" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                          </svg>
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-brand-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          Coming soon
                        </span>
                      )}
                    </div>
                  </article>
                );

                if (published) {
                  return (
                    <Link
                      key={article.slug}
                      to="/resources/$slug"
                      params={{ slug: article.slug }}
                      className="block"
                    >
                      {CardContent}
                    </Link>
                  );
                }
                return <div key={article.slug}>{CardContent}</div>;
              })}
            </div>
          )}

          {/* Footer note */}
          <div className="mt-12 text-center">
            <p className="text-sm text-neutral-400">
              We're publishing new guides regularly. Full articles with detailed walkthroughs, diagrams, and downloadable resources are added weekly.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-navy-900">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center sm:py-20">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">Ready to put these ideas into practice?</h2>
          <p className="mt-4 text-lg text-neutral-300">
            Browse complete AI business system blueprints — each with detailed architecture, workflows, and implementation plans.
          </p>
          <Link
            to="/products"
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-8 py-4 text-lg font-semibold text-white shadow-sm transition-all duration-200 hover:bg-brand-600 hover:shadow-md hover:-translate-y-px active:bg-brand-700 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900"
          >
            Browse the Marketplace
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M4 10h12m0 0l-5-5m5 5l-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
