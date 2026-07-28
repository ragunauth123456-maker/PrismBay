import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/sign-in")({
  component: SignInPage,
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
          <Link to="/products" className="text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900">
            Products
          </Link>
          <Link to="/products" search={{ category: "bundles" }} className="text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900">
            Bundles
          </Link>
        </nav>
        <div className="flex items-center gap-5">
          <Link to="/sign-in" className="text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900">
            Sign In
          </Link>
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
        <div className="mt-12 border-t border-neutral-800 pt-8">
          <p className="text-xs text-neutral-500">&copy; PrismBay 2026. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      <div className="flex items-center justify-center py-20 px-6">
        <div className="w-full max-w-md">
          <div className="rounded-xl border border-neutral-200 bg-white p-8 shadow-sm">
            <h1 className="text-2xl font-bold text-neutral-800 text-center">Sign In</h1>
            <p className="mt-2 text-sm text-neutral-500 text-center">
              Access your purchases, downloads, and account.
            </p>

            {submitted ? (
              <div className="mt-8 rounded-lg border border-brand-200 bg-brand-50 p-4 text-center">
                <p className="text-sm font-medium text-brand-700">
                  Account authentication is coming soon.
                </p>
                <p className="mt-1 text-xs text-brand-600">
                  Full customer accounts will be available when our database is connected. Check back shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Email address
                  </label>
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
                  <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="block w-full rounded-lg border border-neutral-300 bg-neutral-50 px-4 py-3 text-base text-neutral-700 placeholder:text-neutral-400 transition-colors duration-200 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-lg bg-brand-500 px-6 py-3 text-base font-semibold text-white shadow-sm transition-all duration-200 hover:bg-brand-600 hover:shadow-md hover:-translate-y-px active:bg-brand-700 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30 focus-visible:ring-offset-2"
                >
                  Sign In
                </button>
                <p className="text-center text-sm text-neutral-500">
                  Don't have an account?{" "}
                  <Link to="/sign-in" className="font-medium text-brand-600 hover:text-brand-700">
                    Sign up
                  </Link>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
