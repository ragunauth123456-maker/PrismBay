import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

interface PublicUser {
  id: string;
  email: string;
  name: string;
}

interface OrderItem {
  id: string;
  product_title: string;
  price_cents: number;
}

interface DownloadToken {
  token: string;
  downloads_used: number;
  max_downloads: number;
  expires_at: string;
  product_title: string;
  order_status: string;
}

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "My Account — PrismBay" },
      { name: "description", content: "Access your PrismBay account to manage downloads, view purchase history, and access your AI business system purchases." },
      { name: "robots", content: "noindex" },
      { property: "og:url", content: "https://prismbay.com/account" },
    ],
    links: [
      { rel: "canonical", href: "https://prismbay.com/account" },
    ],
  }),
  component: AccountPage,
});

/* ─── Logo ─── */
function LogoHorizontal() {
  return (
    <Link to="/" className="inline-flex items-center gap-3">
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

function Navbar({ user, onLogout }: { user?: PublicUser | null; onLogout: () => void }) {
  return (
    <header className="sticky top-0 z-50 h-16 border-b border-neutral-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6">
        <LogoHorizontal />
        <nav className="hidden items-center gap-8 lg:flex">
          <Link to="/products" className="text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900">Products</Link>
          <Link to="/products" search={{ category: "bundles" }} className="text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900">Bundles</Link>
        </nav>
        <div className="flex items-center gap-5">
          {user ? (
            <>
              <span className="text-sm text-neutral-600">{user.email}</span>
              <button onClick={onLogout} className="text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900">Sign Out</button>
            </>
          ) : (
            <Link to="/sign-in" className="text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900">Sign In</Link>
          )}
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

function AccountPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloads, setDownloads] = useState<DownloadToken[]>([]);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // Check for checkout success param
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") === "success") {
      setShowSuccess(true);
      // Clean URL
      window.history.replaceState({}, "", "/account");
    }
  }, []);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          navigate({ to: "/sign-in" });
          return;
        }
        const data = await res.json();
        setUser(data.user);
        await fetchDownloads();
      } catch {
        navigate({ to: "/sign-in" });
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [navigate]);

  async function fetchDownloads() {
    try {
      const res = await fetch("/api/auth/me/downloads");
      if (res.ok) {
        const data = await res.json();
        setDownloads(data.downloads || []);
      }
    } catch {
      // Downloads will be empty — not critical
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    navigate({ to: "/" });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Navbar user={user} onLogout={handleLogout} />
        <div className="flex items-center justify-center py-32">
          <div className="text-neutral-500">Loading...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar user={user} onLogout={handleLogout} />

      <div className="mx-auto max-w-4xl px-6 py-10">
        {showSuccess && (
          <div className="mb-8 rounded-lg border border-green-200 bg-green-50 p-4">
            <p className="text-sm font-medium text-green-700">
              🎉 Payment successful! Your purchase is confirmed and your downloads are ready below.
            </p>
          </div>
        )}

        <h1 className="text-3xl font-bold text-neutral-800">My Account</h1>
        <p className="mt-2 text-neutral-500">{user?.email}</p>

        {/* Downloads Section */}
        <section className="mt-10">
          <h2 className="text-xl font-bold text-neutral-800">My Downloads</h2>
          {downloads.length === 0 ? (
            <div className="mt-4 rounded-lg border border-neutral-200 bg-white p-8 text-center">
              <p className="text-neutral-500">You haven't purchased any products yet.</p>
              <Link
                to="/products"
                className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-6 py-3 text-base font-semibold text-white shadow-sm transition-all duration-200 hover:bg-brand-600"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {downloads.map((dl) => {
                const expiresAt = dl.expires_at ? new Date(dl.expires_at) : null;
                const isExpired = expiresAt && Date.now() > expiresAt.getTime();
                const remaining = dl.max_downloads - dl.downloads_used;

                return (
                  <div key={dl.token} className="rounded-lg border border-neutral-200 bg-white p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-neutral-800">{dl.product_title}</h3>
                        <p className="mt-1 text-sm text-neutral-500">
                          {remaining} downloads remaining
                          {expiresAt && ` · Expires ${expiresAt.toLocaleDateString()}`}
                        </p>
                      </div>
                      <a
                        href={`/api/downloads/${dl.token}`}
                        className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                          isExpired || remaining <= 0
                            ? "bg-neutral-100 text-neutral-400 cursor-not-allowed pointer-events-none"
                            : "bg-brand-500 text-white hover:bg-brand-600"
                        }`}
                      >
                        {isExpired ? "Expired" : remaining <= 0 ? "Limit Reached" : "Download"}
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Licence Info */}
        <section className="mt-10">
          <h2 className="text-xl font-bold text-neutral-800">Licence Information</h2>
          <div className="mt-4 rounded-lg border border-neutral-200 bg-white p-5">
            <p className="text-sm text-neutral-600">
              All purchases include a single-business perpetual licence. You may use the purchased business system
              blueprint to build one commercial product. For agency or multi-client use, please contact us about
              enterprise licensing.
            </p>
            <p className="mt-3 text-sm text-neutral-500">
              Need help? <Link to="/contact" className="text-brand-600 hover:text-brand-700">Contact support</Link>
            </p>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
