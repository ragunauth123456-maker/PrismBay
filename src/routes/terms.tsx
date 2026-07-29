import { createFileRoute, Link } from "@tanstack/react-router";
import Navbar from '~/components/Navbar';
import Footer from '~/components/Footer';
import LogoHorizontal from '~/components/LogoHorizontal';

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — PrismBay" },
      { name: "description", content: "PrismBay terms of service: licence terms, usage rights, payment policies, and legal agreements for purchasing AI business systems and digital products." },
    ],
    links: [
      { rel: "canonical", href: "https://prismbay.com/terms" },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      <div className="bg-white border-b border-neutral-200">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-600 mb-2">Legal</p>
          <h1 className="text-3xl font-bold text-neutral-800">Terms &amp; Conditions</h1>
          <p className="mt-2 text-sm text-neutral-500">Effective: July 28, 2026</p>
          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <strong>⚠️ Draft — Pending Legal Review.</strong> These terms have not been reviewed by a qualified lawyer and should not be considered final. Placeholders and advisory notes are marked throughout.
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-3xl px-6 py-12">
        <div className="prose prose-neutral max-w-none space-y-8 text-neutral-600 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-neutral-800">1. Acceptance of Terms</h2>
            <p>By accessing or using PrismBay ("we," "us," or "our"), you agree to be bound by these Terms and Conditions. If you do not agree, do not use the site or purchase any products.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-neutral-800">2. Products and Digital Delivery</h2>
            <p>All products sold on PrismBay are digital business system blueprints — comprehensive documentation packages delivered as downloadable files. No physical products are shipped. Upon successful payment, you receive immediate access to download your purchase.</p>
            <p>Each product includes a single-business perpetual licence. You may use the blueprint to build one commercial product. Agency, multi-client, and enterprise licences are available separately — contact us for details.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-neutral-800">3. Pricing and Payment</h2>
            <p>All prices are in US dollars. We offer introductory launch pricing for a limited period (currently 30 days from launch). After the launch period, regular prices apply. We reserve the right to change pricing at any time, but the price at the time of your purchase is the price you pay.</p>
            <p>Payments are processed securely through Stripe. We do not store your full payment card details on our servers.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-neutral-800">4. Intellectual Property</h2>
            <p>All product content, including architecture diagrams, workflow designs, documentation, and implementation guides, is protected by copyright and other intellectual property laws. Your purchase grants you a licence to use the content — it does not transfer ownership.</p>
            <p>You may not redistribute, resell, or sublicense the product materials beyond the scope of your licence.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-neutral-800">5. Disclaimer of Warranties</h2>
            <p>Products are provided "as is" without warranty of any kind, either express or implied. PrismBay does not guarantee that any specific business outcome, revenue, or savings will result from using our products. Implementation results depend on your team, market conditions, and execution.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-neutral-800">6. Limitation of Liability</h2>
            <p>To the fullest extent permitted by law, PrismBay shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the site or products. Our total liability for any claim shall not exceed the amount you paid for the product in question.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-neutral-800">7. Account Responsibilities</h2>
            <p>You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account. Notify us immediately of any unauthorized use.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-neutral-800">8. Changes to These Terms</h2>
            <p>We may update these terms from time to time. Material changes will be communicated via email or a notice on the site. Continued use after changes constitutes acceptance.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-neutral-800">9. Contact</h2>
            <p>For questions about these terms, contact us at <a href="mailto:legal@prismbay.com" className="text-brand-600 hover:text-brand-700">legal@prismbay.com</a> or through our <Link to="/contact" className="text-brand-600 hover:text-brand-700">contact page</Link>.</p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
