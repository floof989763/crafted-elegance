import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";

const entries = [
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
  {
    chapter: "Chapter 04",
    tag: "Living",
    minutes: "7 min",
    title: "The room that listens.",
    excerpt:
      "Notes from collectors in Kyoto, Antwerp and Mumbai on what it means to live with a single, considered object — and the quiet it brings to a room.",
    date: "December, MMXXIV",
    img: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1400&q=80",
  },
  {
    chapter: "Chapter 05",
    tag: "Craft",
    minutes: "9 min",
    title: "Reading the grain before the cut.",
    excerpt:
      "Every billet tells the maker how it wants to be shaped. A study of figure, flame and burl — and the small ritual of standing still before the chisel meets the wood.",
    date: "November, MMXXIV",
    img: "https://images.unsplash.com/photo-1605117913953-65f44a9e2cd3?auto=format&fit=crop&w=1400&q=80",
  },
  {
    chapter: "Chapter 06",
    tag: "Editions",
    minutes: "4 min",
    title: "Why we stop at nine.",
    excerpt:
      "Each form is released in an edition of nine — then the templates are burned. A short essay on scarcity, signature, and the brass plate stamped into every base.",
    date: "October, MMXXIV",
    img: "https://images.unsplash.com/photo-1604147706283-d7119b5b822c?auto=format&fit=crop&w=1400&q=80",
  },
];

export const Route = createFileRoute("/journal")({
  head: () => ({
    meta: [
      { title: "The Journal — The Woods" },
      {
        name: "description",
        content:
          "Slow writing on timber, tools and the rooms our objects come to live in. Field notes from a Saharanpur-based wooden handicraft atelier.",
      },
      { property: "og:title", content: "The Journal — The Woods" },
      {
        property: "og:description",
        content: "Field notes from the atelier. Published quarterly. Never sponsored.",
      },
    ],
  }),
  component: JournalPage,
});

function JournalPage() {
  return (
    <SiteShell>
      <section className="pt-40 md:pt-48 pb-20 border-b border-border">
        <div className="mx-auto max-w-[1480px] px-6 md:px-10">
          <p className="eyebrow">— The Journal</p>
          <h1 className="mt-5 font-display text-6xl md:text-8xl text-cream leading-[0.92] max-w-4xl">
            Field notes from
            <br />
            <em className="text-brass">the atelier.</em>
          </h1>
          <p className="mt-8 max-w-xl text-muted-foreground leading-relaxed">
            Slow writing on timber, tools, and the rooms our objects come to live in.
            Published quarterly. Never sponsored.
          </p>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-[1480px] px-6 md:px-10 grid md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-20">
          {entries.map((j, i) => (
            <article key={i} className="group">
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
              <h2 className="font-display text-2xl md:text-3xl text-cream group-hover:text-brass transition-colors duration-500">
                {j.title}
              </h2>
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

        <div className="mt-24 text-center">
          <Link
            to="/contact"
            className="inline-flex items-center gap-3 px-7 py-4 bg-cream text-ink text-[11px] uppercase tracking-[0.32em] hover:bg-brass transition-colors duration-500"
          >
            Subscribe to the next issue <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </SiteShell>
  );
}
