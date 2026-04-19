import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Package, Tag, MessageSquare, ShoppingBag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/")({
  component: AdminOverview,
});

function AdminOverview() {
  const [stats, setStats] = useState({ products: 0, categories: 0, inquiries: 0, orders: 0 });
  const [recentInquiries, setRecentInquiries] = useState<
    { id: string; name: string; email: string; subject: string | null; created_at: string }[]
  >([]);

  useEffect(() => {
    (async () => {
      const [p, c, i, o, ri] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("categories").select("id", { count: "exact", head: true }),
        supabase.from("inquiries").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("id", { count: "exact", head: true }),
        supabase
          .from("inquiries")
          .select("id, name, email, subject, created_at")
          .order("created_at", { ascending: false })
          .limit(5),
      ]);
      setStats({
        products: p.count ?? 0,
        categories: c.count ?? 0,
        inquiries: i.count ?? 0,
        orders: o.count ?? 0,
      });
      setRecentInquiries(ri.data || []);
    })();
  }, []);

  return (
    <div className="p-10 space-y-12">
      <header>
        <p className="eyebrow">Atelier overview</p>
        <h1 className="mt-3 font-display text-5xl text-cream">Today, in the workshop.</h1>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <Stat icon={Package} label="Products" value={stats.products} to="/admin/products" />
        <Stat icon={Tag} label="Categories" value={stats.categories} to="/admin/categories" />
        <Stat icon={MessageSquare} label="Inquiries" value={stats.inquiries} to="/admin/inquiries" />
        <Stat icon={ShoppingBag} label="Orders" value={stats.orders} />
      </div>

      <section className="border border-border rounded-sm">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-display text-2xl text-cream">Recent inquiries</h2>
          <Link to="/admin/inquiries" className="text-xs uppercase tracking-[0.28em] text-brass luxe-link">
            View all
          </Link>
        </div>
        {recentInquiries.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-sm">No inquiries yet.</div>
        ) : (
          <ul className="divide-y divide-border">
            {recentInquiries.map((i) => (
              <li key={i.id} className="px-6 py-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-cream truncate">{i.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {i.subject || i.email}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground shrink-0">
                  {new Date(i.created_at).toLocaleDateString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  to,
}: {
  icon: typeof Package;
  label: string;
  value: number;
  to?: string;
}) {
  const inner = (
    <div className="border border-border rounded-sm p-6 hover:bg-card transition-colors">
      <Icon className="w-5 h-5 text-brass" strokeWidth={1.4} />
      <p className="mt-6 text-4xl font-display text-cream">{value}</p>
      <p className="mt-1 eyebrow">{label}</p>
    </div>
  );
  return to ? <Link to={to}>{inner}</Link> : inner;
}
