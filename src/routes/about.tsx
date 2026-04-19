import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "The Atelier — The Woods" },
      {
        name: "description",
        content:
          "A small atelier of wood artisans turning fallen walnut, oak and ash into objects meant to last generations.",
      },
      { property: "og:title", content: "The Atelier — The Woods" },
      {
        property: "og:description",
        content: "Slow craft, three pairs of hands, 80 hours per object.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <SiteShell>
      <section className="relative h-[80vh] min-h-[520px] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=2400&q=80"
          alt="Workshop interior with hand tools"
          className="absolute inset-0 w-full h-full object-cover ken-burns"
        />
        <div className="absolute inset-0" style={{ background: "var(--gradient-overlay)" }} />
        <div className="relative z-10 h-full flex items-end pb-16 md:pb-24">
          <div className="mx-auto max-w-[1480px] px-6 md:px-10">
            <p className="eyebrow">The Atelier</p>
            <h1 className="mt-6 font-display text-cream text-[14vw] md:text-[8vw] leading-[0.92] max-w-5xl">
              We work in <em className="text-brass">silence,</em><br />
              and in wood.
            </h1>
          </div>
        </div>
      </section>

      <section className="py-32 md:py-48">
        <div className="mx-auto max-w-3xl px-6 md:px-10 space-y-10 font-display text-2xl md:text-3xl text-cream/90 leading-[1.4]">
          <p>
            The Woods began in 2014 in a converted barn at the edge of a beech forest.
            We were three: a carver, a turner, a finisher. We are now seven.
          </p>
          <p className="text-brass italic">
            "A piece of furniture should last longer than the person who buys it."
          </p>
          <p>
            We use only fallen wood from within a hundred miles of the workshop —
            walnut from old orchards, oak from storm-felled hedgerows, ash before the
            disease takes the rest. Every plank is dated, traced, and remembered.
          </p>
          <p>
            We do not use CNC. We do not finish in batches of more than six. The objects
            you find here have passed through the hands of every member of the atelier.
          </p>
        </div>
      </section>

      <section className="py-24 bg-walnut">
        <div className="mx-auto max-w-[1480px] px-6 md:px-10 grid md:grid-cols-3 gap-12 text-center">
          <Stat value="11" label="Years of practice" />
          <Stat value="312" label="Trees catalogued" />
          <Stat value="∞" label="Hours of patience" />
        </div>
      </section>

      <section className="py-32 md:py-40">
        <div className="mx-auto max-w-[1480px] px-6 md:px-10 grid md:grid-cols-2 gap-6 md:gap-10">
          <div className="aspect-[4/5] overflow-hidden rounded-sm">
            <img
              src="https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?auto=format&fit=crop&w=1600&q=80"
              alt="Hand chiseling wood"
              className="w-full h-full object-cover ken-burns"
            />
          </div>
          <div className="aspect-[4/5] overflow-hidden rounded-sm md:mt-20">
            <img
              src="https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=1600&q=80"
              alt="Stack of finished wood pieces"
              className="w-full h-full object-cover ken-burns"
            />
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="font-display text-7xl md:text-8xl text-brass">{value}</div>
      <div className="mt-2 eyebrow">{label}</div>
    </div>
  );
}
