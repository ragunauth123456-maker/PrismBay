import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { COMPARISONS, getComparisonBySlug } from "~/data/comparisons";
import { getProductBySlug } from "~/data/products";
import ComparisonContent from "~/components/ComparisonTable";
import Navbar from '~/components/Navbar';
import Footer from '~/components/Footer';
import { breadcrumbListScript, twitterMeta } from "~/utils/seo";
export const Route = createFileRoute("/compare/$slug")({
  loader: ({ params }) => {
    const comparison = getComparisonBySlug(params.slug);
    if (!comparison) throw notFound();
    return { comparison };
  },
  head: ({ loaderData }) => {
    const { comparison } = loaderData;
    const title = `${comparison.title} — Comparison | PrismBay`;
    const products = comparison.productSlugs
      .map((s) => getProductBySlug(s))
      .filter(Boolean);
    const canonicalUrl = `https://www.prismbayai.com/compare/${comparison.slug}`;
    return {
      meta: [
        { title },
        { name: "description", content: comparison.seoDescription },
        { property: "og:title", content: title },
        { property: "og:description", content: comparison.seoDescription },
        { property: "og:type", content: "website" },
        { property: "og:url", content: canonicalUrl },
        ...twitterMeta(title, comparison.seoDescription),
      ],
      links: [
        { rel: "canonical", href: canonicalUrl },
      ],
      scripts: [
        breadcrumbListScript([
          { name: "Home", url: "https://www.prismbayai.com" },
          { name: "Compare", url: "https://www.prismbayai.com/compare" },
          { name: comparison.title, url: canonicalUrl },
        ]),
      ],
    };
  },
  component: ComparePage,
  notFoundComponent: CompareNotFound,
});
function CompareNotFound() {
  return (
    <div>
      <Navbar />
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h1 className="text-2xl font-bold text-neutral-800">Comparison not found</h1>
        <p className="mt-4 text-neutral-500">
          This comparison doesn't exist. Browse available comparisons below.
        </p>
        <Link to="/compare" className="mt-6 inline-block rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600">
          See all comparisons
        </Link>
      </div>
      <Footer />
    </div>
  );
}
function ComparePage() {
  const { comparison } = Route.useLoaderData();
  return (
    <div>
      <Navbar />
      <ComparisonContent config={comparison} />
      <Footer />
    </div>
  );
}
