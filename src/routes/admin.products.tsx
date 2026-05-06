import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Loader2, Sparkle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/format";
import { ImageUploader } from "@/components/admin/ImageUploader";

type Category = { id: string; name: string; slug: string };
type Product = {
  id: string;
  slug: string;
  name: string;
  short_description: string | null;
  description: string | null;
  price_cents: number;
  currency: string;
  images: string[];
  materials: string | null;
  dimensions: string | null;
  stock: number;
  collection_tags: string[];
  is_featured: boolean;
  is_premium: boolean;
  is_active: boolean;
  category_id: string | null;
};

type FormState = {
  id?: string;
  slug: string;
  name: string;
  short_description: string;
  description: string;
  price: string;
  images: string[];
  materials: string;
  dimensions: string;
  stock: string;
  collection_tags: string[];
  is_active: boolean;
  category_id: string;
};

const QUIET_TAG = "quiet";
const PREMIUM_TAG = "premium";

function hasCollectionTag(product: Pick<Product, "collection_tags">, tag: string) {
  return product.collection_tags?.includes(tag) ?? false;
}

function setCollectionTag(tags: string[], tag: string, enabled: boolean) {
  const next = new Set(tags.filter(Boolean));
  if (enabled) next.add(tag);
  else next.delete(tag);
  return Array.from(next);
}

const empty: FormState = {
  slug: "",
  name: "",
  short_description: "",
  description: "",
  price: "",
  images: [],
  materials: "",
  dimensions: "",
  stock: "0",
  collection_tags: [],
  is_active: true,
  category_id: "",
};

export const Route = createFileRoute("/admin/products")({
  component: AdminProducts,
});

function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "quiet" | "premium" | "both" | "none" | "hidden">("all");

  const load = async () => {
    setLoading(true);
    const [{ data: prods }, { data: cats }] = await Promise.all([
      supabase.from("products").select("*").order("created_at", { ascending: false }),
      supabase.from("categories").select("id, name, slug").order("sort_order"),
    ]);
    setProducts((prods as Product[]) || []);
    setCategories((cats as Category[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const startNew = () => {
    setError(null);
    setEditing({ ...empty });
  };

  const startEdit = (p: Product) => {
    setError(null);
    setEditing({
      id: p.id,
      slug: p.slug,
      name: p.name,
      short_description: p.short_description || "",
      description: p.description || "",
      price: (p.price_cents / 100).toString(),
      images: p.images || [],
      materials: p.materials || "",
      dimensions: p.dimensions || "",
      stock: p.stock.toString(),
      collection_tags: p.collection_tags || [],
      is_active: p.is_active,
      category_id: p.category_id || "",
    });
  };

  const onSave = async () => {
    if (!editing) return;
    setError(null);
    setSaving(true);

    const payload = {
      slug: editing.slug.trim().toLowerCase().replace(/\s+/g, "-"),
      name: editing.name.trim(),
      short_description: editing.short_description.trim() || null,
      description: editing.description.trim() || null,
      price_cents: Math.round(Number(editing.price || "0") * 100),
      images: editing.images.map((s) => s.trim()).filter(Boolean),
      materials: editing.materials.trim() || null,
      dimensions: editing.dimensions.trim() || null,
      stock: Number(editing.stock || "0"),
      collection_tags: editing.collection_tags,
      is_featured: editing.collection_tags.includes(QUIET_TAG),
      is_premium: editing.collection_tags.includes(PREMIUM_TAG),
      is_active: editing.is_active,
      category_id: editing.category_id || null,
    };

    if (!payload.slug || !payload.name || !Number.isFinite(payload.price_cents)) {
      setSaving(false);
      setError("Name, slug and a valid price are required.");
      return;
    }

    const { error: e } = editing.id
      ? await supabase.from("products").update(payload).eq("id", editing.id)
      : await supabase.from("products").insert(payload);

    setSaving(false);
    if (e) {
      setError(e.message);
      return;
    }
    setEditing(null);
    load();
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this piece?")) return;
    await supabase.from("products").delete().eq("id", id);
    load();
  };

  const toggleQuietTag = async (p: Product) => {
    const collection_tags = setCollectionTag(
      p.collection_tags || [],
      QUIET_TAG,
      !hasCollectionTag(p, QUIET_TAG),
    );
    await supabase
      .from("products")
      .update({ collection_tags, is_featured: collection_tags.includes(QUIET_TAG) })
      .eq("id", p.id);
    load();
  };

  const togglePremiumTag = async (p: Product) => {
    const collection_tags = setCollectionTag(
      p.collection_tags || [],
      PREMIUM_TAG,
      !hasCollectionTag(p, PREMIUM_TAG),
    );
    await supabase
      .from("products")
      .update({ collection_tags, is_premium: collection_tags.includes(PREMIUM_TAG) })
      .eq("id", p.id);
    load();
  };

  const visible = products.filter((p) => {
    if (filter === "hidden") return !p.is_active;
    if (!p.is_active) return filter === "all";
    if (filter === "quiet") return hasCollectionTag(p, QUIET_TAG);
    if (filter === "premium") return hasCollectionTag(p, PREMIUM_TAG);
    if (filter === "both") return hasCollectionTag(p, QUIET_TAG) && hasCollectionTag(p, PREMIUM_TAG);
    if (filter === "none") return !hasCollectionTag(p, QUIET_TAG) && !hasCollectionTag(p, PREMIUM_TAG);
    return true;
  });

  const counts = {
    all: products.length,
    quiet: products.filter((p) => hasCollectionTag(p, QUIET_TAG) && p.is_active).length,
    premium: products.filter((p) => hasCollectionTag(p, PREMIUM_TAG) && p.is_active).length,
    both: products.filter((p) => hasCollectionTag(p, QUIET_TAG) && hasCollectionTag(p, PREMIUM_TAG) && p.is_active).length,
    none: products.filter((p) => !hasCollectionTag(p, QUIET_TAG) && !hasCollectionTag(p, PREMIUM_TAG) && p.is_active).length,
    hidden: products.filter((p) => !p.is_active).length,
  };

  return (
    <div className="p-10 space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <p className="eyebrow">Catalogue</p>
          <h1 className="mt-3 font-display text-5xl text-ink">Products</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Tag pieces with <span className="text-brass">Quiet</span> or{" "}
            <span className="text-brass">Premium</span> to control where they appear.
          </p>
        </div>
        <button
          onClick={startNew}
          className="inline-flex items-center gap-2 px-6 py-3 bg-cream text-ink text-xs uppercase tracking-[0.28em] hover:bg-brass transition-colors duration-500"
        >
          <Plus className="w-4 h-4" /> New piece
        </button>
      </header>

      <div className="flex flex-wrap gap-2">
        {(["all", "quiet", "premium", "both", "none", "hidden"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-[10px] uppercase tracking-[0.28em] border rounded-sm transition-colors ${
              filter === f
                ? "border-brass text-brass bg-brass/5"
                : "border-border text-muted-foreground hover:text-ink"
            }`}
          >
            {f === "all"
              ? "All"
              : f === "quiet"
              ? "Quiet"
              : f === "premium"
              ? "Premium"
              : f === "both"
              ? "Both"
              : f === "none"
              ? "Untagged"
              : "Hidden"}
            <span className="ml-2 opacity-60">{counts[f]}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-5 h-5 animate-spin text-brass mx-auto" />
        </div>
      ) : visible.length === 0 ? (
        <div className="border border-border rounded-sm p-16 text-center">
          <p className="font-display text-2xl text-ink">
            {filter === "all" ? "No products yet." : "Nothing in this view."}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {filter === "all"
              ? "Add your first piece to begin the collection."
              : "Try a different filter, or mark a piece as Premium to populate the Quiet Collection."}
          </p>
        </div>
      ) : (
        <div className="border border-border rounded-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-card text-muted-foreground text-xs uppercase tracking-[0.2em]">
              <tr>
                <th className="text-left px-6 py-4">Piece</th>
                <th className="text-left px-6 py-4">Category</th>
                <th className="text-left px-6 py-4">Price</th>
                <th className="text-left px-6 py-4">Stock</th>
                <th className="text-left px-6 py-4">Status</th>
                <th className="text-left px-6 py-4">Tags</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {visible.map((p) => {
                const cat = categories.find((c) => c.id === p.category_id);
                return (
                  <tr key={p.id} className="hover:bg-card transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-walnut rounded-sm overflow-hidden shrink-0">
                          {p.images?.[0] && (
                            <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div>
                          <p className="text-ink">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{p.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-ink/70">{cat?.name || "—"}</td>
                    <td className="px-6 py-4 text-ink/70">
                      {formatPrice(p.price_cents, p.currency)}
                    </td>
                    <td className="px-6 py-4 text-ink/70">{p.stock}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs uppercase tracking-[0.2em] ${
                          p.is_active ? "text-brass" : "text-muted-foreground"
                        }`}
                      >
                        {p.is_active ? "Live" : "Hidden"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          onClick={() => togglePremium(p)}
                          title={p.is_featured ? "Remove from Quiet Collection" : "Add to Quiet Collection"}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 border text-[10px] uppercase tracking-[0.22em] rounded-sm transition-colors ${
                            p.is_featured
                              ? "border-brass text-brass bg-brass/5"
                              : "border-border text-muted-foreground hover:text-brass hover:border-brass/50"
                          }`}
                        >
                          <Sparkle className="w-3 h-3" strokeWidth={1.5} />
                          Quiet
                        </button>
                        <button
                          onClick={() => togglePremiumTag(p)}
                          title={p.is_premium ? "Remove from Premium Collection" : "Add to Premium Collection"}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 border text-[10px] uppercase tracking-[0.22em] rounded-sm transition-colors ${
                            p.is_premium
                              ? "border-brass text-brass bg-brass/5"
                              : "border-border text-muted-foreground hover:text-brass hover:border-brass/50"
                          }`}
                        >
                          Premium
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => startEdit(p)}
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
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 bg-ink/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-sm w-full max-w-3xl max-h-[90vh] overflow-auto">
            <header className="px-8 py-5 border-b border-border flex items-center justify-between sticky top-0 bg-card z-10">
              <h2 className="font-display text-2xl text-ink">
                {editing.id ? "Edit piece" : "New piece"}
              </h2>
              <button onClick={() => setEditing(null)} aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </header>
            <div className="p-8 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Field label="Name">
                  <input
                    value={editing.name}
                    onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                    className="admin-input"
                  />
                </Field>
                <Field label="Slug (url)">
                  <input
                    value={editing.slug}
                    onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                    className="admin-input"
                    placeholder="walnut-bowl"
                  />
                </Field>
                <Field label="Category">
                  <select
                    value={editing.category_id}
                    onChange={(e) => setEditing({ ...editing, category_id: e.target.value })}
                    className="admin-input"
                  >
                    <option value="">— None —</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Price (₹ INR)">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editing.price}
                    onChange={(e) => setEditing({ ...editing, price: e.target.value })}
                    className="admin-input"
                  />
                </Field>
              </div>

              <Field label="Short description (one line)">
                <input
                  value={editing.short_description}
                  onChange={(e) => setEditing({ ...editing, short_description: e.target.value })}
                  className="admin-input"
                />
              </Field>

              <Field label="Full description">
                <textarea
                  value={editing.description}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  className="admin-input min-h-32 resize-y"
                />
              </Field>

              <Field label="Photos">
                <ImageUploader
                  value={editing.images}
                  onChange={(images) => setEditing({ ...editing, images })}
                  folder="products"
                />
              </Field>

              <div className="grid md:grid-cols-3 gap-6">
                <Field label="Materials">
                  <input
                    value={editing.materials}
                    onChange={(e) => setEditing({ ...editing, materials: e.target.value })}
                    className="admin-input"
                  />
                </Field>
                <Field label="Dimensions">
                  <input
                    value={editing.dimensions}
                    onChange={(e) => setEditing({ ...editing, dimensions: e.target.value })}
                    className="admin-input"
                  />
                </Field>
                <Field label="Stock">
                  <input
                    type="number"
                    min="0"
                    value={editing.stock}
                    onChange={(e) => setEditing({ ...editing, stock: e.target.value })}
                    className="admin-input"
                  />
                </Field>
              </div>

              <div className="flex gap-8 pt-2">
                <label className="flex items-center gap-3 text-sm text-ink">
                  <input
                    type="checkbox"
                    checked={editing.is_active}
                    onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })}
                  />
                  Active
                </label>
                <label className="flex items-center gap-3 text-sm text-ink">
                  <input
                    type="checkbox"
                    checked={editing.is_featured}
                    onChange={(e) => setEditing({ ...editing, is_featured: e.target.checked })}
                  />
                  Quiet Collection
                </label>
                <label className="flex items-center gap-3 text-sm text-ink">
                  <input
                    type="checkbox"
                    checked={editing.is_premium}
                    onChange={(e) => setEditing({ ...editing, is_premium: e.target.checked })}
                  />
                  Premium Collection
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
                Save piece
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
