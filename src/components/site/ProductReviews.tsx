import { useEffect, useState } from "react";
import { Star, Loader2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useCustomerAuth } from "@/hooks/use-customer-auth";

type Review = {
  id: string;
  reviewer_name: string;
  rating: number;
  title: string | null;
  comment: string;
  created_at: string;
  is_approved: boolean;
  user_id: string;
};

export function ProductReviews({ productId }: { productId: string }) {
  const { user, loading: authLoading } = useCustomerAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [myReview, setMyReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const [{ data: approved }, mine] = await Promise.all([
      supabase
        .from("reviews")
        .select("id, reviewer_name, rating, title, comment, created_at, is_approved, user_id")
        .eq("product_id", productId)
        .eq("is_approved", true)
        .order("created_at", { ascending: false }),
      user
        ? supabase
            .from("reviews")
            .select("id, reviewer_name, rating, title, comment, created_at, is_approved, user_id")
            .eq("product_id", productId)
            .eq("user_id", user.id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
    ]);
    setReviews((approved as Review[]) || []);
    setMyReview((mine.data as Review | null) || null);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, user]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError(null);
    setInfo(null);
    if (comment.trim().length < 5) {
      setError("Please share at least a few words.");
      return;
    }
    setBusy(true);
    const payload = {
      product_id: productId,
      user_id: user.id,
      reviewer_name: (name.trim() || user.email?.split("@")[0] || "Patron").slice(0, 120),
      rating,
      title: title.trim() || null,
      comment: comment.trim(),
      is_approved: false,
    };
    const { error: e1 } = await supabase.from("reviews").insert(payload);
    setBusy(false);
    if (e1) {
      setError(e1.message);
      return;
    }
    setInfo("Thank you. Your review will appear once approved by the atelier.");
    setShowForm(false);
    setName("");
    setTitle("");
    setComment("");
    setRating(5);
    load();
  };

  const avg =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;

  return (
    <section className="mt-24 md:mt-32">
      <div className="mx-auto max-w-[1200px] px-6 md:px-10">
        <header className="flex flex-wrap items-end justify-between gap-6 mb-10">
          <div>
            <p className="eyebrow">Patron reviews</p>
            <h2 className="mt-3 font-display text-4xl md:text-5xl text-ink">Voices of those who've collected.</h2>
            {reviews.length > 0 && (
              <div className="mt-4 flex items-center gap-3">
                <Stars value={Math.round(avg)} />
                <span className="text-sm text-muted-foreground">
                  {avg.toFixed(1)} · {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
                </span>
              </div>
            )}
          </div>
          {user && !myReview && !showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-ink text-cream text-xs uppercase tracking-[0.28em] hover:bg-brass transition-colors duration-500"
            >
              Write a review
            </button>
          )}
          {!user && !authLoading && (
            <Link
              to="/account"
              search={{ redirect: typeof window !== "undefined" ? window.location.pathname : "/" }}
              className="px-6 py-3 border border-border text-xs uppercase tracking-[0.28em] text-ink hover:border-brass hover:text-brass transition-colors"
            >
              Sign in to review
            </Link>
          )}
        </header>

        {info && <p className="mb-6 text-brass text-sm">{info}</p>}
        {myReview && !myReview.is_approved && (
          <p className="mb-6 text-brass text-sm">
            Your review is awaiting moderation by the atelier.
          </p>
        )}

        {showForm && user && (
          <form
            onSubmit={submit}
            className="mb-12 border border-border rounded-sm p-6 md:p-8 space-y-5 bg-card/50"
          >
            <div>
              <span className="eyebrow block mb-2">Your rating</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    type="button"
                    key={n}
                    onClick={() => setRating(n)}
                    onMouseEnter={() => setHoverRating(n)}
                    onMouseLeave={() => setHoverRating(0)}
                    aria-label={`${n} star${n > 1 ? "s" : ""}`}
                  >
                    <Star
                      className={`w-7 h-7 transition-colors ${
                        n <= (hoverRating || rating) ? "fill-brass text-brass" : "text-muted-foreground"
                      }`}
                      strokeWidth={1.4}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="eyebrow block mb-2">Display name</span>
                <input
                  className="checkout-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={user.email?.split("@")[0] || "Patron"}
                  maxLength={120}
                />
              </label>
              <label className="block">
                <span className="eyebrow block mb-2">Title (optional)</span>
                <input
                  className="checkout-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={120}
                />
              </label>
            </div>
            <label className="block">
              <span className="eyebrow block mb-2">Your review</span>
              <textarea
                className="checkout-input min-h-32"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={2000}
                required
              />
            </label>
            {error && <p className="text-destructive text-xs">{error}</p>}
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-5 py-2 text-xs uppercase tracking-[0.28em] text-muted-foreground hover:text-ink"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy}
                className="inline-flex items-center gap-2 px-6 py-3 bg-ink text-cream text-xs uppercase tracking-[0.28em] hover:bg-brass transition-colors duration-500 disabled:opacity-50"
              >
                {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                Submit review
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="py-12 text-center">
            <Loader2 className="w-5 h-5 mx-auto animate-spin text-brass" />
          </div>
        ) : reviews.length === 0 ? (
          <p className="text-muted-foreground text-sm py-8 border-t border-border">
            Be the first to share your impressions of this piece.
          </p>
        ) : (
          <ul className="divide-y divide-border border-t border-b border-border">
            {reviews.map((r) => (
              <li key={r.id} className="py-8 grid md:grid-cols-12 gap-6">
                <div className="md:col-span-3 space-y-1">
                  <Stars value={r.rating} />
                  <p className="text-sm text-ink mt-2">{r.reviewer_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(r.created_at).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "long",
                    })}
                  </p>
                </div>
                <div className="md:col-span-9 space-y-3">
                  {r.title && <p className="font-display text-xl text-ink">{r.title}</p>}
                  <p className="text-sm text-ink/80 leading-relaxed whitespace-pre-line">
                    {r.comment}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

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
    </section>
  );
}

function Stars({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`w-4 h-4 ${n <= value ? "fill-brass text-brass" : "text-muted-foreground"}`}
          strokeWidth={1.4}
        />
      ))}
    </div>
  );
}