import { createFileRoute, Link } from "@tanstack/react-router";
import Navbar from '~/components/Navbar';
import Footer from '~/components/Footer';
import LogoHorizontal from '~/components/LogoHorizontal';

export const Route = createFileRoute("/refunds")({
  head: () => ({
    meta: [
      { title: "Refund Policy — PrismBay" },
      { name: "description", content: "PrismBay refund policy: our 14-day money-back guarantee for AI business system purchases. Learn about eligibility, the refund process, and our commitment." },
    ],
    links: [
      { rel: "canonical", href: "https://prismbay.com/refunds" },
    ],
  }),
  component: RefundsPage,
});

function RefundsPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      <div className="bg-white border-b border-neutral-200">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-600 mb-2">Legal</p>
          <h1 className="text-3xl font-bold text-neutral-800">Refund Policy</h1>
          <p className="mt-2 text-sm text-neutral-500">Effective: July 28, 2026</p>
          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <strong>⚠️ Draft — Pending Legal Review.</strong> This policy has not been reviewed by a qualified lawyer.
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-3xl px-6 py-12">
        <div className="prose prose-neutral max-w-none space-y-8 text-neutral-600 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-neutral-800">Our Refund Guarantee</h2>
            <p>We want you to be confident in your purchase. All PrismBay products come with a <strong>14-day money-back guarantee</strong> from the date of purchase.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-neutral-800">Eligibility</h2>
            <p>To be eligible for a refund, you must request it within 14 days of purchase. Because our products are digital downloads delivered instantly, we ask that you provide a brief reason for your refund request — this helps us improve our products.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-neutral-800">How to Request a Refund</h2>
            <p>Email us at <a href="mailto:support@prismbay.com" className="text-brand-600 hover:text-brand-700">support@prismbay.com</a> with your order number and the reason for your refund request. We process refunds within 5 business days.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-neutral-800">After Refund</h2>
            <p>Upon refund, your licence to use the product is revoked. You must delete all downloaded materials and confirm you will not use the blueprint in any commercial product.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-neutral-800">Bundle Purchases</h2>
            <p>For bundle purchases, refunds apply to the entire bundle — partial refunds for individual products within a bundle are not available.</p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
