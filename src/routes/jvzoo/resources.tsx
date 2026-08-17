import { createFileRoute, Link } from "@tanstack/react-router";
import { BUNDLES, PRODUCTS } from "~/data/products";
import TrustBadges from "~/components/TrustBadges";
import LogoHorizontal from "~/components/LogoHorizontal";

export const Route = createFileRoute("/jvzoo/resources")({
  head: () => ({
    meta: [
      { title: "Affiliate Resource Center | PrismBay" },
      { name: "description", content: "Approved PrismBay affiliate copy, product references, commission details, assets, and promotion guidelines." },
    ],
  }),
  component: AffiliateResources,
});

const genesis = PRODUCTS.find((p) => p.slug === "genesis-platform")!;
const nexus = PRODUCTS.find((p) => p.slug === "nexus-network")!;
const portfolio = BUNDLES.find((b) => b.slug === "complete-portfolio")!;
const money = (value: number) => `$${value.toLocaleString("en-US", { minimumFractionDigits: value % 1 ? 2 : 0, maximumFractionDigits: 2 })}`;
const commission = (price: number, rate: number) => money(price * rate);

const products = [
  { name: "Genesis Platform", price: genesis.launchPrice, description: "A complete blueprint for designing an AI-powered, no-code business application builder. It covers workflows, technical architecture, revenue planning, and the implementation path to commercial launch.", buyer: "Entrepreneurs, product builders, and digital agencies who want a structured plan for creating business applications.", href: "/jvzoo/genesis" },
  { name: "Nexus Network", price: nexus.launchPrice, description: "A complete blueprint for launching an AI-powered business collaboration marketplace. Buyers get matching workflows, trust structures, monetization guidance, and the architecture needed to build it.", buyer: "Founders and companies planning a marketplace for businesses, professionals, and service providers.", href: "/jvzoo/nexus" },
  { name: "Complete Portfolio", price: portfolio.launchPrice, description: "The full collection of nine PrismBay AI business system blueprints in one library. It includes documentation, workflows, technical architecture, revenue models, videos, templates, and implementation guidance for every system.", buyer: "Business builders, consultants, and venture teams evaluating multiple AI business opportunities.", href: "/jvzoo/portfolio" },
];

const checklist = [
  "I describe products as blueprints/guides, not software",
  "I include FTC disclosure (\"I earn a commission...\")",
  "I make no income claims or earnings promises",
  "I use approved product descriptions from this page",
  "I don't bid on PrismBay branded keywords in PPC",
  "I don't use fake scarcity or urgency",
  "I don't self-refer or self-purchase",
  "I've read the full Affiliate Promotion Rules",
];

function Section({ eyebrow, title, id, children }: { eyebrow: string; title: string; id?: string; children: React.ReactNode }) {
  return <section id={id} className="border-t border-white/10 px-5 py-16 sm:py-20"><div className="mx-auto max-w-6xl"><p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-300">{eyebrow}</p><h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">{title}</h2>{children}</div></section>;
}

function AssetIcon({ type }: { type: string }) {
  return <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-400/10 text-2xl text-brand-300" aria-hidden="true">{type === "banner" ? "▣" : type === "email" ? "✉" : "◈"}</div>;
}

function AffiliateResources() {
  return <div className="min-h-screen bg-neutral-950 text-neutral-100">
    <header className="border-b border-white/10 bg-neutral-950/90"><div className="mx-auto flex max-w-6xl items-center px-5 py-5"><Link to="/" aria-label="PrismBay home"><LogoHorizontal /></Link><span className="ml-auto text-xs font-medium uppercase tracking-[0.2em] text-brand-300">JVZoo Partner Resources</span></div></header>
    <main>
      <section className="relative overflow-hidden px-5 py-20 sm:py-28"><div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_10%,rgba(20,184,166,0.18),transparent_48%)]" /><div className="relative mx-auto max-w-4xl text-center"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-300">For approved affiliates</p><h1 className="mt-5 text-4xl font-bold tracking-tight text-white sm:text-6xl">Affiliate Resource Center</h1><p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-neutral-300 sm:text-xl">Everything you need to promote PrismBay products — approved copy, banners, buyer profiles, and compliance guidelines.</p></div></section>
      <Section eyebrow="Know the offers" title="Product reference"><div className="mt-10 grid gap-5 lg:grid-cols-3">{products.map((product) => <article key={product.name} className="flex flex-col rounded-2xl border border-white/10 bg-neutral-900/70 p-6"><h3 className="text-xl font-bold text-white">{product.name}</h3><p className="mt-4 text-3xl font-bold text-brand-300">{money(product.price)}</p><p className="mt-2 text-sm text-neutral-400">30%: <strong className="text-neutral-200">{commission(product.price, .3)}</strong> · 35%: <strong className="text-neutral-200">{commission(product.price, .35)}</strong></p><p className="mt-6 text-sm leading-7 text-neutral-300">{product.description}</p><p className="mt-5 border-t border-white/10 pt-5 text-sm leading-6 text-neutral-400"><strong className="text-neutral-200">Ideal buyer:</strong> {product.buyer}</p><Link to={product.href} className="mt-6 inline-flex items-center font-semibold text-brand-300 hover:text-brand-200">View JVZoo sales page <span className="ml-2">→</span></Link></article>)}</div></Section>
      <Section eyebrow="At a glance" title="Commission structure"><div className="mt-8 overflow-x-auto rounded-2xl border border-white/10"><table className="w-full min-w-[650px] text-left text-sm"><thead className="bg-white/5 text-xs uppercase tracking-wider text-neutral-400"><tr><th className="px-5 py-4">Product</th><th className="px-5 py-4">Sale Price</th><th className="px-5 py-4">30% Commission</th><th className="px-5 py-4">35% Commission</th><th className="px-5 py-4">Cookie</th></tr></thead><tbody className="divide-y divide-white/10">{products.map((p) => <tr key={p.name}><td className="px-5 py-4 font-semibold text-white">{p.name}</td><td className="px-5 py-4 text-neutral-300">{money(p.price)}</td><td className="px-5 py-4 text-brand-300">{commission(p.price, .3)}</td><td className="px-5 py-4 text-brand-300">{commission(p.price, .35)}</td><td className="px-5 py-4 text-neutral-300">60 days</td></tr>)}</tbody></table></div><p className="mt-4 text-sm text-neutral-500">Commissions apply to eligible net sale price. JVZoo administers attribution, payouts, and reversals.</p></Section>
      <Section eyebrow="Use this language" title="Approved copy & descriptions"><div className="mt-8 grid gap-5 md:grid-cols-2"><article className="rounded-2xl border border-brand-400/25 bg-brand-400/5 p-6"><h3 className="font-bold text-brand-200">How to describe PrismBay products</h3><p className="mt-4 text-sm leading-7 text-neutral-300">Use only these terms: <strong className="text-white">blueprint</strong>, <strong className="text-white">guide</strong>, <strong className="text-white">AI business system</strong>, and <strong className="text-white">implementation plan</strong>.</p></article><article className="rounded-2xl border border-red-400/20 bg-red-400/5 p-6"><h3 className="font-bold text-red-200">Never use</h3><p className="mt-4 text-sm leading-7 text-neutral-300">software, SaaS, app, platform, subscription, AI tool, automated system</p></article></div><div className="mt-5 rounded-2xl border border-white/10 bg-neutral-900 p-6"><h3 className="font-bold text-white">Sample elevator pitch</h3><p className="mt-3 text-sm leading-7 text-neutral-300">“PrismBay creates detailed AI business system blueprints and implementation guides. Each purchase gives you the workflows, architecture, revenue model, and launch guidance to plan and build your own business concept.”</p><p className="mt-4 text-xs text-neutral-500">Always include: “I earn a commission if you purchase through my link.”</p></div></Section>
      <Section eyebrow="Your toolkit" title="Downloadable assets"><div className="mt-8 grid gap-5 md:grid-cols-3">{[{ type: "banner", title: "Banner pack" }, { type: "email", title: "Email swipe file" }, { type: "images", title: "Product images" }].map((asset) => <div key={asset.title} className="rounded-2xl border border-white/10 bg-neutral-900/70 p-6"><AssetIcon type={asset.type} /><div className="mt-5 flex items-start justify-between gap-3"><h3 className="font-bold text-white">{asset.title}</h3><span className="shrink-0 rounded-full bg-amber-400/10 px-2.5 py-1 text-[11px] font-semibold text-amber-200">Coming soon</span></div><p className="mt-3 text-sm text-neutral-500">Approved promotional materials will be added here.</p></div>)}</div></Section>
      <Section eyebrow="Promote responsibly" title="Compliance checklist"><div className="mt-8 grid gap-3 sm:grid-cols-2">{checklist.map((item) => <label key={item} className="flex gap-3 rounded-xl border border-white/10 bg-neutral-900/60 p-4 text-sm leading-6 text-neutral-300"><input type="checkbox" className="mt-1 h-4 w-4 shrink-0 accent-brand-400" />{item}</label>)}</div></Section>
      <Section eyebrow="Need clarity?" title="Frequently asked questions" id="faq"><div className="mt-8 max-w-4xl divide-y divide-white/10">{[{ q: "How do I get my affiliate link?", a: "After approval, your unique JVZoo link appears in your JVZoo dashboard" }, { q: "When are commissions paid?", a: "JVZoo handles all payouts — typically net-30 after sale clears" }, { q: "Can I promote all three products?", a: "Yes — approved affiliates can promote any pilot product" }, { q: "What happens if a customer refunds?", a: "Commission is reversed; choose audiences carefully" }].map((item) => <details key={item.q} className="py-5"><summary className="cursor-pointer font-semibold text-white">{item.q}</summary><p className="mt-3 text-sm leading-7 text-neutral-400">{item.a}</p></details>)}</div></Section>
      <section className="border-t border-white/10 px-5 py-16 text-center"><h2 className="text-2xl font-bold text-white">Questions about the programme?</h2><p className="mt-4 text-neutral-400">Email <a className="font-semibold text-brand-300 hover:text-brand-200" href="mailto:partners@prismbayai.com">partners@prismbayai.com</a></p><Link to={{ to: "/jvzoo/resources", hash: "faq" }} className="mt-5 inline-block text-sm font-semibold text-brand-300 hover:text-brand-200">Read the full Affiliate Promotion Rules →</Link><TrustBadges className="mt-12" /></section>
    </main>
  </div>;
}
