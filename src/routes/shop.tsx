import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, X, Sparkle } from "lucide-react";
import { z } from "zod";
import { SiteShell } from "@/components/site/SiteShell";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/format";
import { useSiteContent } from "@/hooks/use-site-content";

const searchSchema = z.object({
  category: z.string().optional(),
});

type Product = {
  id: string;
  slug: string;
  name: string;
  short_description: string | null;
  price_cents: number;
  currency: string;
  images: string[];
  category_id: string | null;
  collection_tags: string[];
};

const hasTag = (product: Pick<Product, "collection_tags">, tag: string) =>
  product.collection_tags?.includes(tag) ?? false;

type Category = {
  id: string;
  slug: string;
  name: string;
};

export const Route = createFileRoute("/shop")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "The Collection — The Woods" },
      {
        name: "description",
        content:
          "Browse hand-carved trays, decor, furniture and accessories. Numbered, signed, made slowly.",
      },
      { property: "og:title", content: "The Collection — The Woods" },
      {
        property: "og:description",
        content: "Heirloom wooden objects, made slowly by a small atelier.",
      },
    ],
  }),
  component: ShopRouteBoundary,
});

function ShopRouteBoundary() {
  const location = useLocation();

  if (location.pathname !== "/shop") {
    return <Outlet />;
  }

  return <ShopPage />;
}

function ShopPage() {
  const { category } = Route.useSearch();
  const h = useSiteContent("shop.header");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: cats } = await supabase
        .from("categories")
        .select("id, slug, name")
        .order("sort_order");
      setCategories((cats as Category[]) || []);

      let q = supabase
        .from("products")
        .select("id, slug, name, short_description, price_cents, currency, images, category_id, collection_tags")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (category && cats) {
        const c = cats.find((x) => x.slug === category);
        if (c) q = q.eq("category_id", c.id);
      }

      const { data } = await q;
      setProducts((data as Product[]) || []);
      setLoading(false);
    })();
  }, [category]);

  const filtered = useMemo(() => {
    const t = query.trim().toLowerCase();
    if (!t) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(t) ||
        (p.short_description || "").toLowerCase().includes(t),
    );
  }, [products, query]);

  return (
    <SiteShell>
      <section className="pt-40 md:pt-48 pb-16 border-b border-border">
        <div className="mx-auto max-w-[1480px] px-6 md:px-10">
          <p className="eyebrow">{h.eyebrow}</p>
          <h1
            className="mt-4 font-display text-6xl md:text-8xl text-ink leading-[0.92] [&_em]:text-brass"
            dangerouslySetInnerHTML={{ __html: h.title_html }}
          />
        </div>
      </section>

      <section className="py-10 border-b border-border sticky top-20 md:top-24 bg-background/85 backdrop-blur-xl z-30">
        <div className="mx-auto max-w-[1480px] px-6 md:px-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div className="flex flex-wrap gap-x-7 gap-y-3 min-w-0">
            <Link
              to="/shop"
              search={{}}
              className={`text-xs uppercase tracking-[0.28em] luxe-link transition-colors ${
                !category ? "text-brass" : "text-ink/70 hover:text-ink"
              }`}
            >
              {h.all_label}
            </Link>
            {categories.map((c) => (
              <Link
                key={c.id}
                to="/shop"
                search={{ category: c.slug }}
                className={`text-xs uppercase tracking-[0.28em] luxe-link transition-colors ${
                  category === c.slug ? "text-brass" : "text-ink/70 hover:text-ink"
                }`}
              >
                {c.name}
              </Link>
            ))}
          </div>

          <div className="relative md:w-72 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink/50" strokeWidth={1.5} />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search the collection"
              className="w-full bg-transparent border border-border rounded-sm pl-9 pr-9 py-2.5 text-xs uppercase tracking-[0.18em] text-ink placeholder:text-ink/40 placeholder:tracking-[0.18em] focus:outline-none focus:border-brass transition-colors"
            />
            {query && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-ink/50 hover:text-ink"
              >
                <X className="w-3.5 h-3.5" strokeWidth={1.5} />
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-[1480px] px-6 md:px-10">
          {loading ? (
            <div className="text-center py-32 text-muted-foreground text-sm">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-32">
              <p className="font-display text-3xl text-ink">
                {query ? "Nothing matches that search." : h.empty_title}
              </p>
              <p className="mt-3 text-sm text-muted-foreground">
                {query ? "Try a different word, or clear the search." : h.empty_body}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-24">
              {filtered.map((p) => (
                <Link
                  key={p.id}
                  to="/shop/$slug"
                  params={{ slug: p.slug }}
                  className="group block"
                >
                  <div className="relative aspect-[4/5] bg-walnut overflow-hidden mb-6 rounded-sm">
                    {p.images?.[0] ? (
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-ink/30 font-display text-7xl">
                        ⵘ
                      </div>
                    )}
                    {(hasTag(p, "quiet") || hasTag(p, "premium")) && (
                      <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 bg-ink/85 backdrop-blur-sm border border-brass/50 text-brass text-[9px] uppercase tracking-[0.32em] rounded-sm">
                        <Sparkle className="w-2.5 h-2.5" strokeWidth={1.5} />
                        {hasTag(p, "premium") && hasTag(p, "quiet")
                          ? "Premium · Quiet"
                          : hasTag(p, "premium")
                          ? "Premium Collection"
                          : "The Quiet Collection"}
                      </span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-display text-2xl text-ink group-hover:text-brass transition-colors duration-500">
                      {p.name}
                    </h3>
                    {p.short_description && (
                      <p className="text-xs text-muted-foreground">{p.short_description}</p>
                    )}
                    <p className="text-sm text-ink/80 pt-2">
                      {formatPrice(p.price_cents, p.currency)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </SiteShell>
  );
}
