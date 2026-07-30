// tailwind-colors.js
// PrismBay color system — Tailwind CSS v4 configuration extension.
// Imported via @config in app.css

export default {
  theme: {
    extend: {
      colors: {
        // ── Brand Primary (teal) ──────────────────────────────────────
        brand: {
          50:  "#EFFBFA",
          100: "#D5F5F2",
          200: "#ABEBE5",
          300: "#73DED6",
          400: "#3DCCC2",
          500: "#16B3A7",  // base
          600: "#12948A",  // hover
          700: "#0F766E",  // active
          800: "#0E5F58",
          900: "#0C4E48",
          950: "#08332F",
          DEFAULT: "#16B3A7",
        },

        // ── Brand Accent (golden amber) ──────────────────────────────
        accent: {
          50:  "#FFFBF0",
          100: "#FEF3D6",
          200: "#FDE4A0",
          300: "#FBD26A",
          400: "#F9BD35",
          500: "#F59E0B",  // base
          600: "#D98A09",  // hover
          700: "#B47007",  // active
          800: "#925B06",
          900: "#784A05",
          950: "#513202",
          DEFAULT: "#F59E0B",
        },

        // ── Neutrals (warm gray) ─────────────────────────────────────
        neutral: {
          50:  "#F8F8F7",
          100: "#EDEDEB",
          200: "#DEDDDA",
          300: "#C5C4C0",
          400: "#9F9E99",
          500: "#7A7974",
          600: "#5C5B57",
          700: "#3F3E3B",
          800: "#282724",
          900: "#1A1917",
          950: "#0F0E0D",
        },

        // ── Navy (for premium hero backgrounds) ───────────────────────
        navy: {
          50:  '#F0F4FA',
          100: '#D9E2F0',
          200: '#B3C5E0',
          300: '#8DA8D0',
          400: '#668BC0',
          500: '#406EB0',
          600: '#335890',
          700: '#264270',
          800: '#1A2C50',
          900: '#0F172A',
          950: '#0A0F1E',
        },

        // ── Surface / background shortcuts ────────────────────────────
        surface: {
          light:   "#FFFFFF",
          dark:    "#1A1917",
          DEFAULT: "#FFFFFF",
        },
      },
    },
  },
};
