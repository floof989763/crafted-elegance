import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Centralized site_content keys + their default values.
 * Each key stores a small JSON blob that the admin can override.
 * If a key is missing in the DB, we fall back to the default below
 * so the site keeps rendering exactly as it does today.
 */
export const SITE_CONTENT_DEFAULTS = {
  "home.hero": {
    eyebrow: "A Saharanpur Atelier · Est. MMXXIV",
    title: "The Woods",
    quote:
      "“We would rather make one bowl that outlives us, than a hundred that do not.”",
    video_url: "",
    poster_image: "/images/products/bowl-01-walnut.jpg",
  },
  "home.manifesto": {
    eyebrow: "— Vol. 01 · The Quiet Collection · MMXXIV",
    title_html:
      "Objects shaped <em>slowly,</em><br/>for the room <em>that listens.</em>",
    body_1:
      "A small atelier on the edge of Saharanpur, devoted to the slow art of turning heritage timber into vessels, candle stands, trays and tables — each one numbered, signed, and made by a single pair of hands.",
    body_2:
      "We work in editions of nine. Once a piece is gone, the form retires with it. Nothing here is restocked, nothing repeated. What remains is what was meant to remain.",
    badge: "N° P03 · Walnut",
    image: "/images/products/candle-01-walnut-tall.jpg",
    bullet_1: "Single-billet construction",
    bullet_2: "Hand-finished, never lacquered",
    bullet_3: "Numbered & signed by maker",
  },
  "home.collection": {
    eyebrow: "— The Collection",
    title_html: "Eight objects, conceived <em>in shadow.</em>",
    body:
      "Bowls and vases turned on the lathe. Candle stands and trays carved by gouge. Tables and live-edge tops shaped from a single billet. Each piece exists in an edition of nine — never repeated, never restocked.",
  },
  "home.craft": {
    eyebrow: "— Craft",
    title_html: "Eighty hours,<br/><em>one pair of hands.</em>",
    body_1:
      "Each object passes through a single maker, from raw billet to final wax. There are no production runs — only sequences. We work in editions of nine, never more.",
    body_2:
      "The grain is read before it is cut. The form is found, not imposed. What remains is the wood at its quietest.",
    image: "/images/editorial/atelier-hands.jpg",
    stat_1_n: "09",
    stat_1_l: "per edition",
    stat_2_n: "80h",
    stat_2_l: "per object",
    stat_3_n: "01",
    stat_3_l: "maker",
  },
  "home.atelier": {
    eyebrow: "— The Atelier",
    title_html: "A studio of <em>two,</em><br/>a forest of <em>memory.</em>",
    image: "/images/editorial/atelier-interior.jpg",
    body_1:
      "The Woods is a Saharanpur-based wooden handicraft brand, founded in a converted granary at the edge of the old timber market — where India's finest woodcarvers have worked for generations.",
    body_2:
      "We source only from fallen and reclaimed timber — sheesham from family groves, walnut from the Kashmir valley, teak rescued from century-old havelis. Every piece carries the history of the tree it once was. Nothing is repeated. Nothing is hurried.",
    body_3:
      "Our objects are held in private collections from Kyoto to Copenhagen. They are not sold in stores. They are commissioned, numbered, and delivered by hand.",
  },
  "home.correspondence": {
    eyebrow: "— Correspondence",
    title_html: "For commissions<br/>&amp; <em>private viewings.</em>",
    address_lines: "Nakhasa Bazar\nSaharanpur · Uttar Pradesh · India",
    email: "mohdumar20052004@gmail.com",
    phone: "+91 70557 62173",
    appointment: "Thursday — Saturday",
    cta_body:
      "Tell us about the room you have in mind, the tree you remember, or the piece you would like to commission. Every enquiry is read by the maker.",
  },
  "about.hero": {
    eyebrow: "The Atelier",
    title_html: "We work in <em>silence,</em><br/>and in wood.",
    image: "/images/editorial/atelier-interior.jpg",
  },
  "about.body": {
    p1:
      "The Woods is a Saharanpur-based wooden handicraft brand, founded in a converted granary at the edge of the old timber market — where India's finest woodcarvers have worked for generations.",
    quote:
      '"We would rather make one bowl that outlives us, than a hundred that do not."',
    p2:
      "We source only from fallen and reclaimed timber — sheesham from family groves, walnut from the Kashmir valley, teak rescued from century-old havelis. Every billet is dated, traced, and remembered.",
    p3:
      "We do not use CNC. We work in editions of nine. Each object passes through a single pair of hands — from the first cut of the gouge to the seventeenth coat of beeswax.",
    image_1: "/images/editorial/atelier-hands.jpg",
    image_2: "/images/editorial/beeswax-finish.jpg",
  },
  "contact.info": {
    address_lines:
      "The Woods Atelier\nNakhasa Bazar, Saharanpur\nUttar Pradesh, India · By appointment",
    email: "mohdumar20052004@gmail.com",
    phone: "+91 70557 62173",
    hours:
      "Studio hours are Tuesday through Saturday, 10am – 5pm. Visits are by appointment only — we keep our space quiet for the work.",
  },
  "site.header": {
    brand: "The Woods",
    tagline: "Est. MMXXIV",
    nav_collection: "Collection",
    nav_atelier: "Atelier",
    nav_journal: "Journal",
    nav_contact: "Contact",
  },
  "site.footer": {
    title_html: "Crafted from the<br/><em>forest's quiet.</em>",
    blurb:
      "The Woods is a Saharanpur-based wooden handicraft brand. Heirloom objects, made slowly by a single pair of hands. Each piece is signed, numbered, and meant to age with you.",
    address_1: "Nakhasa Bazar, Saharanpur",
    address_2: "Uttar Pradesh, India",
    phone: "+91 70557 62173",
    email: "mohdumar20052004@gmail.com",
    newsletter_title: "Letters from the workshop",
    newsletter_body:
      "A quiet note, four times a year. New pieces, process, the occasional poem.",
    instagram_url: "#",
    facebook_url: "#",
  },
} as const;

export type SiteContentKey = keyof typeof SITE_CONTENT_DEFAULTS;
export type SiteContentValue<K extends SiteContentKey> =
  (typeof SITE_CONTENT_DEFAULTS)[K];

const cache: Partial<Record<SiteContentKey, any>> = {};
const subscribers = new Set<() => void>();
let loaded = false;
let loadPromise: Promise<void> | null = null;

async function loadAll() {
  if (loadPromise) return loadPromise;
  loadPromise = (async () => {
    const { data } = await supabase.from("site_content").select("key, value");
    if (data) {
      data.forEach((row: any) => {
        cache[row.key as SiteContentKey] = row.value;
      });
    }
    loaded = true;
    subscribers.forEach((s) => s());
  })();
  return loadPromise;
}

export function useSiteContent<K extends SiteContentKey>(
  key: K,
): SiteContentValue<K> {
  const [, force] = useState(0);
  useEffect(() => {
    const sub = () => force((n) => n + 1);
    subscribers.add(sub);
    if (!loaded) loadAll();
    return () => {
      subscribers.delete(sub);
    };
  }, []);
  const stored = cache[key];
  return { ...SITE_CONTENT_DEFAULTS[key], ...(stored || {}) } as SiteContentValue<K>;
}

export async function saveSiteContent<K extends SiteContentKey>(
  key: K,
  value: SiteContentValue<K>,
) {
  const { error } = await supabase
    .from("site_content")
    .upsert({ key, value }, { onConflict: "key" });
  if (error) throw error;
  cache[key] = value;
  subscribers.forEach((s) => s());
}

export async function fetchSiteContentOnce<K extends SiteContentKey>(
  key: K,
): Promise<SiteContentValue<K>> {
  const { data } = await supabase
    .from("site_content")
    .select("value")
    .eq("key", key)
    .maybeSingle();
  return {
    ...SITE_CONTENT_DEFAULTS[key],
    ...(((data?.value as object) || {}) as object),
  } as SiteContentValue<K>;
}