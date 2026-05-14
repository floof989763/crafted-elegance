import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, Check } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { supabase } from "@/integrations/supabase/client";
import { useCustomerAuth } from "@/hooks/use-customer-auth";
import { formatPrice } from "@/lib/format";
import { TRACK_STEPS, statusLabel, trackingIndex } from "@/lib/order-status";

export const Route = createFileRoute("/account/orders/$id")({
  head: () => ({ meta: [{ title: "Your order — The Woods" }, { name: "robots", content: "noindex" }] }),
  component: CustomerOrderDetail,
});

type Order = {
  id: string;
  created_at: string;
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
  product_name: string;
  quantity: number;
  unit_price_cents: number;
};

function CustomerOrderDetail() {
  const { id } = Route.useParams();
  const { user, loading: authLoading } = useCustomerAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate({ to: "/account", search: { redirect: `/account/orders/${id}` } });
      return;
    }
    (async () => {
      const [{ data: o }, { data: it }] = await Promise.all([
        supabase.from("orders").select("*").eq("id", id).maybeSingle(),
        supabase
          .from("order_items")
          .select("id, product_name, quantity, unit_price_cents")
          .eq("order_id", id),
      ]);
      setOrder((o as Order) || null);
      setItems((it as Item[]) || []);
      setLoading(false);
    })();
  }, [id, user, authLoading, navigate]);

  if (loading || authLoading) {
    return <SiteShell><div className="pt-48 text-center"><Loader2 className="w-6 h-6 mx-auto animate-spin text-brass" /></div></SiteShell>;
  }
  if (!order) {
    return (
      <SiteShell>
        <section className="pt-40 pb-32 text-center px-6">
          <h1 className="font-display text-4xl text-ink">Order not found.</h1>
          <Link to="/account" className="mt-8 inline-block text-brass luxe-link">Return to your account</Link>
        </section>
      </SiteShell>
    );
  }

  const addr = order.shipping_address || {};
  const idx = trackingIndex(order.status);
  const cancelled = order.status === "cancelled" || order.status === "returned";

  return (
    <SiteShell>
      <section className="pt-32 md:pt-40 pb-24">
        <div className="mx-auto max-w-3xl px-6 md:px-10 space-y-12">
          <Link to="/account" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-muted-foreground hover:text-brass">
            <ArrowLeft className="w-4 h-4" /> Your account
          </Link>

          <header>
            <p className="eyebrow">Order #{order.id.slice(0, 8).toUpperCase()}</p>
            <h1 className="mt-3 font-display text-5xl text-ink">{statusLabel(order.status)}</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Placed {new Date(order.created_at).toLocaleDateString()} · {order.payment_method === "cod" ? "Cash on delivery" : order.payment_method}
            </p>
          </header>

          {!cancelled && (
            <section>
              <h2 className="eyebrow mb-6">Tracking</h2>
              <ol className="space-y-3">
                {TRACK_STEPS.map((step, i) => {
                  const reached = i <= idx && idx >= 0;
                  return (
                    <li key={step} className="flex items-center gap-4">
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center border ${reached ? "bg-brass border-brass text-cream" : "border-border text-muted-foreground"}`}>
                        {reached ? <Check className="w-4 h-4" /> : <span className="text-[10px]">{i + 1}</span>}
                      </span>
                      <span className={reached ? "text-ink" : "text-muted-foreground"}>
                        {statusLabel(step)}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </section>
          )}

          {(order.tracking_number || order.courier_name || order.estimated_delivery) && (
            <section className="border border-border rounded-sm p-6 space-y-2">
              <h2 className="eyebrow">Shipping details</h2>
              {order.courier_name && <p className="text-sm text-ink">Courier: <span className="text-muted-foreground">{order.courier_name}</span></p>}
              {order.tracking_number && <p className="text-sm text-ink">Tracking: <span className="font-mono text-brass">{order.tracking_number}</span></p>}
              {order.estimated_delivery && <p className="text-sm text-ink">Estimated delivery: <span className="text-muted-foreground">{new Date(order.estimated_delivery).toLocaleDateString()}</span></p>}
            </section>
          )}

          <section className="border border-border rounded-sm">
            <div className="px-6 py-4 border-b border-border"><h2 className="font-display text-2xl text-ink">Items</h2></div>
            <ul className="divide-y divide-border">
              {items.map((i) => (
                <li key={i.id} className="px-6 py-4 flex justify-between text-sm">
                  <span className="text-ink">{i.product_name} <span className="text-muted-foreground">× {i.quantity}</span></span>
                  <span className="text-ink">{formatPrice(i.unit_price_cents * i.quantity, order.currency)}</span>
                </li>
              ))}
            </ul>
            <div className="px-6 py-4 border-t border-border flex justify-between text-ink font-display text-lg">
              <span>Total</span>
              <span>{formatPrice(order.total_cents, order.currency)}</span>
            </div>
          </section>

          <section className="grid md:grid-cols-2 gap-6">
            <div className="border border-border rounded-sm p-6 text-sm space-y-1">
              <h3 className="eyebrow mb-2">Shipping to</h3>
              <p className="text-ink">{order.customer_name}</p>
              <p className="text-muted-foreground">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}</p>
              <p className="text-muted-foreground">{[addr.city, addr.state, addr.postal_code].filter(Boolean).join(", ")}</p>
              <p className="text-muted-foreground">{addr.country}</p>
            </div>
            <div className="border border-border rounded-sm p-6 text-sm space-y-1">
              <h3 className="eyebrow mb-2">Contact</h3>
              <p className="text-ink">{order.email}</p>
              <p className="text-muted-foreground">{order.customer_phone || "—"}</p>
            </div>
          </section>
        </div>
      </section>
    </SiteShell>
  );
}
