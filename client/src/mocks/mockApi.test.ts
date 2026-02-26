import { describe, expect, it } from "vitest";
import { mockApi } from "./mockApi";

describe("mockApi", () => {
  it("returns paginated orders", async () => {
    const result = await mockApi.getOrders(1, 10);
    expect(result.data).toHaveLength(10);
    expect(result.meta.page).toBe(1);
    expect(result.meta.perPage).toBe(10);
    expect(result.meta.total).toBeGreaterThan(0);
  });

  it("creates an order with tax calculation", async () => {
    const order = await mockApi.createOrder({
      latitude: 40.78,
      longitude: -73.96,
      subtotal: 100
    });
    expect(order.id).toBeGreaterThan(0);
    expect(order.tax_amount).toBeGreaterThan(0);
    expect(order.jurisdictions.state).toBe("New York");
  });

  it("filters orders by search", async () => {
    const result = await mockApi.getOrders(1, 100, { search: "Queens" });
    for (const order of result.data) {
      expect(order.jurisdictions.county).toBe("Queens");
    }
  });

  it("imports multiple orders", async () => {
    const payloads = [
      { latitude: 40.75, longitude: -73.95, subtotal: 50 },
      { latitude: 40.65, longitude: -73.80, subtotal: 100 }
    ];
    const imported = await mockApi.importCSV(payloads);
    expect(imported).toHaveLength(2);
    expect(imported[0]!.tax_amount).toBeGreaterThan(0);
  });

  it("returns all orders", async () => {
    const all = await mockApi.getAllOrders();
    expect(all.length).toBeGreaterThan(0);
  });
});
