import { describe, expect, it } from "vitest";
import { getOrders, createOrder, getAllOrders } from "./ordersApi";

describe("ordersApi (mock mode)", () => {
  it("getOrders returns paginated data", async () => {
    const result = await getOrders(1, 10);
    expect(result.data).toHaveLength(10);
    expect(result.meta.page).toBe(1);
  });

  it("createOrder returns order with tax", async () => {
    const order = await createOrder({ latitude: 40.78, longitude: -73.96, subtotal: 100 });
    expect(order.tax_amount).toBeGreaterThan(0);
    expect(order.total_amount).toBeGreaterThan(100);
  });

  it("getAllOrders returns array", async () => {
    const all = await getAllOrders();
    expect(Array.isArray(all)).toBe(true);
    expect(all.length).toBeGreaterThan(0);
  });
});
