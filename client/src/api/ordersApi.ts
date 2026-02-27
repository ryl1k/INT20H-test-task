import type { BackendOrder, CreateOrderPayload, Order, OrderFilters, PaginatedResponse } from "@/types/order";
import { api, isMockMode } from "./axiosInstance";
import { mockApi } from "@/mocks/mockApi";

function normalizeOrder(raw: BackendOrder): Order {
  return {
    id: raw.order,
    latitude: raw.latitude,
    longitude: raw.longitude,
    composite_tax_rate: raw.composite_tax_rate,
    tax_amount: raw.tax_amount,
    total_amount: raw.total_amount,
    breakdown: raw.breakdown,
    jurisdictions: raw.jurisdictions,
    status: raw.status,
    reporting_code: raw.reporting_code,
    created_at: raw.created_at,
    updated_at: raw.updated_at
  };
}

export async function getOrders(
  page = 1,
  perPage = 20,
  filters?: OrderFilters
): Promise<PaginatedResponse<Order>> {
  if (isMockMode) {
    return mockApi.getOrders(page, perPage, filters);
  }

  const params: Record<string, unknown> = {
    page,
    pageSize: perPage
  };

  if (filters?.dateFrom) params.from_date = filters.dateFrom;
  if (filters?.dateTo) params.to_date = filters.dateTo;
  if (filters?.amountMin != null) params.total_amount_min = filters.amountMin;
  if (filters?.amountMax != null) params.total_amount_max = filters.amountMax;
  if (filters?.sortBy) params.sort_by = filters.sortBy;
  if (filters?.sortDir) params.sort_order = filters.sortDir;
  if (filters?.status) params.status = filters.status;
  if (filters?.reportingCode) params.reporting_code = filters.reportingCode;

  const response = await api.get<{ data: { orders: BackendOrder[] | null; total: number } }>("/orders", { params });
  const { orders, total } = response.data.data;
  const totalPages = Math.ceil(total / perPage);

  return {
    data: (orders ?? []).map(normalizeOrder),
    meta: { page, perPage, total, totalPages }
  };
}

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  if (isMockMode) {
    return mockApi.createOrder(payload);
  }
  const response = await api.post<{ data: BackendOrder }>("/orders", payload);
  return normalizeOrder(response.data.data);
}

export async function importCSV(file: File): Promise<{ message: string }> {
  if (isMockMode) {
    // In mock mode, parse the file client-side and use mockApi
    const text = await file.text();
    const lines = text.trim().split("\n");
    const headers = lines[0]!.split(",").map((h) => h.trim());
    const payloads: CreateOrderPayload[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i]!.split(",").map((c) => c.trim());
      const row: Record<string, string> = {};
      headers.forEach((h, idx) => { row[h] = cols[idx] ?? ""; });

      payloads.push({
        latitude: Number(row["latitude"]) || 0,
        longitude: Number(row["longitude"]) || 0,
        subtotal: Number(row["subtotal"]) || 0,
        timestamp: row["timestamp"] || undefined
      });
    }

    await mockApi.importCSV(payloads);
    return { message: `Imported ${payloads.length} orders` };
  }

  const formData = new FormData();
  formData.append("orders", file);
  const response = await api.post<{ message: string }>("/orders/import", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return response.data;
}

const MAX_PAGE_SIZE = 200;

export async function getAllOrders(pageSize?: number): Promise<Order[]> {
  if (isMockMode) {
    return mockApi.getAllOrders();
  }
  // Fetch multiple pages, stopping at pageSize or when all records are loaded
  const collected: Order[] = [];
  let page = 1;
  while (true) {
    const result = await getOrders(page, MAX_PAGE_SIZE);
    collected.push(...result.data);
    const done =
      result.data.length < MAX_PAGE_SIZE ||
      collected.length >= result.meta.total ||
      (pageSize !== undefined && collected.length >= pageSize);
    if (done) break;
    page++;
  }
  return pageSize !== undefined ? collected.slice(0, pageSize) : collected;
}

export async function clearAllOrders(): Promise<void> {
  if (isMockMode) {
    mockApi.clearOrders();
    return;
  }
  await api.delete("/orders");
}
