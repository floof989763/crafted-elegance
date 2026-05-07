import { cn } from "@/lib/utils";

type Props = {
  stock: number | null | undefined;
  className?: string;
};

/**
 * Subtle, luxury-styled stock indicator.
 * - stock <= 0 → "Made to order"
 * - stock 1-3 → "Only N left"
 * - stock 4-6 → "Low stock — N remaining"
 * - stock 7-10 → "Selling fast"
 * - stock > 10 → nothing (keep it quiet)
 */
export function StockIndicator({ stock, className }: Props) {
  if (stock === null || stock === undefined) return null;

  let label: string | null = null;
  if (stock <= 0) label = "Made to order";
  else if (stock <= 3) label = `Only ${stock} left`;
  else if (stock <= 6) label = `Low stock — ${stock} remaining`;
  else if (stock <= 10) label = "Selling fast";

  if (!label) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.28em] text-brass/90",
        className,
      )}
    >
      <span className="inline-block w-1 h-1 rounded-full bg-brass/70" />
      {label}
    </span>
  );
}