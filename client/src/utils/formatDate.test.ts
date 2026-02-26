import { describe, expect, it } from "vitest";
import { formatDate } from "./formatDate";

describe("formatDate", () => {
  it("formats ISO date string", () => {
    const result = formatDate("2025-11-15T12:00:00Z");
    expect(result).toContain("Nov");
    expect(result).toContain("15");
    expect(result).toContain("2025");
  });
});
