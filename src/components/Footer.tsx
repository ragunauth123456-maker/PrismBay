import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import LogoHorizontal from "./LogoHorizontal";

const COOKIE_CONSENT_KEY = "prismbay_cookie_consent";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [consentDeclined, setConsentDeclined] = useState(false);

  useEffect(() => {
    if (typeof localStorage !== "undefined") {
      setConsentDeclined(localStorage.getItem(COOKIE_CONSENT_KEY) === "declined");
    }
  }, []);

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setStatus("success");
        setMessage(data.message || "You're subscribed!");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  return (
    <footer className="bg-neutral-900">
      <div className="mx-auto max-w-7xl px-6 pt-16 pb-12">
        <div className="mb-12">
          <LogoHorizontal light />
        </div>
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <nav aria-label="Browse navigation">
            <h4 className="mb-4 text-sm font-semibold text-neutral-100">Browse</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/products"
                  className="text-sm text-neutral-300 transition-colors hover:text-white"
                >
                  Products
                </Link>
              </li>
              <li>
                <Link
                  to="/bundles"
                  className="text-sm text-neutral-300 transition-colors hover:text-white"
                >
                  Bundles
                </Link>
              </li>
              <li>
                <Link
                  to="/pricing"
                  className="text-sm text-neutral-300 transition-colors hover:text-white"
                >
                  Pricing
                </Link>
              </li>
            </ul>
          </nav>
          <nav aria-label="Learn navigation">
            <h4 className="mb-4 text-sm font-semibold text-neutral-100">Learn</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/resources"
                  className="text-sm text-neutral-300 transition-colors hover:text-white"
                >
                  Resources
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="text-sm text-neutral-300 transition-colors hover:text-white"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  to="/trust"
                  className="text-sm text-neutral-300 transition-colors hover:text-white"
                >
                  Trust Centre
                </Link>
              </li>
              <li>
                <Link
                  to="/compare"
                  className="text-sm text-neutral-300 transition-colors hover:text-white"
                >
                  Compare
                </Link>
              </li>
              <li>
                <Link
                  to="/demo"
                  className="text-sm text-neutral-300 transition-colors hover:text-white"
                >
                  Demos
                </Link>
              </li>
            </ul>
          </nav>
          <nav aria-label="Company navigation">
            <h4 className="mb-4 text-sm font-semibold text-neutral-100">Company</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/about"
                  className="text-sm text-neutral-300 transition-colors hover:text-white"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  to="/how-it-works"
                  className="text-sm text-neutral-300 transition-colors hover:text-white"
                >
                  How It Works
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-sm text-neutral-300 transition-colors hover:text-white"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  to="/jvzoo/resources"
                  className="text-sm text-neutral-300 transition-colors hover:text-white"
                >
                  Affiliate Program
                </Link>
              </li>
            </ul>
          </nav>

          {/* Newsletter signup */}
          <div>
            <h4 className="mb-2 text-sm font-semibold text-neutral-100">
              Get new articles by email
            </h4>
            <p className="mb-4 text-sm text-neutral-400">
              One email every two weeks. No spam, unsubscribe anytime.
            </p>
            {consentDeclined ? (
              <p className="text-sm text-neutral-500">
                Newsletter signup requires functional cookies.{" "}
                <Link to="/cookies" className="text-brand-400 hover:text-brand-300 underline underline-offset-2">
                  Manage cookie preferences
                </Link>
              </p>
            ) : status === "success" ? (
              <p className="text-sm font-medium text-brand-400">{message}</p>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col gap-3 sm:flex-row">
                <label htmlFor="footer-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="footer-email"
                  type="email"
                  required
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="min-w-0 flex-1 rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-sm text-white placeholder:text-neutral-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:opacity-60"
                >
                  {status === "loading" ? "Subscribing…" : "Subscribe"}
                </button>
              </form>
            )}
            {status === "error" && (
              <p className="mt-2 text-sm text-red-400">{message}</p>
            )}
          </div>
        </div>
        <div className="mt-12 border-t border-neutral-800 pt-8">
          <p className="text-xs text-neutral-500">
            &copy; PrismBay 2026. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
