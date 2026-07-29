import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getArticleBySlug, isPublished, CATEGORIES } from "~/data/articles";
import Navbar from '~/components/Navbar';
import Footer from '~/components/Footer';
import { breadcrumbListScript, twitterMeta } from "~/utils/seo";
export const Route = createFileRoute("/resources/$slug")({
  head: ({ loaderData }) => {
    const article = loaderData;
    if (!article) {
      return {
        meta: [{ title: "Article not found — PrismBay" }],
      };
    }
    const seoTitle = article.seoTitle ?? `${article.title} — PrismBay`;
    const seoDesc = article.metaDescription ?? article.description;
    const canonicalUrl = `https://www.prismbayai.com/resources/${article.slug}`;
    return {
      meta: [
        { title: seoTitle },
        { name: "description", content: seoDesc },
        { property: "og:title", content: seoTitle },
        { property: "og:description", content: seoDesc },
        { property: "og:type", content: "article" },
        ...twitterMeta(seoTitle, seoDesc),
      ],
      links: [
        {
          rel: "canonical",
          href: canonicalUrl,
        },
      ],
      scripts: [
        breadcrumbListScript([
          { name: "Home", url: "https://www.prismbayai.com" },
          { name: "Resources", url: "https://www.prismbayai.com/resources" },
          { name: article.title, url: canonicalUrl },
        ]),
      ],
    };
  },
  loader: ({ params }) => {
    const article = getArticleBySlug(params.slug);
    if (!article || !isPublished(article)) {
      throw notFound();
    }
    return article;
  },
  notFoundComponent: () => (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <Navbar />
      <div className="mt-20">
        <h1 className="text-3xl font-bold text-neutral-800">Article not found</h1>
        <p className="mt-4 text-neutral-500">The article you're looking for doesn't exist or hasn't been published yet.</p>
        <Link to="/resources" className="mt-6 inline-block rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600">
          Browse all resources
        </Link>
      </div>
      <Footer />
    </div>
  ),
  component: ResourceArticlePage,
});
function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="5.5" stroke="#9F9E99" strokeWidth="1.2" />
      <path d="M7 4.5V7l2 1.5" stroke="#9F9E99" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function ResourceArticlePage() {
  const article = Route.useLoaderData();
  const categoryName =
    CATEGORIES.find((c) => c.slug === article.category)?.name ?? article.category;
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      {/* Article header */}
      <section className="bg-navy-900">
        <div className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Link
              to="/resources"
              className="inline-flex items-center gap-1.5 text-sm text-neutral-400 transition-colors hover:text-white"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M9 3L5 7l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              All Resources
            </Link>
          </div>
          {/* Category + read time */}
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center rounded-full bg-brand-500/15 px-3 py-1 text-xs font-medium text-brand-300">
              {categoryName}
            </span>
            <span className="inline-flex items-center gap-1.5 text-sm text-neutral-400">
              <ClockIcon />
              {article.readTime} min read
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {article.title}
          </h1>
          <p className="mt-4 text-lg text-neutral-300 leading-relaxed">
            {article.description}
          </p>
          {/* Linked products */}
          {article.linkedProducts.length > 0 && (
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <span className="text-xs text-neutral-400">Related products:</span>
              {article.linkedProducts.map((p) => (
                <Link
                  key={p}
                  to="/products"
                  className="inline-flex items-center rounded-full border border-navy-600 bg-navy-800 px-3 py-1 text-xs font-medium text-neutral-300 transition-colors hover:border-brand-500 hover:text-brand-300"
                >
                  {p}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
      {/* Article body */}
      <section className="bg-white">
        <div className="mx-auto max-w-3xl px-6 py-12 sm:py-16">
          <div
            className="article-body prose-custom"
            dangerouslySetInnerHTML={{ __html: article.bodyHtml ?? "" }}
          />
        </div>
      </section>
      {/* Back to resources */}
      <section className="border-t border-neutral-100 bg-neutral-50">
        <div className="mx-auto max-w-3xl px-6 py-12 text-center">
          <Link
            to="/resources"
            className="inline-flex items-center gap-2 text-sm font-medium text-brand-600 transition-colors hover:text-brand-700"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M9 3L5 7l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to All Resources
          </Link>
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
