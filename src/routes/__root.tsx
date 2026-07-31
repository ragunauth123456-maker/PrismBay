import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router";
import type { ReactNode } from "react";

import appCss from "~/styles/app.css?url";
import CookieConsent from "~/components/CookieConsent";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "AI Business Systems & Blueprints | PrismBay" },
      { name: "description", content: "Complete AI business systems with workflows, architecture diagrams, revenue models & implementation plans. Browse, evaluate, and download instantly." },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: "AI Business Systems & Blueprints | PrismBay" },
      { property: "og:description", content: "Complete AI business systems with workflows, architecture diagrams, revenue models & implementation plans. Browse, evaluate, and download instantly." },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://www.prismbayai.com/images/og-default.png" },
      { property: "og:url", content: "https://www.prismbayai.com" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "AI Business Systems & Blueprints | PrismBay" },
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
  notFoundComponent: () => <div>Page not found</div>,
  component: RootComponent,
});

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
        {/* Affiliate referral tracking: read ?ref=CODE from URL and set 30-day cookie */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function(){
  var m = location.search.match(/[?&]ref=([a-z0-9-]+)/i);
  if (m) {
    var d = new Date();
    d.setDate(d.getDate() + 30);
    document.cookie = "prismbay_ref=" + encodeURIComponent(m[1]) + ";path=/;expires=" + d.toUTCString() + ";SameSite=Lax";
  }
})();`,
          }}
        />
      </head>
      <body>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-brand-600 focus:text-white focus:rounded">Skip to content</a>
        <main id="main-content">
          {children}
        </main>
        <CookieConsent />
        <Scripts />
      </body>
    </html>
  );
}
