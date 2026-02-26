import type { CreateOrderPayload, Order, OrderFilters, PaginatedResponse } from "@/types/order";
import { api, isMockMode } from "./axiosInstance";
import { mockApi } from "@/mocks/mockApi";

export async function getOrders(
  page = 1,
  perPage = 20,
  filters?: OrderFilters
): Promise<PaginatedResponse<Order>> {
  if (isMockMode) {
    return mockApi.getOrders(page, perPage, filters);
  }
  const response = await api.get<PaginatedResponse<Order>>("/orders", {
    params: { page, per_page: perPage, ...filters }
  });
  return response.data;
}

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  if (isMockMode) {
    return mockApi.createOrder(payload);
  }
  const response = await api.post<Order>("/orders", payload);
  return response.data;
}

export async function importCSV(orders: CreateOrderPayload[]): Promise<Order[]> {
  if (isMockMode) {
    return mockApi.importCSV(orders);
  }
  const response = await api.post<Order[]>("/orders/import", { orders });
  return response.data;
}

export async function getAllOrders(): Promise<Order[]> {
  if (isMockMode) {
    return mockApi.getAllOrders();
  }
  const response = await api.get<Order[]>("/orders/all");
  return response.data;
}

export function clearAllOrders(): void {
  if (isMockMode) {
    mockApi.clearOrders();
  }
}
