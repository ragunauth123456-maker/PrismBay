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
      { property: "og:image", content: "https://prismbay.com/images/og-default.png" },
      { property: "og:url", content: "https://prismbay.com" },
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
      </head>
      <body>
        {children}
        <CookieConsent />
        <Scripts />
      </body>
    </html>
  );
}
