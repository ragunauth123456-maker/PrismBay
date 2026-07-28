import { useState, useEffect, useCallback } from "react";
import { Link } from "@tanstack/react-router";
import type { DemoWalkthrough, DemoStep } from "~/data/demos";

/* ─── Icon Components ─── */

function HookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="7.5" stroke="#F59E0B" strokeWidth="1.5" />
      <path d="M6.5 9.5L8.5 11.5L11.5 7" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function OverviewIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <rect x="1.5" y="1.5" width="7" height="6" rx="1" stroke="#16B3A7" strokeWidth="1.5" />
      <rect x="9.5" y="1.5" width="7" height="6" rx="1" stroke="#16B3A7" strokeWidth="1.5" />
      <rect x="1.5" y="10.5" width="7" height="6" rx="1" stroke="#16B3A7" strokeWidth="1.5" />
      <rect x="9.5" y="10.5" width="7" height="6" rx="1" stroke="#16B3A7" strokeWidth="1.5" />
    </svg>
  );
}

function FeatureIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M3 12.5l4.5-4.5L10 10.5l5-6" stroke="#16B3A7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="8.5" cy="6.5" r="1" fill="#16B3A7" />
      <circle cx="3" cy="14" r="1" fill="#3DCCC2" />
      <circle cx="14" cy="5" r="1" fill="#3DCCC2" />
    </svg>
  );
}

function ValueIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M9 1.5v15M3.5 4.5h3a2.5 2.5 0 010 5h-3m0-5h4" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14.5 13.5h-3a2.5 2.5 0 010-5h3m0 5h-4" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M2 9h10M8 5l4 4-4 4" stroke="#16B3A7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="10" y="4" width="8" height="11" rx="1.5" stroke="#16B3A7" strokeWidth="1.5" />
    </svg>
  );
}

function iconForStep(icon?: DemoStep["icon"]) {
  switch (icon) {
    case "hook":
      return <HookIcon />;
    case "overview":
      return <OverviewIcon />;
    case "feature":
      return <FeatureIcon />;
    case "value":
      return <ValueIcon />;
    case "close":
      return <CloseIcon />;
    default:
      return <FeatureIcon />;
  }
}

function iconLabel(icon?: DemoStep["icon"]) {
  switch (icon) {
    case "hook":
      return "Intro";
    case "overview":
      return "Overview";
    case "feature":
      return "Feature";
    case "value":
      return "Results";
    case "close":
      return "Next Steps";
    default:
      return "Step";
  }
}

/* ─── Component ─── */

export default function DemoWalkthroughPage({
  demo,
  productImage,
}: {
  demo: DemoWalkthrough;
  productImage: string;
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [autoAdvance, setAutoAdvance] = useState(false);
  const totalSteps = demo.totalSteps;
  const step = demo.steps[currentStep];

  const goNext = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
  }, [totalSteps]);

  const goPrev = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  // Auto-advance timer
  useEffect(() => {
    if (!autoAdvance) return;
    if (currentStep >= totalSteps - 1) {
      setAutoAdvance(false);
      return;
    }
    const timer = setTimeout(goNext, 8000);
    return () => clearTimeout(timer);
  }, [autoAdvance, currentStep, totalSteps, goNext]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goNext, goPrev]);

  const isFirst = currentStep === 0;
  const isLast = currentStep === totalSteps - 1;

  // Progress percentage for the bar
  const progressPct = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-white">
      {/* ── Progress Bar (top) ── */}
      <div className="sticky top-0 z-30 h-1 bg-neutral-100">
        <div
          className="h-full bg-brand-500 transition-all duration-500 ease-out"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* ── Navigation Header ── */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/demo"
              className="text-sm text-neutral-400 hover:text-brand-600 transition-colors"
            >
              ← All Demos
            </Link>
            <span className="text-neutral-300">|</span>
            <span className="text-sm font-medium text-neutral-700">
              {demo.productName}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-neutral-400">
              Use ← → arrow keys
            </span>
            <button
              onClick={() => setAutoAdvance(!autoAdvance)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                autoAdvance
                  ? "bg-brand-100 text-brand-700 hover:bg-brand-200"
                  : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
              }`}
            >
              {autoAdvance ? (
                <>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <rect x="3" y="1" width="1.5" height="10" rx="0.5" fill="currentColor" />
                    <rect x="7.5" y="1" width="1.5" height="10" rx="0.5" fill="currentColor" />
                  </svg>
                  Auto-pause
                </>
              ) : (
                <>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M3 1.5l7 4.5-7 4.5V1.5z" fill="currentColor" />
                  </svg>
                  Auto-play
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pb-16">
        {/* Step counter */}
        <div className="mb-6 flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-500">
            Step {currentStep + 1} of {totalSteps}
          </span>
          <span className="text-xs text-neutral-400">—</span>
          <span className="text-xs text-neutral-500">
            {iconLabel(step.icon)}
          </span>
        </div>

        {/* Two-column layout */}
        <div className="grid gap-8 lg:grid-cols-5">
          {/* ── Visual Column (3/5) ── */}
          <div className="lg:col-span-3">
            <div className="relative aspect-video rounded-xl bg-navy-900 overflow-hidden shadow-xl">
              {/* Product image as visual backdrop */}
              <img
                src={productImage}
                alt={`${demo.productName} product image`}
                className="absolute inset-0 w-full h-full object-cover opacity-30"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-navy-950/90 via-navy-900/70 to-transparent" />

              {/* Visual label overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                <div className="inline-flex items-center gap-2 rounded-full bg-brand-500/10 border border-brand-400/30 px-4 py-1.5 mb-4">
                  {iconForStep(step.icon)}
                  <span className="text-xs font-medium text-brand-300">
                    {iconLabel(step.icon)}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-bold text-white text-center max-w-md mb-3">
                  {step.title}
                </h2>

                <div className="rounded-lg bg-white/10 backdrop-blur-sm border border-white/10 px-4 py-2">
                  <p className="text-sm text-brand-200/80 text-center">
                    📄 {step.visualLabel}
                  </p>
                </div>

                {/* Step dots indicator */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                  {demo.steps.map((_, i) => (
                    <div
                      key={i}
                      className={`rounded-full transition-all duration-300 ${
                        i === currentStep
                          ? "w-6 h-2 bg-brand-400"
                          : i < currentStep
                            ? "w-2 h-2 bg-brand-500/60"
                            : "w-2 h-2 bg-white/20"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Narration Column (2/5) ── */}
          <div className="lg:col-span-2 flex flex-col">
            <div className="flex-1 rounded-xl border border-neutral-200 bg-neutral-50/50 p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M2 4h12M2 8h8M2 12h5"
                      stroke="#16B3A7"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-neutral-600">
                  Narration
                </span>
              </div>
              <p className="text-base leading-relaxed text-neutral-700">
                {step.narration}
              </p>
            </div>

            {/* Navigation buttons */}
            <div className="mt-6 flex items-center justify-between">
              <button
                onClick={goPrev}
                disabled={isFirst}
                className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 px-4 py-2.5 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-50 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M10 4l-4 4 4 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Previous
              </button>

              {isLast ? (
                <Link
                  to="/products"
                  search={{ category: "all" }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-600 hover:shadow-md"
                >
                  Browse Products
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M3 8h10M9 4l4 4-4 4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
              ) : (
                <button
                  onClick={goNext}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-600 hover:shadow-md"
                >
                  Next
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M6 4l4 4-4 4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Step thumbnails row */}
        <div className="mt-10">
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">
            Jump to step
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2">
            {demo.steps.map((s, i) => (
              <button
                key={i}
                onClick={() => {
                  setCurrentStep(i);
                  setAutoAdvance(false);
                }}
                className={`rounded-lg border p-3 text-left transition-all ${
                  i === currentStep
                    ? "border-brand-400 bg-brand-50 shadow-sm"
                    : "border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50"
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-xs">{iconForStep(s.icon)}</span>
                  <span className="text-[10px] font-semibold uppercase text-neutral-400">
                    {i + 1}
                  </span>
                </div>
                <p
                  className={`text-xs leading-tight line-clamp-2 ${
                    i === currentStep
                      ? "text-neutral-800 font-medium"
                      : "text-neutral-500"
                  }`}
                >
                  {s.title}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
