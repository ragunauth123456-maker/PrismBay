import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import Navbar from '~/components/Navbar';
import Footer from '~/components/Footer';
import LogoHorizontal from '~/components/LogoHorizontal';

export const Route = createFileRoute("/sign-in")({
  head: () => ({
    meta: [
      { title: "Sign In — Access Your Purchases | PrismBay" },
      { name: "description", content: "Sign in to your PrismBay account to access your AI business system purchases, download files, view your order history, and manage your licences." },
      { name: "robots", content: "noindex" },
    ],
    links: [
      { rel: "canonical", href: "https://prismbay.com/sign-in" },
    ],
  }),
  component: SignInPage,
});

function SignInPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "register">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = mode === "signin" ? "/api/auth/login" : "/api/auth/register";
      const body: Record<string, string> = { email, password };
      if (mode === "register") body.name = name;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Authentication failed. Please try again.");
        return;
      }

      // Success — redirect to account
      navigate({ to: "/account" });
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      <div className="flex items-center justify-center py-20 px-6">
        <div className="w-full max-w-md">
          <div className="rounded-xl border border-neutral-200 bg-white p-8 shadow-sm">
            <h1 className="text-2xl font-bold text-neutral-800 text-center">
              {mode === "signin" ? "Sign In" : "Create Account"}
            </h1>
            <p className="mt-2 text-sm text-neutral-500 text-center">
              {mode === "signin"
                ? "Access your purchases, downloads, and account."
                : "Create an account to save your purchases and access downloads."}
            </p>

            {error && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
                <p className="text-sm font-medium text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {mode === "register" && (
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Full name
                  </label>
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
              )}
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
                  minLength={8}
                  placeholder="••••••••"
                  className="block w-full rounded-lg border border-neutral-300 bg-neutral-50 px-4 py-3 text-base text-neutral-700 placeholder:text-neutral-400 transition-colors duration-200 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
                {mode === "register" && (
                  <p className="mt-1 text-xs text-neutral-400">At least 8 characters</p>
                )}
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-brand-500 px-6 py-3 text-base font-semibold text-white shadow-sm transition-all duration-200 hover:bg-brand-600 hover:shadow-md hover:-translate-y-px active:bg-brand-700 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30 focus-visible:ring-offset-2"
              >
                {loading
                  ? "Please wait..."
                  : mode === "signin"
                    ? "Sign In"
                    : "Create Account"}
              </button>
            </form>

            <div className="mt-6 text-center">
              {mode === "signin" ? (
                <button
                  onClick={() => { setMode("register"); setError(""); }}
                  className="text-sm font-medium text-brand-600 hover:text-brand-700"
                >
                  Don't have an account? Create one
                </button>
              ) : (
                <button
                  onClick={() => { setMode("signin"); setError(""); }}
                  className="text-sm font-medium text-brand-600 hover:text-brand-700"
                >
                  Already have an account? Sign in
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
