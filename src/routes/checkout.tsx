import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, ArrowLeft, CreditCard, Truck } from "lucide-react";
import { z } from "zod";
import { SiteShell } from "@/components/site/SiteShell";
import { useCart } from "@/hooks/use-cart";
import { useCustomerAuth } from "@/hooks/use-customer-auth";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/format";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — The Woods" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutPage,
});

const checkoutSchema = z.object({
  customer_name: z.string().trim().min(2, "Name is required").max(120),
  email: z.string().trim().email("Valid email required").max(255),
  customer_phone: z.string().trim().min(7, "Phone is required").max(20),
  address_line1: z.string().trim().min(3, "Address required").max(200),
  address_line2: z.string().trim().max(200).optional(),
  city: z.string().trim().min(2).max(80),
  state: z.string().trim().min(2).max(80),
  postal_code: z.string().trim().min(4).max(12),
  country: z.string().trim().min(2).max(80),
  notes: z.string().trim().max(500).optional(),
});

type Form = z.infer<typeof checkoutSchema>;

function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const { user } = useCustomerAuth();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "stripe">("cod");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<Form>({
    customer_name: "",
    email: user?.email ?? "",
    customer_phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "India",
    notes: "",
  });

  if (items.length === 0) {
    return (
      <SiteShell>
        <section className="pt-40 pb-32 text-center px-6">
          <h1 className="font-display text-5xl text-ink">Your cart is empty.</h1>
          <Link to="/shop" className="mt-8 inline-block text-brass luxe-link">
            Return to the collection
          </Link>
        </section>
      </SiteShell>
    );
  }

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const parsed = checkoutSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please review the form.");
      return;
    }
    setBusy(true);
    try {
      // Create order
      const orderInsert = {
        user_id: user?.id ?? null,
        email: parsed.data.email,
        customer_name: parsed.data.customer_name,
        customer_phone: parsed.data.customer_phone,
        notes: parsed.data.notes || null,
        currency: "inr",
        total_cents: subtotal,
        payment_method: paymentMethod,
        status: paymentMethod === "stripe" ? "awaiting_payment" : "pending",
        shipping_address: {
          line1: parsed.data.address_line1,
          line2: parsed.data.address_line2 || null,
          city: parsed.data.city,
          state: parsed.data.state,
          postal_code: parsed.data.postal_code,
          country: parsed.data.country,
        },
      };
      const { data: order, error: oErr } = await supabase
        .from("orders")
        .insert(orderInsert)
        .select("id")
        .single();
      if (oErr) throw oErr;

      const itemsPayload = items.map((it) => ({
        order_id: order.id,
        product_id: it.product_id,
        product_name: it.name,
        quantity: it.quantity,
        unit_price_cents: it.price_cents,
      }));
      const { error: iErr } = await supabase.from("order_items").insert(itemsPayload);
      if (iErr) throw iErr;

      await clear();

      if (paymentMethod === "stripe") {
        // Stripe is not enabled yet — order saved as awaiting_payment.
        navigate({ to: "/order-placed", search: { id: order.id, pending: 1 } });
      } else {
        navigate({ to: "/order-placed", search: { id: order.id } });
      }
    } catch (err: any) {
      setError(err?.message || "Could not place your order. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const update = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [k]: e.target.value });

  return (
    <SiteShell>
      <section className="pt-32 md:pt-40 pb-24 md:pb-32">
        <div className="mx-auto max-w-[1200px] px-6 md:px-10">
          <Link
            to="/cart"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-muted-foreground hover:text-brass transition-colors mb-10"
          >
            <ArrowLeft className="w-4 h-4" /> Back to cart
          </Link>

          <header className="mb-12">
            <p className="eyebrow">Checkout</p>
            <h1 className="mt-3 font-display text-5xl md:text-6xl text-ink">Almost yours.</h1>
          </header>

          <form onSubmit={placeOrder} className="grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-7 space-y-10">
              <fieldset className="space-y-5">
                <legend className="eyebrow mb-4">Contact</legend>
                <Field label="Full name">
                  <input className="checkout-input" value={form.customer_name} onChange={update("customer_name")} required />
                </Field>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Email">
                    <input type="email" className="checkout-input" value={form.email} onChange={update("email")} required />
                  </Field>
                  <Field label="Phone">
                    <input className="checkout-input" value={form.customer_phone} onChange={update("customer_phone")} required />
                  </Field>
                </div>
              </fieldset>

              <fieldset className="space-y-5">
                <legend className="eyebrow mb-4">Shipping address</legend>
                <Field label="Address line 1">
                  <input className="checkout-input" value={form.address_line1} onChange={update("address_line1")} required />
                </Field>
                <Field label="Address line 2 (optional)">
                  <input className="checkout-input" value={form.address_line2 || ""} onChange={update("address_line2")} />
                </Field>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="City">
                    <input className="checkout-input" value={form.city} onChange={update("city")} required />
                  </Field>
                  <Field label="State">
                    <input className="checkout-input" value={form.state} onChange={update("state")} required />
                  </Field>
                  <Field label="Postal code">
                    <input className="checkout-input" value={form.postal_code} onChange={update("postal_code")} required />
                  </Field>
                  <Field label="Country">
                    <input className="checkout-input" value={form.country} onChange={update("country")} required />
                  </Field>
                </div>
                <Field label="Order notes (optional)">
                  <textarea
                    className="checkout-input min-h-24"
                    value={form.notes || ""}
                    onChange={update("notes")}
                    maxLength={500}
                    placeholder="Gift wrapping, delivery instructions, etc."
                  />
                </Field>
              </fieldset>

              <fieldset className="space-y-3">
                <legend className="eyebrow mb-4">Payment method</legend>
                <label className={`flex items-start gap-4 p-5 border rounded-sm cursor-pointer transition-colors ${paymentMethod === "cod" ? "border-brass bg-walnut" : "border-border hover:border-brass/50"}`}>
                  <input
                    type="radio"
                    name="pay"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                    className="mt-1.5"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-ink font-medium">
                      <Truck className="w-4 h-4" /> Cash on delivery
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Pay in cash when your order arrives at the address above.
                    </p>
                  </div>
                </label>

                <label className={`flex items-start gap-4 p-5 border rounded-sm cursor-pointer transition-colors ${paymentMethod === "stripe" ? "border-brass bg-walnut" : "border-border hover:border-brass/50"}`}>
                  <input
                    type="radio"
                    name="pay"
                    value="stripe"
                    checked={paymentMethod === "stripe"}
                    onChange={() => setPaymentMethod("stripe")}
                    className="mt-1.5"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-ink font-medium">
                      <CreditCard className="w-4 h-4" /> Pay online (Card / UPI)
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Order is placed and the atelier will reach out with a secure payment link until online payments are activated.
                    </p>
                  </div>
                </label>
              </fieldset>
            </div>

            <aside className="lg:col-span-5">
              <div className="border border-border rounded-sm p-8 space-y-6 sticky top-32">
                <h2 className="font-display text-2xl text-ink">Order summary</h2>
                <ul className="space-y-4 max-h-72 overflow-auto">
                  {items.map((it) => (
                    <li key={it.product_id} className="flex gap-3 text-sm">
                      <div className="w-14 h-14 bg-walnut rounded-sm overflow-hidden shrink-0">
                        {it.image && <img src={it.image} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-ink truncate">{it.name}</p>
                        <p className="text-xs text-muted-foreground">× {it.quantity}</p>
                      </div>
                      <p className="text-ink shrink-0">
                        {formatPrice(it.price_cents * it.quantity, it.currency)}
                      </p>
                    </li>
                  ))}
                </ul>
                <div className="hairline" />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span>Quoted on dispatch</span>
                  </div>
                </div>
                <div className="flex justify-between text-lg font-display text-ink pt-2 border-t border-border">
                  <span>Total</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>

                {error && <p className="text-destructive text-xs">{error}</p>}

                <button
                  type="submit"
                  disabled={busy}
                  className="w-full inline-flex justify-center items-center gap-3 px-8 py-4 bg-ink text-cream text-xs uppercase tracking-[0.28em] hover:bg-brass transition-colors duration-500 disabled:opacity-50"
                >
                  {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                  Place order
                </button>
              </div>
            </aside>
          </form>
        </div>
      </section>

      <style>{`
        .checkout-input {
          width: 100%;
          background: transparent;
          border: 1px solid var(--color-border);
          border-radius: 2px;
          padding: 0.7rem 0.9rem;
          color: var(--color-foreground);
          font-family: var(--font-sans);
          font-size: 0.9rem;
          outline: none;
          transition: border-color 0.3s var(--ease-luxe);
        }
        .checkout-input:focus { border-color: var(--color-accent); }
      `}</style>
    </SiteShell>
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