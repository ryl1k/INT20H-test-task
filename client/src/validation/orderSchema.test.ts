import { describe, expect, it } from "vitest";
import { createOrderSchema } from "./orderSchema";

describe("createOrderSchema", () => {
  it("accepts valid NY State order", () => {
    const result = createOrderSchema.safeParse({
      latitude: 40.75,
      longitude: -73.95,
      subtotal: 50
    });
    expect(result.success).toBe(true);
  });

  it("rejects latitude outside NY", () => {
    const result = createOrderSchema.safeParse({
      latitude: 30.0,
      longitude: -73.95,
      subtotal: 50
    });
    expect(result.success).toBe(false);
  });

  it("rejects longitude outside NY", () => {
    const result = createOrderSchema.safeParse({
      latitude: 40.75,
      longitude: -60.0,
      subtotal: 50
    });
    expect(result.success).toBe(false);
  });

  it("rejects zero subtotal", () => {
    const result = createOrderSchema.safeParse({
      latitude: 40.75,
      longitude: -73.95,
      subtotal: 0
    });
    expect(result.success).toBe(false);
  });

  it("rejects subtotal above limit", () => {
    const result = createOrderSchema.safeParse({
      latitude: 40.75,
      longitude: -73.95,
      subtotal: 99999
    });
    expect(result.success).toBe(false);
  });
});
