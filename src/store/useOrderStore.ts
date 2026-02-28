import { create } from "zustand";
import type { Order, OrderFilters, PaginatedMeta } from "@/types/order";

interface OrderState {
  orders: Order[];
  allOrders: Order[];
  meta: PaginatedMeta;
  filters: OrderFilters;
  loading: boolean;
  error: string | null;
  setOrders: (orders: Order[], meta: PaginatedMeta) => void;
  setAllOrders: (orders: Order[]) => void;
  setFilters: (filters: Partial<OrderFilters>) => void;
  resetFilters: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addOrders: (orders: Order[]) => void;
  clearOrders: () => void;
}

const defaultMeta: PaginatedMeta = { page: 1, perPage: 20, total: 0, totalPages: 0 };
const defaultFilters: OrderFilters = { sortBy: "created_at", sortDir: "desc" };

export const useOrderStore = create<OrderState>((set) => ({
  orders: [],
  allOrders: [],
  meta: defaultMeta,
  filters: defaultFilters,
  loading: false,
  error: null,
  setOrders: (orders, meta) =>
    set((state) => ({ orders, meta: { ...meta, perPage: state.meta.perPage } })),
  setAllOrders: (allOrders) => set({ allOrders }),
  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),
  resetFilters: () => set({ filters: defaultFilters }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  addOrders: (newOrders) =>
    set((state) => ({
      allOrders: [...state.allOrders, ...newOrders],
      meta: { ...state.meta, total: state.meta.total + newOrders.length }
    })),
  clearOrders: () =>
    set({ orders: [], allOrders: [], meta: defaultMeta })
}));
