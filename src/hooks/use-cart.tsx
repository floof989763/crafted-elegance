import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCustomerAuth } from "./use-customer-auth";

/* -----------------------------------------------------------
 * Cart that works for guests (localStorage) and signed-in users (DB).
 * On sign-in, local cart is merged into the DB cart.
 * --------------------------------------------------------- */

const LS_KEY = "thewoods.cart.v1";

export type CartItem = {
  product_id: string;
  quantity: number;
  // Snapshot of product info for fast UI (always re-validated on checkout):
  name: string;
  slug: string;
  price_cents: number;
  currency: string;
  image: string | null;
  stock: number;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  loading: boolean;
  add: (item: Omit<CartItem, "quantity">, quantity?: number) => Promise<void>;
  remove: (productId: string) => Promise<void>;
  setQty: (productId: string, quantity: number) => Promise<void>;
  clear: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

function readLocal(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (i) => i && typeof i.product_id === "string" && typeof i.quantity === "number",
    );
  } catch {
    return [];
  }
}

function writeLocal(items: CartItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LS_KEY, JSON.stringify(items));
}

async function ensureCartId(userId: string): Promise<string | null> {
  const { data: existing } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();
  if (existing?.id) return existing.id;
  const { data: created, error } = await supabase
    .from("carts")
    .insert({ user_id: userId })
    .select("id")
    .single();
  if (error) return null;
  return created.id;
}

async function fetchDbCart(userId: string): Promise<{ cartId: string | null; items: CartItem[] }> {
  const cartId = await ensureCartId(userId);
  if (!cartId) return { cartId: null, items: [] };

  const { data: rows } = await supabase
    .from("cart_items")
    .select("product_id, quantity, products(id, name, slug, price_cents, currency, images, stock, is_active)")
    .eq("cart_id", cartId);

  const items: CartItem[] = (rows || [])
    .filter((r: any) => r.products?.is_active)
    .map((r: any) => ({
      product_id: r.product_id,
      quantity: r.quantity,
      name: r.products.name,
      slug: r.products.slug,
      price_cents: r.products.price_cents,
      currency: r.products.currency,
      image: r.products.images?.[0] ?? null,
      stock: r.products.stock,
    }));

  return { cartId, items };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useCustomerAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartId, setCartId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Hydrate from localStorage initially (guest)
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setItems(readLocal());
      setCartId(null);
      setLoading(false);
      return;
    }
    // Logged-in: merge local into DB then fetch
    let cancelled = false;
    (async () => {
      setLoading(true);
      const local = readLocal();
      const cId = await ensureCartId(user.id);
      if (!cId) {
        if (!cancelled) {
          setItems([]);
          setLoading(false);
        }
        return;
      }
      // Upsert local items into DB (sum if exists)
      if (local.length > 0) {
        const { data: existing } = await supabase
          .from("cart_items")
          .select("product_id, quantity")
          .eq("cart_id", cId);
        const existingMap = new Map<string, number>(
          (existing || []).map((e: any) => [e.product_id, e.quantity]),
        );
        for (const li of local) {
          const cur = existingMap.get(li.product_id) ?? 0;
          const next = Math.max(1, cur + li.quantity);
          if (cur > 0) {
            await supabase
              .from("cart_items")
              .update({ quantity: next })
              .eq("cart_id", cId)
              .eq("product_id", li.product_id);
          } else {
            await supabase
              .from("cart_items")
              .insert({ cart_id: cId, product_id: li.product_id, quantity: li.quantity });
          }
        }
        writeLocal([]);
      }
      const fresh = await fetchDbCart(user.id);
      if (cancelled) return;
      setCartId(fresh.cartId);
      setItems(fresh.items);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  const persistLocal = useCallback((next: CartItem[]) => {
    setItems(next);
    writeLocal(next);
  }, []);

  const add = useCallback<CartContextValue["add"]>(
    async (item, quantity = 1) => {
      if (user && cartId) {
        const existing = items.find((i) => i.product_id === item.product_id);
        const next = (existing?.quantity ?? 0) + quantity;
        if (existing) {
          await supabase
            .from("cart_items")
            .update({ quantity: next })
            .eq("cart_id", cartId)
            .eq("product_id", item.product_id);
        } else {
          await supabase
            .from("cart_items")
            .insert({ cart_id: cartId, product_id: item.product_id, quantity });
        }
        const fresh = await fetchDbCart(user.id);
        setItems(fresh.items);
      } else {
        const existing = items.find((i) => i.product_id === item.product_id);
        const next = existing
          ? items.map((i) =>
              i.product_id === item.product_id ? { ...i, quantity: i.quantity + quantity } : i,
            )
          : [...items, { ...item, quantity }];
        persistLocal(next);
      }
    },
    [user, cartId, items, persistLocal],
  );

  const remove = useCallback<CartContextValue["remove"]>(
    async (productId) => {
      if (user && cartId) {
        await supabase
          .from("cart_items")
          .delete()
          .eq("cart_id", cartId)
          .eq("product_id", productId);
        const fresh = await fetchDbCart(user.id);
        setItems(fresh.items);
      } else {
        persistLocal(items.filter((i) => i.product_id !== productId));
      }
    },
    [user, cartId, items, persistLocal],
  );

  const setQty = useCallback<CartContextValue["setQty"]>(
    async (productId, quantity) => {
      if (quantity <= 0) return remove(productId);
      if (user && cartId) {
        await supabase
          .from("cart_items")
          .update({ quantity })
          .eq("cart_id", cartId)
          .eq("product_id", productId);
        const fresh = await fetchDbCart(user.id);
        setItems(fresh.items);
      } else {
        persistLocal(items.map((i) => (i.product_id === productId ? { ...i, quantity } : i)));
      }
    },
    [user, cartId, items, remove, persistLocal],
  );

  const clear = useCallback<CartContextValue["clear"]>(async () => {
    if (user && cartId) {
      await supabase.from("cart_items").delete().eq("cart_id", cartId);
      setItems([]);
    } else {
      persistLocal([]);
    }
  }, [user, cartId, persistLocal]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count: items.reduce((s, i) => s + i.quantity, 0),
      subtotal: items.reduce((s, i) => s + i.quantity * i.price_cents, 0),
      loading,
      add,
      remove,
      setQty,
      clear,
    }),
    [items, loading, add, remove, setQty, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}