import { createFileRoute, Link } from "@tanstack/react-router";
import Navbar from '~/components/Navbar';
import Footer from '~/components/Footer';
import LogoHorizontal from '~/components/LogoHorizontal';
import { breadcrumbListScript, twitterMeta } from "~/utils/seo";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About PrismBay — Premium AI Business Systems Marketplace" },
      { name: "description", content: "Learn about PrismBay: our mission to provide complete AI business systems with real demos, transparent pricing, and instant digital delivery for modern builders." },
      { property: "og:title", content: "About PrismBay — Premium AI Business Systems Marketplace" },
      { property: "og:description", content: "Learn about PrismBay: our mission to provide complete AI business systems with real demos, transparent pricing, and instant digital delivery for modern builders." },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://www.prismbayai.com/images/og-default.png" },
      { property: "og:url", content: "https://www.prismbayai.com/about" },
      ...twitterMeta("About PrismBay — Premium AI Business Systems Marketplace", "Learn about PrismBay: our mission to provide complete AI business systems with real demos, transparent pricing, and instant digital delivery for modern builders."),
    ],
    links: [
      { rel: "canonical", href: "https://www.prismbayai.com/about" },
    ],
    scripts: [
      breadcrumbListScript([
        { name: "Home", url: "https://www.prismbayai.com" },
        { name: "About", url: "https://www.prismbayai.com/about" },
      ]),
    ],
  }),
  component: AboutPage,
});

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
            <p className="mt-4 text-neutral-600 leading-relaxed">Our mission is to accelerate the AI-native business revolution by making comprehensive business system blueprints accessible to founders, executives, and technical teams worldwide.</p>
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
                { title: "Interactive Walkthroughs", desc: "Every product has a detailed, step-by-step interactive walkthrough you can explore before buying." },
                { title: "Transparent Pricing", desc: "Clear regular price, launch discount, and deadline. No hidden fees." },
                { title: "Instant Delivery", desc: "Download immediately after purchase. Start building today." },
                { title: "Transparent Details", desc: "Complete feature breakdowns, technical requirements, and FAQ content so you know exactly what you're buying." },
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
