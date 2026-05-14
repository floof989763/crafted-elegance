export const ORDER_STATUSES = [
  { value: "placed", label: "Order Placed" },
  { value: "confirmed", label: "Confirmed" },
  { value: "processing", label: "Processing" },
  { value: "packed", label: "Packed" },
  { value: "dispatched", label: "Dispatched" },
  { value: "shipped", label: "Shipped" },
  { value: "out_for_delivery", label: "Out for Delivery" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
  { value: "returned", label: "Returned" },
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number]["value"];

export const STATUS_LABEL: Record<string, string> = Object.fromEntries(
  ORDER_STATUSES.map((s) => [s.value, s.label]),
);

// Map legacy values (pending, awaiting_payment) to friendly labels
export function statusLabel(status: string) {
  if (STATUS_LABEL[status]) return STATUS_LABEL[status];
  if (status === "pending") return "Order Placed";
  if (status === "awaiting_payment") return "Awaiting Payment";
  return status.replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}

// Ordered tracker steps shown to customers (excludes cancelled/returned)
export const TRACK_STEPS: OrderStatus[] = [
  "placed",
  "confirmed",
  "processing",
  "packed",
  "dispatched",
  "shipped",
  "out_for_delivery",
  "delivered",
];

export function trackingIndex(status: string) {
  if (status === "pending" || status === "awaiting_payment") return 0;
  const i = TRACK_STEPS.indexOf(status as OrderStatus);
  return i;
}
