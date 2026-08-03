import { createFileRoute, Link } from "@tanstack/react-router";
import Navbar from '~/components/Navbar';
import Footer from '~/components/Footer';
import LogoHorizontal from '~/components/LogoHorizontal';
import { breadcrumbListScript, twitterMeta } from "~/utils/seo";
import { BUNDLES } from "~/data/products";

/* "saves you over $X" — derived from products.ts (Complete Portfolio saving rounded down to nearest $500). */
const COMPLETE_PORTFOLIO_SAVING_OVER = Math.floor(BUNDLES.find((b) => b.slug === "complete-portfolio")!.saving / 500) * 500;

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "Frequently Asked Questions — PrismBay" },
      {
        name: "description",
        content:
          "Common questions about PrismBay: how purchases work, what's included in a blueprint, licensing, refunds, delivery, and more.",
      },
      { property: "og:title", content: "Frequently Asked Questions — PrismBay" },
      {
        property: "og:description",
        content:
          "Common questions about PrismBay: how purchases work, what's included in a blueprint, licensing, refunds, delivery, and more.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://www.prismbayai.com/faq" },
      ...twitterMeta("Frequently Asked Questions — PrismBay", "Common questions about PrismBay: how purchases work, what's included in a blueprint, licensing, refunds, delivery, and more."),
    ],
    links: [{ rel: "canonical", href: "https://www.prismbayai.com/faq" }],
    scripts: [
      {
        tag: "script" as const,
        attrs: { type: "application/ld+json" },
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "What is PrismBay?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "PrismBay is a premium marketplace for complete AI business system blueprints. Each product is a comprehensive document package that includes detailed workflows, technical architecture, revenue models, implementation plans, and commercial launch guidance — everything you need to understand and build a specific type of AI-native business.",
              },
            },
            {
              "@type": "Question",
              name: "What exactly do I receive when I purchase?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Every purchase includes a downloadable ZIP file containing the complete blueprint package: architecture diagrams, workflow documentation, technical specifications, financial models, and a launch roadmap. Files are delivered as PDFs and editable source documents (Markdown, draw.io diagrams, spreadsheet templates). You get instant access after purchase.",
              },
            },
            {
              "@type": "Question",
              name: "Are these working software products?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "No. These are business system blueprints — detailed plans, architectures, and implementation guides. They are not pre-built software applications, SaaS platforms, or installable code. Think of them as the complete architectural plans for a building, not the building itself. They give you everything needed to build the system yourself or with a development team.",
              },
            },
            {
              "@type": "Question",
              name: "What is the refund policy?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "We offer a 14-day money-back guarantee. If the blueprint doesn't meet your expectations, contact us within 14 days of purchase for a full refund. See our full refund policy at /refunds.",
              },
            },
            {
              "@type": "Question",
              name: "How is payment handled?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "All payments are processed securely through Stripe. We never handle or store your credit card details. Stripe is PCI-DSS Level 1 compliant — the highest standard in payment security.",
              },
            },
            {
              "@type": "Question",
              name: "What is the licensing?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Every product comes with a single-business perpetual license. You can use the blueprint to build one business or internal system. You cannot resell, redistribute, or sublicense the blueprint itself. For multi-entity or agency use, contact us.",
              },
            },
            {
              "@type": "Question",
              name: "How do I access my purchase?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Immediately after completing checkout, you'll receive a confirmation email with a unique download link. You can also access all your purchases from your PrismBay account dashboard. Download links never expire.",
              },
            },
            {
              "@type": "Question",
              name: "Do you offer custom or consulting work?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Not at this time. PrismBay sells standardized, self-service blueprint products. We don't offer custom development, implementation consulting, or one-on-one advisory services.",
              },
            },
            {
              "@type": "Question",
              name: "How are launch prices different from regular prices?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Launch pricing is a limited-time introductory discount available during our first 30 days (through August 27, 2026). After the launch period, products return to their regular prices. The current discount percentage is clearly displayed on every product page.",
              },
            },
            {
              "@type": "Question",
              name: "Can I see what's in a product before buying?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes. Every product has a detailed page with feature breakdowns, technical requirements, FAQ content, and an interactive walkthrough showing exactly what's included. We believe in informed purchases — no mystery boxes.",
              },
            },
          ],
        }),
      },
      breadcrumbListScript([
        { name: "Home", url: "https://www.prismbayai.com" },
        { name: "FAQ", url: "https://www.prismbayai.com/faq" },
      ]),
    ],
  }),
  component: FAQPage,
});

/* ─── FAQ data ─── */

interface FAQItem {
  q: string;
  a: string;
}

const generalFaqs: FAQItem[] = [
  {
    q: "What is PrismBay?",
    a: "PrismBay is a premium marketplace for complete AI business system blueprints. Each product is a comprehensive document package that includes detailed workflows, technical architecture, revenue models, implementation plans, and commercial launch guidance — everything you need to understand and build a specific type of AI-native business.",
  },
  {
    q: "What exactly do I receive when I purchase?",
    a: "Every purchase includes a downloadable ZIP file containing the complete blueprint package: architecture diagrams, workflow documentation, technical specifications, financial models, and a launch roadmap. Files are delivered as PDFs and editable source documents (Markdown, draw.io diagrams, spreadsheet templates). You get instant access after purchase.",
  },
  {
    q: "Are these working software products?",
    a: "No. These are business system blueprints — detailed plans, architectures, and implementation guides. They are not pre-built software applications, SaaS platforms, or installable code. Think of them as the complete architectural plans for a building, not the building itself. They give you everything needed to build the system yourself or with a development team.",
  },
  {
    q: "What is the refund policy?",
    a: "We offer a 14-day money-back guarantee. If the blueprint doesn't meet your expectations, contact us within 14 days of purchase for a full refund. See our full refund policy at /refunds.",
  },
  {
    q: "How is payment handled?",
    a: "All payments are processed securely through Stripe. We never handle or store your credit card details. Stripe is PCI-DSS Level 1 compliant — the highest standard in payment security.",
  },
  {
    q: "What is the licensing?",
    a: "Every product comes with a single-business perpetual license. You can use the blueprint to build one business or internal system. You cannot resell, redistribute, or sublicense the blueprint itself. For multi-entity or agency use, contact us.",
  },
  {
    q: "How do I access my purchase?",
    a: "Immediately after completing checkout, you'll receive a confirmation email with a unique download link. You can also access all your purchases from your PrismBay account dashboard. Security-protected email download links expire, while account access continues under the applicable licence terms.",
  },
  {
    q: "Do you offer custom or consulting work?",
    a: "Not at this time. PrismBay sells standardized, self-service blueprint products. We don't offer custom development, implementation consulting, or one-on-one advisory services.",
  },
  {
    q: "How are launch prices different from regular prices?",
    a: "Launch pricing is a limited-time introductory discount available during our first 30 days (through August 27, 2026). After the launch period, products return to their regular prices. The current discount percentage is clearly displayed on every product page.",
  },
  {
    q: "Can I see what's in a product before buying?",
    a: "Yes. Every product has a detailed page with feature breakdowns, technical requirements, FAQ content, and an interactive walkthrough showing exactly what's included. We believe in informed purchases — no mystery boxes.",
  },
];

const productFaqs: FAQItem[] = [
  {
    q: "Which product is right for me?",
    a: "It depends on what you're trying to build. If you want to launch a B2B collaboration marketplace, start with Nexus Network. If you're building an AI-powered internal platform, NexusOS or Empire AI are great fits. Check our comparison pages for side-by-side breakdowns, or browse all products to find what matches your goals.",
  },
  {
    q: "Do bundles include everything from the individual products?",
    a: `Yes. Every bundle includes the complete blueprints for all constituent products at a significant discount. For example, the Complete Portfolio bundle includes all 9 products and saves you over $${COMPLETE_PORTFOLIO_SAVING_OVER.toLocaleString()} compared to buying individually.`,
  },
  {
    q: "Can I upgrade from a single product to a bundle later?",
    a: "At this time, we don't offer pro-rated upgrades. If you think you might want multiple blueprints, bundles offer the best value from the start.",
  },
];

function FAQSection({ title, faqs }: { title: string; faqs: FAQItem[] }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-neutral-800 mb-6">{title}</h2>
      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <details key={i} className="group rounded-lg border border-neutral-200 bg-white">
            <summary className="cursor-pointer px-5 py-4 text-left font-medium text-neutral-800 hover:text-brand-600 transition-colors marker:content-none flex items-center justify-between">
              {faq.q}
              <svg className="h-4 w-4 text-neutral-400 group-open:rotate-180 transition-transform shrink-0 ml-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="px-5 pb-4 text-sm text-neutral-600 leading-relaxed">{faq.a}</div>
          </details>
        ))}
      </div>
    </div>
  );
}

function FAQPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      {/* Hero */}
      <section className="bg-white border-b border-neutral-200">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">Help Centre</p>
            <h1 className="mt-2 text-3xl font-bold text-neutral-800 sm:text-4xl">Frequently Asked Questions</h1>
            <p className="mt-4 text-lg text-neutral-500">
              Everything you need to know about PrismBay — products, purchases, licensing, and more.
              Each product page also has its own detailed FAQ section for product-specific questions.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ sections */}
      <section className="bg-neutral-50">
        <div className="mx-auto max-w-3xl px-6 py-16 sm:py-20 space-y-16">
          <FAQSection title="General Questions" faqs={generalFaqs} />
          <FAQSection title="Products & Bundles" faqs={productFaqs} />

          {/* CTA to browse */}
          <div className="text-center pt-4">
            <p className="text-neutral-500 mb-4">Each product page has detailed FAQs specific to that blueprint.</p>
            <Link
              to="/products"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-8 py-4 text-lg font-semibold text-white shadow-sm transition-all hover:bg-brand-600 hover:shadow-md hover:-translate-y-px"
            >
              Browse All Products
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
