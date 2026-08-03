import { Link } from "@tanstack/react-router";
import LogoHorizontal from "~/components/LogoHorizontal";
import TrustBadges from "~/components/TrustBadges";
import { calculateLaunchDeadline, type Product, type Bundle } from "~/data/products";

const DISCLAIMER = "This is an informational blueprint and implementation guide, not a functioning software application. You receive complete documentation, workflows, architecture, revenue models, and launch guidance to build this AI business system.";

export type JvzooConfig = {
  productKey: "genesis" | "nexus" | "portfolio";
  product: Product | Bundle;
  tagline: string;
  audience: string;
  features: { title: string; description: string }[];
  faq: { question: string; answer: string }[];
};

function StarRating() { return null; }

function isBundle(product: Product | Bundle): product is Bundle {
  return "regularCombined" in product;
}

export default function JvzooSalesPage({ config }: { config: JvzooConfig }) {
  const bundle = isBundle(config.product);
  const price = productPrice(config.product);
  const regular = bundle ? config.product.regularCombined : config.product.regularPrice;
  const saving = regular - price;
  const percent = Math.round((saving / regular) * 100);
  const included = bundle ? config.product.productNames.map((name) => `${name} — complete blueprint and implementation guide`) : config.product.included;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <header className="border-b border-white/10 bg-neutral-950/90">
        <div className="mx-auto flex max-w-6xl items-center px-5 py-5"><Link to="/" aria-label="PrismBay home"><LogoHorizontal /></Link><span className="ml-auto text-xs font-medium uppercase tracking-[0.2em] text-brand-300">JVZoo Partner Offer</span></div>
      </header>
      <main>
        <section className="relative overflow-hidden border-b border-white/10 px-5 py-16 sm:py-24">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(20,184,166,0.18),transparent_45%)]" />
          <div className="relative mx-auto max-w-5xl text-center">
            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-brand-300">PrismBay blueprint system</p>
            <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight text-white sm:text-6xl">{config.product.name}</h1>
            <p className="mx-auto mt-6 max-w-2xl text-xl leading-8 text-neutral-300 sm:text-2xl">{config.tagline}</p>
            <StarRating />
            <div className="mx-auto mt-10 flex max-w-md flex-col items-center gap-3">
              <div className="flex items-center gap-3"><span className="text-5xl font-bold text-white">{money(price)}</span><span className="text-xl text-neutral-500 line-through">{money(regular)}</span></div>
              <span className="rounded-full bg-brand-400/15 px-4 py-1.5 text-sm font-semibold text-brand-300">Save {money(saving)} · {percent}% off</span>
              <p className="text-xs text-neutral-400">Launch pricing available through {calculateLaunchDeadline()}</p>
              <BuyButton productKey={config.productKey} price={price} />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-5 py-16 sm:py-20"><div className="grid gap-12 lg:grid-cols-[1fr_0.9fr]">
          <div><Eyebrow>What you get</Eyebrow><h2 className="mt-3 text-3xl font-bold text-white">A complete plan to build with confidence</h2><ul className="mt-8 space-y-4">{included.map((item) => <li key={item} className="flex gap-3 text-neutral-300"><span className="mt-1 text-brand-300">✓</span><span>{item}</span></li>)}</ul></div>
          <div className="rounded-2xl border border-brand-400/25 bg-brand-400/5 p-7"><Eyebrow>Who this is for</Eyebrow><p className="mt-4 text-lg leading-8 text-neutral-200">{config.audience}</p><p className="mt-5 text-sm leading-7 text-neutral-400">PrismBay blueprints give your team the strategic, technical, and commercial foundation to move from concept to an implementation-ready product.</p></div>
        </div></section>

        <section className="border-y border-white/10 bg-neutral-900/70 px-5 py-16 sm:py-20"><div className="mx-auto max-w-5xl"><Eyebrow>Product details</Eyebrow><h2 className="mt-3 text-3xl font-bold text-white">The thinking behind the build</h2><div className="mt-10 grid gap-5 sm:grid-cols-2">{config.features.map((feature) => <article key={feature.title} className="rounded-xl border border-white/10 bg-neutral-950 p-6"><h3 className="font-semibold text-brand-200">{feature.title}</h3><p className="mt-3 text-sm leading-7 text-neutral-400">{feature.description}</p></article>)}</div></div></section>

        <section className="mx-auto max-w-4xl px-5 py-16"><div className="rounded-2xl border border-amber-400/30 bg-amber-400/5 p-7 sm:p-9"><h2 className="text-lg font-bold text-amber-200">Important: blueprint format</h2><p className="mt-4 text-sm leading-7 text-neutral-300">{DISCLAIMER}</p></div></section>

        <section className="border-y border-white/10 bg-neutral-900/70 px-5 py-16"><div className="mx-auto max-w-3xl text-center"><Eyebrow>Simple, transparent pricing</Eyebrow><h2 className="mt-3 text-3xl font-bold text-white">Everything included in one purchase</h2><div className="mx-auto mt-8 max-w-md rounded-2xl border border-white/10 bg-neutral-950 p-7"><div className="flex items-end justify-center gap-3"><strong className="text-4xl text-white">{money(price)}</strong><span className="mb-1 text-neutral-500 line-through">{money(regular)}</span></div><p className="mt-3 text-sm text-brand-300">Save {money(saving)} ({percent}% off)</p><p className="mt-5 text-sm leading-7 text-neutral-400">{bundle ? "All 9 AI business systems, with documentation for every business function." : "Complete documentation, workflows, architecture, revenue model, and launch guidance."}</p><BuyButton productKey={config.productKey} price={price} /></div></div></section>

        <section className="mx-auto max-w-5xl px-5 py-14"><TrustBadges className="text-neutral-300" /></section>
        <section className="border-t border-white/10 px-5 py-16"><div className="mx-auto max-w-3xl"><Eyebrow>Questions, answered</Eyebrow><h2 className="mt-3 text-3xl font-bold text-white">FAQ</h2><div className="mt-8 divide-y divide-white/10">{[...config.faq, { question: "Is this software?", answer: DISCLAIMER }].map((item) => <details key={item.question} className="group py-5"><summary className="cursor-pointer list-none pr-8 font-semibold text-neutral-200 marker:hidden">{item.question}<span className="float-right text-brand-300">+</span></summary><p className="mt-3 max-w-2xl text-sm leading-7 text-neutral-400">{item.answer}</p></details>)}</div></div></section>
        <section className="border-t border-white/10 px-5 py-16 text-center"><h2 className="text-3xl font-bold text-white">Ready to build what’s next?</h2><p className="mx-auto mt-4 max-w-xl text-neutral-400">Get the {config.product.name} blueprint and start with a plan your team can execute.</p><BuyButton productKey={config.productKey} price={price} /></section>
      </main>
    </div>
  );
}

function productPrice(product: Product | Bundle) { return isBundle(product) ? product.launchPrice : product.launchPrice; }
function money(value: number) { return `$${value.toLocaleString("en-US")}`; }
function Eyebrow({ children }: { children: React.ReactNode }) { return <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-300">{children}</p>; }
function BuyButton({ productKey, price }: { productKey: string; price: number }) { return <a href="#" data-jvzoo-product={productKey} className="mt-7 inline-flex w-full items-center justify-center rounded-lg bg-brand-400 px-6 py-4 text-base font-bold text-neutral-950 shadow-lg shadow-brand-400/20 transition hover:bg-brand-300 sm:w-auto">Buy Now on JVZoo — {money(price)} <span className="ml-2">→</span></a>; }
