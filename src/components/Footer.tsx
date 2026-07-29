import { Link } from "@tanstack/react-router";
import LogoHorizontal from "./LogoHorizontal";

export default function Footer() {
  return (
    <footer className="bg-neutral-900">
      <div className="mx-auto max-w-7xl px-6 pt-16 pb-12">
        <div className="mb-12">
          <LogoHorizontal light />
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          <div>
            <h4 className="mb-4 text-sm font-semibold text-neutral-100">Company</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/about"
                  className="text-sm text-neutral-300 transition-colors hover:text-white"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  to="/how-it-works"
                  className="text-sm text-neutral-300 transition-colors hover:text-white"
                >
                  How It Works
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-sm text-neutral-300 transition-colors hover:text-white"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-neutral-800 pt-8">
          <p className="text-xs text-neutral-500">
            &copy; PrismBay 2026. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
