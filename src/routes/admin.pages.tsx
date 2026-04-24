import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Loader2, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ImageUploader } from "@/components/admin/ImageUploader";

type Page = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  cover_image: string | null;
  content: string;
  is_published: boolean;
  show_in_nav: boolean;
  sort_order: number;
};

type FormState = {
  id?: string;
  slug: string;
  title: string;
  subtitle: string;
  cover_image: string;
  content: string;
  is_published: boolean;
  show_in_nav: boolean;
  sort_order: string;
};

const empty: FormState = {
  slug: "",
  title: "",
  subtitle: "",
  cover_image: "",
  content: "",
  is_published: true,
  show_in_nav: false,
  sort_order: "0",
};

export const Route = createFileRoute("/admin/pages")({
  component: AdminPages,
});

function AdminPages() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("custom_pages")
      .select("*")
      .order("sort_order");
    setPages((data as Page[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const onSave = async () => {
    if (!editing) return;
    setError(null);
    setSaving(true);
    const payload = {
      slug: editing.slug.trim().toLowerCase().replace(/\s+/g, "-"),
      title: editing.title.trim(),
      subtitle: editing.subtitle.trim() || null,
      cover_image: editing.cover_image.trim() || null,
      content: editing.content,
      is_published: editing.is_published,
      show_in_nav: editing.show_in_nav,
      sort_order: Number(editing.sort_order || "0"),
    };
    if (!payload.slug || !payload.title) {
      setSaving(false);
      setError("Title and slug are required.");
      return;
    }
    const { error: e } = editing.id
      ? await supabase.from("custom_pages").update(payload).eq("id", editing.id)
      : await supabase.from("custom_pages").insert(payload);
    setSaving(false);
    if (e) {
      setError(e.message);
      return;
    }
    setEditing(null);
    load();
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this page?")) return;
    await supabase.from("custom_pages").delete().eq("id", id);
    load();
  };

  return (
    <div className="p-10 space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <p className="eyebrow">Custom pages</p>
          <h1 className="mt-3 font-display text-5xl text-ink">Pages</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Create new pages at <code className="text-brass">/p/your-slug</code>. Toggle "Show in nav" to add them to the header menu.
          </p>
        </div>
        <button
          onClick={() => setEditing({ ...empty })}
          className="inline-flex items-center gap-2 px-6 py-3 bg-cream text-ink text-xs uppercase tracking-[0.28em] hover:bg-brass transition-colors duration-500"
        >
          <Plus className="w-4 h-4" /> New page
        </button>
      </header>

      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin text-brass mx-auto" />
      ) : pages.length === 0 ? (
        <div className="border border-border rounded-sm p-16 text-center">
          <p className="font-display text-2xl text-ink">No custom pages yet.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Add your first page — it will live at /p/your-slug.
          </p>
        </div>
      ) : (
        <div className="border border-border rounded-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-card text-muted-foreground text-xs uppercase tracking-[0.2em]">
              <tr>
                <th className="text-left px-6 py-4">Title</th>
                <th className="text-left px-6 py-4">Slug</th>
                <th className="text-left px-6 py-4">Status</th>
                <th className="text-left px-6 py-4">In nav</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pages.map((p) => (
                <tr key={p.id} className="hover:bg-card transition-colors">
                  <td className="px-6 py-4 text-ink">{p.title}</td>
                  <td className="px-6 py-4 text-ink/70">/p/{p.slug}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs uppercase tracking-[0.2em] ${p.is_published ? "text-brass" : "text-muted-foreground"}`}>
                      {p.is_published ? "Live" : "Draft"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-ink/70">{p.show_in_nav ? "Yes" : "—"}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {p.is_published && (
                        <Link
                          to="/p/$slug"
                          params={{ slug: p.slug }}
                          target="_blank"
                          className="p-2 hover:text-brass transition-colors"
                          aria-label="View"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      )}
                      <button
                        onClick={() =>
                          setEditing({
                            id: p.id,
                            slug: p.slug,
                            title: p.title,
                            subtitle: p.subtitle || "",
                            cover_image: p.cover_image || "",
                            content: p.content,
                            is_published: p.is_published,
                            show_in_nav: p.show_in_nav,
                            sort_order: p.sort_order.toString(),
                          })
                        }
                        className="p-2 hover:text-brass transition-colors"
                        aria-label="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(p.id)}
                        className="p-2 hover:text-destructive transition-colors"
                        aria-label="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 bg-ink/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-sm w-full max-w-3xl max-h-[90vh] overflow-auto">
            <header className="px-8 py-5 border-b border-border flex items-center justify-between sticky top-0 bg-card z-10">
              <h2 className="font-display text-2xl text-ink">
                {editing.id ? "Edit page" : "New page"}
              </h2>
              <button onClick={() => setEditing(null)} aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </header>
            <div className="p-8 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Field label="Title">
                  <input
                    value={editing.title}
                    onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                    className="admin-input"
                  />
                </Field>
                <Field label="Slug (url)">
                  <input
                    value={editing.slug}
                    onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                    className="admin-input"
                    placeholder="our-story"
                  />
                </Field>
              </div>
              <Field label="Subtitle / eyebrow (optional)">
                <input
                  value={editing.subtitle}
                  onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })}
                  className="admin-input"
                />
              </Field>
              <Field label="Cover image (optional)">
                <ImageUploader
                  value={editing.cover_image ? [editing.cover_image] : []}
                  onChange={(urls) =>
                    setEditing({ ...editing, cover_image: urls[0] || "" })
                  }
                  multiple={false}
                  folder="pages"
                />
              </Field>
              <Field label="Content (markdown — # heading, ## subheading, blank line for paragraphs, ![](image-url) for images)">
                <textarea
                  value={editing.content}
                  onChange={(e) => setEditing({ ...editing, content: e.target.value })}
                  className="admin-input min-h-64 resize-y font-mono text-sm"
                />
              </Field>
              <div className="grid md:grid-cols-3 gap-6 items-end">
                <Field label="Sort order">
                  <input
                    type="number"
                    value={editing.sort_order}
                    onChange={(e) =>
                      setEditing({ ...editing, sort_order: e.target.value })
                    }
                    className="admin-input w-32"
                  />
                </Field>
                <label className="flex items-center gap-3 text-sm text-ink py-3">
                  <input
                    type="checkbox"
                    checked={editing.is_published}
                    onChange={(e) =>
                      setEditing({ ...editing, is_published: e.target.checked })
                    }
                  />
                  Published
                </label>
                <label className="flex items-center gap-3 text-sm text-ink py-3">
                  <input
                    type="checkbox"
                    checked={editing.show_in_nav}
                    onChange={(e) =>
                      setEditing({ ...editing, show_in_nav: e.target.checked })
                    }
                  />
                  Show in main nav
                </label>
              </div>
              {error && <p className="text-destructive text-xs">{error}</p>}
            </div>
            <footer className="px-8 py-5 border-t border-border flex items-center justify-end gap-3 sticky bottom-0 bg-card">
              <button
                onClick={() => setEditing(null)}
                className="px-6 py-3 text-xs uppercase tracking-[0.28em] text-muted-foreground hover:text-ink"
              >
                Cancel
              </button>
              <button
                onClick={onSave}
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-3 bg-cream text-ink text-xs uppercase tracking-[0.28em] hover:bg-brass transition-colors duration-500 disabled:opacity-50"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Save page
              </button>
            </footer>
          </div>
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
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="eyebrow block mb-2">{label}</span>
      {children}
    </label>
  );
}