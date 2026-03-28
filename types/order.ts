import { CartItem } from "@/types/cart";

export type OrderStatus = "pending" | "confirmed" | "delivered";

export type Order = {
  id: string;
  customerName: string;
  phone: string;
  address?: string;
  latitude?: number | null;
  longitude?: number | null;
  status: OrderStatus;
  createdAt: string;
  items: CartItem[];
  total: number;
};
