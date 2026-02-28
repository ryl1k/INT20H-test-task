import type { CreateOrderPayload, Order, OrderFilters, PaginatedResponse } from "@/types/order";
import { calculateTax } from "./taxRates";

let orders: Order[] = [];
let nextId = 1;

function delay(ms = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildOrder(payload: CreateOrderPayload, now: string): Order {
  const tax = calculateTax(payload.latitude, payload.longitude, payload.subtotal);
  return {
    id: nextId++,
    latitude: payload.latitude,
    longitude: payload.longitude,
    ...tax,
    status: "completed",
    reporting_code: "",
    created_at: payload.timestamp ?? now,
    updated_at: now
  };
}

function applyFilters(list: Order[], filters?: OrderFilters): Order[] {
  let result = [...list];

  if (filters?.dateFrom) {
    const from = new Date(filters.dateFrom).getTime();
    result = result.filter((o) => new Date(o.created_at).getTime() >= from);
  }

  if (filters?.dateTo) {
    const to = new Date(filters.dateTo).getTime();
    result = result.filter((o) => new Date(o.created_at).getTime() <= to);
  }

  if (filters?.amountMin != null) {
    result = result.filter((o) => o.total_amount >= filters.amountMin!);
  }

  if (filters?.amountMax != null) {
    result = result.filter((o) => o.total_amount <= filters.amountMax!);
  }

  if (filters?.status) {
    result = result.filter((o) => o.status === filters.status);
  }

  if (filters?.reportingCode) {
    result = result.filter((o) => o.reporting_code === filters.reportingCode);
  }

  const sortableFields = ["id", "latitude", "longitude", "composite_tax_rate", "tax_amount", "total_amount", "status", "reporting_code", "created_at", "updated_at"] as const;
  type SortableField = typeof sortableFields[number];
  const sortBy = (sortableFields as readonly string[]).includes(filters?.sortBy ?? "")
    ? (filters!.sortBy as SortableField)
    : "created_at";
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
    await delay();
    const now = new Date().toISOString();
    const order = buildOrder(payload, now);
    orders = [order, ...orders];
    return order;
  },

  async importCSV(payloads: CreateOrderPayload[]): Promise<Order[]> {
    await delay(1000);
    const now = new Date().toISOString();
    const imported = payloads.map((p) => buildOrder(p, now));
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
