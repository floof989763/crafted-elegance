import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { useSiteContent } from "@/hooks/use-site-content";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "The Atelier — The Woods" },
      {
        name: "description",
        content:
          "The Woods is a Saharanpur-based wooden handicraft atelier, turning fallen walnut, sheesham and teak into heirloom objects in editions of nine.",
      },
      { property: "og:title", content: "The Atelier — The Woods" },
      {
        property: "og:description",
        content:
          "A Saharanpur-based wooden handicraft brand. Slow craft, one pair of hands, 80 hours per object.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const hero = useSiteContent("about.hero");
  const body = useSiteContent("about.body");
  return (
    <SiteShell>
      <section className="relative h-[80vh] min-h-[520px] overflow-hidden">
        <img
          src={hero.image}
          alt="The Woods atelier interior in Saharanpur"
          className="absolute inset-0 w-full h-full object-cover ken-burns"
        />
        <div className="absolute inset-0" style={{ background: "var(--gradient-overlay)" }} />
        <div className="relative z-10 h-full flex items-end pb-16 md:pb-24">
          <div className="mx-auto max-w-[1480px] px-6 md:px-10">
            <p className="eyebrow">{hero.eyebrow}</p>
            <h1
              className="mt-6 font-display text-cream text-[14vw] md:text-[8vw] leading-[0.92] max-w-5xl [&_em]:text-brass"
              dangerouslySetInnerHTML={{ __html: hero.title_html }}
            />
          </div>
        </div>
      </section>

      <section className="py-32 md:py-48">
        <div className="mx-auto max-w-3xl px-6 md:px-10 space-y-10 font-display text-2xl md:text-3xl text-ink/90 leading-[1.4]">
          <p>{body.p1}</p>
          <p className="text-brass italic">{body.quote}</p>
          <p>{body.p2}</p>
          <p>{body.p3}</p>
        </div>
      </section>

      <section className="py-24 bg-walnut">
        <div className="mx-auto max-w-[1480px] px-6 md:px-10 grid md:grid-cols-3 gap-12 text-center">
          <Stat value="09" label="Per edition" />
          <Stat value="80h" label="Per object" />
          <Stat value="01" label="Maker, by hand" />
        </div>
      </section>

      <section className="py-32 md:py-40">
        <div className="mx-auto max-w-[1480px] px-6 md:px-10 grid md:grid-cols-2 gap-6 md:gap-10">
          <div className="aspect-[4/5] overflow-hidden rounded-sm">
            <img
              src={body.image_1}
              alt="The maker's hands carving walnut"
              className="w-full h-full object-cover ken-burns"
            />
          </div>
          <div className="aspect-[4/5] overflow-hidden rounded-sm md:mt-20">
            <img
              src={body.image_2}
              alt="Beeswax tin and linen cloth on a finished walnut bowl"
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
