import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, ShoppingBag, Check } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/format";
import { useCart } from "@/hooks/use-cart";
import { ProductReviews } from "@/components/site/ProductReviews";

type Product = {
  id: string;
  slug: string;
  name: string;
  short_description: string | null;
  description: string | null;
  price_cents: number;
  currency: string;
  images: string[];
  materials: string | null;
  dimensions: string | null;
  stock: number;
};

export const Route = createFileRoute("/shop/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug.replace(/-/g, " ")} — The Woods` },
      { property: "og:title", content: `${params.slug} — The Woods` },
    ],
  }),
  component: ProductPage,
  notFoundComponent: () => (
    <SiteShell>
      <div className="pt-40 pb-32 text-center">
        <h1 className="font-display text-5xl text-ink">Piece not found</h1>
        <Link to="/shop" className="mt-8 inline-block text-brass luxe-link">
          Back to the collection
        </Link>
      </div>
    </SiteShell>
  ),
});

function ProductPage() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const { add } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .maybeSingle();
      setProduct((data as Product) || null);
      setLoading(false);
    })();
  }, [slug]);

  const handleAddToCart = async () => {
    if (!product) return;
    setAdding(true);
    try {
      await add(
        {
          product_id: product.id,
          name: product.name,
          slug: product.slug,
          price_cents: product.price_cents,
          currency: product.currency,
          image: product.images?.[0] ?? null,
          stock: product.stock,
        },
        1,
      );
      setAdded(true);
      setTimeout(() => setAdded(false), 1800);
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    navigate({ to: "/checkout" });
  };

  if (loading) {
    return (
      <SiteShell>
        <div className="pt-48 text-center text-muted-foreground">
          <Loader2 className="w-6 h-6 mx-auto animate-spin" />
        </div>
      </SiteShell>
    );
  }

  if (!product) {
    throw notFound();
  }

  const images = product.images?.length
    ? product.images
    : ["", "", ""];

  return (
    <SiteShell>
      <section className="pt-32 md:pt-40 pb-24 md:pb-40">
        <div className="mx-auto max-w-[1480px] px-6 md:px-10">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-muted-foreground hover:text-brass transition-colors mb-12"
          >
            <ArrowLeft className="w-4 h-4" /> The collection
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
            {/* Gallery */}
            <div className="lg:col-span-7 space-y-4">
              <div className="aspect-[4/5] bg-walnut overflow-hidden rounded-sm">
                {images[activeImg] ? (
                  <img
                    src={images[activeImg]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-ink/30 font-display text-9xl">
                    ⵘ
                  </div>
                )}
              </div>
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className={`aspect-square bg-walnut overflow-hidden rounded-sm transition-opacity ${
                        activeImg === i ? "opacity-100 ring-1 ring-brass" : "opacity-60 hover:opacity-100"
                      }`}
                    >
                      {img && <img src={img} alt="" className="w-full h-full object-cover" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="lg:col-span-5 lg:pt-12 space-y-8">
              <div>
                <p className="eyebrow">Numbered piece</p>
                <h1 className="mt-4 font-display text-5xl md:text-6xl text-ink leading-[0.95]">
                  {product.name}
                </h1>
                {product.short_description && (
                  <p className="mt-4 text-muted-foreground">{product.short_description}</p>
                )}
              </div>

              <div className="hairline" />

              <div className="text-3xl font-display text-ink">
                {formatPrice(product.price_cents, product.currency)}
              </div>

              {product.description && (
                <p className="text-sm text-ink/70 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              )}

              <div className="space-y-3 text-sm">
                {product.materials && (
                  <div className="flex gap-4">
                    <span className="eyebrow w-32 pt-1">Materials</span>
                    <span className="text-ink/80">{product.materials}</span>
                  </div>
                )}
                {product.dimensions && (
                  <div className="flex gap-4">
                    <span className="eyebrow w-32 pt-1">Dimensions</span>
                    <span className="text-ink/80">{product.dimensions}</span>
                  </div>
                )}
                <div className="flex gap-4">
                  <span className="eyebrow w-32 pt-1">Availability</span>
                  <span className="text-ink/80">
                    {product.stock > 0 ? `${product.stock} in atelier` : "Made to order"}
                  </span>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={adding}
                className="w-full inline-flex justify-center items-center gap-3 px-8 py-5 bg-ink text-cream text-xs uppercase tracking-[0.28em] hover:bg-brass transition-colors duration-500 disabled:opacity-50"
              >
                {adding ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : added ? (
                  <>
                    <Check className="w-4 h-4" /> Added to cart
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" /> Add to cart
                  </>
                )}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={adding}
                className="w-full px-8 py-5 border border-border text-xs uppercase tracking-[0.28em] text-ink hover:border-brass hover:text-brass transition-colors duration-500 disabled:opacity-50"
              >
                Buy now
              </button>

              <Link
                to="/contact"
                className="block text-center text-xs uppercase tracking-[0.28em] text-muted-foreground luxe-link hover:text-brass"
              >
                Inquire about commission
              </Link>
            </div>
          </div>
        </div>
      </section>

      <ProductReviews productId={product.id} />
    </SiteShell>
  );
}
