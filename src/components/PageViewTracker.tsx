/**
 * PageViewTracker — lightweight, privacy-friendly page view logger.
 * Sends a POST to /api/pageview on every navigation.
 * No cookies, no fingerprinting, no third-party scripts.
 */
import { useRouterState } from "@tanstack/react-router";
import { useEffect, useRef } from "react";

export default function PageViewTracker() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const prevPath = useRef<string | null>(null);

  useEffect(() => {
    if (pathname === prevPath.current) return;
    prevPath.current = pathname;

    // Fire-and-forget POST — don't block the page or retry
    const payload = {
      path: pathname,
      referrer: typeof document !== "undefined" ? document.referrer : "",
    };

    try {
      fetch("/api/pageview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        // keepalive ensures the request completes even on navigation
        keepalive: true,
      }).catch(() => {
        // Silently ignore — analytics should never break the page
      });
    } catch {
      // Silently ignore
    }
  }, [pathname]);

  return null; // renders nothing
}
