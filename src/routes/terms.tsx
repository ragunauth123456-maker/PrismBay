import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — PrismBay" },
      { name: "description", content: "PrismBay terms of service: licence terms, usage rights, payment policies, and legal agreements for purchasing AI business systems and digital products." },
    ],
  }),
  component: TermsPage,
});

function LogoHorizontal({ className }: { className?: string }) {
  return (
    <Link to="/" className={`inline-flex items-center gap-3 ${className ?? ""}`}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 64" fill="none" className="h-9 w-auto" aria-label="PrismBay">
        <g transform="translate(0, 6)">
          <polygon points="4,52 28,4 52,52" fill="#16B3A7" />
          <line x1="28" y1="4" x2="20" y2="52" stroke="white" strokeWidth="2.5" />
          <circle cx="20" cy="52" r="3" fill="#F59E0B" />
        </g>
        <g transform="translate(68, 0)">
          <text x="0" y="44" fontFamily="Inter, system-ui, sans-serif" fontWeight="700" fontSize="36" letterSpacing="-0.02em">
            <tspan fill="#16B3A7">Prism</tspan>
            <tspan fill="#282724">Bay</tspan>
          </text>
        </g>
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
        <div className="flex items-center gap-5">
          <Link to="/sign-in" className="text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900">Sign In</Link>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="bg-neutral-900">
      <div className="mx-auto max-w-7xl px-6 pt-16 pb-12">
        <div className="mb-12">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 64" fill="none" className="h-9 w-auto" aria-label="PrismBay">
            <g transform="translate(0, 6)">
              <polygon points="4,52 28,4 52,52" fill="#16B3A7" />
              <line x1="28" y1="4" x2="20" y2="52" stroke="white" strokeWidth="2.5" />
              <circle cx="20" cy="52" r="3" fill="#F59E0B" />
            </g>
            <g transform="translate(68, 0)">
              <text x="0" y="44" fontFamily="Inter, system-ui, sans-serif" fontWeight="700" fontSize="36" letterSpacing="-0.02em">
                <tspan fill="#16B3A7">Prism</tspan>
                <tspan fill="#EDEDEB">Bay</tspan>
              </text>
            </g>
          </svg>
          <p className="mt-3 text-sm text-neutral-400">Complete AI business systems. Instant access.</p>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          <div>
            <h4 className="mb-4 text-sm font-semibold text-neutral-100">Legal</h4>
            <ul className="space-y-2">
              <li><Link to="/terms" className="text-sm text-neutral-400 transition-colors hover:text-white">Terms</Link></li>
              <li><Link to="/privacy" className="text-sm text-neutral-400 transition-colors hover:text-white">Privacy</Link></li>
              <li><Link to="/cookies" className="text-sm text-neutral-400 transition-colors hover:text-white">Cookies</Link></li>
              <li><Link to="/refunds" className="text-sm text-neutral-400 transition-colors hover:text-white">Refunds</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-neutral-800 pt-8">
          <p className="text-xs text-neutral-500">&copy; PrismBay 2026. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

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
