import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Package,
  ShoppingBag,
  IndianRupee,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Users,
  TrendingUp,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/format";
import { statusLabel } from "@/lib/order-status";

export const Route = createFileRoute("/admin/")({
  component: AdminOverview,
});

type OrderLite = {
  id: string;
  created_at: string;
  status: string;
  total_cents: number;
  customer_name: string | null;
  email: string;
};

type ProductLite = {
  id: string;
  name: string;
  slug: string;
  stock: number;
  low_stock_threshold: number;
  images: string[];
  is_active: boolean;
};

function AdminOverview() {
  const [orders, setOrders] = useState<OrderLite[]>([]);
  const [products, setProducts] = useState<ProductLite[]>([]);
  const [bestSellers, setBestSellers] = useState<{ name: string; qty: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [{ data: ord }, { data: prod }, { data: items }] = await Promise.all([
        supabase
          .from("orders")
          .select("id, created_at, status, total_cents, customer_name, email")
          .order("created_at", { ascending: false })
          .limit(500),
        supabase
          .from("products")
          .select("id, name, slug, stock, low_stock_threshold, images, is_active"),
        supabase.from("order_items").select("product_name, quantity").limit(2000),
      ]);
      setOrders((ord as OrderLite[]) || []);
      setProducts((prod as ProductLite[]) || []);
      const agg = new Map<string, number>();
      ((items as { product_name: string; quantity: number }[]) || []).forEach((it) => {
        agg.set(it.product_name, (agg.get(it.product_name) || 0) + it.quantity);
      });
      setBestSellers(
        Array.from(agg.entries())
          .map(([name, qty]) => ({ name, qty }))
          .sort((a, b) => b.qty - a.qty)
          .slice(0, 5),
      );
      setLoading(false);
    })();
  }, []);

  const now = Date.now();
  const DAY = 86400000;
  const recognised = orders.filter(
    (o) => !["cancelled", "returned", "awaiting_payment"].includes(o.status),
  );
  const revenue = recognised.reduce((s, o) => s + o.total_cents, 0);
  const dayRevenue = recognised
    .filter((o) => now - +new Date(o.created_at) < DAY)
    .reduce((s, o) => s + o.total_cents, 0);
  const weekRevenue = recognised
    .filter((o) => now - +new Date(o.created_at) < 7 * DAY)
    .reduce((s, o) => s + o.total_cents, 0);
  const monthRevenue = recognised
    .filter((o) => now - +new Date(o.created_at) < 30 * DAY)
    .reduce((s, o) => s + o.total_cents, 0);

  const pending = orders.filter((o) =>
    ["pending", "placed", "confirmed", "processing", "packed", "awaiting_payment"].includes(
      o.status,
    ),
  ).length;
  const inTransit = orders.filter((o) =>
    ["dispatched", "shipped", "out_for_delivery"].includes(o.status),
  ).length;
  const delivered = orders.filter((o) => o.status === "delivered").length;

  const lowStock = products
    .filter((p) => p.is_active && p.stock <= p.low_stock_threshold)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 6);

  const recent = orders.slice(0, 6);

  return (
    <div className="p-10 space-y-10">
      <header>
        <p className="eyebrow">Atelier overview</p>
        <h1 className="mt-3 font-display text-5xl text-ink">Today, in the workshop.</h1>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Tile icon={ShoppingBag} label="Total orders" value={orders.length.toString()} to="/admin/orders" />
        <Tile icon={IndianRupee} label="Revenue" value={formatPrice(revenue)} />
        <Tile icon={Clock} label="Pending" value={pending.toString()} to="/admin/orders" />
        <Tile icon={CheckCircle2} label="Delivered" value={delivered.toString()} />
      </div>

      <section className="grid sm:grid-cols-3 gap-4">
        <Period label="Today" value={formatPrice(dayRevenue)} />
        <Period label="Last 7 days" value={formatPrice(weekRevenue)} />
        <Period label="Last 30 days" value={formatPrice(monthRevenue)} />
      </section>

      <div className="grid lg:grid-cols-2 gap-6">
        <section className="border border-border rounded-sm">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h2 className="font-display text-2xl text-ink flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-brass" strokeWidth={1.4} /> Low stock
            </h2>
            <Link to="/admin/products" className="text-xs uppercase tracking-[0.28em] text-brass luxe-link">
              Manage
            </Link>
          </div>
          {loading ? (
            <div className="p-10 text-center text-sm text-muted-foreground">Loading…</div>
          ) : lowStock.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              All pieces are well-stocked.
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {lowStock.map((p) => (
                <li key={p.id} className="px-6 py-3 flex items-center gap-4">
                  <div className="w-10 h-10 bg-walnut rounded-sm overflow-hidden shrink-0">
                    {p.images?.[0] && (
                      <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-ink truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Threshold {p.low_stock_threshold}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] uppercase tracking-[0.22em] px-2 py-1 rounded-sm border ${
                      p.stock === 0
                        ? "border-destructive text-destructive"
                        : "border-brass text-brass"
                    }`}
                  >
                    {p.stock === 0 ? "Out of stock" : `${p.stock} left`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="border border-border rounded-sm">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="font-display text-2xl text-ink flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brass" strokeWidth={1.4} /> Best selling
            </h2>
          </div>
          {loading ? (
            <div className="p-10 text-center text-sm text-muted-foreground">Loading…</div>
          ) : bestSellers.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">No sales yet.</div>
          ) : (
            <ul className="divide-y divide-border">
              {bestSellers.map((b) => (
                <li key={b.name} className="px-6 py-3 flex items-center justify-between">
                  <span className="text-ink truncate pr-3">{b.name}</span>
                  <span className="text-xs text-muted-foreground shrink-0">{b.qty} sold</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="border border-border rounded-sm">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-display text-2xl text-ink flex items-center gap-2">
            <Users className="w-4 h-4 text-brass" strokeWidth={1.4} /> Recent orders
          </h2>
          <Link to="/admin/orders" className="text-xs uppercase tracking-[0.28em] text-brass luxe-link">
            View all
          </Link>
        </div>
        {loading ? (
          <div className="p-12 text-center text-muted-foreground text-sm">Loading…</div>
        ) : recent.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-sm">No orders yet.</div>
        ) : (
          <ul className="divide-y divide-border">
            {recent.map((o) => (
              <li key={o.id} className="px-6 py-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <Link
                    to="/admin/orders/$id"
                    params={{ id: o.id }}
                    className="text-ink luxe-link"
                  >
                    {o.customer_name || o.email}
                  </Link>
                  <p className="text-xs text-muted-foreground truncate mt-1">
                    #{o.id.slice(0, 8).toUpperCase()} · {statusLabel(o.status)}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-ink">{formatPrice(o.total_cents)}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(o.created_at).toLocaleDateString()}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="text-xs text-muted-foreground">In transit: {inTransit}</p>
    </div>
  );
}

function Tile({
  icon: Icon,
  label,
  value,
  to,
}: {
  icon: typeof Package;
  label: string;
  value: string;
  to?: string;
}) {
  const inner = (
    <div className="border border-border rounded-sm p-6 hover:bg-card transition-colors">
      <Icon className="w-5 h-5 text-brass" strokeWidth={1.4} />
      <p className="mt-6 text-3xl font-display text-ink truncate">{value}</p>
      <p className="mt-1 eyebrow">{label}</p>
    </div>
  );
  return to ? <Link to={to}>{inner}</Link> : inner;
}

function Period({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border rounded-sm p-6 flex items-center justify-between">
      <p className="eyebrow">{label}</p>
      <p className="font-display text-2xl text-ink">{value}</p>
    </div>
  );
}
