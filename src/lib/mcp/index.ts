import { defineMcp } from "@lovable.dev/mcp-js";
import searchProducts from "./tools/search-products";
import getProduct from "./tools/get-product";
import listCategories from "./tools/list-categories";

export default defineMcp({
  name: "the-woods-mcp",
  title: "The Woods — Atelier catalog",
  version: "0.1.0",
  instructions:
    "Public catalog tools for The Woods handcrafted store. Use list_categories to discover collections, search_products to browse or filter the catalog, and get_product for full details on a specific piece by slug.",
  tools: [searchProducts, getProduct, listCategories],
});