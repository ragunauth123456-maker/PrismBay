import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/cookies")({
  head: () => ({
    meta: [
      { title: "Cookie Policy — PrismBay" },
      { name: "description", content: "PrismBay cookie policy: learn how we use essential, analytics, and functional cookies to keep our marketplace secure and improve your browsing experience." },
    ],
  }),
  component: CookiesPage,
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
        <div className="mt-12 border-t border-neutral-800 pt-8"><p className="text-xs text-neutral-500">&copy; PrismBay 2026. All rights reserved.</p></div>
      </div>
    </footer>
  );
}

function CookiesPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      <div className="bg-white border-b border-neutral-200">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-600 mb-2">Legal</p>
          <h1 className="text-3xl font-bold text-neutral-800">Cookie Policy</h1>
          <p className="mt-2 text-sm text-neutral-500">Effective: July 28, 2026</p>
          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <strong>⚠️ Draft — Pending Legal Review.</strong> This policy has not been reviewed by a qualified lawyer.
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-3xl px-6 py-12">
        <div className="prose prose-neutral max-w-none space-y-8 text-neutral-600 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-neutral-800">What Are Cookies?</h2>
            <p>Cookies are small text files stored on your device by websites you visit. They help sites remember your preferences, keep you signed in, and understand how you use the site.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-neutral-800">Cookies We Use</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-neutral-800">Essential Cookies</h3>
                <p>Required for the site to function. These handle authentication, shopping cart state, and security. The site cannot operate without them.</p>
              </div>
              <div>
                <h3 className="font-semibold text-neutral-800">Analytics Cookies</h3>
                <p>Help us understand how visitors use the site — which pages are popular, how people find us, and where we can improve. We use privacy-respecting analytics that do not track you across other sites.</p>
              </div>
              <div>
                <h3 className="font-semibold text-neutral-800">Functional Cookies</h3>
                <p>Remember your preferences, such as recently viewed products or display settings, to improve your experience.</p>
              </div>
            </div>
          </section>
          <section>
            <h2 className="text-xl font-bold text-neutral-800">Managing Cookies</h2>
            <p>You can control and delete cookies through your browser settings. Disabling essential cookies may affect site functionality. Most browsers also offer "Do Not Track" settings.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-neutral-800">Third-Party Cookies</h2>
            <p>Our payment processor (Stripe) and any embedded content (such as YouTube demo videos) may set their own cookies. These are governed by their respective privacy policies.</p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
