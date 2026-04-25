import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Trash2, Loader2, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSiteContent } from "@/hooks/use-site-content";

type Inquiry = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  status: string;
  created_at: string;
};

const STATUSES = ["new", "in_progress", "answered", "archived"];

export const Route = createFileRoute("/admin/inquiries")({
  component: AdminInquiries,
});

function AdminInquiries() {
  const t = useSiteContent("inquiries.page");
  const [items, setItems] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<Inquiry | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("inquiries")
      .select("*")
      .order("created_at", { ascending: false });
    setItems((data as Inquiry[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("inquiries").update({ status }).eq("id", id);
    setActive((a) => (a && a.id === id ? { ...a, status } : a));
    load();
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this inquiry?")) return;
    await supabase.from("inquiries").delete().eq("id", id);
    if (active?.id === id) setActive(null);
    load();
  };

  const filtered = filter === "all" ? items : items.filter((i) => i.status === filter);

  return (
    <div className="p-10 space-y-8">
      <header>
        <p className="eyebrow">{t.eyebrow}</p>
        <h1 className="mt-3 font-display text-5xl text-ink">{t.title}</h1>
      </header>

      <div className="flex gap-6 border-b border-border">
        {["all", ...STATUSES].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`pb-3 text-xs uppercase tracking-[0.28em] border-b-2 -mb-px transition-colors ${
              filter === s ? "text-brass border-brass" : "text-muted-foreground border-transparent hover:text-ink"
            }`}
          >
            {s.replace("_", " ")} ({s === "all" ? items.length : items.filter((i) => i.status === s).length})
          </button>
        ))}
      </div>

      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin text-brass mx-auto" />
      ) : filtered.length === 0 ? (
        <div className="border border-border rounded-sm p-16 text-center text-muted-foreground text-sm">
          {t.empty}
        </div>
      ) : (
        <div className="grid md:grid-cols-12 gap-6">
          <ul className="md:col-span-5 border border-border rounded-sm divide-y divide-border max-h-[70vh] overflow-auto">
            {filtered.map((i) => (
              <li key={i.id}>
                <button
                  onClick={() => setActive(i)}
                  className={`w-full text-left px-5 py-4 hover:bg-card transition-colors ${
                    active?.id === i.id ? "bg-card" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-ink truncate">{i.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{i.subject || i.email}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span
                      className={`uppercase tracking-[0.2em] ${
                        i.status === "new" ? "text-brass" : "text-muted-foreground"
                      }`}
                    >
                      {i.status.replace("_", " ")}
                    </span>
                    <span className="text-muted-foreground">
                      {new Date(i.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </button>
              </li>
            ))}
          </ul>

          <div className="md:col-span-7">
            {active ? (
              <div className="border border-border rounded-sm">
                <header className="p-6 border-b border-border space-y-1">
                  <h2 className="font-display text-3xl text-ink">{active.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    <a href={`mailto:${active.email}`} className="hover:text-brass">
                      {active.email}
                    </a>
                    {active.phone && <> · {active.phone}</>}
                  </p>
                  {active.subject && (
                    <p className="text-sm text-ink/70 italic">"{active.subject}"</p>
                  )}
                </header>
                <div className="p-6">
                  <p className="text-sm text-ink/80 whitespace-pre-line leading-relaxed">
                    {active.message}
                  </p>
                </div>
                <footer className="p-6 border-t border-border flex items-center justify-between gap-4 flex-wrap">
                  <select
                    value={active.status}
                    onChange={(e) => updateStatus(active.id, e.target.value)}
                    className="bg-transparent border border-border rounded-sm px-3 py-2 text-sm text-ink"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-3">
                    <a
                      href={`mailto:${active.email}?subject=Re: ${encodeURIComponent(
                        active.subject || "Your inquiry"
                      )}`}
                      className="px-5 py-2 text-xs uppercase tracking-[0.28em] bg-cream text-ink hover:bg-brass transition-colors"
                    >
                      Reply
                    </a>
                    <button
                      onClick={() => onDelete(active.id)}
                      className="p-2 text-muted-foreground hover:text-destructive"
                      aria-label="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </footer>
              </div>
            ) : (
              <div className="border border-border rounded-sm p-16 text-center text-muted-foreground text-sm">
                {t.select_prompt}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
