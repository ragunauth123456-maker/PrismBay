export default function TrustBadges({ className }: { className?: string }) {
  const badges = [
    {
      icon: ShieldCheckIcon,
      text: "Secure Checkout via Stripe",
    },
    {
      icon: LockIcon,
      text: "SSL Encrypted",
    },
    {
      icon: DownloadIcon,
      text: "Instant Digital Delivery",
    },
    {
      icon: ClockIcon,
      text: "14-Day Money-Back Guarantee",
    },
    {
      icon: DocCheckIcon,
      text: "Single-Business Licence Included",
    },
  ];

  return (
    <div className={`flex flex-wrap items-center justify-center gap-3${className ? ` ${className}` : ""}`}>
      {badges.map((badge) => (
        <div
          key={badge.text}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500"
        >
          <badge.icon />
          {badge.text}
        </div>
      ))}
    </div>
  );
}

/* ─── Inline SVG Icons ─── */

function ShieldCheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M7 1.5l-4 2v3.5c0 2.5 1.7 4.8 4 5.5 2.3-.7 4-3 4-5.5V3.5l-4-2z"
        stroke="#9F9E99"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 7l1.5 1.5 3-3"
        stroke="#9F9E99"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="2.5"
        y="6"
        width="9"
        height="6.5"
        rx="1.5"
        stroke="#9F9E99"
        strokeWidth="1.2"
      />
      <path
        d="M4.5 6V4a2.5 2.5 0 015 0v2"
        stroke="#9F9E99"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <circle cx="7" cy="9.5" r="0.75" fill="#9F9E99" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M7 1.5v8m0 0L4 6.5m3 3l3-3"
        stroke="#9F9E99"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M1.5 10v1.5a1 1 0 001 1h9a1 1 0 001-1V10"
        stroke="#9F9E99"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="7" cy="7" r="5.5" stroke="#9F9E99" strokeWidth="1.2" />
      <path
        d="M7 4.5V7l2 1.5"
        stroke="#9F9E99"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DocCheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M8 1.5H4a1 1 0 00-1 1v9a1 1 0 001 1h6a1 1 0 001-1V4L8 1.5z"
        stroke="#9F9E99"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 1.5v2.5h2.5"
        stroke="#9F9E99"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 8l1.5 1.5L9 7"
        stroke="#9F9E99"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
