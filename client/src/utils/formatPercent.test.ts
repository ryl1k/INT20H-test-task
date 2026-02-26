import { describe, expect, it } from "vitest";
import { formatPercent } from "./formatPercent";

describe("formatPercent", () => {
  it("formats rate as percentage", () => {
    expect(formatPercent(0.08875)).toBe("8.875%");
  });

  it("formats zero", () => {
    expect(formatPercent(0)).toBe("0.000%");
  });

  it("formats small rate", () => {
    expect(formatPercent(0.00375)).toBe("0.375%");
  });
});
