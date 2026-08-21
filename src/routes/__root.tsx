import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router";
import type { ReactNode } from "react";

import appCss from "~/styles/app.css?url";
import CookieConsent from "~/components/CookieConsent";
import PageViewTracker from "~/components/PageViewTracker";
import Navbar from "~/components/Navbar";
import Footer from "~/components/Footer";
import AdviserLauncher from "~/components/ai-widget/AdviserLauncher";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "AI Business System Blueprints | PrismBay" },
      { name: "description", content: "Complete AI business systems with workflows, architecture diagrams, revenue models & implementation plans. Browse, evaluate, and download instantly." },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: "AI Business System Blueprints | PrismBay" },
      { property: "og:description", content: "Complete AI business systems with workflows, architecture diagrams, revenue models & implementation plans. Browse, evaluate, and download instantly." },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://www.prismbayai.com/images/og-default.png" },
      { property: "og:url", content: "https://www.prismbayai.com" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "AI Business System Blueprints | PrismBay" },
      { name: "twitter:description", content: "Complete AI business systems with workflows, architecture diagrams, revenue models & implementation plans. Browse, evaluate, and download instantly." },
      { name: "theme-color", content: "#16B3A7" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "preload", as: "style", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap", media: "print", onLoad: "this.media='all'" },
      { rel: "alternate", type: "application/rss+xml", title: "PrismBay Blog", href: "/resources/rssxml" },
    ],
  }),
  notFoundComponent: NotFoundPage,
  component: RootComponent,
});

function NotFoundPage() {
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-6 py-24">
        <div className="text-center max-w-lg">
          <p className="text-8xl font-bold text-brand-500 mb-4">404</p>
          <h1 className="text-3xl font-bold text-neutral-800 mb-3">Page not found</h1>
          <p className="text-neutral-600 mb-8 leading-relaxed">
            The page you're looking for doesn't exist or has been moved.
            It might have been renamed, or the link you followed may be outdated.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-6 py-3 text-base font-semibold text-white shadow-sm transition-all duration-200 hover:bg-brand-600"
            >
              Go to Homepage
            </Link>
            <Link
              to="/products"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-6 py-3 text-base font-semibold text-neutral-700 transition-all duration-200 hover:bg-neutral-50"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-brand-600 focus:text-white focus:rounded">Skip to content</a>
        <main id="main-content">
          {children}
        </main>
        <PageViewTracker />
        <CookieConsent />
        <AdviserLauncher />
        <Scripts />
      </body>
    </html>
  );
}
