import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — PrismBay" },
      { name: "description", content: "PrismBay privacy policy: how we collect, use, and protect your personal data when you browse and purchase AI business systems on our marketplace." },
    ],
  }),
  component: PrivacyPage,
});

function LogoHorizontal({ className }: { className?: string }) {
  return (
    <Link to="/" className={`inline-flex items-center gap-3 ${className ?? ""}`}>
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
        <div className="flex items-center gap-5"><Link to="/sign-in" className="text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900">Sign In</Link></div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="bg-neutral-900">
      <div className="mx-auto max-w-7xl px-6 pt-16 pb-12">
        <div className="mb-12"><LogoHorizontal /></div>
        <div className="mt-12 border-t border-neutral-800 pt-8"><p className="text-xs text-neutral-500">&copy; PrismBay 2026. All rights reserved.</p></div>
      </div>
    </footer>
  );
}

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
            <p>For privacy inquiries, contact us at <a href="mailto:privacy@prismbay.com" className="text-brand-600 hover:text-brand-700">privacy@prismbay.com</a>.</p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
