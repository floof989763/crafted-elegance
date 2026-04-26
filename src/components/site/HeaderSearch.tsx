import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Search, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/format";

type Hit = {
  id: string;
  slug: string;
  name: string;
  short_description: string | null;
  price_cents: number;
  currency: string;
  images: string[];
  is_featured: boolean;
};

/**
 * Compact search popover used in the site header.
 * Click the search icon to open; type to find products by name.
 */
export function HeaderSearch({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Focus input when opened
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Click outside / Esc to close
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Debounced search
  useEffect(() => {
    const t = query.trim();
    if (!t) {
      setHits([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from("products")
        .select("id, slug, name, short_description, price_cents, currency, images, is_featured")
        .eq("is_active", true)
        .or(`name.ilike.%${t}%,short_description.ilike.%${t}%`)
        .order("is_featured", { ascending: false })
        .limit(8);
      setHits((data as Hit[]) || []);
      setLoading(false);
    }, 220);
    return () => clearTimeout(timer);
  }, [query]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOpen(false);
    navigate({ to: "/shop" });
  };

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Search the collection"
        className={`inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.32em] text-ink/75 hover:text-brass transition-colors duration-500 ${
          compact ? "" : ""
        }`}
      >
        <Search className="w-4 h-4" strokeWidth={1.4} />
        {!compact && <span className="hidden lg:inline">Search</span>}
      </button>

      {open && (
        <div
          className="absolute right-0 mt-3 w-[min(92vw,420px)] bg-background/95 backdrop-blur-xl border border-border rounded-sm shadow-lg z-50 overflow-hidden"
        >
          <form onSubmit={onSubmit} className="relative border-b border-border">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink/50"
              strokeWidth={1.5}
            />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search the collection"
              className="w-full bg-transparent pl-11 pr-10 py-4 text-sm text-ink placeholder:text-ink/40 focus:outline-none"
            />
            {query && (
              <button
                type="button"
                aria-label="Clear"
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-ink/50 hover:text-ink"
              >
                <X className="w-3.5 h-3.5" strokeWidth={1.5} />
              </button>
            )}
          </form>

          <div className="max-h-[60vh] overflow-y-auto">
            {loading ? (
              <div className="px-5 py-8 flex items-center justify-center text-ink/50">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            ) : query.trim() === "" ? (
              <div className="px-5 py-6 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Type a piece name — e.g. bowl, tray, vase.
              </div>
            ) : hits.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <p className="text-sm text-ink/70">No pieces match “{query}”.</p>
                <Link
                  to="/shop"
                  onClick={() => setOpen(false)}
                  className="mt-3 inline-block text-[11px] uppercase tracking-[0.28em] text-brass luxe-link"
                >
                  Browse the collection
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {hits.map((h) => (
                  <li key={h.id}>
                    <Link
                      to="/shop/$slug"
                      params={{ slug: h.slug }}
                      onClick={() => {
                        setOpen(false);
                        setQuery("");
                      }}
                      className="flex items-center gap-4 px-5 py-3 hover:bg-card transition-colors"
                    >
                      <div className="w-12 h-12 bg-walnut rounded-sm overflow-hidden shrink-0">
                        {h.images?.[0] && (
                          <img
                            src={h.images[0]}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-ink truncate">{h.name}</p>
                          {h.is_featured && (
                            <span className="text-[8px] uppercase tracking-[0.28em] text-brass border border-brass/50 px-1.5 py-0.5 rounded-sm">
                              Premium
                            </span>
                          )}
                        </div>
                        {h.short_description && (
                          <p className="text-xs text-muted-foreground truncate">
                            {h.short_description}
                          </p>
                        )}
                      </div>
                      <p className="text-xs text-ink/70 shrink-0">
                        {formatPrice(h.price_cents, h.currency)}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}