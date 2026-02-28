import type { BackendOrder, CreateOrderPayload, Order, OrderFilters, PaginatedResponse } from "@/types/order";
import { api, isMockMode } from "./axiosInstance";
import { mockApi } from "@/mocks/mockApi";
import { parseCsv } from "@/utils/csvParser";

function normalizeOrder(raw: BackendOrder): Order {
  return {
    id: raw.id,
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

export async function importCSV(file: File): Promise<{ message: string }> {
  if (isMockMode) {
    const text = await file.text();
    const rows = parseCsv(text);
    const payloads: CreateOrderPayload[] = rows.map((row) => ({
      latitude: Number(row.latitude) || 0,
      longitude: Number(row.longitude) || 0,
      subtotal: Number(row.subtotal) || 0,
      timestamp: row.timestamp || undefined
    }));

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
const MAX_CONCURRENT = 10;

export async function getAllOrders(pageSize?: number): Promise<Order[]> {
  if (isMockMode) {
    return mockApi.getAllOrders();
  }

  // First request to discover total count
  const first = await getOrders(1, MAX_PAGE_SIZE);
  const collected: Order[] = [...first.data];

  const target = pageSize ?? first.meta.total;
  const totalPages = Math.ceil(target / MAX_PAGE_SIZE);

  if (totalPages <= 1) {
    return pageSize !== undefined ? collected.slice(0, pageSize) : collected;
  }

  // Fetch remaining pages in parallel batches
  for (let batch = 2; batch <= totalPages; batch += MAX_CONCURRENT) {
    const end = Math.min(batch + MAX_CONCURRENT, totalPages + 1);
    const promises: Promise<PaginatedResponse<Order>>[] = [];
    for (let page = batch; page < end; page++) {
      promises.push(getOrders(page, MAX_PAGE_SIZE));
    }
    const results = await Promise.all(promises);
    for (const result of results) {
      collected.push(...result.data);
    }
  }

  return pageSize !== undefined ? collected.slice(0, pageSize) : collected;
}

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  if (isMockMode) {
    return mockApi.createOrder(payload);
  }

  const body = {
    latitude: payload.latitude,
    longitude: payload.longitude,
    subtotal: payload.subtotal,
    timestamp: payload.timestamp ?? new Date().toISOString()
  };

  const response = await api.post<{ data: BackendOrder }>("/orders", body);
  return normalizeOrder(response.data.data);
}

export async function clearAllOrders(): Promise<void> {
  if (isMockMode) {
    mockApi.clearOrders();
    return;
  }
  await api.delete("/orders");
}
