import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Sparkle } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { supabase } from "@/integrations/supabase/client";
import { useSiteContent } from "@/hooks/use-site-content";
import { formatPrice } from "@/lib/format";

type Product = {
  id: string;
  slug: string;
  name: string;
  short_description: string | null;
  price_cents: number;
  currency: string;
  images: string[];
};

export const Route = createFileRoute("/premium-collection")({
  head: () => ({
    meta: [
      { title: "The Premium Collection — The Woods" },
      {
        name: "description",
        content:
          "Our most considered work — numbered, signed, and made in extremely limited editions.",
      },
      { property: "og:title", content: "The Premium Collection — The Woods" },
      {
        property: "og:description",
        content:
          "The Premium Collection — pieces that ask the most of the maker.",
      },
    ],
  }),
  component: PremiumCollectionPage,
});

function PremiumCollectionPage() {
  const c = useSiteContent("page.premium");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("products")
        .select("id, slug, name, short_description, price_cents, currency, images")
        .eq("is_active", true)
        .contains("collection_tags", ["premium"])
        .order("created_at", { ascending: false });
      setProducts((data as Product[]) || []);
      setLoading(false);
    })();
  }, []);

  return (
    <SiteShell>
      {/* Header */}
      <section className="pt-40 md:pt-48 pb-16 border-b border-border bg-card">
        <div className="mx-auto max-w-[1480px] px-6 md:px-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-muted-foreground hover:text-brass transition-colors mb-10"
          >
            <ArrowLeft className="w-4 h-4" /> Back to The Woods
          </Link>
          <p className="eyebrow flex items-center gap-2">
            <Sparkle className="w-3 h-3 text-brass" strokeWidth={1.5} />
            {c.eyebrow}
          </p>
          <h1
            className="mt-4 font-display text-6xl md:text-8xl text-ink leading-[0.92] [&_em]:text-brass max-w-4xl"
            dangerouslySetInnerHTML={{ __html: c.title_html }}
          />
          <p className="mt-8 max-w-xl text-muted-foreground leading-relaxed">{c.body}</p>
        </div>
      </section>

      {/* Grid */}
      <section className="py-20 md:py-28 bg-background">
        <div className="mx-auto max-w-[1480px] px-6 md:px-10">
          {loading ? (
            <div className="text-center py-32 text-muted-foreground text-sm">Loading…</div>
          ) : products.length === 0 ? (
            <div className="text-center py-32">
              <p className="font-display text-3xl text-ink">
                The Premium Collection is resting.
              </p>
              <p className="mt-3 text-sm text-muted-foreground">
                New premium pieces will be added soon.
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
                  <div className="relative aspect-[4/5] bg-walnut overflow-hidden mb-6 rounded-sm ring-1 ring-brass/15">
                    {p.images?.[0] ? (
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-ink/30 font-display text-7xl">
                        ⵘ
                      </div>
                    )}
                    <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-ink/90 backdrop-blur-sm border border-brass/60 text-brass text-[9px] uppercase tracking-[0.32em] rounded-sm">
                      <Sparkle className="w-2.5 h-2.5" strokeWidth={1.5} /> Premium Collection
                    </span>
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

          <div className="mt-20 text-center">
            <Link
              to="/shop"
              className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.32em] text-ink/80 luxe-link hover:text-brass"
            >
              View the full collection
            </Link>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}