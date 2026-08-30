import type { OrderStatus } from "@/features/orders/types/order";

/**
 * Order status pill. Colors are derived to sit within the
 * Loomino palette (see designTokens COLORS.status*).
 */
const STATUS_STYLES: Record<
  OrderStatus,
  { label: string; bg: string; text: string }
> = {
  pending: {
    label: "Pending",
    bg: "#F0E6D8",
    text: "#4C300D",
  },
  confirmed: {
    label: "Confirmed",
    bg: "#E3EAF3",
    text: "#33506F",
  },
  processing: {
    label: "Processing",
    bg: "#EDE9F2",
    text: "#5A4B78",
  },
  shipped: {
    label: "Shipped",
    bg: "#E5EDE3",
    text: "#3B5537",
  },
  delivered: {
    label: "Delivered",
    bg: "#DCE7DA",
    text: "#2C4A28",
  },
  cancelled: {
    label: "Cancelled",
    bg: "#F3E3E3",
    text: "#8A3B3B",
  },
};

interface StatusBadgeProps {
  status: OrderStatus;
}

function StatusBadge({ status }: StatusBadgeProps) {
  const style =
    STATUS_STYLES[status] ?? STATUS_STYLES.pending;

  return (
    <span
      className="inline-flex items-center px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.6px]"
      style={{
        backgroundColor: style.bg,
        color: style.text,
      }}
    >
      {style.label}
    </span>
  );
}

export default StatusBadge;
