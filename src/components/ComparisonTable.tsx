import { Link } from "@tanstack/react-router";
import { PRODUCTS, BUNDLES, getProductBySlug, getBundleForProduct, type Product, type Bundle } from "~/data/products";
import type { ComparisonConfig, ComparisonDimension, FeatureGroup } from "~/data/comparisons";
import CountdownTimer from "~/components/CountdownTimer";

/* ─── Inline SVG Icons ─── */

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="7" fill="#16B3A7" />
      <path d="M5 8.5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="3" y="7" width="10" height="2" rx="1" fill="#DEDDDA" />
    </svg>
  );
}

function WinnerBadge() {
  return (
    <span className="ml-1.5 inline-flex items-center rounded-full bg-accent-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent-700">
      Best
    </span>
  );
}

/* ─── Comparison Table Header ─── */

function ComparisonHeader({ products }: { products: Product[] }) {
  return (
    <thead>
      <tr>
        <th className="w-1/4 py-4 pr-4 text-left"></th>
        {products.map((p) => (
          <th key={p.slug} className="w-1/4 py-4 px-3 text-center">
            <Link
              to={`/products/${p.slug}`}
              className="inline-block text-base font-bold text-navy-800 hover:text-brand-600 transition-colors"
            >
              {p.name}
            </Link>
            <p className="text-xs text-neutral-400 mt-0.5">{p.tagline}</p>
          </th>
        ))}
      </tr>
    </thead>
  );
}

/* ─── Row: Quick Comparison ─── */

function QuickComparisonRow({ dimension, productCount }: { dimension: ComparisonDimension; productCount: number }) {
  return (
    <tr className="border-b border-neutral-100">
      <td className="py-3 pr-4 text-sm font-medium text-neutral-700">
        {dimension.name}
      </td>
      {dimension.values.map((val, i) => (
        <td key={i} className="py-3 px-3 text-center text-sm text-neutral-600">
          <span className={i === dimension.winnerIndex ? "font-semibold text-brand-700" : ""}>
            {val}
          </span>
          {i === dimension.winnerIndex && <WinnerBadge />}
        </td>
      ))}
    </tr>
  );
}

/* ─── Row: Feature Group ─── */

function FeatureGroupSection({ group, productCount }: { group: FeatureGroup; productCount: number }) {
  return (
    <>
      <tr>
        <td colSpan={productCount + 1} className="pt-6 pb-2">
          <h3 className="text-sm font-semibold text-navy-800 uppercase tracking-wide">
            {group.groupName}
          </h3>
        </td>
      </tr>
      {group.features.map((feat, fi) => (
        <tr key={fi} className="border-b border-neutral-100">
          <td className="py-3 pr-4 text-sm text-neutral-600 pl-4">
            {feat.name}
          </td>
          {feat.values.map((val, vi) => (
            <td key={vi} className="py-3 px-3 text-center text-sm">
              {renderFeatureValue(val)}
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

function renderFeatureValue(val: string) {
  if (val === "✓") return <CheckIcon />;
  if (val === "—") return <DashIcon />;
  return <span className="text-neutral-600">{val}</span>;
}

/* ─── Pricing Comparison Section ─── */

function PricingComparison({ products, config }: { products: Product[]; config: ComparisonConfig }) {
  const bundle: Bundle | undefined = config.bundleSlug
    ? BUNDLES.find((b) => b.slug === config.bundleSlug)
    : undefined;

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <h2 className="text-2xl font-bold text-neutral-800 text-center">Pricing Comparison</h2>
        <p className="mt-2 text-neutral-500 text-center">
          Launch pricing available until{" "}
          <span className="font-semibold text-amber-600">August 27, 2026</span>.
        </p>

        {/* Countdown */}
        <div className="mt-4 flex justify-center">
          <CountdownTimer variant="hero" />
        </div>

        {/* Pricing cards */}
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <div
              key={p.slug}
              className="rounded-xl border border-neutral-200 bg-white p-6 text-center"
            >
              <h3 className="text-lg font-bold text-neutral-800">{p.name}</h3>
              <p className="mt-1 text-sm text-neutral-500">{p.tagline}</p>
              <div className="mt-4">
                <span className="text-3xl font-bold text-brand-600">${p.launchPrice}</span>
                <span className="ml-2 text-sm text-neutral-400 line-through">${p.regularPrice}</span>
              </div>
              <p className="mt-1 text-xs font-medium text-amber-600">
                Save ${p.regularPrice - p.launchPrice} ({p.discountPercent}%)
              </p>
              <Link
                to={`/products/${p.slug}`}
                className="mt-4 inline-block w-full rounded-lg bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-800"
              >
                Get {p.name} for ${p.launchPrice}
              </Link>
            </div>
          ))}
        </div>

        {/* Bundle upsell */}
        {bundle && (
          <div className="mt-10 rounded-2xl border-2 border-accent-300 bg-accent-50 p-8 text-center">
            <span className="inline-flex items-center rounded-full bg-accent-200 px-3 py-1 text-xs font-semibold text-accent-800">
              Save More
            </span>
            <h3 className="mt-3 text-xl font-bold text-neutral-800">
              Get the {bundle.name}
            </h3>
            <p className="mt-2 text-sm text-neutral-600 max-w-lg mx-auto">
              {bundle.description}
            </p>
            <div className="mt-4">
              <span className="text-3xl font-bold text-accent-600">${bundle.launchPrice}</span>
              <span className="ml-2 text-sm text-neutral-400 line-through">
                ${bundle.regularCombined}
              </span>
              <span className="ml-2 inline-block rounded bg-accent-100 px-2 py-0.5 text-xs font-semibold text-accent-700">
                Save ${bundle.saving}
              </span>
            </div>
            <p className="mt-1 text-sm text-neutral-500">
              Includes: {bundle.productNames.join(" + ")}
            </p>
            <Link
              to={`/products/${bundle.slug}`}
              className="mt-4 inline-block rounded-lg bg-accent-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-600"
            >
              View {bundle.name} →
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

/* ─── "Still Not Sure?" Section ─── */

function StillNotSure({ products, config }: { products: Product[]; config: ComparisonConfig }) {
  return (
    <section className="bg-neutral-50">
      <div className="mx-auto max-w-3xl px-6 py-14 text-center">
        <h2 className="text-2xl font-bold text-neutral-800">Still not sure?</h2>
        <p className="mt-2 text-neutral-500">
          Explore each product in detail or see all comparisons.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          {products.map((p) => (
            <Link
              key={p.slug}
              to={`/products/${p.slug}`}
              className="rounded-lg border border-neutral-200 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-700 transition-all hover:border-brand-200 hover:text-brand-600 hover:shadow-sm"
            >
              {p.name} details →
            </Link>
          ))}
          <Link
            to="/compare"
            className="rounded-lg border border-neutral-200 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-700 transition-all hover:border-brand-200 hover:text-brand-600 hover:shadow-sm"
          >
            All comparisons →
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─── Main Export: Full Comparison Page Content ─── */

export default function ComparisonContent({ config }: { config: ComparisonConfig }) {
  const products: Product[] = config.productSlugs
    .map((s) => getProductBySlug(s))
    .filter(Boolean) as Product[];

  if (products.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h1 className="text-2xl font-bold text-neutral-800">Comparison not available</h1>
        <p className="mt-4 text-neutral-500">
          The products in this comparison could not be loaded. Please check back later.
        </p>
        <Link to="/compare" className="mt-6 inline-block text-brand-600 font-semibold hover:underline">
          ← Back to comparisons
        </Link>
      </div>
    );
  }

  const isThreeWay = products.length === 3;

  return (
    <div>
      {/* ─── Hero ─── */}
      <section className="bg-navy-900">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:py-20">
          {/* Breadcrumb */}
          <nav className="mb-6">
            <Link to="/" className="text-sm text-navy-300 hover:text-white transition-colors">
              Home
            </Link>
            <span className="mx-2 text-navy-500">/</span>
            <Link to="/compare" className="text-sm text-navy-300 hover:text-white transition-colors">
              Compare
            </Link>
            <span className="mx-2 text-navy-500">/</span>
            <span className="text-sm text-navy-400">{config.title}</span>
          </nav>

          <h1 className="text-3xl font-bold text-white lg:text-4xl">{config.title}</h1>
          <p className="mt-3 max-w-2xl text-lg text-navy-200">{config.oneLiner}</p>

          {/* Dual CTAs */}
          <div className="mt-8 flex flex-wrap gap-4">
            {products.map((p, i) => (
              <Link
                key={p.slug}
                to={`/products/${p.slug}`}
                className={`rounded-lg px-6 py-3 text-sm font-semibold transition-all ${
                  i === 0
                    ? "bg-brand-500 text-white hover:bg-brand-600"
                    : "border border-navy-600 text-navy-100 hover:border-navy-400 hover:text-white"
                }`}
              >
                View {p.name} →
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Decision Guide ─── */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <h2 className="text-2xl font-bold text-neutral-800 text-center">
            {isThreeWay ? "Which One Is Right for You?" : "Decision Guide"}
          </h2>
          <div className={`mt-8 grid gap-6 ${isThreeWay ? "lg:grid-cols-3" : "md:grid-cols-2"}`}>
            {/* First product */}
            <div className="rounded-xl border border-brand-100 bg-brand-50/40 p-6">
              <h3 className="text-lg font-bold text-brand-700">{config.decisionGuide.titleA}</h3>
              <p className="mt-2 text-sm text-neutral-600 leading-relaxed">
                {config.decisionGuide.descriptionA}
              </p>
            </div>
            {/* Second product */}
            <div className="rounded-xl border border-neutral-200 bg-white p-6">
              <h3 className="text-lg font-bold text-neutral-800">{config.decisionGuide.titleB}</h3>
              <p className="mt-2 text-sm text-neutral-600 leading-relaxed">
                {config.decisionGuide.descriptionB}
              </p>
            </div>
            {/* Third product for 3-way */}
            {isThreeWay && products.length > 2 && config.decisionGuide.titleC && (
              <div className="rounded-xl border border-accent-100 bg-accent-50/40 p-6">
                <h3 className="text-lg font-bold text-accent-700">{config.decisionGuide.titleC}</h3>
                <p className="mt-2 text-sm text-neutral-600 leading-relaxed">
                  {config.decisionGuide.descriptionC}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── Quick Comparison Table ─── */}
      <section className="bg-neutral-50">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <h2 className="text-2xl font-bold text-neutral-800 text-center">Quick Comparison</h2>
          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <ComparisonHeader products={products} />
              <tbody>
                {config.quickComparison.map((dim, i) => (
                  <QuickComparisonRow key={i} dimension={dim} productCount={products.length} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ─── Detailed Feature Breakdown ─── */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <h2 className="text-2xl font-bold text-neutral-800 text-center">Detailed Feature Comparison</h2>
          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <ComparisonHeader products={products} />
              <tbody>
                {config.featureGroups.map((group, i) => (
                  <FeatureGroupSection key={i} group={group} productCount={products.length} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ─── Pricing Comparison ─── */}
      <PricingComparison products={products} config={config} />

      {/* ─── Still Not Sure? ─── */}
      <StillNotSure products={products} config={config} />
    </div>
  );
}
