import { Order } from "@/types/order";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { getSafeStorage } from "@/utils/storage";

type OrderState = {
  currentOrder: Order | null;
  orders: Order[];
  setCurrentOrder: (order: Order | null) => void;
  addOrder: (order: Order) => void;
  updateOrder: (order: Order) => void;
  clearCurrentOrder: () => void;
};

export const useOrderStore = create<OrderState>()(
  persist(
    (set) => ({
      currentOrder: null,
      orders: [],
      setCurrentOrder: (order) => set({ currentOrder: order }),
      addOrder: (order) =>
        set((state) => ({
          orders: [order, ...state.orders],
          currentOrder: order,
        })),
      updateOrder: (order) =>
        set((state) => ({
          orders: state.orders.map((current) => (current.id === order.id ? order : current)),
          currentOrder: state.currentOrder?.id === order.id ? order : state.currentOrder,
        })),
      clearCurrentOrder: () => set({ currentOrder: null }),
    }),
    {
      name: "khidma-orders",
      storage: createJSONStorage(() => getSafeStorage()),
    },
  ),
);
