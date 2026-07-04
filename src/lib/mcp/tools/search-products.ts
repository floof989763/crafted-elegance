import { defineTool } from "@lovable.dev/mcp-js";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

export default defineTool({
  name: "search_products",
  title: "Search products",
  description:
    "Search the storefront catalog. Filter by free-text query (matches name and description), category slug, or featured/premium flags. Returns active products with price, stock, and slug.",
  inputSchema: {
    query: z.string().trim().optional().describe("Free-text search on name/description."),
    category_slug: z.string().trim().optional().describe("Filter by category slug."),
    featured: z.boolean().optional().describe("Only featured products."),
    premium: z.boolean().optional().describe("Only premium products."),
    limit: z.number().int().min(1).max(50).optional().describe("Max rows (default 20)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ query, category_slug, featured, premium, limit }) => {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    let q = supabase
      .from("products")
      .select("id, name, slug, short_description, price_cents, currency, stock, is_featured, is_premium, images, categories!inner(slug, name)")
      .eq("is_active", true)
      .limit(limit ?? 20);
    if (query) q = q.or(`name.ilike.%${query}%,description.ilike.%${query}%`);
    if (category_slug) q = q.eq("categories.slug", category_slug);
    if (featured !== undefined) q = q.eq("is_featured", featured);
    if (premium !== undefined) q = q.eq("is_premium", premium);
    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { products: data ?? [] },
    };
  },
});
