import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { SiteShell } from "@/components/site/SiteShell";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/format";

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
};

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
  component: ShopPage,
});

function ShopPage() {
  const { category } = Route.useSearch();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

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
        .select("id, slug, name, short_description, price_cents, currency, images, category_id")
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

  return (
    <SiteShell>
      <section className="pt-40 md:pt-48 pb-16 border-b border-border">
        <div className="mx-auto max-w-[1480px] px-6 md:px-10">
          <p className="eyebrow">The Collection</p>
          <h1 className="mt-4 font-display text-6xl md:text-8xl text-cream leading-[0.92]">
            Every piece,<br />
            <em className="text-brass">numbered.</em>
          </h1>
        </div>
      </section>

      <section className="py-10 border-b border-border sticky top-20 md:top-24 bg-background/85 backdrop-blur-xl z-30">
        <div className="mx-auto max-w-[1480px] px-6 md:px-10 flex flex-wrap gap-x-8 gap-y-4">
          <Link
            to="/shop"
            search={{}}
            className={`text-xs uppercase tracking-[0.28em] luxe-link transition-colors ${
              !category ? "text-brass" : "text-cream/70 hover:text-cream"
            }`}
          >
            All
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              to="/shop"
              search={{ category: c.slug }}
              className={`text-xs uppercase tracking-[0.28em] luxe-link transition-colors ${
                category === c.slug ? "text-brass" : "text-cream/70 hover:text-cream"
              }`}
            >
              {c.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-[1480px] px-6 md:px-10">
          {loading ? (
            <div className="text-center py-32 text-muted-foreground text-sm">Loading…</div>
          ) : products.length === 0 ? (
            <div className="text-center py-32">
              <p className="font-display text-3xl text-cream">Nothing here yet.</p>
              <p className="mt-3 text-sm text-muted-foreground">
                The atelier is preparing the next pieces.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-24">
              {products.map((p) => (
                <Link
                  key={p.id}
                  to="/shop/$slug"
                  params={{ slug: p.slug }}
                  className="group block"
                >
                  <div className="aspect-[4/5] bg-walnut overflow-hidden mb-6 rounded-sm">
                    {p.images?.[0] ? (
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-cream/30 font-display text-7xl">
                        ⵘ
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-display text-2xl text-cream group-hover:text-brass transition-colors duration-500">
                      {p.name}
                    </h3>
                    {p.short_description && (
                      <p className="text-xs text-muted-foreground">{p.short_description}</p>
                    )}
                    <p className="text-sm text-cream/80 pt-2">
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
