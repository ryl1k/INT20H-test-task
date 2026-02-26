import { describe, expect, it } from "vitest";
import { csvRowSchema } from "./csvSchema";

describe("csvRowSchema", () => {
  it("accepts valid CSV row with coercion", () => {
    const result = csvRowSchema.safeParse({
      id: "1",
      longitude: "-73.95",
      latitude: "40.75",
      timestamp: "2025-11-15 12:00:00",
      subtotal: "50.0"
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe(1);
      expect(result.data.subtotal).toBe(50);
    }
  });

  it("rejects invalid latitude", () => {
    const result = csvRowSchema.safeParse({
      id: "1",
      longitude: "-73.95",
      latitude: "999",
      timestamp: "2025-11-15",
      subtotal: "50"
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty timestamp", () => {
    const result = csvRowSchema.safeParse({
      id: "1",
      longitude: "-73.95",
      latitude: "40.75",
      timestamp: "",
      subtotal: "50"
    });
    expect(result.success).toBe(false);
  });
});
