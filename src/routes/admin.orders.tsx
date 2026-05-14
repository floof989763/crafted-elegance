import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/format";
import { ORDER_STATUSES, statusLabel } from "@/lib/order-status";

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrdersList,
});

type OrderRow = {
  id: string;
  created_at: string;
  status: string;
  total_cents: number;
  currency: string;
  payment_method: string;
  email: string;
  customer_name: string | null;
  customer_phone: string | null;
};

function AdminOrdersList() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sort, setSort] = useState<"newest" | "oldest" | "amount">("newest");

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("orders")
        .select("id, created_at, status, total_cents, currency, payment_method, email, customer_name, customer_phone")
        .order("created_at", { ascending: false })
        .limit(500);
      setOrders((data as OrderRow[]) || []);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    let list = orders;
    if (statusFilter !== "all") list = list.filter((o) => o.status === statusFilter);
    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      list = list.filter(
        (o) =>
          o.id.toLowerCase().includes(needle) ||
          o.email.toLowerCase().includes(needle) ||
          (o.customer_name || "").toLowerCase().includes(needle) ||
          (o.customer_phone || "").toLowerCase().includes(needle),
      );
    }
    list = [...list];
    if (sort === "oldest") list.sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at));
    else if (sort === "amount") list.sort((a, b) => b.total_cents - a.total_cents);
    else list.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
    return list;
  }, [orders, q, statusFilter, sort]);

  const revenue = orders
    .filter((o) => !["cancelled", "returned", "awaiting_payment"].includes(o.status))
    .reduce((s, o) => s + o.total_cents, 0);

  return (
    <div className="p-10 space-y-8">
      <header className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <p className="eyebrow">Orders</p>
          <h1 className="mt-3 font-display text-5xl text-ink">Order management</h1>
        </div>
        <div className="flex gap-8 text-right">
          <div>
            <p className="text-3xl font-display text-ink">{orders.length}</p>
            <p className="eyebrow">Total orders</p>
          </div>
          <div>
            <p className="text-3xl font-display text-ink">{formatPrice(revenue)}</p>
            <p className="eyebrow">Recognised revenue</p>
          </div>
        </div>
      </header>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            placeholder="Search by ID, email, name, phone…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-transparent border border-border rounded-sm text-sm text-ink outline-none focus:border-brass"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-transparent border border-border rounded-sm text-sm text-ink"
        >
          <option value="all">All statuses</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
          <option value="pending">Legacy: Pending</option>
          <option value="awaiting_payment">Legacy: Awaiting payment</option>
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as any)}
          className="px-3 py-2 bg-transparent border border-border rounded-sm text-sm text-ink"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="amount">Highest amount</option>
        </select>
      </div>

      <div className="border border-border rounded-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center"><Loader2 className="w-5 h-5 mx-auto animate-spin text-brass" /></div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">No orders match.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-walnut/40">
              <tr className="text-left">
                <th className="px-4 py-3 eyebrow">Order</th>
                <th className="px-4 py-3 eyebrow">Customer</th>
                <th className="px-4 py-3 eyebrow">Date</th>
                <th className="px-4 py-3 eyebrow">Payment</th>
                <th className="px-4 py-3 eyebrow">Status</th>
                <th className="px-4 py-3 eyebrow text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((o) => (
                <tr key={o.id} className="hover:bg-walnut/30 transition-colors">
                  <td className="px-4 py-3">
                    <Link
                      to="/admin/orders/$id"
                      params={{ id: o.id }}
                      className="font-mono text-brass luxe-link"
                    >
                      #{o.id.slice(0, 8).toUpperCase()}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-ink">{o.customer_name || "—"}</div>
                    <div className="text-xs text-muted-foreground">{o.email}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(o.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground capitalize">
                    {o.payment_method === "cod" ? "Cash on delivery" : o.payment_method}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-block px-2 py-1 text-[10px] uppercase tracking-[0.2em] bg-walnut text-brass rounded-sm">
                      {statusLabel(o.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-ink">{formatPrice(o.total_cents, o.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
