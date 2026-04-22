import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { z } from "zod";
import { SiteShell } from "@/components/site/SiteShell";

const search = z.object({
  id: z.string().optional(),
  pending: z.coerce.number().optional(),
});

export const Route = createFileRoute("/order-placed")({
  validateSearch: (s) => search.parse(s),
  head: () => ({
    meta: [
      { title: "Order placed — The Woods" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrderPlaced,
});

function OrderPlaced() {
  const { id, pending } = useSearch({ from: "/order-placed" });

  return (
    <SiteShell>
      <section className="pt-32 md:pt-44 pb-32">
        <div className="mx-auto max-w-2xl px-6 md:px-10 text-center space-y-8">
          <CheckCircle2 className="w-14 h-14 mx-auto text-brass" strokeWidth={1.2} />
          <div>
            <p className="eyebrow">Confirmed</p>
            <h1 className="mt-3 font-display text-5xl md:text-6xl text-ink leading-[0.95]">
              Thank you for your order.
            </h1>
          </div>
          {id && (
            <p className="text-sm text-muted-foreground">
              Order reference{" "}
              <span className="font-mono text-ink">#{id.slice(0, 8).toUpperCase()}</span>
            </p>
          )}
          <p className="text-cream text-base text-muted-foreground leading-relaxed">
            {pending
              ? "Your piece is reserved. We'll reach you at the email and phone you provided to share a secure payment link."
              : "Your piece is reserved. We will be in touch shortly to confirm dispatch and arrange cash payment on delivery."}
          </p>
          <div className="flex items-center justify-center gap-6 pt-4">
            <Link
              to="/shop"
              className="px-7 py-3 border border-border text-xs uppercase tracking-[0.28em] text-ink hover:bg-walnut transition-colors"
            >
              Continue browsing
            </Link>
            <Link
              to="/account"
              className="px-7 py-3 bg-ink text-cream text-xs uppercase tracking-[0.28em] hover:bg-brass transition-colors duration-500"
            >
              View your orders
            </Link>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}