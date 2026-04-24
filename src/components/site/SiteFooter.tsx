import { Link } from "@tanstack/react-router";
import { Instagram, Facebook } from "lucide-react";
import { useSiteContent } from "@/hooks/use-site-content";

export function SiteFooter() {
  const f = useSiteContent("site.footer");
  return (
    <footer className="relative bg-walnut text-ink/80 pt-24 pb-10 overflow-hidden grain border-t border-border">
      <div className="mx-auto max-w-[1480px] px-6 md:px-10">
        <div className="grid md:grid-cols-12 gap-12 md:gap-8">
          <div className="md:col-span-5 space-y-6">
            <h3
              className="font-display text-4xl md:text-5xl text-ink leading-[1.05] [&_em]:text-brass"
              dangerouslySetInnerHTML={{ __html: f.title_html }}
            />
            <p className="text-sm leading-relaxed max-w-md text-ink/65">{f.blurb}</p>
            <div className="text-sm text-ink/65 space-y-1 pt-2">
              <p>{f.address_1}</p>
              <p>{f.address_2}</p>
              <p><a href={`tel:${f.phone.replace(/\s+/g, "")}`} className="hover:text-brass transition-colors">{f.phone}</a></p>
              <p><a href={`mailto:${f.email}`} className="hover:text-brass transition-colors">{f.email}</a></p>
            </div>
          </div>

          <div className="md:col-span-2 space-y-4">
            <p className="eyebrow">Collection</p>
            <ul className="space-y-3 text-sm">
              <li><Link to="/shop" className="hover:text-brass transition-colors">All pieces</Link></li>
              <li><Link to="/shop" search={{ category: "centerpieces" }} className="hover:text-brass transition-colors">Centerpieces</Link></li>
              <li><Link to="/shop" search={{ category: "bowls" }} className="hover:text-brass transition-colors">Bowls</Link></li>
              <li><Link to="/shop" search={{ category: "tables" }} className="hover:text-brass transition-colors">Tables</Link></li>
            </ul>
          </div>

          <div className="md:col-span-2 space-y-4">
            <p className="eyebrow">House</p>
            <ul className="space-y-3 text-sm">
              <li><Link to="/about" className="hover:text-brass transition-colors">Atelier</Link></li>
              <li><Link to="/journal" className="hover:text-brass transition-colors">Journal</Link></li>
              <li><Link to="/contact" className="hover:text-brass transition-colors">Contact</Link></li>
              <li><Link to="/admin" className="hover:text-brass transition-colors">Admin</Link></li>
            </ul>
          </div>

          <div className="md:col-span-3 space-y-4">
            <p className="eyebrow">{f.newsletter_title}</p>
            <p className="text-sm text-ink/65">{f.newsletter_body}</p>
            <form className="flex border-b border-ink/20 pb-2">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 bg-transparent text-sm placeholder:text-ink/40 focus:outline-none text-ink"
              />
              <button type="submit" className="text-xs uppercase tracking-[0.28em] text-brass hover:text-ink transition-colors">
                Join
              </button>
            </form>
          </div>
        </div>

        <div className="hairline mt-20 mb-8" />

        <div className="flex flex-col md:flex-row gap-6 md:items-center md:justify-between text-xs text-ink/50 uppercase tracking-[0.28em]">
          <p>© {new Date().getFullYear()} The Woods. All work signed by hand.</p>
          <div className="flex items-center gap-6">
            <a href={f.instagram_url} target="_blank" rel="noreferrer" aria-label="Instagram" className="hover:text-brass transition-colors"><Instagram className="w-4 h-4" /></a>
            <a href={f.facebook_url} target="_blank" rel="noreferrer" aria-label="Facebook" className="hover:text-brass transition-colors"><Facebook className="w-4 h-4" /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
