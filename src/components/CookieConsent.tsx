import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

const STORAGE_KEY = "prismbay_cookie_consent";

export default function CookieConsent() {
  const [show, setShow] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return;
    // Delay for slide-up animation
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const delay = prefersReducedMotion ? 300 : 500;
    const timer = setTimeout(() => {
      setShow(true);
      // Trigger entrance animation on next frame
      requestAnimationFrame(() => setAnimate(true));
    }, delay);
    return () => clearTimeout(timer);
  }, []);

  function handleChoice(value: "accepted" | "declined") {
    localStorage.setItem(STORAGE_KEY, value);
    setAnimate(false);
    setExiting(true);
    setTimeout(() => setShow(false), 400);
  }

  if (!show) return null;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-[100] motion-safe:transition-all motion-safe:duration-400 ${
        animate && !exiting
          ? "motion-safe:translate-y-0 motion-safe:opacity-100"
          : "motion-safe:translate-y-full motion-safe:opacity-0"
      } ${exiting ? "motion-safe:translate-y-full motion-safe:opacity-0" : ""}`}
    >
      <div className="bg-neutral-900 border-t border-neutral-800 px-6 py-5">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              {/* Cookie SVG icon */}
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                  stroke="#16B3A7"
                  strokeWidth="1.5"
                />
                <circle cx="8" cy="9" r="1.5" fill="#F59E0B" />
                <circle cx="14" cy="7" r="1" fill="#DEDDDA" />
                <circle cx="16" cy="12" r="1.5" fill="#DEDDDA" />
                <circle cx="9" cy="14" r="1" fill="#DEDDDA" />
              </svg>
              <h3 className="text-sm font-semibold text-white">
                This site uses cookies
              </h3>
            </div>
            <p className="text-sm text-neutral-400 leading-relaxed">
              We use essential cookies to keep the site secure and functional.
              With your permission, we also use analytics and functional cookies
              to understand how the site is used and remember your preferences.{" "}
              <Link
                to="/cookies"
                className="text-brand-400 hover:text-brand-300 underline underline-offset-2"
              >
                Cookie Policy
              </Link>
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => handleChoice("declined")}
              className="inline-flex items-center justify-center rounded-lg bg-neutral-800 px-5 py-2.5 text-sm font-semibold text-neutral-200 transition-colors hover:bg-neutral-700 active:bg-neutral-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50"
            >
              Decline non-essential
            </button>
            <button
              onClick={() => handleChoice("accepted")}
              className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600 active:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50"
            >
              Accept all cookies
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
