import { describe, expect, it } from "vitest";
import { getOrders, getAllOrders } from "./ordersApi";

describe("ordersApi (mock mode)", () => {
  it("getOrders returns paginated data", async () => {
    const result = await getOrders(1, 10);
    expect(result.data).toHaveLength(10);
    expect(result.meta.page).toBe(1);
  });

  it("getAllOrders returns array", async () => {
    const all = await getAllOrders();
    expect(Array.isArray(all)).toBe(true);
    expect(all.length).toBeGreaterThan(0);
  });
});
