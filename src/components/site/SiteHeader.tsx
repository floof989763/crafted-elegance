import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, ShoppingBag, User } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useCustomerAuth } from "@/hooks/use-customer-auth";

const navLinks = [
  { to: "/shop", label: "Collection" },
  { to: "/about", label: "Atelier" },
  { to: "/journal", label: "Journal" },
  { to: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { count } = useCart();
  const { user } = useCustomerAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
        scrolled
          ? "bg-background/85 backdrop-blur-xl border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-[1480px] px-6 md:px-10">
        <div className="flex h-20 md:h-24 items-center justify-between">
          <Link
            to="/"
            className="flex items-baseline gap-3 text-ink"
            onClick={() => setOpen(false)}
          >
            <span className="font-display text-2xl md:text-[1.75rem] tracking-tight">
              The Woods
            </span>
            <span className="hidden sm:inline text-[10px] uppercase tracking-[0.32em] text-ink/55">
              Est. MMXXIV
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-[11px] uppercase tracking-[0.32em] text-ink/75 hover:text-brass luxe-link transition-colors duration-500"
                activeProps={{ className: "text-brass" }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <Link
              to="/account"
              className="hidden md:inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.32em] text-ink/75 hover:text-brass transition-colors duration-500"
            >
              <User className="w-4 h-4" strokeWidth={1.4} />
              {user ? "Account" : "Sign in"}
            </Link>
            <Link
              to="/cart"
              className="hidden md:inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.32em] text-ink/75 hover:text-brass transition-colors duration-500"
            >
              <ShoppingBag className="w-4 h-4" strokeWidth={1.4} />
              Cart
              <span className={count > 0 ? "text-brass" : "text-ink/40"}>{count}</span>
            </Link>
            <button
              onClick={() => setOpen((v) => !v)}
              className="md:hidden text-ink"
              aria-label="Toggle menu"
            >
              {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden bg-background/95 backdrop-blur-xl border-b border-border transition-[max-height,opacity] duration-700 ${
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="flex flex-col gap-2 px-6 py-8">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className="py-3 text-sm uppercase tracking-[0.32em] text-ink/80 border-b border-border last:border-0"
              activeProps={{ className: "text-brass" }}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/cart"
            onClick={() => setOpen(false)}
            className="py-3 text-sm uppercase tracking-[0.32em] text-ink/80 border-b border-border flex items-center justify-between"
          >
            <span>Cart</span>
            <span className={count > 0 ? "text-brass" : "text-ink/40"}>{count}</span>
          </Link>
          <Link
            to="/account"
            onClick={() => setOpen(false)}
            className="py-3 text-sm uppercase tracking-[0.32em] text-ink/80"
          >
            {user ? "Account" : "Sign in"}
          </Link>
        </nav>
      </div>
    </header>
  );
}
