import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
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

function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      <section className="bg-white border-b border-neutral-200">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">Contact</p>
            <h1 className="mt-2 text-3xl font-bold text-neutral-800 sm:text-4xl">Get in touch</h1>
            <p className="mt-4 text-lg text-neutral-500">Have a question about our products, licensing, or anything else? We'd love to hear from you.</p>
          </div>
        </div>
      </section>
      <section className="bg-neutral-50">
        <div className="mx-auto max-w-2xl px-6 py-16">
          {sent ? (
            <div className="rounded-xl border border-brand-200 bg-brand-50 p-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-100">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                  <circle cx="16" cy="16" r="12" stroke="#16B3A7" strokeWidth="2" />
                  <path d="M10 16l4 4 8-8" stroke="#16B3A7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-neutral-800">Message Sent</h2>
              <p className="mt-2 text-neutral-600">Thanks for reaching out, {name || "friend"}. We'll get back to you at {email || "your email"} within 1–2 business days.</p>
              <Link to="/" className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-6 py-3 text-base font-semibold text-white shadow-sm transition-all duration-200 hover:bg-brand-600">
                Back to Home
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="rounded-xl border border-neutral-200 bg-white p-8 shadow-sm space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-1.5">Name</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Your name"
                  className="block w-full rounded-lg border border-neutral-300 bg-neutral-50 px-4 py-3 text-base text-neutral-700 placeholder:text-neutral-400 transition-colors duration-200 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1.5">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="block w-full rounded-lg border border-neutral-300 bg-neutral-50 px-4 py-3 text-base text-neutral-700 placeholder:text-neutral-400 transition-colors duration-200 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-neutral-700 mb-1.5">Message</label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={5}
                  placeholder="How can we help?"
                  className="block w-full rounded-lg border border-neutral-300 bg-neutral-50 px-4 py-3 text-base text-neutral-700 placeholder:text-neutral-400 transition-colors duration-200 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 resize-y"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-lg bg-brand-500 px-6 py-3 text-base font-semibold text-white shadow-sm transition-all duration-200 hover:bg-brand-600 hover:shadow-md hover:-translate-y-px active:bg-brand-700 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30 focus-visible:ring-offset-2"
              >
                Send Message
              </button>
              <p className="text-xs text-center text-neutral-400">
                Or email us directly at <a href="mailto:support@prismbay.com" className="text-brand-600 hover:text-brand-700">support@prismbay.com</a>
              </p>
            </form>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
}
