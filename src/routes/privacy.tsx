import { createFileRoute, Link } from "@tanstack/react-router";
import Navbar from '~/components/Navbar';
import Footer from '~/components/Footer';
import LogoHorizontal from '~/components/LogoHorizontal';
import { breadcrumbListScript, twitterMeta } from "~/utils/seo";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — PrismBay" },
      { name: "description", content: "PrismBay privacy policy: how we collect, use, and protect your personal data when you browse and purchase AI business systems on our marketplace." },
      ...twitterMeta("Privacy Policy — PrismBay", "PrismBay privacy policy: how we collect, use, and protect your personal data when you browse and purchase AI business systems on our marketplace."),
    ],
    links: [
      { rel: "canonical", href: "https://www.prismbayai.com/privacy" },
    ],
    scripts: [
      breadcrumbListScript([
        { name: "Home", url: "https://www.prismbayai.com" },
        { name: "Privacy Policy", url: "https://www.prismbayai.com/privacy" },
      ]),
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      <div className="bg-white border-b border-neutral-200">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-600 mb-2">Legal</p>
          <h1 className="text-3xl font-bold text-neutral-800">Privacy Policy</h1>
          <p className="mt-2 text-sm text-neutral-500">Effective: July 28, 2026</p>
          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <strong>⚠️ Draft — Pending Legal Review.</strong> This policy has not been reviewed by a qualified lawyer.
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-3xl px-6 py-12">
        <div className="prose prose-neutral max-w-none space-y-8 text-neutral-600 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-neutral-800">1. Information We Collect</h2>
            <p>When you use PrismBay, we collect information you provide directly: your name, email address, and payment details when you make a purchase. We also collect technical information automatically: IP address, browser type, pages visited, and time spent on the site.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-neutral-800">2. How We Use Your Information</h2>
            <p>We use your information to: process purchases and deliver products, manage your account and purchase history, communicate about your orders, send product updates (with your consent), and improve our site and product offerings.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-neutral-800">3. Payment Processing</h2>
            <p>Payments are processed by Stripe. We do not store full credit card numbers on our servers. Stripe's privacy policy governs their handling of your payment data.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-neutral-800">4. Cookies and Tracking</h2>
            <p>We use essential cookies for site functionality (authentication, shopping cart) and analytics cookies to understand site usage. See our <Link to="/cookies" className="text-brand-600 hover:text-brand-700">Cookie Policy</Link> for details.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-neutral-800">5. Data Sharing</h2>
            <p>We do not sell your personal information. We share data only with service providers necessary to operate the site (payment processing, hosting, analytics) and when required by law.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-neutral-800">6. Data Security</h2>
            <p>We implement reasonable security measures to protect your data, including encryption in transit (HTTPS) and secure storage practices. No method of transmission over the internet is 100% secure.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-neutral-800">7. Your Rights</h2>
            <p>You may request access to, correction of, or deletion of your personal data by contacting us. You may also opt out of marketing communications at any time.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-neutral-800">8. Contact</h2>
            <p>For privacy inquiries, contact us at <a href="mailto:privacy@www.prismbayai.com" className="text-brand-600 hover:text-brand-700">privacy@www.prismbayai.com</a>.</p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
