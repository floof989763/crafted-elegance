import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Award, Hammer, Leaf } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/format";

const HERO_VIDEO =
  "https://cdn.coverr.co/videos/coverr-a-carpenter-using-a-chisel-on-wood-7838/1080p.mp4";
const HERO_POSTER =
  "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=2400&q=80";

type Product = {
  id: string;
  slug: string;
  name: string;
  short_description: string | null;
  price_cents: number;
  currency: string;
  images: string[];
};

type Category = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
};

const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  trays: "https://images.unsplash.com/photo-1604147706283-d7119b5b822c?auto=format&fit=crop&w=1600&q=80",
  decor: "https://images.unsplash.com/photo-1530018352490-c6eef07fd7e3?auto=format&fit=crop&w=1600&q=80",
  furniture: "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=1600&q=80",
  accessories: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1600&q=80",
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Woods — Heirloom Wooden Handicraft" },
      {
        name: "description",
        content:
          "Hand-carved trays, decor, furniture and accessories from a small atelier of wood artisans. Each piece is signed, numbered, and built to outlive trends.",
      },
      { property: "og:title", content: "The Woods — Heirloom Wooden Handicraft" },
      {
        property: "og:description",
        content:
          "Hand-carved heirloom objects in walnut, oak and ash. Slow craft from a small atelier.",
      },
      { property: "og:image", content: HERO_POSTER },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);

  useEffect(() => {
    (async () => {
      const [{ data: cats }, { data: prods }] = await Promise.all([
        supabase.from("categories").select("*").order("sort_order"),
        supabase
          .from("products")
          .select("id, slug, name, short_description, price_cents, currency, images")
          .eq("is_active", true)
          .eq("is_featured", true)
          .limit(4),
      ]);
      if (cats) setCategories(cats);
      if (prods) setFeatured(prods as Product[]);
    })();
  }, []);

  return (
    <SiteShell>
      <Hero />
      <Marquee />
      <Story />
      <Categories categories={categories} />
      <Featured products={featured} />
      <Process />
      <ClosingCTA />
    </SiteShell>
  );
}

function Hero() {
  return (
    <section className="relative h-[100svh] min-h-[640px] w-full overflow-hidden">
      <video
        autoPlay
        muted
        loop
        playsInline
        poster={HERO_POSTER}
        className="absolute inset-0 w-full h-full object-cover ken-burns"
      >
        <source src={HERO_VIDEO} type="video/mp4" />
      </video>

      <div className="absolute inset-0" style={{ background: "var(--gradient-overlay)" }} />
      <div className="absolute inset-0 grain" />

      <div className="relative z-10 h-full flex flex-col justify-end pb-20 md:pb-28">
        <div className="mx-auto w-full max-w-[1480px] px-6 md:px-10">
          <p className="eyebrow reveal reveal-delay-1">Est. in the foothills · Small batch</p>
          <h1 className="mt-6 font-display text-cream text-[14vw] md:text-[8.5vw] leading-[0.92] reveal reveal-delay-2">
            Heirlooms<br />
            carved from <em className="text-brass">stillness.</em>
          </h1>
          <div className="mt-8 md:mt-12 flex flex-col md:flex-row md:items-end md:justify-between gap-8 reveal reveal-delay-3">
            <p className="max-w-md text-cream/70 text-sm md:text-base leading-relaxed">
              A small atelier of carvers turning fallen walnut, oak and ash into objects
              meant to be passed down. No factory. No hurry.
            </p>
            <div className="flex items-center gap-6">
              <Link
                to="/shop"
                className="group inline-flex items-center gap-3 px-8 py-4 bg-cream text-ink text-xs uppercase tracking-[0.28em] hover:bg-brass transition-colors duration-500"
              >
                Explore the collection
                <ArrowRight className="w-4 h-4 transition-transform duration-500 group-hover:translate-x-1" />
              </Link>
              <Link
                to="/about"
                className="text-xs uppercase tracking-[0.28em] text-cream/80 luxe-link hover:text-brass transition-colors"
              >
                Our story
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 right-6 md:right-10 z-10 text-[10px] uppercase tracking-[0.32em] text-cream/50 reveal reveal-delay-4">
        Vol. 01 — Winter Collection
      </div>
    </section>
  );
}

function Marquee() {
  const items = ["Walnut", "Hand-carved", "Numbered", "Oak", "Single-batch", "Ash", "Signed by maker", "Made slowly"];
  return (
    <div className="relative py-10 border-y border-border bg-walnut overflow-hidden">
      <div className="flex marquee whitespace-nowrap">
        {[...items, ...items, ...items].map((item, i) => (
          <span key={i} className="font-display italic text-3xl md:text-5xl text-cream/70 px-10">
            {item} <span className="text-brass mx-6">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function Story() {
  return (
    <section className="relative py-32 md:py-48 overflow-hidden">
      <div className="mx-auto max-w-[1480px] px-6 md:px-10 grid md:grid-cols-12 gap-12 md:gap-20 items-center">
        <div className="md:col-span-5 md:col-start-1 space-y-8">
          <p className="eyebrow">Maison · Est. 2014</p>
          <h2 className="font-display text-5xl md:text-7xl leading-[0.95] text-cream">
            We do not make<br />
            <em className="text-brass">furniture.</em><br />
            We make <em>time.</em>
          </h2>
          <p className="text-muted-foreground leading-relaxed max-w-md">
            Every piece begins as a tree we knew by name. From felling to oil finish,
            a single object passes through three hands and roughly 80 hours of work.
          </p>
          <Link
            to="/about"
            className="inline-flex items-center gap-3 text-xs uppercase tracking-[0.32em] text-brass luxe-link"
          >
            Read the manifesto <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="md:col-span-6 md:col-start-7 grid grid-cols-2 gap-4 md:gap-6">
          <div className="aspect-[3/4] overflow-hidden rounded-sm">
            <img
              src="https://images.unsplash.com/photo-1517846693594-1adfca870ed4?auto=format&fit=crop&w=1200&q=80"
              alt="Carver's hands shaping a walnut bowl"
              loading="lazy"
              className="w-full h-full object-cover ken-burns"
            />
          </div>
          <div className="aspect-[3/4] overflow-hidden rounded-sm mt-12 md:mt-20">
            <img
              src="https://images.unsplash.com/photo-1605117913953-65f44a9e2cd3?auto=format&fit=crop&w=1200&q=80"
              alt="Wood grain detail close-up"
              loading="lazy"
              className="w-full h-full object-cover ken-burns"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function Categories({ categories }: { categories: Category[] }) {
  if (!categories.length) return null;

  return (
    <section className="relative py-24 md:py-40 bg-walnut">
      <div className="mx-auto max-w-[1480px] px-6 md:px-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16 md:mb-24">
          <div>
            <p className="eyebrow">The collection</p>
            <h2 className="mt-4 font-display text-5xl md:text-7xl leading-[0.95] text-cream max-w-3xl">
              Four ways into the<br />
              <em className="text-brass">grain.</em>
            </h2>
          </div>
          <Link
            to="/shop"
            className="text-xs uppercase tracking-[0.28em] text-cream/70 luxe-link hover:text-brass transition-colors"
          >
            View all pieces →
          </Link>
        </div>

        {/* Asymmetric category grid */}
        <div className="grid grid-cols-12 gap-4 md:gap-6">
          {categories.slice(0, 4).map((cat, i) => {
            const layouts = [
              "col-span-12 md:col-span-7 aspect-[16/11]",
              "col-span-12 md:col-span-5 aspect-[4/5] md:mt-16",
              "col-span-12 md:col-span-5 aspect-[4/5] md:-mt-12",
              "col-span-12 md:col-span-7 aspect-[16/11]",
            ];
            const img = cat.image_url || CATEGORY_FALLBACK_IMAGES[cat.slug] || CATEGORY_FALLBACK_IMAGES.trays;
            return (
              <Link
                key={cat.id}
                to="/shop"
                search={{ category: cat.slug }}
                className={`group relative overflow-hidden rounded-sm bg-ink ${layouts[i % 4]}`}
              >
                <img
                  src={img}
                  alt={cat.name}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1500ms] ease-out group-hover:scale-110"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(180deg, transparent 30%, color-mix(in oklab, var(--ink) 80%, transparent) 100%)",
                  }}
                />
                <div className="absolute inset-x-0 bottom-0 p-8 md:p-10 flex items-end justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.32em] text-brass mb-3">
                      0{i + 1}
                    </p>
                    <h3 className="font-display text-4xl md:text-5xl text-cream">
                      {cat.name}
                    </h3>
                    {cat.description && (
                      <p className="mt-3 text-sm text-cream/60 max-w-xs">{cat.description}</p>
                    )}
                  </div>
                  <ArrowRight className="w-6 h-6 text-cream/80 transition-transform duration-500 group-hover:translate-x-2 group-hover:text-brass" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Featured({ products }: { products: Product[] }) {
  return (
    <section className="relative py-32 md:py-48">
      <div className="mx-auto max-w-[1480px] px-6 md:px-10">
        <div className="flex items-end justify-between mb-16">
          <div>
            <p className="eyebrow">Featured</p>
            <h2 className="mt-4 font-display text-5xl md:text-6xl text-cream">
              Quietly remarkable.
            </h2>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="border border-border rounded-sm py-32 text-center">
            <p className="text-muted-foreground text-sm">
              The first pieces are being numbered. Check back shortly.
            </p>
            <Link
              to="/admin"
              className="mt-6 inline-flex text-xs uppercase tracking-[0.28em] text-brass luxe-link"
            >
              Add the first piece
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-20">
            {products.map((p) => (
              <Link
                key={p.id}
                to="/shop/$slug"
                params={{ slug: p.slug }}
                className="group block"
              >
                <div className="aspect-[3/4] bg-walnut overflow-hidden mb-6 rounded-sm">
                  {p.images?.[0] ? (
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-cream/30 font-display text-6xl">
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
  );
}

function Process() {
  const steps = [
    { icon: Leaf, t: "Sourced", d: "Reclaimed and storm-fallen wood, traced to the grove." },
    { icon: Hammer, t: "Hand-carved", d: "Three pairs of hands, 80 hours per object, no CNC." },
    { icon: Award, t: "Signed", d: "Each piece numbered, signed, and oiled in linseed." },
  ];
  return (
    <section className="relative py-24 md:py-32 bg-card border-y border-border">
      <div className="mx-auto max-w-[1480px] px-6 md:px-10 grid md:grid-cols-3 gap-12 md:gap-20">
        {steps.map((s, i) => (
          <div key={i} className="space-y-5">
            <s.icon className="w-7 h-7 text-brass" strokeWidth={1.2} />
            <p className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
              0{i + 1} — Step
            </p>
            <h3 className="font-display text-3xl text-cream">{s.t}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">{s.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ClosingCTA() {
  return (
    <section className="relative h-[80vh] min-h-[480px] overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=2400&q=80"
        alt="Walnut workshop interior"
        className="absolute inset-0 w-full h-full object-cover ken-burns"
      />
      <div className="absolute inset-0" style={{ background: "var(--gradient-overlay)" }} />
      <div className="relative z-10 h-full flex items-center justify-center text-center px-6">
        <div className="max-w-3xl">
          <p className="eyebrow">Commissions</p>
          <h2 className="mt-6 font-display text-5xl md:text-7xl text-cream leading-[0.95]">
            Have a tree<br />
            <em className="text-brass">with a story?</em>
          </h2>
          <p className="mt-6 text-cream/70 max-w-md mx-auto">
            We accept a small number of bespoke commissions each season. Tell us yours.
          </p>
          <Link
            to="/contact"
            className="mt-10 inline-flex items-center gap-3 px-8 py-4 bg-cream text-ink text-xs uppercase tracking-[0.28em] hover:bg-brass transition-colors duration-500"
          >
            Begin a conversation <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
