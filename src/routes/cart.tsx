import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { useCart } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/format";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your cart — The Woods" },
      { name: "description", content: "Review the pieces you've selected from The Woods atelier." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, subtotal, setQty, remove, loading } = useCart();

  if (loading && items.length === 0) {
    return (
      <SiteShell>
        <div className="pt-48 pb-32 text-center text-muted-foreground text-sm">Loading your cart…</div>
      </SiteShell>
    );
  }

  if (items.length === 0) {
    return (
      <SiteShell>
        <section className="pt-32 md:pt-40 pb-32">
          <div className="mx-auto max-w-2xl px-6 md:px-10 text-center space-y-6">
            <ShoppingBag className="w-10 h-10 text-brass mx-auto" strokeWidth={1.2} />
            <h1 className="font-display text-5xl text-ink">Your cart is empty.</h1>
            <p className="text-muted-foreground">
              Browse the atelier and choose a piece to bring home.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-3 px-8 py-4 bg-ink text-cream text-xs uppercase tracking-[0.28em] hover:bg-brass transition-colors duration-500"
            >
              Explore the collection <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <section className="pt-32 md:pt-40 pb-24 md:pb-32">
        <div className="mx-auto max-w-[1200px] px-6 md:px-10 space-y-12">
          <header>
            <p className="eyebrow">Selected</p>
            <h1 className="mt-3 font-display text-5xl md:text-6xl text-ink">Your cart.</h1>
          </header>

          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">
            <ul className="lg:col-span-8 divide-y divide-border border-t border-b border-border">
              {items.map((it) => (
                <li key={it.product_id} className="py-6 flex gap-5">
                  <Link
                    to="/shop/$slug"
                    params={{ slug: it.slug }}
                    className="w-24 h-24 md:w-28 md:h-28 bg-walnut overflow-hidden rounded-sm shrink-0"
                  >
                    {it.image && (
                      <img src={it.image} alt={it.name} className="w-full h-full object-cover" />
                    )}
                  </Link>
                  <div className="flex-1 min-w-0 flex flex-col justify-between gap-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <Link
                          to="/shop/$slug"
                          params={{ slug: it.slug }}
                          className="font-display text-xl text-ink luxe-link"
                        >
                          {it.name}
                        </Link>
                        <p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                          {formatPrice(it.price_cents, it.currency)} each
                        </p>
                      </div>
                      <button
                        onClick={() => remove(it.product_id)}
                        aria-label="Remove"
                        className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <div className="inline-flex items-center border border-border rounded-sm">
                        <button
                          onClick={() => setQty(it.product_id, it.quantity - 1)}
                          aria-label="Decrease"
                          className="p-2 hover:bg-walnut transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-10 text-center text-sm">{it.quantity}</span>
                        <button
                          onClick={() =>
                            setQty(it.product_id, Math.min(it.quantity + 1, Math.max(it.stock, 1)))
                          }
                          aria-label="Increase"
                          disabled={it.stock > 0 && it.quantity >= it.stock}
                          className="p-2 hover:bg-walnut transition-colors disabled:opacity-30"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-ink font-display text-xl">
                        {formatPrice(it.price_cents * it.quantity, it.currency)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <aside className="lg:col-span-4">
              <div className="border border-border rounded-sm p-8 space-y-6 sticky top-32">
                <h2 className="font-display text-2xl text-ink">Summary</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-ink">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-muted-foreground italic">Calculated at checkout</span>
                  </div>
                </div>
                <div className="hairline" />
                <div className="flex justify-between text-lg font-display text-ink">
                  <span>Total</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <Link
                  to="/checkout"
                  className="w-full inline-flex justify-center items-center gap-3 px-8 py-4 bg-ink text-cream text-xs uppercase tracking-[0.28em] hover:bg-brass transition-colors duration-500"
                >
                  Continue to checkout <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/shop"
                  className="block text-center text-xs uppercase tracking-[0.28em] text-muted-foreground hover:text-brass luxe-link"
                >
                  Continue browsing
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}