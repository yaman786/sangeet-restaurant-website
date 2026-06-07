import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { MenuItem } from "@/types/database";

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  specialRequests: string;
}

interface CartState {
  items: CartItem[];
  tableNumber: string | null;
  customerName: string;

  // Actions
  setTableNumber: (tableNumber: string) => void;
  setCustomerName: (name: string) => void;
  addItem: (menuItem: MenuItem, quantity?: number, specialRequests?: string) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  updateSpecialRequests: (menuItemId: string, requests: string) => void;
  clearCart: () => void;

  // Computed
  totalItems: () => number;
  totalAmount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      tableNumber: null,
      customerName: "",

      setTableNumber: (tableNumber: string) => set({ tableNumber }),

      setCustomerName: (name: string) => set({ customerName: name }),

      addItem: (menuItem: MenuItem, quantity = 1, specialRequests = "") => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) => item.menuItem.id === menuItem.id
          );

          if (existingIndex >= 0) {
            const updated = [...state.items];
            updated[existingIndex] = {
              ...updated[existingIndex],
              quantity: updated[existingIndex].quantity + quantity,
            };
            return { items: updated };
          }

          return {
            items: [...state.items, { menuItem, quantity, specialRequests }],
          };
        });
      },

      removeItem: (menuItemId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.menuItem.id !== menuItemId),
        }));
      },

      updateQuantity: (menuItemId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(menuItemId);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.menuItem.id === menuItemId ? { ...item, quantity } : item
          ),
        }));
      },

      updateSpecialRequests: (menuItemId: string, requests: string) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.menuItem.id === menuItemId
              ? { ...item, specialRequests: requests }
              : item
          ),
        }));
      },

      clearCart: () => set({ items: [], customerName: "" }),

      totalItems: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),

      totalAmount: () =>
        get().items.reduce(
          (sum, item) => sum + item.menuItem.price * item.quantity,
          0
        ),
    }),
    {
      name: "sangeet-cart",
      partialize: (state) => ({
        items: state.items,
        tableNumber: state.tableNumber,
        customerName: state.customerName,
      }),
    }
  )
);
