import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/hooks/use-admin-auth";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [{ title: "Sign in — The Woods Admin" }, { name: "robots", content: "noindex" }],
  }),
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const { user, isAdmin, loading } = useAdminAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user && isAdmin) {
      navigate({ to: "/admin" });
    }
  }, [loading, user, isAdmin, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setBusy(true);

    if (mode === "signup") {
      const { error: e1 } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/admin` },
      });
      setBusy(false);
      if (e1) {
        setError(e1.message);
        return;
      }
      setInfo(
        "Account created. You can now sign in with your email and password."
      );
      return;
    }

    const { error: e2 } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (e2) {
      setError(e2.message);
      return;
    }
    navigate({ to: "/admin" });
  };

  return (
    <div className="min-h-screen flex">
      {/* Left visual */}
      <div className="hidden lg:flex relative w-1/2 bg-walnut overflow-hidden">
        <img
          src="/images/products/candle-stands-story.jpg"
          alt="Handcrafted wooden objects in the atelier"
          className="absolute inset-0 w-full h-full object-cover ken-burns"
        />
        <div className="absolute inset-0" style={{ background: "var(--gradient-overlay)" }} />
        <div className="relative z-10 flex flex-col justify-end p-12 text-cream">
          <p className="eyebrow">Atelier panel</p>
          <h1 className="mt-4 font-display text-5xl leading-[0.95]">
            The keys<br />to the <em className="text-brass">workshop.</em>
          </h1>
          <p className="mt-6 text-cream/70 max-w-sm text-sm">
            Manage products, categories, inquiries and orders from one quiet place.
          </p>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div>
            <p className="eyebrow">{mode === "signin" ? "Sign in" : "Create account"}</p>
            <h2 className="mt-3 font-display text-4xl text-ink">
              {mode === "signin" ? "Welcome back." : "Begin your access."}
            </h2>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
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
              className="w-full inline-flex justify-center items-center gap-3 px-8 py-4 bg-cream text-ink text-xs uppercase tracking-[0.28em] hover:bg-brass transition-colors duration-500 disabled:opacity-50"
            >
              {busy && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <div className="text-xs text-muted-foreground">
            {mode === "signin" ? (
              <>
                Need an account?{" "}
                <button onClick={() => setMode("signup")} className="text-brass luxe-link">
                  Create one
                </button>
              </>
            ) : (
              <>
                Already have access?{" "}
                <button onClick={() => setMode("signin")} className="text-brass luxe-link">
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
