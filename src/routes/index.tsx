import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/format";
import heroCraftVideo from "@/assets/hero-craft.mp4.asset.json";

const HERO_VIDEO = heroCraftVideo.url;
const HERO_POSTER =
  "https://images.unsplash.com/photo-1517260911205-8a3bea4ec9bd?auto=format&fit=crop&w=2400&q=80";

const MANIFESTO_IMG =
  "https://images.unsplash.com/photo-1611036989259-26d6caf6e7e7?auto=format&fit=crop&w=1600&q=85";
const CRAFT_IMG =
  "https://images.unsplash.com/photo-1605117913953-65f44a9e2cd3?auto=format&fit=crop&w=1800&q=85";
const ATELIER_IMG =
  "https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=1800&q=85";

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

const journalEntries = [
  {
    chapter: "Chapter 01",
    tag: "Material",
    minutes: "8 min",
    title: "On the patience of fallen timber.",
    excerpt:
      "A walnut tree felled by storm in the Saharanpur foothills waits seven years before it is ready to be turned. We trace the slow arc from forest floor to finished vessel.",
    date: "March, MMXXV",
    img: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1400&q=80",
  },
  {
    chapter: "Chapter 02",
    tag: "Tools",
    minutes: "6 min",
    title: "Twelve gouges, one philosophy.",
    excerpt:
      "Our maker keeps only twelve carving tools — most older than he is. A meditation on the discipline of working with less, and why a sharp edge is half the design.",
    date: "February, MMXXV",
    img: "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=1400&q=80",
  },
  {
    chapter: "Chapter 03",
    tag: "Finish",
    minutes: "5 min",
    title: "Beeswax, linseed, and time.",
    excerpt:
      "We never lacquer. We never spray. The story of our seventeen-coat hand-rubbed finish, and why a piece of The Woods continues to deepen for decades after it leaves the atelier.",
    date: "January, MMXXV",
    img: "https://images.unsplash.com/photo-1517260911205-8a3bea4ec9bd?auto=format&fit=crop&w=1400&q=80",
  },
];

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
      { property: "og:image", content: HERO_POSTER },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    (async () => {
      const [{ data: cats }, { data: prods }] = await Promise.all([
        supabase.from("categories").select("id, slug, name").order("sort_order"),
        supabase
          .from("products")
          .select("id, slug, name, short_description, price_cents, currency, images, category_id")
          .eq("is_active", true)
          .order("created_at", { ascending: true }),
      ]);
      if (cats) setCategories(cats as Category[]);
      if (prods) setProducts(prods as Product[]);
    })();
  }, []);

  return (
    <SiteShell>
      <Hero />
      <Manifesto />
      <Collection categories={categories} products={products} />
      <Craft />
      <Atelier />
      <Journal />
      <Correspondence />
    </SiteShell>
  );
}

/* -------------------------------------------------------------------------- */
/* Hero                                                                       */
/* -------------------------------------------------------------------------- */

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

      {/* Soft warm wash so the brand wordmark sits clearly above the bowl */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 35%, color-mix(in oklab, var(--ink) 25%, transparent) 0%, color-mix(in oklab, var(--ink) 65%, transparent) 60%, color-mix(in oklab, var(--ink) 85%, transparent) 100%)",
        }}
      />
      <div className="absolute inset-0 grain" />

      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
        <p className="eyebrow reveal reveal-delay-1">A Saharanpur Atelier · Est. MMXXIV</p>
        <h1 className="mt-8 font-display text-cream text-[20vw] md:text-[12vw] leading-[0.85] reveal reveal-delay-2">
          The Woods
        </h1>
        <p className="mt-10 max-w-md mx-auto font-display italic text-cream/75 text-lg md:text-2xl leading-snug reveal reveal-delay-3">
          “We would rather make one bowl that outlives us,
          <br />
          than a hundred that do not.”
        </p>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-3 text-cream/60 reveal reveal-delay-4">
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
  return (
    <section className="relative py-32 md:py-48 overflow-hidden">
      <div className="mx-auto max-w-[1480px] px-6 md:px-10 grid md:grid-cols-12 gap-12 md:gap-20 items-center">
        <div className="md:col-span-5 md:col-start-1 relative">
          <div className="aspect-[3/4] overflow-hidden rounded-sm bg-walnut">
            <img
              src={MANIFESTO_IMG}
              alt="A single hand-turned walnut candle stand by The Woods"
              loading="lazy"
              className="w-full h-full object-cover ken-burns"
            />
          </div>
          <div className="absolute -bottom-4 left-4 md:-bottom-6 md:left-6 bg-background/90 backdrop-blur px-4 py-2 border border-border">
            <p className="text-[10px] uppercase tracking-[0.32em] text-brass">
              N° P03 · Walnut
            </p>
          </div>
        </div>

        <div className="md:col-span-6 md:col-start-7 space-y-8">
          <p className="eyebrow">— Vol. 01 · The Quiet Collection · MMXXIV</p>
          <h2 className="font-display text-5xl md:text-7xl leading-[0.95] text-cream">
            Objects shaped <em className="text-brass">slowly,</em>
            <br />
            for the room <em>that listens.</em>
          </h2>
          <div className="space-y-5 text-muted-foreground leading-relaxed max-w-xl">
            <p>
              A small atelier on the edge of Saharanpur, devoted to the slow art of turning
              heritage timber into vessels, candle stands, trays and tables — each one
              numbered, signed, and made by a single pair of hands.
            </p>
            <p>
              We work in editions of nine. Once a piece is gone, the form retires with it.
              Nothing here is restocked, nothing repeated. What remains is what was meant
              to remain.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-8 gap-y-4 pt-4">
            <Link
              to="/shop"
              className="group inline-flex items-center gap-3 px-7 py-4 bg-cream text-ink text-[11px] uppercase tracking-[0.32em] hover:bg-brass transition-colors duration-500"
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
            {[
              "Single-billet construction",
              "Hand-finished, never lacquered",
              "Numbered & signed by maker",
            ].map((line, i) => (
              <li key={i} className="space-y-1.5">
                <span className="text-[10px] uppercase tracking-[0.32em] text-brass">
                  0{i + 1}
                </span>
                <p className="text-sm text-cream/85 leading-snug">{line}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Collection (with category tabs)                                            */
/* -------------------------------------------------------------------------- */

function Collection({
  categories,
  products,
}: {
  categories: Category[];
  products: Product[];
}) {
  const [active, setActive] = useState<string>("all");

  const visible = useMemo(() => {
    if (active === "all") return products;
    const cat = categories.find((c) => c.slug === active);
    if (!cat) return products;
    return products.filter((p) => p.category_id === cat.id);
  }, [active, categories, products]);

  return (
    <section className="relative py-24 md:py-40 bg-walnut" id="collection">
      <div className="mx-auto max-w-[1480px] px-6 md:px-10">
        <div className="text-center max-w-3xl mx-auto">
          <p className="eyebrow">— The Collection</p>
          <h2 className="mt-5 font-display text-5xl md:text-7xl leading-[0.95] text-cream">
            Eight objects, conceived <em className="text-brass">in shadow.</em>
          </h2>
          <p className="mt-6 text-muted-foreground leading-relaxed">
            Bowls and vases turned on the lathe. Candle stands and trays carved by gouge.
            Tables and live-edge tops shaped from a single billet. Each piece exists in an
            edition of nine — never repeated, never restocked.
          </p>
        </div>

        {/* Category tabs */}
        <div className="mt-14 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 border-y border-border py-5">
          <CategoryTab label="All" slug="all" active={active} onClick={setActive} />
          {categories.map((c) => (
            <CategoryTab
              key={c.id}
              label={c.name}
              slug={c.slug}
              active={active}
              onClick={setActive}
            />
          ))}
        </div>

        {/* Product grid */}
        {visible.length === 0 ? (
          <div className="py-32 text-center text-sm text-muted-foreground">
            No pieces in this category yet.
          </div>
        ) : (
          <div className="mt-16 md:mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-20">
            {visible.map((p, i) => (
              <ProductCard key={p.id} p={p} index={i} categories={categories} />
            ))}
          </div>
        )}

        <div className="mt-20 text-center">
          <Link
            to="/shop"
            className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.32em] text-cream/80 luxe-link hover:text-brass"
          >
            View the full collection <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function CategoryTab({
  label,
  slug,
  active,
  onClick,
}: {
  label: string;
  slug: string;
  active: string;
  onClick: (slug: string) => void;
}) {
  const isActive = slug === active;
  return (
    <button
      onClick={() => onClick(slug)}
      className={`text-[11px] uppercase tracking-[0.32em] transition-colors duration-300 ${
        isActive ? "text-brass" : "text-cream/60 hover:text-cream"
      }`}
    >
      {label}
    </button>
  );
}

function ProductCard({
  p,
  index,
  categories,
}: {
  p: Product;
  index: number;
  categories: Category[];
}) {
  const cat = categories.find((c) => c.id === p.category_id);
  return (
    <Link
      to="/shop/$slug"
      params={{ slug: p.slug }}
      className="group block"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="aspect-[4/5] bg-ink overflow-hidden mb-5 rounded-sm">
        {p.images?.[0] ? (
          <img
            src={p.images[0]}
            alt={p.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.06]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-cream/30 font-display text-7xl">
            ⵘ
          </div>
        )}
      </div>
      <div className="space-y-1.5">
        {cat && (
          <p className="text-[10px] uppercase tracking-[0.32em] text-brass">{cat.name}</p>
        )}
        <h3 className="font-display text-xl text-cream group-hover:text-brass transition-colors duration-500">
          {p.name}
        </h3>
        <p className="text-sm text-cream/70 pt-1">
          {formatPrice(p.price_cents, p.currency)}
        </p>
      </div>
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/* Craft                                                                      */
/* -------------------------------------------------------------------------- */

function Craft() {
  return (
    <section className="relative py-32 md:py-48 overflow-hidden">
      <div className="mx-auto max-w-[1480px] px-6 md:px-10 grid md:grid-cols-12 gap-12 md:gap-20 items-center">
        <div className="md:col-span-7 md:col-start-1 order-2 md:order-1">
          <div className="aspect-[16/11] overflow-hidden rounded-sm bg-walnut">
            <img
              src={CRAFT_IMG}
              alt="Artisan hands carving dark walnut at The Woods atelier"
              loading="lazy"
              className="w-full h-full object-cover ken-burns"
            />
          </div>
        </div>

        <div className="md:col-span-5 md:col-start-8 order-1 md:order-2 space-y-8">
          <p className="eyebrow">— Craft</p>
          <h2 className="font-display text-5xl md:text-6xl leading-[0.95] text-cream">
            Eighty hours,
            <br />
            <em className="text-brass">one pair of hands.</em>
          </h2>
          <p className="text-muted-foreground leading-relaxed max-w-md">
            Each object passes through a single maker, from raw billet to final wax. There
            are no production runs — only sequences. We work in editions of nine, never
            more.
          </p>
          <p className="text-muted-foreground leading-relaxed max-w-md">
            The grain is read before it is cut. The form is found, not imposed. What
            remains is the wood at its quietest.
          </p>

          <div className="grid grid-cols-3 gap-6 pt-6 border-t border-border">
            <Stat n="09" label="per edition" />
            <Stat n="80h" label="per object" />
            <Stat n="01" label="maker" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div>
      <p className="font-display text-3xl md:text-4xl text-cream">{n}</p>
      <p className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground mt-1.5">
        {label}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Atelier — Saharanpur mention                                               */
/* -------------------------------------------------------------------------- */

function Atelier() {
  return (
    <section className="relative py-32 md:py-48 bg-walnut">
      <div className="mx-auto max-w-[1480px] px-6 md:px-10">
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
          <p className="eyebrow">— The Atelier</p>
          <h2 className="mt-5 font-display text-5xl md:text-7xl leading-[0.95] text-cream">
            A studio of <em>two,</em>
            <br />
            a forest of <em className="text-brass">memory.</em>
          </h2>
        </div>

        <div className="grid md:grid-cols-12 gap-12 md:gap-16 items-center">
          <div className="md:col-span-7">
            <div className="aspect-[4/3] overflow-hidden rounded-sm bg-ink">
              <img
                src={ATELIER_IMG}
                alt="The Woods atelier interior in Saharanpur"
                loading="lazy"
                className="w-full h-full object-cover ken-burns"
              />
            </div>
          </div>

          <div className="md:col-span-5 space-y-6 text-muted-foreground leading-relaxed">
            <p>
              <span className="text-cream">The Woods</span> is a Saharanpur-based wooden
              handicraft brand, founded in a converted granary at the edge of the old
              timber market — where India&rsquo;s finest woodcarvers have worked for
              generations.
            </p>
            <p>
              We source only from fallen and reclaimed timber — sheesham from family
              groves, walnut from the Kashmir valley, teak rescued from century-old
              havelis. Every piece carries the history of the tree it once was. Nothing is
              repeated. Nothing is hurried.
            </p>
            <p>
              Our objects are held in private collections from Kyoto to Copenhagen. They
              are not sold in stores. They are commissioned, numbered, and delivered by
              hand.
            </p>

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
/* Journal                                                                    */
/* -------------------------------------------------------------------------- */

function Journal() {
  return (
    <section className="relative py-32 md:py-48">
      <div className="mx-auto max-w-[1480px] px-6 md:px-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16 md:mb-20">
          <div className="max-w-2xl">
            <p className="eyebrow">— The Journal</p>
            <h2 className="mt-5 font-display text-5xl md:text-7xl leading-[0.95] text-cream">
              Field notes from <em className="text-brass">the atelier.</em>
            </h2>
            <p className="mt-6 text-muted-foreground leading-relaxed">
              Slow writing on timber, tools, and the rooms our objects come to live in.
              Published quarterly. Never sponsored.
            </p>
          </div>
          <Link
            to="/contact"
            className="text-[11px] uppercase tracking-[0.32em] text-cream/70 luxe-link hover:text-brass shrink-0"
          >
            Subscribe by post →
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-x-8 gap-y-16">
          {journalEntries.map((j, i) => (
            <article key={i} className="group cursor-pointer">
              <div className="aspect-[4/5] overflow-hidden rounded-sm bg-walnut mb-6">
                <img
                  src={j.img}
                  alt={j.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.06]"
                />
              </div>
              <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.32em] text-cream/50 mb-3">
                <span className="text-brass">{j.chapter}</span>
                <span>
                  {j.tag} <span className="mx-1.5">·</span> {j.minutes}
                </span>
              </div>
              <h3 className="font-display text-2xl md:text-3xl text-cream group-hover:text-brass transition-colors duration-500">
                {j.title}
              </h3>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                {j.excerpt}
              </p>
              <div className="mt-5 flex items-center justify-between text-[10px] uppercase tracking-[0.32em] text-cream/40">
                <span>{j.date}</span>
                <span className="text-brass">Read →</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Correspondence                                                             */
/* -------------------------------------------------------------------------- */

function Correspondence() {
  return (
    <section className="relative py-32 md:py-48 bg-card border-t border-border">
      <div className="mx-auto max-w-[1480px] px-6 md:px-10 grid md:grid-cols-12 gap-12 md:gap-20">
        <div className="md:col-span-5 space-y-8">
          <p className="eyebrow">— Correspondence</p>
          <h2 className="font-display text-5xl md:text-6xl leading-[0.95] text-cream">
            For commissions
            <br />
            &amp; <em className="text-brass">private viewings.</em>
          </h2>

          <div className="space-y-6 pt-4">
            <InfoBlock
              label="Atelier"
              lines={["Old Timber Market", "Saharanpur · Uttar Pradesh · India"]}
            />
            <InfoBlock label="Write" lines={["atelier@thewoods.studio"]} />
            <InfoBlock
              label="By appointment"
              lines={["Thursday — Saturday"]}
            />
          </div>
        </div>

        <div className="md:col-span-7">
          <div className="border border-border bg-background/40 backdrop-blur p-8 md:p-12">
            <p className="eyebrow mb-8">Begin a conversation</p>
            <p className="text-cream/80 leading-relaxed mb-8">
              Tell us about the room you have in mind, the tree you remember, or the
              piece you would like to commission. Every enquiry is read by the maker.
            </p>
            <Link
              to="/contact"
              className="group inline-flex items-center gap-3 px-7 py-4 bg-cream text-ink text-[11px] uppercase tracking-[0.32em] hover:bg-brass transition-colors duration-500"
            >
              Open the enquiry form
              <ArrowRight className="w-4 h-4 transition-transform duration-500 group-hover:translate-x-1" />
            </Link>
            <p className="mt-8 text-[10px] uppercase tracking-[0.32em] text-cream/40">
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
        <p key={i} className="text-cream/85">
          {l}
        </p>
      ))}
    </div>
  );
}
