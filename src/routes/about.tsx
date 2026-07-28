import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About PrismBay — Premium AI Business Systems Marketplace" },
      { name: "description", content: "Learn about PrismBay: our mission to provide complete AI business systems with real demos, transparent pricing, and instant digital delivery for modern builders." },
    ],
    links: [
      { rel: "canonical", href: "https://prismbay.com/about" },
    ],
  }),
  component: AboutPage,
});

function LogoHorizontal() {
  return (
    <Link to="/" className="inline-flex items-center gap-3">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 64" fill="none" className="h-9 w-auto" aria-label="PrismBay">
        <g transform="translate(0, 6)"><polygon points="4,52 28,4 52,52" fill="#16B3A7" /><line x1="28" y1="4" x2="20" y2="52" stroke="white" strokeWidth="2.5" /><circle cx="20" cy="52" r="3" fill="#F59E0B" /></g>
        <g transform="translate(68, 0)"><text x="0" y="44" fontFamily="Inter, system-ui, sans-serif" fontWeight="700" fontSize="36" letterSpacing="-0.02em"><tspan fill="#16B3A7">Prism</tspan><tspan fill="#282724">Bay</tspan></text></g>
      </svg>
    </Link>
  );
}

function Navbar() {
  return (
    <header className="sticky top-0 z-50 h-16 border-b border-neutral-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6">
        <LogoHorizontal />
        <nav className="hidden items-center gap-8 lg:flex">
          <Link to="/products" className="text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900">Products</Link>
          <Link to="/products" search={{ category: "bundles" }} className="text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900">Bundles</Link>
        </nav>
        <Link to="/sign-in" className="text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900">Sign In</Link>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="bg-neutral-900">
      <div className="mx-auto max-w-7xl px-6 pt-16 pb-12">
        <div className="mb-12"><LogoHorizontal /></div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          <div><h4 className="mb-4 text-sm font-semibold text-neutral-100">Company</h4><ul className="space-y-2"><li><Link to="/about" className="text-sm text-neutral-400 transition-colors hover:text-white">About</Link></li><li><Link to="/how-it-works" className="text-sm text-neutral-400 transition-colors hover:text-white">How It Works</Link></li><li><Link to="/contact" className="text-sm text-neutral-400 transition-colors hover:text-white">Contact</Link></li></ul></div>
        </div>
        <div className="mt-12 border-t border-neutral-800 pt-8"><p className="text-xs text-neutral-500">&copy; PrismBay 2026. All rights reserved.</p></div>
      </div>
    </footer>
  );
}

function AboutPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      <section className="bg-white border-b border-neutral-200">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">About</p>
            <h1 className="mt-2 text-3xl font-bold text-neutral-800 sm:text-4xl">Building the future of AI business — one blueprint at a time</h1>
            <p className="mt-4 text-lg text-neutral-500">PrismBay is a premium marketplace for complete AI business systems. We believe that the next generation of great companies will be AI-native — and they shouldn't have to start from zero.</p>
          </div>
        </div>
      </section>
      <section className="bg-neutral-50">
        <div className="mx-auto max-w-3xl px-6 py-16 sm:py-20 space-y-16">
          <div>
            <h2 className="text-2xl font-bold text-neutral-800">Our Mission</h2>
            <p className="mt-4 text-neutral-600 leading-relaxed">Every AI business system on PrismBay is a complete blueprint — detailed workflows, technical architecture, revenue models, implementation plans, and commercial launch guidance. We don't sell vague ideas or hype documents. Every product has transparent pricing, detailed feature breakdowns, and clear licensing terms.</p>
            <p className="mt-4 text-neutral-600 leading-relaxed">Our mission is to accelerate the AI-native business revolution by making battle-tested business system blueprints accessible to founders, executives, and technical teams worldwide.</p>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-neutral-800">The Demo-First Philosophy</h2>
            <p className="mt-4 text-neutral-600 leading-relaxed">Most digital product marketplaces ask you to buy based on a sales page and some bullet points. We think that's backwards. Every PrismBay product includes a detailed feature breakdown, technical architecture documentation, FAQ section, and transparent launch pricing so you make an informed decision every time.</p>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-neutral-800">What Makes Our Products Different</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {[
                { title: "Complete Systems", desc: "Not just ideas — full architecture, workflows, revenue models, and launch plans." },
                { title: "Demo-Verified", desc: "Every product has a demo video. No mystery purchases." },
                { title: "Transparent Pricing", desc: "Clear regular price, launch discount, and deadline. No hidden fees." },
                { title: "Instant Delivery", desc: "Download immediately after purchase. Start building today." },
                { title: "Verified Reviews", desc: "Feedback from real buyers who have used the blueprints." },
                { title: "Clear Licensing", desc: "Single-business perpetual licence. No subscription traps." },
              ].map((item) => (
                <div key={item.title} className="rounded-lg border border-neutral-200 bg-white p-5">
                  <h3 className="font-semibold text-neutral-800">{item.title}</h3>
                  <p className="mt-1 text-sm text-neutral-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-neutral-800">Our Story</h2>
            <p className="mt-4 text-neutral-600 leading-relaxed">PrismBay was founded in 2026 by a team of AI practitioners and business builders who saw the same pattern repeating: founders and executives knew AI was the future, but they lacked the structured blueprints to build AI-native businesses. Existing resources were either too academic, too vague, or locked behind expensive consulting engagements.</p>
            <p className="mt-4 text-neutral-600 leading-relaxed">We built PrismBay to bridge that gap — providing complete, actionable AI business system blueprints at transparent, accessible prices. Every product on our marketplace has been designed, documented, and reviewed to the standard we'd want if we were buying it ourselves.</p>
          </div>
        </div>
      </section>
      <section className="bg-white border-t border-neutral-200">
        <div className="mx-auto max-w-6xl px-6 py-16 text-center">
          <h2 className="text-2xl font-bold text-neutral-800">Join the AI-native revolution</h2>
          <p className="mt-3 text-lg text-neutral-500">Browse our marketplace and find the blueprint for your next AI business.</p>
          <Link to="/products" className="mt-8 inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-8 py-4 text-lg font-semibold text-white shadow-sm transition-all duration-200 hover:bg-brand-600 hover:shadow-md hover:-translate-y-px active:bg-brand-700 active:translate-y-0">
            Browse Products
          </Link>
        </div>
      </section>
      <Footer />
    </div>
  );
}
