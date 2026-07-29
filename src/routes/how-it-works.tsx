import { createFileRoute, Link } from "@tanstack/react-router";
import Navbar from '~/components/Navbar';
import Footer from '~/components/Footer';
import LogoHorizontal from '~/components/LogoHorizontal';

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How It Works — Browse, Watch Demos, Buy & Download | PrismBay" },
      { name: "description", content: "How PrismBay works: browse AI business systems, watch real product demos, check out securely via Stripe, and download your purchase instantly. No mystery boxes." },
      { property: "og:title", content: "How It Works — Browse, Watch Demos, Buy & Download | PrismBay" },
      { property: "og:description", content: "How PrismBay works: browse AI business systems, watch real product demos, check out securely via Stripe, and download your purchase instantly. No mystery boxes." },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://prismbay.com/images/og-default.png" },
      { property: "og:url", content: "https://prismbay.com/how-it-works" },
    ],
    links: [
      { rel: "canonical", href: "https://prismbay.com/how-it-works" },
    ],
  }),
  component: HowItWorksPage,
});

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="7" fill="#16B3A7" />
      <path d="M5 8.5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const STEPS = [
  {
    number: 1,
    title: "Browse & Discover",
    description: "Explore our marketplace of complete AI business systems. Search by keyword, filter by category, or browse bundles. Each product has a clear description, feature list, and transparent pricing — no surprises.",
    details: "Every product listing shows you exactly what's included: workflows, architecture diagrams, revenue models, implementation plans, and commercial launch guidance. You'll see the regular price, the launch price, and your savings upfront.",
  },
  {
    number: 2,
    title: "See Before You Buy",
    description: "Review the complete feature breakdown, technical architecture, and FAQ section so you know exactly what you're getting.",
    details: "Our transparency-first philosophy means you make informed decisions. No mystery boxes, no vague promises — just clear, detailed product presentations with complete feature breakdowns and pricing.",
  },
  {
    number: 3,
    title: "Instant Access",
    description: "Check out securely with Stripe. Your account is created automatically, and you get immediate access to download your purchase. No waiting, no approval process — start building right away.",
    details: "Every purchase includes a single-business perpetual licence. Download the complete documentation package as PDFs and editable source files. Your purchase history and downloads are available in your account.",
  },
];

const TRUST_SIGNALS = [
  "Secure checkout via Stripe",
  "Instant delivery after purchase",
  "14-day money-back guarantee",
  "Clear licence terms included",
  "Editable source files included",
];

function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      <section className="bg-white border-b border-neutral-200">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">How It Works</p>
            <h1 className="mt-2 text-3xl font-bold text-neutral-800 sm:text-4xl">Three steps to your next AI business</h1>
            <p className="mt-4 text-lg text-neutral-500">PrismBay makes buying AI business systems as simple as buying software — but you get the complete blueprint, not just a tool.</p>
          </div>
        </div>
      </section>
      <section className="bg-neutral-50">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <div className="space-y-16">
            {STEPS.map((step) => (
              <div key={step.number} className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
                <div className={`order-2 ${step.number % 2 === 0 ? "lg:order-1" : "lg:order-2"}`}>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-lg font-bold text-brand-600">
                    {step.number}
                  </div>
                  <h2 className="text-2xl font-bold text-neutral-800">{step.title}</h2>
                  <p className="mt-3 text-lg text-neutral-500 leading-relaxed">{step.description}</p>
                  <p className="mt-4 text-sm text-neutral-400 leading-relaxed">{step.details}</p>
                </div>
                <div className={`order-1 ${step.number % 2 === 0 ? "lg:order-2" : "lg:order-1"} flex items-center justify-center`}>
                  <div className="flex h-40 w-40 items-center justify-center rounded-2xl bg-white border border-neutral-200 shadow-sm">
                    <span className="text-6xl font-bold text-brand-200">{step.number}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-white border-t border-neutral-200">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-neutral-800">Why Buy From PrismBay?</h2>
            <p className="mt-3 text-lg text-neutral-500">We built this marketplace differently — with buyer confidence at the centre.</p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TRUST_SIGNALS.map((signal) => (
              <div key={signal} className="flex items-center gap-2.5 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3">
                <CheckIcon />
                <span className="text-sm font-medium text-neutral-700">{signal}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-neutral-50">
        <div className="mx-auto max-w-6xl px-6 py-16 text-center">
          <h2 className="text-2xl font-bold text-neutral-800">Ready to start?</h2>
          <p className="mt-3 text-lg text-neutral-500">Browse the marketplace and find the AI business system that fits your vision.</p>
          <Link to="/products" className="mt-8 inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-8 py-4 text-lg font-semibold text-white shadow-sm transition-all duration-200 hover:bg-brand-600 hover:shadow-md hover:-translate-y-px active:bg-brand-700 active:translate-y-0">
            Browse Products
          </Link>
        </div>
      </section>
      <Footer />
    </div>
  );
}
