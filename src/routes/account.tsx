import { createFileRoute, useNavigate, useSearch, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, LogOut } from "lucide-react";
import { z } from "zod";
import { SiteShell } from "@/components/site/SiteShell";
import { supabase } from "@/integrations/supabase/client";
import { useCustomerAuth } from "@/hooks/use-customer-auth";

const searchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/account")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Your account — The Woods" },
      { name: "description", content: "Sign in or create an account at The Woods." },
    ],
  }),
  component: AccountPage,
});

type RecentOrder = {
  id: string;
  created_at: string;
  status: string;
  total_cents: number;
  currency: string;
  payment_method: string;
};

function AccountPage() {
  const { user, loading } = useCustomerAuth();
  const navigate = useNavigate();
  const search = useSearch({ from: "/account" });
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [orders, setOrders] = useState<RecentOrder[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("orders")
        .select("id, created_at, status, total_cents, currency, payment_method")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);
      setOrders((data as RecentOrder[]) || []);
    })();
  }, [user]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error: e1 } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/account`,
            data: { full_name: name.trim() },
          },
        });
        if (e1) throw e1;
        setInfo("Account created. Please check your email to confirm, then sign in.");
        setMode("signin");
        return;
      }
      const { error: e2 } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (e2) throw e2;
      navigate({ to: search.redirect || "/account" });
    } catch (err: any) {
      setError(err?.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <SiteShell>
        <div className="pt-48 text-center">
          <Loader2 className="w-6 h-6 mx-auto animate-spin text-brass" />
        </div>
      </SiteShell>
    );
  }

  if (user) {
    return (
      <SiteShell>
        <section className="pt-32 md:pt-40 pb-24">
          <div className="mx-auto max-w-3xl px-6 md:px-10 space-y-12">
            <header>
              <p className="eyebrow">Patron</p>
              <h1 className="mt-3 font-display text-5xl text-ink">{user.email}</h1>
            </header>

            <section className="border border-border rounded-sm">
              <div className="px-6 py-4 border-b border-border">
                <h2 className="font-display text-2xl text-ink">Your orders</h2>
              </div>
              {orders.length === 0 ? (
                <p className="p-12 text-center text-sm text-muted-foreground">
                  No orders yet —{" "}
                  <Link to="/shop" className="text-brass luxe-link">
                    explore the collection
                  </Link>
                  .
                </p>
              ) : (
                <ul className="divide-y divide-border">
                  {orders.map((o) => (
                    <li key={o.id} className="px-6 py-4 flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-ink text-sm font-medium">
                          Order #{o.id.slice(0, 8).toUpperCase()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(o.created_at).toLocaleDateString()} ·{" "}
                          {o.payment_method === "cod" ? "Cash on delivery" : "Online"}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-ink text-sm">
                          ₹ {(o.total_cents / 100).toLocaleString("en-IN")}
                        </p>
                        <p className="text-xs uppercase tracking-[0.2em] text-brass">{o.status}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <button
              onClick={async () => {
                await supabase.auth.signOut();
                navigate({ to: "/" });
              }}
              className="inline-flex items-center gap-3 px-6 py-3 border border-border text-xs uppercase tracking-[0.28em] text-ink hover:bg-walnut transition-colors"
            >
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>
        </section>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <section className="pt-32 md:pt-40 pb-24">
        <div className="mx-auto max-w-md px-6 md:px-10 space-y-10">
          <header>
            <p className="eyebrow">{mode === "signin" ? "Welcome back" : "Become a patron"}</p>
            <h1 className="mt-3 font-display text-5xl text-ink leading-[0.95]">
              {mode === "signin" ? "Sign in." : "Create your account."}
            </h1>
            <p className="mt-4 text-sm text-muted-foreground">
              {mode === "signin"
                ? "Access your orders and review the pieces you've collected."
                : "An account lets you save shipping details, track orders and leave reviews."}
            </p>
          </header>

          <form onSubmit={onSubmit} className="space-y-6">
            {mode === "signup" && (
              <label className="block">
                <span className="eyebrow block mb-2">Full name</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  maxLength={120}
                  className="w-full bg-transparent border-b border-border focus:border-brass outline-none py-3 text-ink"
                />
              </label>
            )}
            <label className="block">
              <span className="eyebrow block mb-2">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full bg-transparent border-b border-border focus:border-brass outline-none py-3 text-ink"
              />
            </label>
            <label className="block">
              <span className="eyebrow block mb-2">Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                className="w-full bg-transparent border-b border-border focus:border-brass outline-none py-3 text-ink"
              />
            </label>

            {error && <p className="text-destructive text-xs">{error}</p>}
            {info && <p className="text-brass text-xs">{info}</p>}

            <button
              type="submit"
              disabled={busy}
              className="w-full inline-flex justify-center items-center gap-3 px-8 py-4 bg-ink text-cream text-xs uppercase tracking-[0.28em] hover:bg-brass transition-colors duration-500 disabled:opacity-50"
            >
              {busy && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <p className="text-xs text-muted-foreground">
            {mode === "signin" ? (
              <>
                Need an account?{" "}
                <button onClick={() => setMode("signup")} className="text-brass luxe-link">
                  Create one
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button onClick={() => setMode("signin")} className="text-brass luxe-link">
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
      </section>
    </SiteShell>
  );
}