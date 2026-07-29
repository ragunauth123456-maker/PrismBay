import { Link } from "@tanstack/react-router";
import LogoHorizontal from "./LogoHorizontal";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 h-16 border-b border-neutral-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6">
        <LogoHorizontal />
        <nav className="hidden items-center gap-8 lg:flex" aria-label="Main navigation">
          <Link
            to="/products"
            className="text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900"
          >
            Products
          </Link>
          <Link
            to="/bundles"
            className="text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900"
          >
            Bundles
          </Link>
          <Link
            to="/compare"
            className="text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900"
          >
            Compare
          </Link>
          <Link
            to="/demo"
            className="text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900"
          >
            Demos
          </Link>
          <Link
            to="/resources"
            className="text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900"
          >
            Resources
          </Link>
        </nav>
        <Link
          to="/sign-in"
          className="text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900"
        >
          Sign In
        </Link>
      </div>
    </header>
  );
}
