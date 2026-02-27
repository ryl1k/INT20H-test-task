import { beforeEach, describe, expect, it } from "vitest";
import { useOrderStore } from "./useOrderStore";
import type { Order, PaginatedMeta } from "@/types/order";

const mockOrder: Order = {
  id: 1,
  latitude: 40.75,
  longitude: -73.95,
  composite_tax_rate: 0.08875,
  tax_amount: 8.88,
  total_amount: 108.88,
  breakdown: { state_rate: 0.04, county_rate: 0.045, city_rate: 0, special_rate: 0.00375 },
  jurisdictions: ["New York", "New York County", "New York City", "MCTD"],
  status: "completed",
  reporting_code: "",
  created_at: "2025-11-15T12:00:00Z",
  updated_at: "2025-11-15T12:00:00Z"
};

const mockMeta: PaginatedMeta = { page: 1, perPage: 20, total: 1, totalPages: 1 };

describe("useOrderStore", () => {
  beforeEach(() => {
    useOrderStore.setState({
      orders: [],
      allOrders: [],
      meta: { page: 1, perPage: 20, total: 0, totalPages: 0 },
      filters: { sortBy: "created_at", sortDir: "desc" },
      loading: false,
      error: null
    });
  });

  it("sets orders and meta", () => {
    useOrderStore.getState().setOrders([mockOrder], mockMeta);
    expect(useOrderStore.getState().orders).toHaveLength(1);
    expect(useOrderStore.getState().meta.total).toBe(1);
  });

  it("sets all orders", () => {
    useOrderStore.getState().setAllOrders([mockOrder]);
    expect(useOrderStore.getState().allOrders).toHaveLength(1);
  });

  it("sets filters", () => {
    useOrderStore.getState().setFilters({ amountMin: 50 });
    expect(useOrderStore.getState().filters.amountMin).toBe(50);
    expect(useOrderStore.getState().filters.sortBy).toBe("created_at");
  });

  it("resets filters", () => {
    useOrderStore.getState().setFilters({ amountMin: 50 });
    useOrderStore.getState().resetFilters();
    expect(useOrderStore.getState().filters.amountMin).toBeUndefined();
  });

  it("sets loading state", () => {
    useOrderStore.getState().setLoading(true);
    expect(useOrderStore.getState().loading).toBe(true);
  });

  it("sets error", () => {
    useOrderStore.getState().setError("fail");
    expect(useOrderStore.getState().error).toBe("fail");
  });

  it("adds orders", () => {
    useOrderStore.getState().addOrders([mockOrder]);
    expect(useOrderStore.getState().allOrders).toHaveLength(1);
  });
});
