import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { supabase } from "@/integrations/supabase/client";
import { useSiteContent } from "@/hooks/use-site-content";
import { formatPrice } from "@/lib/format";
import heroCraftVideo from "@/assets/hero-craft.mp4.asset.json";
import { StockIndicator } from "@/components/site/StockIndicator";

const FALLBACK_HERO_VIDEO = heroCraftVideo.url;
const FALLBACK_HERO_POSTER = "/images/products/bowl-01-walnut.jpg";

type Category = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  image_url: string | null;
};

type QuietProduct = {
  id: string;
  slug: string;
  name: string;
  short_description: string | null;
  price_cents: number;
  currency: string;
  images: string[];
  collection_tags: string[];
  stock: number;
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Woods — A Saharanpur Wooden Handicraft Atelier" },
      {
        name: "description",
        content:
          "Heirloom wooden objects — bowls, vases, trays and tables — hand-carved in editions of nine by a small Saharanpur-based atelier. Numbered, signed, made slowly.",
      },
      { property: "og:title", content: "The Woods — A Saharanpur Wooden Handicraft Atelier" },
      {
        property: "og:description",
        content:
          "Hand-carved heirloom objects in walnut, oak and ash. Editions of nine, numbered and signed by the maker.",
      },
      { property: "og:image", content: FALLBACK_HERO_POSTER },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [productCount, setProductCount] = useState(0);
  const [quietProducts, setQuietProducts] = useState<QuietProduct[]>([]);
  const quiet = useSiteContent("home.quiet");
  const maxItems = Math.max(1, Math.min(12, parseInt(String(quiet.max_items)) || 4));

  useEffect(() => {
    (async () => {
      const [{ data: cats }, { count }, { data: premium }] = await Promise.all([
        supabase
          .from("categories")
          .select("id, slug, name, description, image_url")
          .order("sort_order"),
        supabase
          .from("products")
          .select("id", { count: "exact", head: true })
          .eq("is_active", true),
        supabase
          .from("products")
          .select("id, slug, name, short_description, price_cents, currency, images, collection_tags, stock")
          .eq("is_active", true)
          .contains("collection_tags", ["premium"])
          .order("created_at", { ascending: false })
          .limit(maxItems),
      ]);
      if (cats) setCategories(cats as Category[]);
      if (typeof count === "number") setProductCount(count);
      if (premium) setQuietProducts(premium as QuietProduct[]);
    })();
  }, [maxItems]);

  return (
    <SiteShell>
      <Hero />
      <Manifesto />
      <Collection categories={categories} productCount={productCount} />
      {String((quiet as any).enabled) !== "false" && quietProducts.length > 0 && (
        <QuietCollection products={quietProducts} />
      )}
      <Craft />
      <Atelier />
      <Correspondence />
    </SiteShell>
  );
}

/* -------------------------------------------------------------------------- */
/* Hero                                                                       */
/* -------------------------------------------------------------------------- */

function Hero() {
  const c = useSiteContent("home.hero");
  const videoSrc = c.video_url?.trim() ? c.video_url : FALLBACK_HERO_VIDEO;
  const poster = c.poster_image?.trim() ? c.poster_image : FALLBACK_HERO_POSTER;

  return (
    <section className="relative h-[100svh] min-h-[640px] w-full overflow-hidden bg-cream">
      <video
        key={videoSrc}
        autoPlay
        muted
        loop
        playsInline
        poster={poster}
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src={videoSrc} type="video/mp4" />
      </video>

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, color-mix(in oklab, var(--cream) 70%, transparent) 0%, color-mix(in oklab, var(--cream) 25%, transparent) 28%, transparent 55%, color-mix(in oklab, var(--cream) 20%, transparent) 100%)",
        }}
      />
      <div className="absolute inset-0 grain pointer-events-none" />

      <div className="relative z-10 h-full flex flex-col items-center px-6 pt-[14vh] md:pt-[12vh]">
        <p className="eyebrow reveal reveal-delay-1">{c.eyebrow}</p>
        <h1 className="mt-5 font-display text-ink text-[16vw] md:text-[10vw] leading-[0.85] reveal reveal-delay-2">
          {c.title}
        </h1>
        <p
          className="mt-auto mb-24 max-w-md mx-auto font-display italic text-base md:text-xl leading-snug text-center reveal reveal-delay-3 whitespace-pre-line"
          style={{
            color: "var(--brass)",
            textShadow:
              "0 1px 2px color-mix(in oklab, var(--ink) 55%, transparent), 0 0 18px color-mix(in oklab, var(--ink) 25%, transparent)",
          }}
        >
          {c.quote}
        </p>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-3 text-ink/60 reveal reveal-delay-4">
        <span className="text-[10px] uppercase tracking-[0.32em]">Scroll</span>
        <ChevronDown className="w-4 h-4 animate-bounce" strokeWidth={1.2} />
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Manifesto                                                                  */
/* -------------------------------------------------------------------------- */

function Manifesto() {
  const c = useSiteContent("home.manifesto");
  return (
    <section className="relative py-32 md:py-48 overflow-hidden">
      <div className="mx-auto max-w-[1480px] px-6 md:px-10 grid md:grid-cols-12 gap-12 md:gap-20 items-center">
        <div className="md:col-span-5 md:col-start-1 relative scroll-reveal">
          <div className="aspect-[3/4] overflow-hidden rounded-sm bg-walnut">
            <img
              src={c.image}
              alt="The Woods"
              loading="lazy"
              className="w-full h-full object-cover ken-burns"
            />
          </div>
          <div className="absolute -bottom-4 left-4 md:-bottom-6 md:left-6 bg-background/90 backdrop-blur px-4 py-2 border border-border">
            <p className="text-[10px] uppercase tracking-[0.32em] text-brass">
              {c.badge}
            </p>
          </div>
        </div>

        <div className="md:col-span-6 md:col-start-7 space-y-8 scroll-reveal">
          <p className="eyebrow">{c.eyebrow}</p>
          <h2
            className="font-display text-5xl md:text-7xl leading-[0.95] text-ink [&_em]:text-brass"
            dangerouslySetInnerHTML={{ __html: c.title_html }}
          />
          <div className="space-y-5 text-muted-foreground leading-relaxed max-w-xl">
            <p>{c.body_1}</p>
            <p>{c.body_2}</p>
          </div>

          <div className="flex flex-wrap items-center gap-x-8 gap-y-4 pt-4">
            <Link
              to="/quiet-collection"
              className="group inline-flex items-center gap-3 px-7 py-4 bg-ink text-cream text-[11px] uppercase tracking-[0.32em] hover:bg-brass transition-colors duration-500"
            >
              View the Collection
              <ArrowRight className="w-4 h-4 transition-transform duration-500 group-hover:translate-x-1" />
            </Link>
            <Link
              to="/journal"
              className="text-[11px] uppercase tracking-[0.32em] text-brass luxe-link"
            >
              Read the Journal
            </Link>
          </div>

          <div className="hairline mt-10" />

          <ul className="grid sm:grid-cols-3 gap-6 pt-2">
            {[c.bullet_1, c.bullet_2, c.bullet_3].map((line, i) => (
              <li key={i} className="space-y-1.5">
                <span className="text-[10px] uppercase tracking-[0.32em] text-brass">
                  0{i + 1}
                </span>
                <p className="text-sm text-ink/85 leading-snug">{line}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Collection — categories only                                               */
/* -------------------------------------------------------------------------- */

function Collection({
  categories,
  productCount,
}: {
  categories: Category[];
  productCount: number;
}) {
  const c = useSiteContent("home.collection");
  const all = useSiteContent("home.collection_all");

  return (
    <section className="relative py-24 md:py-40 bg-walnut" id="collection">
      <div className="mx-auto max-w-[1480px] px-6 md:px-10">
        <div className="text-center max-w-3xl mx-auto scroll-reveal">
          <p className="eyebrow">{c.eyebrow}</p>
          <h2
            className="mt-5 font-display text-5xl md:text-7xl leading-[0.95] text-ink [&_em]:text-brass"
            dangerouslySetInnerHTML={{ __html: c.title_html }}
          />
          <p className="mt-6 text-muted-foreground leading-relaxed">{c.body}</p>
        </div>

        <div className="mt-16 md:mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 scroll-reveal">
          {/* All Products card — admin can hide / rename / re-image */}
          {String((all as any).enabled) !== "false" && (
            <CategoryCard
              to="/shop"
              search={{}}
              name={all.name}
              description={(all.description || "").replace("{count}", String(productCount))}
              image={all.image?.trim() ? all.image : categories[0]?.image_url || null}
              featured
              eyebrow={all.eyebrow}
            />
          )}

          {categories.map((cat) => (
            <CategoryCard
              key={cat.id}
              to="/shop"
              search={{ category: cat.slug }}
              name={cat.name}
              description={cat.description}
              image={cat.image_url}
            />
          ))}
        </div>

        <div className="mt-20 text-center">
          <Link
            to="/shop"
            className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.32em] text-ink/80 luxe-link hover:text-brass"
          >
            View the full collection <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function CategoryCard({
  to,
  search,
  name,
  description,
  image,
  featured = false,
  eyebrow,
}: {
  to: "/shop";
  search: { category?: string };
  name: string;
  description: string | null;
  image: string | null;
  featured?: boolean;
  eyebrow?: string;
}) {
  return (
    <Link
      to={to}
      search={search}
      className="group relative block aspect-[4/5] overflow-hidden rounded-sm bg-ink/60"
    >
      {image ? (
        <img
          src={image}
          alt={name}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.06]"
        />
      ) : (
        <div className="absolute inset-0 bg-walnut flex items-center justify-center text-ink/30 font-display text-7xl">
          ⵘ
        </div>
      )}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, transparent 35%, color-mix(in oklab, var(--ink) 70%, transparent) 100%)",
        }}
      />
      <div className="absolute inset-x-0 bottom-0 p-7 md:p-8 z-10">
        {featured && eyebrow && (
          <p className="text-[10px] uppercase tracking-[0.32em] text-brass mb-2">
            {eyebrow}
          </p>
        )}
        <h3 className="font-display text-3xl md:text-4xl text-cream leading-tight group-hover:text-brass transition-colors duration-500">
          {name}
        </h3>
        {description && (
          <p className="mt-2 text-sm text-cream/75 max-w-xs">{description}</p>
        )}
        <span className="mt-4 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.32em] text-cream/85 group-hover:text-brass transition-colors">
          Explore <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/* Craft                                                                      */
/* -------------------------------------------------------------------------- */

function Craft() {
  return CraftBody();
}

function QuietCollection({ products }: { products: QuietProduct[] }) {
  const c = useSiteContent("home.quiet");
  return (
    <section className="relative py-24 md:py-36 bg-background">
      <div className="mx-auto max-w-[1480px] px-6 md:px-10">
        <div className="text-center max-w-3xl mx-auto scroll-reveal">
          <p className="eyebrow">{c.eyebrow}</p>
          <h2
            className="mt-5 font-display text-4xl md:text-6xl leading-[0.95] text-ink [&_em]:text-brass"
            dangerouslySetInnerHTML={{ __html: c.title_html }}
          />
          <p className="mt-6 text-muted-foreground leading-relaxed">{c.body}</p>
        </div>

        <div className="mt-14 md:mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16 scroll-reveal">
          {products.map((p) => (
            <Link
              key={p.id}
              to="/shop/$slug"
              params={{ slug: p.slug }}
              className="group block"
            >
              <div className="relative aspect-[4/5] bg-walnut overflow-hidden mb-5 rounded-sm ring-1 ring-brass/10">
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
                <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 bg-ink/85 backdrop-blur-sm border border-brass/60 text-brass text-[9px] uppercase tracking-[0.32em] rounded-sm">
                  Premium Collection
                </span>
              </div>
              <h3 className="font-display text-xl text-ink group-hover:text-brass transition-colors duration-500">
                {p.name}
              </h3>
              {p.short_description && (
                <p className="mt-1 text-xs text-muted-foreground">{p.short_description}</p>
              )}
              <p className="mt-2 text-sm text-ink/80">
                {formatPrice(p.price_cents, p.currency)}
              </p>
              <StockIndicator stock={p.stock} className="mt-1" />
            </Link>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link
            to="/premium-collection"
            className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.32em] text-ink/80 luxe-link hover:text-brass"
          >
            Explore Premium Collection <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function CraftBody() {
  const c = useSiteContent("home.craft");
  return (
    <section className="relative py-32 md:py-48 overflow-hidden">
      <div className="mx-auto max-w-[1480px] px-6 md:px-10 grid md:grid-cols-12 gap-12 md:gap-20 items-center">
        <div className="md:col-span-7 md:col-start-1 order-2 md:order-1 scroll-reveal">
          <div className="aspect-[16/11] overflow-hidden rounded-sm bg-walnut">
            <img
              src={c.image}
              alt="Artisan hands at The Woods atelier"
              loading="lazy"
              className="w-full h-full object-cover ken-burns"
            />
          </div>
        </div>

        <div className="md:col-span-5 md:col-start-8 order-1 md:order-2 space-y-8 scroll-reveal">
          <p className="eyebrow">{c.eyebrow}</p>
          <h2
            className="font-display text-5xl md:text-6xl leading-[0.95] text-ink [&_em]:text-brass"
            dangerouslySetInnerHTML={{ __html: c.title_html }}
          />
          <p className="text-muted-foreground leading-relaxed max-w-md">{c.body_1}</p>
          <p className="text-muted-foreground leading-relaxed max-w-md">{c.body_2}</p>

          <div className="grid grid-cols-3 gap-6 pt-6 border-t border-border">
            <Stat n={c.stat_1_n} label={c.stat_1_l} />
            <Stat n={c.stat_2_n} label={c.stat_2_l} />
            <Stat n={c.stat_3_n} label={c.stat_3_l} />
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div>
      <p className="font-display text-3xl md:text-4xl text-ink">{n}</p>
      <p className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground mt-1.5">
        {label}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Atelier                                                                    */
/* -------------------------------------------------------------------------- */

function Atelier() {
  const c = useSiteContent("home.atelier");
  return (
    <section className="relative py-32 md:py-48 bg-walnut">
      <div className="mx-auto max-w-[1480px] px-6 md:px-10">
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24 scroll-reveal">
          <p className="eyebrow">{c.eyebrow}</p>
          <h2
            className="mt-5 font-display text-5xl md:text-7xl leading-[0.95] text-ink [&_em]:text-brass"
            dangerouslySetInnerHTML={{ __html: c.title_html }}
          />
        </div>

        <div className="grid md:grid-cols-12 gap-12 md:gap-16 items-center">
          <div className="md:col-span-7 scroll-reveal">
            <div className="aspect-[4/3] overflow-hidden rounded-sm bg-walnut">
              <img
                src={c.image}
                alt="The Woods atelier interior in Saharanpur"
                loading="lazy"
                className="w-full h-full object-cover ken-burns"
              />
            </div>
          </div>

          <div className="md:col-span-5 space-y-6 text-muted-foreground leading-relaxed scroll-reveal">
            <p>{c.body_1}</p>
            <p>{c.body_2}</p>
            <p>{c.body_3}</p>

            <Link
              to="/about"
              className="inline-flex items-center gap-3 pt-4 text-[11px] uppercase tracking-[0.32em] text-brass luxe-link"
            >
              Visit the atelier <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Correspondence                                                             */
/* -------------------------------------------------------------------------- */

function Correspondence() {
  const c = useSiteContent("home.correspondence");
  const labels = useSiteContent("admin.labels");
  const addressLines = c.address_lines.split("\n").filter(Boolean);

  return (
    <section className="relative py-32 md:py-48 bg-card border-t border-border">
      <div className="mx-auto max-w-[1480px] px-6 md:px-10 grid md:grid-cols-12 gap-12 md:gap-20">
        <div className="md:col-span-5 space-y-8 scroll-reveal">
          <p className="eyebrow">{c.eyebrow}</p>
          <h2
            className="font-display text-5xl md:text-6xl leading-[0.95] text-ink [&_em]:text-brass"
            dangerouslySetInnerHTML={{ __html: c.title_html }}
          />

          <div className="space-y-6 pt-4">
            <InfoBlock label={labels.correspondence_address_label} lines={addressLines} />
            <InfoBlock label={labels.correspondence_email_label} lines={[c.email]} />
            <InfoBlock label={labels.correspondence_phone_label} lines={[c.phone]} />
            <InfoBlock label={labels.correspondence_appointment_label} lines={[c.appointment]} />
          </div>
        </div>

        <div className="md:col-span-7 scroll-reveal">
          <div className="border border-border bg-background/40 backdrop-blur p-8 md:p-12">
            <p className="eyebrow mb-8">Begin a conversation</p>
            <p className="text-ink/80 leading-relaxed mb-8">{c.cta_body}</p>
            <Link
              to="/contact"
              className="group inline-flex items-center gap-3 px-7 py-4 bg-ink text-cream text-[11px] uppercase tracking-[0.32em] hover:bg-brass transition-colors duration-500"
            >
              Open the enquiry form
              <ArrowRight className="w-4 h-4 transition-transform duration-500 group-hover:translate-x-1" />
            </Link>
            <p className="mt-8 text-[10px] uppercase tracking-[0.32em] text-ink/45">
              Replies within three working days.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function InfoBlock({ label, lines }: { label: string; lines: string[] }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.32em] text-brass mb-2">{label}</p>
      {lines.map((l, i) => (
        <p key={i} className="text-ink/85">
          {l}
        </p>
      ))}
    </div>
  );
}