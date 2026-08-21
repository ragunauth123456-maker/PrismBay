/* ─── Ask PrismBay AI — chat panel (lazy-loaded, client-only) ─── */
/* This module is only ever mounted after the user opens the widget, and is
 * imported via React.lazy in AdviserLauncher, so it ships in a separate chunk
 * (kept out of the main bundle). It calls the Phase-1 deterministic retrieval
 * layer (src/data/adviser.ts) directly — client-side in-memory, matching the
 * repo's convention that the adviser is a pure data module (no server fn, no
 * backend dependency, so it never depends on the degraded checkout env). All
 * copy comes from widget-config.ts, grounded in adviser-flows.md + knowledge.ts.
 */

import { Link } from "@tanstack/react-router";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";

import { answerIntent, answerQuery } from "~/data/adviser";
import type { AdviserAnswer } from "~/data/adviser";

import {
  buildNamedLinks,
  COMPARE_CHIPS,
  COMPARE_QUESTION,
  FIT_NEED_CHIPS,
  FIT_NEED_QUESTION,
  FIT_SIZE_CHIPS,
  FIT_SIZE_QUESTION,
  GREETING,
  nextActionsFor,
  OPENING_CHIPS,
  OPENING_SECONDARY_CHIPS,
  SOFT_CONFIRM_NOTE,
  type ChatMessage,
  type ChipDef,
  type NamedLink,
} from "./widget-config";

let seq = 0;
function nextId(): string {
  seq += 1;
  return `ai-msg-${seq}`;
}

interface Props {
  onClose: () => void;
}

/* ─── Split an answer string, wrapping canonical product/bundle names and real
 * email addresses as deep links (tappable names per adviser-flows.md). ─── */
interface Span {
  start: number;
  end: number;
  href: string;
}

function buildIndexMap(text: string, links: NamedLink[]): Span[] {
  const normalized = text.toLowerCase();
  const spans: Span[] = [];
  let cursor = 0;
  let guard = 0;
  while (cursor < normalized.length && guard < text.length) {
    guard += 1;
    let best: Span | null = null;
    for (const l of links) {
      const idx = normalized.indexOf(l.name.toLowerCase(), cursor);
      if (idx === -1) continue;
      if (
        !best ||
        idx < best.start ||
        (idx === best.start && l.name.length > best.end - best.start)
      ) {
        best = { start: idx, end: idx + l.name.length, href: l.href };
      }
    }
    if (!best) break;
    spans.push(best);
    cursor = best.end;
  }
  return spans;
}

function LinkedText({ text, onNavigate }: { text: string; onNavigate: () => void }) {
  const links = useMemo<NamedLink[]>(() => buildNamedLinks(), []);
  const parts = useMemo(() => {
    const out: { raw: string; href?: string }[] = [];
    let cursor = 0;
    for (const m of buildIndexMap(text, links)) {
      if (m.start > cursor) out.push({ raw: text.slice(cursor, m.start) });
      out.push({ raw: text.slice(m.start, m.end), href: m.href });
      cursor = m.end;
    }
    if (cursor < text.length) out.push({ raw: text.slice(cursor) });
    if (out.length === 0) out.push({ raw: text });
    return out;
  }, [text, links]);

  return (
    <>
      {parts.map((p, i) =>
        p.href ? (
          <Link
            key={i}
            to={p.href}
            onClick={onNavigate}
            className="font-medium text-brand-700 underline underline-offset-2 hover:text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 rounded"
          >
            {p.raw}
          </Link>
        ) : (
          <span key={i}>{p.raw}</span>
        )
      )}
    </>
  );
}

/* ─── Citation block: "Why this answer" from sources[] ─── */
function Citations({ answer }: { answer: AdviserAnswer }) {
  if (!answer.sources || answer.sources.length === 0) return null;
  return (
    <details className="mt-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2">
      <summary className="cursor-pointer select-none text-xs font-semibold text-neutral-500 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30 rounded">
        Why this answer ({answer.sources.length} source fact
        {answer.sources.length === 1 ? "" : "s"})
      </summary>
      <ul className="mt-2 space-y-2">
        {answer.sources.map((s, i) => (
          <li key={i} className="text-xs leading-relaxed">
            <span className="inline-block rounded bg-brand-50 px-1.5 py-0.5 font-semibold text-brand-700">
              {s.name} · {s.label}
            </span>
            <p className="mt-1 text-neutral-600">{s.value}</p>
          </li>
        ))}
      </ul>
    </details>
  );
}

/* ─── Quick-action chip grid (keyboard roving) ─── */
function ChipGrid({
  chips,
  onChip,
}: {
  chips: ChipDef[];
  onChip: (c: ChipDef) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function onKeyDown(e: ReactKeyboardEvent<HTMLDivElement>) {
    if (["ArrowRight", "ArrowLeft", "Home", "End"].indexOf(e.key) === -1) return;
    const container = ref.current;
    if (!container) return;
    const buttons = Array.from(
      container.querySelectorAll<HTMLButtonElement>("button[data-chip]")
    );
    if (buttons.length === 0) return;
    e.preventDefault();
    const idx = buttons.indexOf(document.activeElement as HTMLButtonElement);
    let next: number;
    if (e.key === "Home") next = 0;
    else if (e.key === "End") next = buttons.length - 1;
    else if (e.key === "ArrowRight") next = idx < 0 ? 0 : (idx + 1) % buttons.length;
    else next = idx <= 0 ? buttons.length - 1 : idx - 1;
    buttons[next].focus();
  }

  return (
    <div ref={ref} onKeyDown={onKeyDown} className="flex flex-wrap gap-2">
      {chips.map((c) => (
        <button
          key={c.id}
          data-chip
          type="button"
          onClick={() => onChip(c)}
          className="inline-flex items-center rounded-full border border-brand-200 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 shadow-sm transition-colors hover:border-brand-400 hover:bg-brand-50 hover:text-brand-800 active:bg-brand-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50"
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}

/* ─── Bot answer bubble: text + optional soft-confirm note + citations + chips ─── */
function BotAnswer({
  message,
  onChip,
  onNavigate,
}: {
  message: ChatMessage;
  onChip: (c: ChipDef) => void;
  onNavigate: () => void;
}) {
  const a = message.answer;
  const soft = a && a.confidence >= 0.3 && a.confidence < 0.7;

  return (
    <div className="max-w-[92%]">
      <div className="rounded-2xl rounded-tl-sm border border-neutral-200 bg-white px-4 py-3 text-sm leading-relaxed text-neutral-700 shadow-sm">
        <div className="whitespace-pre-line">
          <LinkedText text={message.text} onNavigate={onNavigate} />
        </div>
        {soft && (
          <p className="mt-2 border-t border-neutral-100 pt-2 text-xs text-neutral-500">
            {SOFT_CONFIRM_NOTE}
          </p>
        )}
        {a && <Citations answer={a} />}
      </div>
      {message.chips && message.chips.length > 0 && (
        <div className="mt-2">
          <ChipGrid chips={message.chips} onChip={onChip} />
        </div>
      )}
    </div>
  );
}

/* ─── Main panel ─── */
export default function AdviserChatPanel({ onClose }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: "ai-greeting",
      role: "bot",
      kind: "greeting",
      text: GREETING,
      chips: OPENING_CHIPS,
      secondaryChips: OPENING_SECONDARY_CHIPS,
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  const threadRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fitRef = useRef<{ active: boolean; size?: string; need?: string }>({
    active: false,
  });

  function push(msg: ChatMessage) {
    setMessages((prev) => [...prev, msg]);
  }

  function pushUser(text: string) {
    push({ id: nextId(), role: "user", kind: "user", text });
  }

  function run(fn: () => AdviserAnswer) {
    setBusy(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const a = fn();
      push({
        id: nextId(),
        role: "bot",
        kind: "answer",
        text: a.answer,
        answer: a,
        chips: nextActionsFor(a),
      });
      setBusy(false);
    }, 420);
  }

  function handleChip(c: ChipDef) {
    if (busy) return;
    switch (c.kind) {
      case "intent":
        pushUser(c.label);
        run(() => answerIntent(c.intent!, c.ctx));
        break;
      case "query":
        pushUser(c.label);
        run(() => answerQuery(c.query!));
        break;
      case "link":
        // handled via the LinkedText / Link onClick (onNavigate closes panel)
        break;
      case "human":
        pushUser(c.label);
        run(() => answerIntent("handoff", { query: "Talk to a human" }));
        break;
      case "fit-start":
        pushUser(c.label);
        fitRef.current = { active: true };
        push({
          id: nextId(),
          role: "bot",
          kind: "clarify",
          text: FIT_SIZE_QUESTION,
          chips: FIT_SIZE_CHIPS,
        });
        break;
      case "fit-size":
        pushUser(c.label);
        fitRef.current.active = true;
        if (c.value !== "not-sure") fitRef.current.size = c.value;
        push({
          id: nextId(),
          role: "bot",
          kind: "clarify",
          text: FIT_NEED_QUESTION,
          chips: FIT_NEED_CHIPS,
        });
        break;
      case "fit-need": {
        pushUser(c.label);
        const size = fitRef.current.size;
        const need = c.value === "not-sure" ? undefined : c.value;
        fitRef.current = { active: false };
        run(() => answerIntent("business_fit", { profile: { size, need } }));
        break;
      }
      case "compare-start":
        pushUser(c.label);
        push({
          id: nextId(),
          role: "bot",
          kind: "clarify",
          text: COMPARE_QUESTION,
          chips: COMPARE_CHIPS,
        });
        break;
    }
  }

  function submit() {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    pushUser(text);
    const fit = fitRef.current;
    if (fit.active && !fit.size) {
      const unsure = /not sure|anyway|recommend anyway/.test(text.toLowerCase());
      fitRef.current = { active: true, size: unsure ? undefined : text };
      push({
        id: nextId(),
        role: "bot",
        kind: "clarify",
        text: FIT_NEED_QUESTION,
        chips: FIT_NEED_CHIPS,
      });
      return;
    }
    if (fit.active && fit.size && !fit.need) {
      const size = fit.size;
      const need = /not sure|anyway/.test(text.toLowerCase()) ? undefined : text;
      fitRef.current = { active: false };
      run(() => answerIntent("business_fit", { profile: { size, need } }));
      return;
    }
    run(() => answerQuery(text));
  }

  // Auto-scroll to the latest message only when already near the bottom.
  useEffect(() => {
    const el = threadRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    if (nearBottom) {
      el.scrollTo({
        top: el.scrollHeight,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  // Focus the input on mount.
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 80);
    return () => clearTimeout(t);
  }, []);

  // Clear the pending reply timer on unmount.
  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    []
  );

  // Latest bot message text for the screen-reader live region.
  const lastBotText = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      if (messages[i].role === "bot") return messages[i].text;
    }
    return "";
  }, [messages]);

  function handlePanelKeyDown(e: ReactKeyboardEvent<HTMLDivElement>) {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
      return;
    }
    if (e.key !== "Tab") return;
    const panel = panelRef.current;
    if (!panel) return;
    const focusables = Array.from(
      panel.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), summary, a[href], [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => el.offsetParent !== null);
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  return (
    <div
      ref={panelRef}
      id="adviser-panel"
      role="dialog"
      aria-modal="false"
      aria-label="Ask PrismBay AI chat"
      onKeyDown={handlePanelKeyDown}
      className="fixed inset-x-0 bottom-0 z-[120] flex h-[85dvh] flex-col overflow-hidden rounded-t-2xl border border-neutral-200 bg-white shadow-2xl sm:inset-x-auto sm:bottom-6 sm:right-6 sm:h-[min(660px,84vh)] sm:w-[400px] sm:rounded-2xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 bg-brand-600 px-4 py-3 text-white">
        <div className="min-w-0">
          <p className="text-sm font-semibold leading-tight">Ask PrismBay AI</p>
          <p className="truncate text-[11px] text-brand-100">
            Answers from our official catalogue
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => handleChip({ id: "persist-human", kind: "human", label: "Talk to a human" })}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-white ring-1 ring-inset ring-white/30 hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <span aria-hidden="true">🧑‍💼</span>
            Talk to a human
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close chat"
            className="ml-1 inline-flex h-8 w-8 items-center justify-center rounded-lg text-white/90 hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Live region for screen readers */}
      <div aria-live="polite" className="sr-only">
        {busy ? "The adviser is typing" : lastBotText}
      </div>

      {/* Thread */}
      <div ref={threadRef} className="flex-1 space-y-3 overflow-y-auto bg-neutral-50 px-4 py-4">
        {messages.map((m) => {
          if (m.role === "user") {
            return (
              <div key={m.id} className="flex justify-end">
                <div className="max-w-[85%] whitespace-pre-line rounded-2xl rounded-br-sm bg-brand-600 px-4 py-2.5 text-sm text-white">
                  {m.text}
                </div>
              </div>
            );
          }
          if (m.kind === "greeting") {
            return (
              <div key={m.id} className="max-w-full">
                <div className="max-w-[92%] rounded-2xl rounded-tl-sm border border-neutral-200 bg-white px-4 py-3 text-sm leading-relaxed text-neutral-700 shadow-sm">
                  <span className="whitespace-pre-line">{m.text}</span>
                </div>
                <div className="mt-3">
                  <ChipGrid chips={OPENING_CHIPS} onChip={handleChip} />
                </div>
                <p className="mt-3 mb-1 text-[11px] font-medium uppercase tracking-wide text-neutral-400">
                  Or explore
                </p>
                <div className="mt-0">
                  <ChipGrid chips={OPENING_SECONDARY_CHIPS} onChip={handleChip} />
                </div>
              </div>
            );
          }
          if (m.kind === "clarify") {
            return (
              <div key={m.id} className="max-w-[92%]">
                <div className="rounded-2xl rounded-tl-sm border border-neutral-200 bg-white px-4 py-3 text-sm leading-relaxed text-neutral-700 shadow-sm">
                  <span className="whitespace-pre-line">{m.text}</span>
                </div>
                {m.chips && m.chips.length > 0 && (
                  <div className="mt-2">
                    <ChipGrid chips={m.chips} onChip={handleChip} />
                  </div>
                )}
              </div>
            );
          }
          return (
            <div key={m.id} className="flex justify-start">
              <BotAnswer message={m} onChip={handleChip} onNavigate={onClose} />
            </div>
          );
        })}

        {busy && (
          <div className="flex items-center gap-1.5 px-1 text-neutral-400" aria-hidden="true">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-400" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-400 [animation-delay:120ms]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-400 [animation-delay:240ms]" />
          </div>
        )}
      </div>

      {/* Input */}
      <form
        className="flex items-center gap-2 border-t border-neutral-200 bg-white px-3 py-2.5"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about products, fit, bundles…"
          aria-label="Message the AI adviser"
          autoComplete="off"
          className="min-w-0 flex-1 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-800 placeholder:text-neutral-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          aria-label="Send message"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M3 11.5 21 3l-8.5 18-2.4-6.6L3 11.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            <path d="M21 3 10.1 14.4" stroke="currentColor" strokeWidth="1.8" />
          </svg>
        </button>
      </form>
    </div>
  );
}
