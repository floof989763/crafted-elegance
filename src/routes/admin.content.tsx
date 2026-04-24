import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { ImageUploader } from "@/components/admin/ImageUploader";
import {
  SITE_CONTENT_DEFAULTS,
  SiteContentKey,
  fetchSiteContentOnce,
  saveSiteContent,
} from "@/hooks/use-site-content";

export const Route = createFileRoute("/admin/content")({
  component: AdminContent,
});

type Section = {
  key: SiteContentKey;
  title: string;
  description: string;
  fields: { name: string; label: string; type: "text" | "textarea" | "image" }[];
};

const SECTIONS: Section[] = [
  {
    key: "home.hero",
    title: "Home · Hero",
    description: "The big video section at the top of the homepage.",
    fields: [
      { name: "eyebrow", label: "Eyebrow", type: "text" },
      { name: "title", label: "Brand title", type: "text" },
      { name: "quote", label: "Quote", type: "textarea" },
      { name: "video_url", label: "Hero video URL (mp4) — leave blank for default", type: "text" },
      { name: "poster_image", label: "Poster image (shown before video loads)", type: "image" },
    ],
  },
  {
    key: "home.manifesto",
    title: "Home · Manifesto",
    description: "The manifesto section with the tall image.",
    fields: [
      { name: "eyebrow", label: "Eyebrow", type: "text" },
      { name: "title_html", label: "Title (use <em> for italic)", type: "textarea" },
      { name: "body_1", label: "Paragraph 1", type: "textarea" },
      { name: "body_2", label: "Paragraph 2", type: "textarea" },
      { name: "badge", label: "Image badge label", type: "text" },
      { name: "image", label: "Image", type: "image" },
      { name: "bullet_1", label: "Bullet 1", type: "text" },
      { name: "bullet_2", label: "Bullet 2", type: "text" },
      { name: "bullet_3", label: "Bullet 3", type: "text" },
    ],
  },
  {
    key: "home.collection",
    title: "Home · Collection intro",
    description: "The headline above the category cards.",
    fields: [
      { name: "eyebrow", label: "Eyebrow", type: "text" },
      { name: "title_html", label: "Title (use <em> for italic)", type: "textarea" },
      { name: "body", label: "Body", type: "textarea" },
    ],
  },
  {
    key: "home.craft",
    title: "Home · Craft",
    description: "The 'Eighty hours' section.",
    fields: [
      { name: "eyebrow", label: "Eyebrow", type: "text" },
      { name: "title_html", label: "Title (use <em> for italic)", type: "textarea" },
      { name: "body_1", label: "Paragraph 1", type: "textarea" },
      { name: "body_2", label: "Paragraph 2", type: "textarea" },
      { name: "image", label: "Image", type: "image" },
      { name: "stat_1_n", label: "Stat 1 — number", type: "text" },
      { name: "stat_1_l", label: "Stat 1 — label", type: "text" },
      { name: "stat_2_n", label: "Stat 2 — number", type: "text" },
      { name: "stat_2_l", label: "Stat 2 — label", type: "text" },
      { name: "stat_3_n", label: "Stat 3 — number", type: "text" },
      { name: "stat_3_l", label: "Stat 3 — label", type: "text" },
    ],
  },
  {
    key: "home.atelier",
    title: "Home · Atelier",
    description: "The 'A studio of two' section.",
    fields: [
      { name: "eyebrow", label: "Eyebrow", type: "text" },
      { name: "title_html", label: "Title (use <em> for italic)", type: "textarea" },
      { name: "image", label: "Image", type: "image" },
      { name: "body_1", label: "Paragraph 1", type: "textarea" },
      { name: "body_2", label: "Paragraph 2", type: "textarea" },
      { name: "body_3", label: "Paragraph 3", type: "textarea" },
    ],
  },
  {
    key: "home.correspondence",
    title: "Home · Correspondence",
    description: "The contact CTA at the bottom of the homepage.",
    fields: [
      { name: "eyebrow", label: "Eyebrow", type: "text" },
      { name: "title_html", label: "Title (use <em> for italic)", type: "textarea" },
      { name: "address_lines", label: "Address (one line per row)", type: "textarea" },
      { name: "email", label: "Email", type: "text" },
      { name: "phone", label: "Phone", type: "text" },
      { name: "appointment", label: "By appointment", type: "text" },
      { name: "cta_body", label: "CTA body", type: "textarea" },
    ],
  },
  {
    key: "about.hero",
    title: "About page · Hero",
    description: "The hero of the /about page.",
    fields: [
      { name: "eyebrow", label: "Eyebrow", type: "text" },
      { name: "title_html", label: "Title (use <em> for italic)", type: "textarea" },
      { name: "image", label: "Background image", type: "image" },
    ],
  },
  {
    key: "about.body",
    title: "About page · Body",
    description: "The narrative copy on the /about page.",
    fields: [
      { name: "p1", label: "Paragraph 1", type: "textarea" },
      { name: "quote", label: "Quote", type: "textarea" },
      { name: "p2", label: "Paragraph 2", type: "textarea" },
      { name: "p3", label: "Paragraph 3", type: "textarea" },
      { name: "image_1", label: "Image 1", type: "image" },
      { name: "image_2", label: "Image 2", type: "image" },
    ],
  },
  {
    key: "contact.info",
    title: "Contact page · Info",
    description: "Sidebar info on the /contact page.",
    fields: [
      { name: "address_lines", label: "Address (one line per row)", type: "textarea" },
      { name: "email", label: "Email", type: "text" },
      { name: "phone", label: "Phone", type: "text" },
      { name: "hours", label: "Hours", type: "textarea" },
    ],
  },
  {
    key: "site.header",
    title: "Header",
    description: "Site-wide header brand and nav labels.",
    fields: [
      { name: "brand", label: "Brand name", type: "text" },
      { name: "tagline", label: "Tagline (next to brand)", type: "text" },
      { name: "nav_collection", label: "Nav — Collection label", type: "text" },
      { name: "nav_atelier", label: "Nav — Atelier label", type: "text" },
      { name: "nav_journal", label: "Nav — Journal label", type: "text" },
      { name: "nav_contact", label: "Nav — Contact label", type: "text" },
    ],
  },
  {
    key: "site.footer",
    title: "Footer",
    description: "Site-wide footer copy & links.",
    fields: [
      { name: "title_html", label: "Headline (use <em>)", type: "textarea" },
      { name: "blurb", label: "Blurb", type: "textarea" },
      { name: "address_1", label: "Address line 1", type: "text" },
      { name: "address_2", label: "Address line 2", type: "text" },
      { name: "phone", label: "Phone", type: "text" },
      { name: "email", label: "Email", type: "text" },
      { name: "newsletter_title", label: "Newsletter title", type: "text" },
      { name: "newsletter_body", label: "Newsletter body", type: "textarea" },
      { name: "instagram_url", label: "Instagram URL", type: "text" },
      { name: "facebook_url", label: "Facebook URL", type: "text" },
    ],
  },
];

function AdminContent() {
  const [activeKey, setActiveKey] = useState<SiteContentKey>(SECTIONS[0].key);
  const [values, setValues] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const v = await fetchSiteContentOnce(activeKey);
      setValues(v as any);
      setLoading(false);
      setSavedAt(null);
    })();
  }, [activeKey]);

  const section = SECTIONS.find((s) => s.key === activeKey)!;

  const onSave = async () => {
    setSaving(true);
    try {
      await saveSiteContent(activeKey, values as any);
      setSavedAt(new Date().toLocaleTimeString());
    } catch (e: any) {
      alert(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    setValues({ ...SITE_CONTENT_DEFAULTS[activeKey] });
  };

  return (
    <div className="p-10 grid lg:grid-cols-[260px_1fr] gap-10">
      <aside className="space-y-1">
        <p className="eyebrow mb-4">Sections</p>
        {SECTIONS.map((s) => (
          <button
            key={s.key}
            onClick={() => setActiveKey(s.key)}
            className={`w-full text-left px-4 py-3 text-sm rounded-sm transition-colors ${
              activeKey === s.key
                ? "bg-walnut text-brass"
                : "text-ink/70 hover:bg-walnut hover:text-ink"
            }`}
          >
            {s.title}
          </button>
        ))}
      </aside>

      <div className="space-y-8 min-w-0">
        <header className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <p className="eyebrow">Site content</p>
            <h1 className="mt-3 font-display text-4xl text-ink">{section.title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{section.description}</p>
          </div>
          <div className="flex items-center gap-3">
            {savedAt && (
              <span className="text-xs text-muted-foreground">Saved · {savedAt}</span>
            )}
            <button
              onClick={reset}
              className="px-5 py-3 text-xs uppercase tracking-[0.28em] text-muted-foreground hover:text-ink"
            >
              Reset to default
            </button>
            <button
              onClick={onSave}
              disabled={saving || loading}
              className="inline-flex items-center gap-2 px-6 py-3 bg-cream text-ink text-xs uppercase tracking-[0.28em] hover:bg-brass transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save
            </button>
          </div>
        </header>

        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-5 h-5 animate-spin text-brass mx-auto" />
          </div>
        ) : (
          <div className="space-y-6">
            {section.fields.map((f) => (
              <label key={f.name} className="block">
                <span className="eyebrow block mb-2">{f.label}</span>
                {f.type === "text" && (
                  <input
                    value={values[f.name] ?? ""}
                    onChange={(e) =>
                      setValues({ ...values, [f.name]: e.target.value })
                    }
                    className="admin-input"
                  />
                )}
                {f.type === "textarea" && (
                  <textarea
                    value={values[f.name] ?? ""}
                    onChange={(e) =>
                      setValues({ ...values, [f.name]: e.target.value })
                    }
                    rows={4}
                    className="admin-input resize-y min-h-24"
                  />
                )}
                {f.type === "image" && (
                  <ImageUploader
                    value={values[f.name] ? [values[f.name]] : []}
                    onChange={(urls) =>
                      setValues({ ...values, [f.name]: urls[0] || "" })
                    }
                    multiple={false}
                    folder="site-content"
                  />
                )}
              </label>
            ))}
          </div>
        )}

        <style>{`
          .admin-input {
            width: 100%;
            background: transparent;
            border: 1px solid var(--color-border);
            border-radius: 2px;
            padding: 0.65rem 0.85rem;
            color: var(--color-foreground);
            font-family: var(--font-sans);
            font-size: 0.9rem;
            outline: none;
            transition: border-color 0.3s var(--ease-luxe);
          }
          .admin-input:focus { border-color: var(--color-accent); }
        `}</style>
      </div>
    </div>
  );
}