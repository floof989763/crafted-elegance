import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { supabase } from "@/integrations/supabase/client";

type Page = {
  slug: string;
  title: string;
  subtitle: string | null;
  cover_image: string | null;
  content: string;
};

export const Route = createFileRoute("/p/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug.replace(/-/g, " ")} — The Woods` },
    ],
  }),
  component: CustomPage,
  notFoundComponent: () => (
    <SiteShell>
      <section className="pt-40 pb-32 text-center px-6">
        <p className="eyebrow">404</p>
        <h1 className="mt-4 font-display text-6xl text-ink">Page not found.</h1>
        <Link
          to="/"
          className="mt-10 inline-block text-xs uppercase tracking-[0.28em] text-brass luxe-link"
        >
          Return home
        </Link>
      </section>
    </SiteShell>
  ),
});

/**
 * Render plain markdown-ish text:
 * - blank line = paragraph break
 * - lines starting with "# " become h2
 * - "## " become h3
 * - lines starting with "![](url)" become image blocks
 */
function renderContent(raw: string) {
  const blocks = raw.split(/\n\s*\n/);
  return blocks.map((block, i) => {
    const trimmed = block.trim();
    const imgMatch = trimmed.match(/^!\[[^\]]*\]\(([^)]+)\)$/);
    if (imgMatch) {
      return (
        <div key={i} className="my-12 aspect-[16/10] overflow-hidden rounded-sm bg-walnut">
          <img src={imgMatch[1]} alt="" className="w-full h-full object-cover" />
        </div>
      );
    }
    if (trimmed.startsWith("# ")) {
      return (
        <h2 key={i} className="font-display text-4xl md:text-5xl text-ink mt-16 mb-6">
          {trimmed.slice(2)}
        </h2>
      );
    }
    if (trimmed.startsWith("## ")) {
      return (
        <h3 key={i} className="font-display text-2xl md:text-3xl text-ink mt-10 mb-4">
          {trimmed.slice(3)}
        </h3>
      );
    }
    return (
      <p key={i} className="text-ink/80 leading-relaxed text-base md:text-lg whitespace-pre-line">
        {trimmed}
      </p>
    );
  });
}

function CustomPage() {
  const { slug } = Route.useParams();
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("custom_pages")
        .select("slug, title, subtitle, cover_image, content")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();
      setPage((data as Page) || null);
      setLoading(false);
    })();
  }, [slug]);

  if (loading) {
    return (
      <SiteShell>
        <div className="min-h-[70vh] flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-brass" />
        </div>
      </SiteShell>
    );
  }

  if (!page) {
    throw notFound();
  }

  return (
    <SiteShell>
      {page.cover_image ? (
        <section className="relative h-[60vh] min-h-[420px] overflow-hidden">
          <img
            src={page.cover_image}
            alt={page.title}
            className="absolute inset-0 w-full h-full object-cover ken-burns"
          />
          <div className="absolute inset-0" style={{ background: "var(--gradient-overlay)" }} />
          <div className="relative z-10 h-full flex items-end pb-12 md:pb-20">
            <div className="mx-auto max-w-[1480px] px-6 md:px-10 w-full">
              {page.subtitle && <p className="eyebrow">{page.subtitle}</p>}
              <h1 className="mt-4 font-display text-cream text-6xl md:text-8xl leading-[0.92] max-w-4xl">
                {page.title}
              </h1>
            </div>
          </div>
        </section>
      ) : (
        <section className="pt-40 md:pt-48 pb-12">
          <div className="mx-auto max-w-[1480px] px-6 md:px-10">
            {page.subtitle && <p className="eyebrow">{page.subtitle}</p>}
            <h1 className="mt-4 font-display text-6xl md:text-8xl text-ink leading-[0.92] max-w-4xl">
              {page.title}
            </h1>
          </div>
        </section>
      )}

      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-3xl px-6 md:px-10 space-y-6">
          {renderContent(page.content)}
        </div>
      </section>
    </SiteShell>
  );
}