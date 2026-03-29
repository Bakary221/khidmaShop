import { ordersSeed } from "@/services/mock-db";
import { CartItem } from "@/types/cart";
import { Order, OrderStatus } from "@/types/order";
import { delay } from "@/utils/delay";
import { createId } from "@/utils/id";

let orders: Order[] = [...ordersSeed];

export async function listOrders() {
  await delay(450);
  return [...orders];
}

export async function getOrderById(id: string) {
  await delay(250);
  return orders.find((order) => order.id === id) ?? null;
}

export async function createOrder(input: {
  customerName: string;
  phone: string;
  address?: string;
  latitude?: number | null;
  longitude?: number | null;
  items: CartItem[];
}) {
  await delay(900);

  const total = input.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const order: Order = {
    id: createId("ord"),
    customerName: input.customerName,
    phone: input.phone,
    address: input.address,
    latitude: input.latitude ?? null,
    longitude: input.longitude ?? null,
    status: "en_attente",
    createdAt: new Date().toISOString(),
    items: input.items,
    total,
  };

  orders = [order, ...orders];
  return order;
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  await delay(500);
  orders = orders.map((order) => (order.id === id ? { ...order, status } : order));
  return orders.find((order) => order.id === id) ?? null;
}

export async function listOrderStats() {
  await delay(200);
  return {
    total: orders.length,
    pending: orders.filter((order) => order.status === "en_attente").length,
    confirmed: orders.filter((order) => order.status === "confirmee").length,
    delivered: orders.filter((order) => order.status === "livree").length,
  };
}

export function getOrderSnapshot() {
  return [...orders];
}
