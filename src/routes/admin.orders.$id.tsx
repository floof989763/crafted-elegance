import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/format";
import { ORDER_STATUSES, statusLabel } from "@/lib/order-status";

export const Route = createFileRoute("/admin/orders/$id")({
  component: AdminOrderDetail,
});

type Order = {
  id: string;
  created_at: string;
  updated_at: string;
  status: string;
  total_cents: number;
  currency: string;
  payment_method: string;
  email: string;
  customer_name: string | null;
  customer_phone: string | null;
  notes: string | null;
  shipping_address: any;
  tracking_number: string | null;
  courier_name: string | null;
  estimated_delivery: string | null;
  status_history: { status: string; at: string }[] | null;
};

type Item = {
  id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price_cents: number;
};

function AdminOrderDetail() {
  const { id } = Route.useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [status, setStatus] = useState("");
  const [tracking, setTracking] = useState("");
  const [courier, setCourier] = useState("");
  const [eta, setEta] = useState("");

  const load = async () => {
    setLoading(true);
    const [{ data: o }, { data: it }] = await Promise.all([
      supabase.from("orders").select("*").eq("id", id).maybeSingle(),
      supabase
        .from("order_items")
        .select("id, product_id, product_name, quantity, unit_price_cents")
        .eq("order_id", id),
    ]);
    if (o) {
      setOrder(o as Order);
      setStatus(o.status);
      setTracking(o.tracking_number || "");
      setCourier(o.courier_name || "");
      setEta(o.estimated_delivery || "");
    }
    setItems((it as Item[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  const save = async () => {
    setSaving(true);
    setMsg(null);
    const { error } = await supabase
      .from("orders")
      .update({
        status,
        tracking_number: tracking || null,
        courier_name: courier || null,
        estimated_delivery: eta || null,
      })
      .eq("id", id);
    setSaving(false);
    if (error) {
      setMsg(error.message);
    } else {
      setMsg("Saved.");
      await load();
    }
  };

  if (loading) {
    return <div className="p-20 text-center"><Loader2 className="w-6 h-6 mx-auto animate-spin text-brass" /></div>;
  }
  if (!order) {
    return <div className="p-20 text-center text-muted-foreground">Order not found.</div>;
  }

  const addr = order.shipping_address || {};
  const subtotal = items.reduce((s, i) => s + i.unit_price_cents * i.quantity, 0);

  return (
    <div className="p-10 space-y-10 max-w-[1100px]">
      <Link to="/admin/orders" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-muted-foreground hover:text-brass">
        <ArrowLeft className="w-4 h-4" /> All orders
      </Link>

      <header className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="eyebrow">Order</p>
          <h1 className="mt-2 font-display text-4xl text-ink">#{order.id.slice(0, 8).toUpperCase()}</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Placed {new Date(order.created_at).toLocaleString()}
          </p>
        </div>
        <span className="px-3 py-1 text-xs uppercase tracking-[0.24em] bg-walnut text-brass rounded-sm">
          {statusLabel(order.status)}
        </span>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        <section className="border border-border rounded-sm p-6 space-y-3">
          <h2 className="eyebrow">Customer</h2>
          <p className="text-ink">{order.customer_name || "—"}</p>
          <p className="text-sm text-muted-foreground">{order.email}</p>
          <p className="text-sm text-muted-foreground">{order.customer_phone || "—"}</p>
        </section>

        <section className="border border-border rounded-sm p-6 space-y-2">
          <h2 className="eyebrow">Shipping address</h2>
          <p className="text-sm text-ink">{addr.line1}</p>
          {addr.line2 && <p className="text-sm text-ink">{addr.line2}</p>}
          <p className="text-sm text-muted-foreground">
            {[addr.city, addr.state, addr.postal_code].filter(Boolean).join(", ")}
          </p>
          <p className="text-sm text-muted-foreground">{addr.country}</p>
        </section>

        <section className="border border-border rounded-sm p-6 space-y-2">
          <h2 className="eyebrow">Payment & notes</h2>
          <p className="text-sm text-ink capitalize">
            {order.payment_method === "cod" ? "Cash on delivery" : order.payment_method}
          </p>
          <p className="text-sm text-muted-foreground">
            {order.notes || "No order notes."}
          </p>
        </section>
      </div>

      <section className="border border-border rounded-sm">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-display text-2xl text-ink">Items</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-walnut/40 text-left">
            <tr>
              <th className="px-6 py-3 eyebrow">Product</th>
              <th className="px-6 py-3 eyebrow text-right">Qty</th>
              <th className="px-6 py-3 eyebrow text-right">Unit</th>
              <th className="px-6 py-3 eyebrow text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map((i) => (
              <tr key={i.id}>
                <td className="px-6 py-3 text-ink">{i.product_name}</td>
                <td className="px-6 py-3 text-right text-ink">× {i.quantity}</td>
                <td className="px-6 py-3 text-right text-muted-foreground">
                  {formatPrice(i.unit_price_cents, order.currency)}
                </td>
                <td className="px-6 py-3 text-right text-ink">
                  {formatPrice(i.unit_price_cents * i.quantity, order.currency)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-border">
              <td colSpan={3} className="px-6 py-3 text-right text-muted-foreground">Subtotal</td>
              <td className="px-6 py-3 text-right text-ink">{formatPrice(subtotal, order.currency)}</td>
            </tr>
            <tr>
              <td colSpan={3} className="px-6 py-3 text-right text-muted-foreground">Order total</td>
              <td className="px-6 py-3 text-right text-ink font-display text-lg">
                {formatPrice(order.total_cents, order.currency)}
              </td>
            </tr>
          </tfoot>
        </table>
      </section>

      <section className="border border-border rounded-sm p-6 space-y-5">
        <h2 className="font-display text-2xl text-ink">Status & shipping</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <label className="block">
            <span className="eyebrow block mb-2">Order status</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-transparent border border-border rounded-sm px-3 py-2 text-ink"
            >
              {ORDER_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
              {!ORDER_STATUSES.find((s) => s.value === status) && (
                <option value={status}>{statusLabel(status)} (legacy)</option>
              )}
            </select>
          </label>
          <label className="block">
            <span className="eyebrow block mb-2">Estimated delivery</span>
            <input
              type="date"
              value={eta}
              onChange={(e) => setEta(e.target.value)}
              className="w-full bg-transparent border border-border rounded-sm px-3 py-2 text-ink"
            />
          </label>
          <label className="block">
            <span className="eyebrow block mb-2">Courier / shipping partner</span>
            <input
              value={courier}
              onChange={(e) => setCourier(e.target.value)}
              placeholder="e.g. Bluedart, Delhivery, DTDC"
              className="w-full bg-transparent border border-border rounded-sm px-3 py-2 text-ink"
            />
          </label>
          <label className="block">
            <span className="eyebrow block mb-2">Tracking number</span>
            <input
              value={tracking}
              onChange={(e) => setTracking(e.target.value)}
              className="w-full bg-transparent border border-border rounded-sm px-3 py-2 text-ink"
            />
          </label>
        </div>
        {msg && <p className="text-xs text-brass">{msg}</p>}
        <button
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-3 px-6 py-3 bg-ink text-cream text-xs uppercase tracking-[0.28em] hover:bg-brass transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save changes
        </button>
      </section>

      <section className="border border-border rounded-sm p-6">
        <h2 className="font-display text-2xl text-ink mb-4">History</h2>
        <ol className="space-y-2 text-sm">
          {(order.status_history || []).map((h, i) => (
            <li key={i} className="flex justify-between">
              <span className="text-ink">{statusLabel(h.status)}</span>
              <span className="text-muted-foreground">{new Date(h.at).toLocaleString()}</span>
            </li>
          ))}
          {(!order.status_history || order.status_history.length === 0) && (
            <li className="text-muted-foreground">No history recorded.</li>
          )}
        </ol>
      </section>
    </div>
  );
}
