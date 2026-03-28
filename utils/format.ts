import { Order } from "@/types/order";

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(value: string | number | Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatPhone(value: string) {
  return value.replace(/\s+/g, "").replace(/(\d{2})(?=\d)/g, "$1 ");
}

export function orderLabel(order: Order) {
  return `CMD-${order.id.slice(-6).toUpperCase()}`;
}
