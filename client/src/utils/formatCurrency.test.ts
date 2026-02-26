import { describe, expect, it } from "vitest";
import { formatCurrency } from "./formatCurrency";

describe("formatCurrency", () => {
  it("formats dollars with cents", () => {
    expect(formatCurrency(100)).toBe("$100.00");
  });

  it("formats with comma separator", () => {
    expect(formatCurrency(1234.56)).toBe("$1,234.56");
  });

  it("formats zero", () => {
    expect(formatCurrency(0)).toBe("$0.00");
  });
});
