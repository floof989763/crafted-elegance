import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, ShoppingBag, User } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useCustomerAuth } from "@/hooks/use-customer-auth";
import { useSiteContent } from "@/hooks/use-site-content";
import { supabase } from "@/integrations/supabase/client";
import { HeaderSearch } from "./HeaderSearch";

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { count } = useCart();
  const { user } = useCustomerAuth();
  const h = useSiteContent("site.header");
  const [extraPages, setExtraPages] = useState<{ slug: string; title: string }[]>([]);
  const location = useLocation();
  const navigate = useNavigate();

  const scrollToCollections = (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(false);
    if (location.pathname === "/") {
      const el = document.getElementById("collection");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
    }
    navigate({ to: "/", hash: "collection" });
  };

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("custom_pages")
        .select("slug, title")
        .eq("is_published", true)
        .eq("show_in_nav", true)
        .order("sort_order");
      if (data) setExtraPages(data as { slug: string; title: string }[]);
    })();
  }, []);

  const navLinks: { to: any; params?: any; label: string; onClick?: (e: React.MouseEvent) => void }[] = [
    { to: "/", label: h.nav_collection, onClick: scrollToCollections },
    { to: "/shop", label: "Shop" },
    { to: "/about", label: h.nav_atelier },
    { to: "/journal", label: h.nav_journal },
    { to: "/contact", label: h.nav_contact },
    ...extraPages.map((p) => ({
      to: "/p/$slug",
      params: { slug: p.slug },
      label: p.title,
    })),
  ];

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
        <div className={`flex items-center justify-between transition-[height] duration-500 ${scrolled ? "h-14 md:h-16" : "h-20 md:h-24"}`}>
          <Link
            to="/"
            className="flex items-baseline gap-3 text-ink"
            onClick={() => setOpen(false)}
          >
            <span className={`font-display tracking-tight transition-all duration-500 ${scrolled ? "text-xl md:text-2xl" : "text-2xl md:text-[1.75rem]"}`}>
              {h.brand}
            </span>
            <span className={`hidden uppercase tracking-[0.32em] text-ink/55 transition-opacity duration-500 ${scrolled ? "sm:hidden opacity-0" : "sm:inline opacity-100 text-[10px]"}`}>
              {h.tagline}
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={`${link.to}${link.params?.slug ?? ""}${link.label}`}
                to={link.to}
                params={link.params}
                onClick={link.onClick}
                className="text-[11px] uppercase tracking-[0.32em] text-ink/75 hover:text-brass luxe-link transition-colors duration-500"
                activeProps={{ className: "text-brass" }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <HeaderSearch />
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
              key={`m-${link.to}${link.params?.slug ?? ""}${link.label}`}
              to={link.to}
              params={link.params}
              onClick={(e) => {
                if (link.onClick) link.onClick(e);
                else setOpen(false);
              }}
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
