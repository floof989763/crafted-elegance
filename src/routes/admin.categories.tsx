import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Category = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
};

type FormState = {
  id?: string;
  slug: string;
  name: string;
  description: string;
  image_url: string;
  sort_order: string;
};

const empty: FormState = { slug: "", name: "", description: "", image_url: "", sort_order: "0" };

export const Route = createFileRoute("/admin/categories")({
  component: AdminCategories,
});

function AdminCategories() {
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("categories").select("*").order("sort_order");
    setItems((data as Category[]) || []);
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
      name: editing.name.trim(),
      description: editing.description.trim() || null,
      image_url: editing.image_url.trim() || null,
      sort_order: Number(editing.sort_order || "0"),
    };
    if (!payload.slug || !payload.name) {
      setSaving(false);
      setError("Name and slug are required.");
      return;
    }
    const { error: e } = editing.id
      ? await supabase.from("categories").update(payload).eq("id", editing.id)
      : await supabase.from("categories").insert(payload);
    setSaving(false);
    if (e) {
      setError(e.message);
      return;
    }
    setEditing(null);
    load();
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this category? Products will be unassigned.")) return;
    await supabase.from("categories").delete().eq("id", id);
    load();
  };

  return (
    <div className="p-10 space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <p className="eyebrow">Taxonomy</p>
          <h1 className="mt-3 font-display text-5xl text-ink">Categories</h1>
        </div>
        <button
          onClick={() => setEditing({ ...empty })}
          className="inline-flex items-center gap-2 px-6 py-3 bg-cream text-ink text-xs uppercase tracking-[0.28em] hover:bg-brass transition-colors duration-500"
        >
          <Plus className="w-4 h-4" /> New category
        </button>
      </header>

      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin text-brass mx-auto" />
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {items.map((c) => (
            <div key={c.id} className="border border-border rounded-sm overflow-hidden bg-card">
              <div className="aspect-[16/9] bg-walnut">
                {c.image_url && <img src={c.image_url} alt="" className="w-full h-full object-cover" />}
              </div>
              <div className="p-6 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
                    /{c.slug} · #{c.sort_order}
                  </p>
                  <h3 className="mt-2 font-display text-2xl text-ink">{c.name}</h3>
                  {c.description && (
                    <p className="mt-2 text-sm text-muted-foreground">{c.description}</p>
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() =>
                      setEditing({
                        id: c.id,
                        slug: c.slug,
                        name: c.name,
                        description: c.description || "",
                        image_url: c.image_url || "",
                        sort_order: c.sort_order.toString(),
                      })
                    }
                    className="p-2 hover:text-brass"
                    aria-label="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(c.id)}
                    className="p-2 hover:text-destructive"
                    aria-label="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 bg-ink/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-sm w-full max-w-xl">
            <header className="px-8 py-5 border-b border-border flex items-center justify-between">
              <h2 className="font-display text-2xl text-ink">
                {editing.id ? "Edit category" : "New category"}
              </h2>
              <button onClick={() => setEditing(null)} aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </header>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <Field label="Name">
                  <input
                    value={editing.name}
                    onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                    className="admin-input"
                  />
                </Field>
                <Field label="Slug">
                  <input
                    value={editing.slug}
                    onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                    className="admin-input"
                  />
                </Field>
              </div>
              <Field label="Description">
                <textarea
                  value={editing.description}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  className="admin-input min-h-24 resize-y"
                />
              </Field>
              <Field label="Image URL">
                <input
                  value={editing.image_url}
                  onChange={(e) => setEditing({ ...editing, image_url: e.target.value })}
                  className="admin-input"
                />
              </Field>
              <Field label="Sort order">
                <input
                  type="number"
                  value={editing.sort_order}
                  onChange={(e) => setEditing({ ...editing, sort_order: e.target.value })}
                  className="admin-input w-32"
                />
              </Field>
              {error && <p className="text-destructive text-xs">{error}</p>}
            </div>
            <footer className="px-8 py-5 border-t border-border flex items-center justify-end gap-3">
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
                Save
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
