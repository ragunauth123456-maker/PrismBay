import { Link } from "@tanstack/react-router";

interface LogoHorizontalProps {
  className?: string;
  /** Use light text variant (for dark backgrounds like the footer) */
  light?: boolean;
}

export default function LogoHorizontal({ className, light }: LogoHorizontalProps) {
  return (
    <Link to="/" className={`inline-flex items-center gap-3 ${className ?? ""}`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 320 64"
        fill="none"
        className="h-9 w-auto"
        aria-label="PrismBay"
      >
        <g transform="translate(0, 6)">
          <polygon points="4,52 28,4 52,52" fill="#16B3A7" />
          <line x1="28" y1="4" x2="20" y2="52" stroke="white" strokeWidth="2.5" />
          <circle cx="20" cy="52" r="3" fill="#F59E0B" />
        </g>
        <g transform="translate(68, 0)">
          <text
            x="0"
            y="44"
            fontFamily="Inter, system-ui, sans-serif"
            fontWeight="700"
            fontSize="36"
            letterSpacing="-0.02em"
          >
            <tspan fill="#16B3A7">Prism</tspan>
            <tspan fill={light ? "#EDEDEB" : "#282724"}>Bay</tspan>
          </text>
        </g>
      </svg>
    </Link>
  );
}
