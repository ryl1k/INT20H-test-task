import type { CreateOrderPayload, Order, OrderFilters, PaginatedResponse } from "@/types/order";
import { mockOrders } from "./mockOrders";
import { calculateTax } from "./taxRates";

let orders: Order[] = [...mockOrders];
let nextId = orders.length + 1;

function delay(ms = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function applyFilters(list: Order[], filters?: OrderFilters): Order[] {
  let result = [...list];

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (o) =>
        o.id.toString().includes(q) ||
        o.jurisdictions.county.toLowerCase().includes(q) ||
        o.jurisdictions.city.toLowerCase().includes(q)
    );
  }

  if (filters?.dateFrom) {
    const from = new Date(filters.dateFrom).getTime();
    result = result.filter((o) => new Date(o.timestamp).getTime() >= from);
  }

  if (filters?.dateTo) {
    const to = new Date(filters.dateTo).getTime();
    result = result.filter((o) => new Date(o.timestamp).getTime() <= to);
  }

  if (filters?.amountMin != null) {
    result = result.filter((o) => o.subtotal >= filters.amountMin!);
  }

  if (filters?.amountMax != null) {
    result = result.filter((o) => o.subtotal <= filters.amountMax!);
  }

  const sortBy = filters?.sortBy ?? "timestamp";
  const sortDir = filters?.sortDir ?? "desc";
  result.sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];
    if (typeof aVal === "string" && typeof bVal === "string") {
      return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    if (typeof aVal === "number" && typeof bVal === "number") {
      return sortDir === "asc" ? aVal - bVal : bVal - aVal;
    }
    return 0;
  });

  return result;
}

export const mockApi = {
  async getOrders(
    page = 1,
    perPage = 20,
    filters?: OrderFilters
  ): Promise<PaginatedResponse<Order>> {
    await delay();
    const filtered = applyFilters(orders, filters);
    const total = filtered.length;
    const totalPages = Math.ceil(total / perPage);
    const start = (page - 1) * perPage;
    const data = filtered.slice(start, start + perPage);

    return {
      data,
      meta: { page, perPage, total, totalPages }
    };
  },

  async createOrder(payload: CreateOrderPayload): Promise<Order> {
    await delay(500);
    const tax = calculateTax(payload.latitude, payload.longitude, payload.subtotal);
    const order: Order = {
      id: nextId++,
      latitude: payload.latitude,
      longitude: payload.longitude,
      subtotal: payload.subtotal,
      timestamp: payload.timestamp ?? new Date().toISOString(),
      ...tax
    };
    orders = [order, ...orders];
    return order;
  },

  async importCSV(payloads: CreateOrderPayload[]): Promise<Order[]> {
    await delay(1000);
    const imported: Order[] = payloads.map((p) => {
      const tax = calculateTax(p.latitude, p.longitude, p.subtotal);
      const order: Order = {
        id: nextId++,
        latitude: p.latitude,
        longitude: p.longitude,
        subtotal: p.subtotal,
        timestamp: p.timestamp ?? new Date().toISOString(),
        ...tax
      };
      return order;
    });
    orders = [...imported, ...orders];
    return imported;
  },

  async getAllOrders(): Promise<Order[]> {
    await delay();
    return [...orders];
  },

  clearOrders(): void {
    orders = [];
    nextId = 1;
  }
};
