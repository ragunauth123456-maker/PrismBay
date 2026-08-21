/* ─── Ask PrismBay AI — floating launcher ─── */
/* Tiny client component that lives in the main bundle. The chat panel (and the
 * whole Phase-1 retrieval layer + knowledge base it pulls in) is lazy-loaded via
 * React.lazy on first open, so it ships in a separate chunk and never bloats the
 * main bundle. The panel stays mounted after first open so the conversation and
 * the loaded chunk persist across open/close.
 */

import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";

const AdviserChatPanel = lazy(() => import("./AdviserChatPanel"));

function ChatIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3C6.9 3 3 6.5 3 10.8c0 2.3 1.2 4.3 3.1 5.7-.2 1.1-.7 2.2-1.5 3.1-.2.3 0 .7.4.7 1.8 0 3.3-.6 4.5-1.4.8.2 1.6.3 2.5.3 5.1 0 9-3.5 9-7.8S17.1 3 12 3Z"
        fill="currentColor"
      />
    </svg>
  );
}

function PanelFallback() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-[120] flex h-[85dvh] items-center justify-center border border-neutral-200 bg-white shadow-2xl sm:inset-x-auto sm:bottom-6 sm:right-6 sm:h-[min(660px,84vh)] sm:w-[400px] sm:rounded-2xl">
      <div className="flex items-center gap-2 text-sm text-neutral-500">
        <span className="h-2 w-2 animate-pulse rounded-full bg-brand-500" />
        Opening the adviser…
      </div>
    </div>
  );
}

export default function AdviserLauncher() {
  const [open, setOpen] = useState(false);
  const [everOpened, setEverOpened] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const openRef = useRef(false);
  openRef.current = open;

  const openChat = useCallback(() => {
    setOpen(true);
    setEverOpened(true);
  }, []);

  const closeChat = useCallback(() => {
    setOpen(false);
    // Return focus to the launcher button.
    requestAnimationFrame(() => btnRef.current?.focus());
  }, []);

  // Global Escape closes the panel (in addition to the panel's own handler).
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && openRef.current) {
        setOpen(false);
        requestAnimationFrame(() => btnRef.current?.focus());
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={open ? closeChat : openChat}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="adviser-panel"
        aria-label={open ? "Close Ask PrismBay AI chat" : "Open Ask PrismBay AI chat"}
        className={`fixed bottom-5 right-5 z-[120] inline-flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg transition-all duration-200 hover:bg-brand-700 hover:shadow-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/40 active:scale-95 sm:bottom-6 sm:right-6 ${
          open ? "hidden" : ""
        }`}
      >
        <ChatIcon />
      </button>

      {everOpened && (
        <div className={open ? "block" : "hidden"}>
          <Suspense fallback={<PanelFallback />}>
            <AdviserChatPanel onClose={closeChat} />
          </Suspense>
        </div>
      )}
    </>
  );
}
