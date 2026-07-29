import { createFileRoute, Link } from "@tanstack/react-router";
import Navbar from '~/components/Navbar';
import Footer from '~/components/Footer';
import LogoHorizontal from '~/components/LogoHorizontal';

export const Route = createFileRoute("/cookies")({
  head: () => ({
    meta: [
      { title: "Cookie Policy — PrismBay" },
      { name: "description", content: "PrismBay cookie policy: learn how we use essential, analytics, and functional cookies to keep our marketplace secure and improve your browsing experience." },
    ],
    links: [
      { rel: "canonical", href: "https://prismbay.com/cookies" },
    ],
  }),
  component: CookiesPage,
});

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
