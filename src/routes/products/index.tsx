import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PRODUCTS, BUNDLES, CATEGORY_MAP } from "~/data/products";
import CountdownTimer from "~/components/CountdownTimer";
import TrustBadges from "~/components/TrustBadges";

/* ─── Search params type ─── */
type ProductSearch = {
  search?: string;
  category?: string;
  sort?: string;
};

export const Route = createFileRoute("/products/")({
  head: () => ({
    meta: [
      { title: "AI Business Systems Marketplace — PrismBay" },
      { name: "description", content: "Browse premium AI business systems: complete blueprints with workflows, architecture, revenue models & implementation plans. Instant access, launch pricing available." },
      { property: "og:url", content: "https://prismbay.com/products" },
    ],
    links: [
      { rel: "canonical", href: "https://prismbay.com/products" },
    ],
  }),
  validateSearch: (search: Record<string, unknown>): ProductSearch => ({
    search: typeof search.search === "string" ? search.search : undefined,
    category: typeof search.category === "string" ? search.category : undefined,
    sort: typeof search.sort === "string" ? search.sort : undefined,
  }),
  component: ProductsPage,
});

/* ─── Categories with bundle option ─── */
const CATEGORIES = [
  { slug: "all", name: "All", count: PRODUCTS.length },
  { slug: "ai-business-systems", name: "AI Business Systems", count: CATEGORY_MAP["ai-business-systems"]?.count ?? 0 },
  { slug: "ai-development", name: "AI Development", count: CATEGORY_MAP["ai-development"]?.count ?? 0 },
  { slug: "trust-compliance", name: "Trust & Compliance", count: CATEGORY_MAP["trust-compliance"]?.count ?? 0 },
  { slug: "bundles", name: "Bundles", count: BUNDLES.length },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "discount", label: "Biggest Savings" },
];

const ITEMS_PER_PAGE = 6;

/* ─── Inline SVG Icons ─── */
function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill={filled ? "#F59E0B" : "#DEDDDA"} aria-hidden="true">
      <path d="M8 1.5l1.76 4.86 5.17.24-4.1 3.17 1.34 5-4.17-3.08-4.17 3.08 1.34-5-4.1-3.17 5.17-.24L8 1.5z" />
    </svg>
  );
}

function StarRating({ rating, count }: { rating: number; count: number }) {
  if (rating === 0 || count === 0) {
    return <span className="text-sm text-neutral-400 italic">No reviews yet</span>;
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

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="8.5" cy="8.5" r="5" stroke="#9F9E99" strokeWidth="1.5" />
      <path d="M12 12l5 5" stroke="#9F9E99" strokeWidth="1.5" strokeLinecap="round" />
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

function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function CogIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="3" stroke="#16B3A7" strokeWidth="1.5" />
      <path d="M12 1v3m0 16v3M1 12h3m16 0h3M4.93 4.93l2.12 2.12m9.9 9.9l2.12 2.12M4.93 19.07l2.12-2.12m9.9-9.9l2.12-2.12" stroke="#16B3A7" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2l1.5 5.5L19 9l-5.5 1.5L12 16l-1.5-5.5L5 9l5.5-1.5L12 2z" fill="#16B3A7" />
      <path d="M19 15l.8 2.7 2.7.8-2.7.8-.8 2.7-.8-2.7-2.7-.8 2.7-.8.8-2.7z" fill="#16B3A7" opacity="0.5" />
    </svg>
  );
}

function BoxIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" stroke="#16B3A7" strokeWidth="1.5" />
      <path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" stroke="#16B3A7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="#16B3A7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 2v6h6" stroke="#16B3A7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 13H8m8 4H8" stroke="#16B3A7" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function MonitorIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="3" width="20" height="14" rx="2" stroke="#16B3A7" strokeWidth="1.5" />
      <path d="M8 21h8" stroke="#16B3A7" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 17v4" stroke="#16B3A7" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function BundleIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16l4-2 4 2z" stroke="#16B3A7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 7h4m-4 4h4" stroke="#16B3A7" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function EmptySearchIcon() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <circle cx="27" cy="27" r="12" stroke="#DEDDDA" strokeWidth="2" />
      <path d="M36 36l12 12" stroke="#DEDDDA" strokeWidth="2" strokeLinecap="round" />
      <path d="M20 27h14M27 20v14" stroke="#DEDDDA" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

const typeIcons: Record<string, React.FC> = {
  cog: CogIcon,
  sparkle: SparkleIcon,
  box: BoxIcon,
  file: FileIcon,
  monitor: MonitorIcon,
};

type ProductCardItem = {
  slug: string;
  name: string;
  price: number;
  launchPrice: number;
  discountPercent: number;
  category: string;
  categorySlug: string;
  rating: number;
  reviewCount: number;
  description: string;
  typeIcon: string;
  gradient: string;
  demoVideoUrl: string;
};

// Map products to card format
const marketableProducts: ProductCardItem[] = PRODUCTS.map((p) => ({
  slug: p.slug,
  name: p.name,
  price: p.regularPrice,
  launchPrice: p.launchPrice,
  discountPercent: p.discountPercent,
  category: p.category,
  categorySlug: p.categorySlug,
  rating: p.rating,
  reviewCount: p.reviewCount,
  description: p.tagline,
  typeIcon: p.typeIcon,
  gradient: p.gradient,
  demoVideoUrl: p.demoVideoUrl,
}));

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
          <p className="mt-3 text-sm text-neutral-300">Complete AI business systems. Instant access.</p>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          <div>
            <h4 className="mb-4 text-sm font-semibold text-neutral-100">Categories</h4>
            <ul className="space-y-2">
              {CATEGORIES.filter((c) => c.slug !== "all" && c.slug !== "bundles").map((cat) => (
                <li key={cat.slug}>
                  <Link to="/products" search={{ category: cat.slug }} className="text-sm text-neutral-300 transition-colors hover:text-white">{cat.name}</Link>
                </li>
              ))}
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

/* ─── Product Card ─── */
function ProductCard({ product }: { product: ProductCardItem }) {
  return (
    <div className="group cursor-pointer rounded-xl border border-neutral-200 bg-white p-0 transition-all duration-200 hover:border-brand-200 hover:shadow-md hover:-translate-y-0.5">
      <Link
        to={`/products/${product.slug}`}
        className="block"
      >
        <div className={`relative flex aspect-[16/10] items-center justify-center rounded-t-xl bg-gradient-to-br ${product.gradient}`}>
          <img
            src={`/images/products/${product.slug}.png`}
            alt={product.name}
            className="h-full w-full object-cover rounded-t-xl"
            loading="lazy"
          />
          <div className="absolute top-3 left-3 rounded-lg bg-white/90 px-2 py-0.5 text-xs font-medium text-neutral-600 shadow-sm">
            {product.category}
          </div>
          <div className="absolute top-3 right-3 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
            Save {product.discountPercent}%
          </div>
          <div className="absolute bottom-3 left-3 rounded-lg bg-amber-50/90 px-2 py-0.5 text-[11px] font-medium text-amber-700">
            30-day launch offer
          </div>
        </div>
        <div className="p-5">
          <h3 className="text-base font-semibold text-neutral-800">{product.name}</h3>
          <p className="mt-1 text-sm text-neutral-600 line-clamp-2">{product.description}</p>
          <div className="mt-2">
            <StarRating rating={product.rating} count={product.reviewCount} />
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-brand-600">${product.launchPrice}</span>
              <span className="text-sm text-neutral-400 line-through">${product.price}</span>
            </div>
          </div>
        </div>
      </Link>
      <div className="px-5 pb-5 flex gap-2">
        <Link
          to={`/products/${product.slug}`}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-brand-500 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
        >
          View Product
        </Link>
        {product.demoVideoUrl ? (
          <a
            href={`/products/${product.slug}#demo`}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-neutral-200 bg-neutral-100 px-3 py-2 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-200"
          >
            Watch Demo
          </a>
        ) : (
          <Link
            to={`/products/${product.slug}`}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-neutral-200 bg-neutral-100 px-3 py-2 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-200"
          >
            Details
          </Link>
        )}
      </div>
    </div>
  );
}

/* ─── Bundle Card ─── */
function BundleCard({ bundle }: { bundle: typeof BUNDLES[number] }) {
  return (
    <Link
      to={`/products/${bundle.slug}`}
      className="group cursor-pointer rounded-xl border-2 border-amber-200 bg-amber-50/30 p-0 transition-all duration-200 hover:border-amber-300 hover:shadow-md hover:-translate-y-0.5"
    >
      <div className="relative flex aspect-[16/10] items-center justify-center rounded-t-xl bg-gradient-to-br from-amber-50 via-amber-100/50 to-brand-50">
        <img
          src={`/images/products/${bundle.slug}.png`}
          alt={`${bundle.name} bundle collection`}
          className="h-full w-full object-cover rounded-t-xl"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 rounded-lg bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
          Bundle
        </div>
        <div className="absolute top-3 right-3 rounded-full bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-700">
          Save ${bundle.saving.toLocaleString()}
        </div>
        <div className="absolute bottom-3 left-3 rounded-lg bg-amber-50/90 px-2 py-0.5 text-[11px] font-medium text-amber-700">
          30-day launch offer
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-base font-semibold text-neutral-800">{bundle.name}</h3>
        <p className="mt-1 text-sm text-neutral-600 line-clamp-2">{bundle.description}</p>
        <p className="mt-2 text-xs text-neutral-400">
          Includes: {bundle.productNames.join(", ")}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-brand-600">${bundle.launchPrice.toLocaleString()}</span>
            <span className="text-sm text-neutral-400 line-through">${bundle.regularCombined.toLocaleString()}</span>
          </div>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-100">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 8h10m0 0L9 4m4 4l-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ─── Main Products Page ─── */
function ProductsPage() {
  const searchParams = useSearch({ from: "/products/" }) as ProductSearch;
  const navigate = useNavigate();

  const activeSearch = searchParams.search ?? "";
  const activeCategory = searchParams.category ?? "all";
  const activeSort = searchParams.sort ?? "newest";

  const [searchInput, setSearchInput] = useState(activeSearch);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  const showingBundles = activeCategory === "bundles";

  /* ─── Filter + Sort Logic ─── */
  const filtered = useMemo(() => {
    if (showingBundles) return [];
    let results = [...marketableProducts];

    if (activeSearch.trim()) {
      const query = activeSearch.toLowerCase().trim();
      results = results.filter(
        (p) => p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query)
      );
    }

    if (activeCategory && activeCategory !== "all" && activeCategory !== "bundles") {
      results = results.filter((p) => p.categorySlug === activeCategory);
    }

    switch (activeSort) {
      case "price-asc":
        results.sort((a, b) => a.launchPrice - b.launchPrice);
        break;
      case "price-desc":
        results.sort((a, b) => b.launchPrice - a.launchPrice);
        break;
      case "discount":
        results.sort((a, b) => b.discountPercent - a.discountPercent);
        break;
    }

    return results;
  }, [activeSearch, activeCategory, activeSort, showingBundles]);

  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [activeSearch, activeCategory, activeSort]);

  const visibleProducts = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const activeFilterCount = [
    activeSearch ? 1 : 0,
    activeCategory && activeCategory !== "all" ? 1 : 0,
    activeSort && activeSort !== "newest" ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const updateParams = useCallback(
    (updates: Partial<ProductSearch>) => {
      const params: Record<string, string> = {};
      const s = updates.search !== undefined ? updates.search : activeSearch;
      const c = updates.category !== undefined ? updates.category : activeCategory;
      const so = updates.sort !== undefined ? updates.sort : activeSort;

      if (s) params.search = s;
      if (c && c !== "all") params.category = c;
      if (so && so !== "newest") params.sort = so;

      navigate({ to: "/products", search: params as any, replace: true });
    },
    [activeSearch, activeCategory, activeSort, navigate]
  );

  const clearAll = () => {
    setSearchInput("");
    setVisibleCount(ITEMS_PER_PAGE);
    navigate({ to: "/products", search: {} as any, replace: true });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ search: searchInput || undefined });
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />

      {/* Page Header */}
      <section className="bg-white border-b border-neutral-200">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <nav className="flex items-center gap-2 text-sm text-neutral-400 mb-3">
            <Link to="/" className="hover:text-neutral-600 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-neutral-600 font-medium">Products</span>
          </nav>
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
            <div>
              <h1 className="text-3xl font-bold text-neutral-800">
                {showingBundles ? "Product Bundles" : "Build Smarter AI Businesses"}
              </h1>
              <p className="mt-1 text-neutral-600">
                {showingBundles
                  ? `${BUNDLES.length} bundles available — save up to $1,542`
                  : activeCategory !== "all"
                    ? `${filtered.length} products in this category · 9 products + 3 bundles available`
                    : `9 products + 3 bundles available`}
              </p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-4">
            <CountdownTimer variant="compact" />
            <p className="text-xs text-neutral-400">
              Introductory launch pricing — 30 days only. After that, regular prices apply.
            </p>
          </div>
        </div>
      </section>

      {/* Search + Filter Bar */}
      <div className="sticky top-16 z-40 bg-white border-b border-neutral-200">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <SearchIcon />
              </div>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search products..."
                className="block w-full rounded-xl border border-neutral-300 bg-neutral-50 pl-12 pr-4 py-2.5 text-base text-neutral-700 placeholder:text-neutral-400 h-12 transition-colors duration-200 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => { setSearchInput(""); updateParams({ search: undefined }); }}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-400 hover:text-neutral-600"
                >
                  <XIcon />
                </button>
              )}
            </form>
            {!showingBundles && (
              <div className="relative">
                <select
                  value={activeSort}
                  onChange={(e) => updateParams({ sort: e.target.value })}
                  className="appearance-none block w-full sm:w-auto rounded-lg border border-neutral-300 bg-white pl-4 pr-10 py-2.5 text-sm font-medium text-neutral-700 transition-colors duration-200 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 cursor-pointer"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-400">
                  <ChevronDownIcon />
                </div>
              </div>
            )}
            {activeFilterCount > 0 && (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">
                  {activeFilterCount} {activeFilterCount === 1 ? "filter" : "filters"} active
                </span>
                <button onClick={clearAll} className="text-xs font-medium text-brand-600 hover:text-brand-700 transition-colors">Clear all</button>
              </div>
            )}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => updateParams({ category: cat.slug === "all" ? undefined : cat.slug })}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-200 cursor-pointer ${
                  activeCategory === cat.slug || (cat.slug === "all" && !activeCategory)
                    ? "bg-brand-500 text-white shadow-sm"
                    : "bg-neutral-100 text-neutral-600 border border-neutral-200 hover:bg-neutral-200 hover:border-neutral-300"
                }`}
              >
                {cat.name}
                <span className={`text-xs ${activeCategory === cat.slug || (cat.slug === "all" && !activeCategory) ? "text-white/70" : "text-neutral-400"}`}>
                  {cat.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Product Grid or Bundles or Empty */}
      <section className="bg-neutral-50">
        <div className="mx-auto max-w-7xl px-6 py-10">
          {showingBundles ? (
            /* Bundle Grid */
            <div>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-neutral-800">Bundle & Save</h2>
                <p className="mt-2 text-neutral-600">Get multiple AI business systems together and save up to $1,542 during our 30-day launch.</p>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {BUNDLES.map((bundle) => (
                  <BundleCard key={bundle.slug} bundle={bundle} />
                ))}
              </div>
            </div>
          ) : visibleProducts.length > 0 ? (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {visibleProducts.map((product) => (
                  <ProductCard key={product.slug} product={product} />
                ))}
              </div>
              {hasMore && (
                <div className="mt-10 text-center">
                  <button
                    onClick={() => setVisibleCount((prev) => prev + ITEMS_PER_PAGE)}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-neutral-100 px-6 py-3 text-base font-semibold text-neutral-700 transition-all duration-200 hover:bg-neutral-200 active:bg-neutral-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30 focus-visible:ring-offset-2"
                  >
                    Load more products
                    <ChevronDownIcon />
                  </button>
                </div>
              )}
              {filtered.length > ITEMS_PER_PAGE && (
                <p className="mt-4 text-center text-sm text-neutral-400">
                  Showing {visibleProducts.length} of {filtered.length} products
                </p>
              )}

              {/* Bundles callout below product grid */}
              <div className="mt-16 border-t border-neutral-200 pt-12">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-neutral-800">Save more with bundles</h2>
                  <p className="mt-2 text-neutral-600">Get multiple AI business systems together and save during our 30-day launch.</p>
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {BUNDLES.map((bundle) => (
                    <BundleCard key={bundle.slug} bundle={bundle} />
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-20">
              <EmptySearchIcon />
              <h3 className="mt-6 text-xl font-semibold text-neutral-700">No products match your filters</h3>
              <p className="mt-2 text-neutral-600 max-w-md text-center">
                Try adjusting your search terms or clearing some filters to find what you're looking for.
              </p>
              <button
                onClick={clearAll}
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-6 py-3 text-base font-semibold text-white shadow-sm transition-all duration-200 hover:bg-brand-600 hover:shadow-md hover:-translate-y-px active:bg-brand-700 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30 focus-visible:ring-offset-2"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </section>

      <TrustBadges className="mt-12 mb-4" />
      <Footer />
    </div>
  );
}
