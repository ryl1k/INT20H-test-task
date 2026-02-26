import { describe, expect, it } from "vitest";
import { parseCsv } from "./csvParser";

describe("parseCsv", () => {
  it("parses CSV text into rows", () => {
    const csv = `id,longitude,latitude,timestamp,subtotal
1,-73.95,40.75,2025-11-15 12:00:00,50.0
2,-73.80,40.65,2025-11-16 14:00:00,120.0`;

    const rows = parseCsv(csv);
    expect(rows).toHaveLength(2);
    expect(rows[0]?.id).toBe("1");
    expect(rows[0]?.longitude).toBe("-73.95");
    expect(rows[0]?.subtotal).toBe("50.0");
  });

  it("returns empty array for empty input", () => {
    expect(parseCsv("")).toHaveLength(0);
  });

  it("skips empty lines", () => {
    const csv = `id,longitude,latitude,timestamp,subtotal
1,-73.95,40.75,2025-11-15,50.0

2,-73.80,40.65,2025-11-16,120.0`;
    const rows = parseCsv(csv);
    expect(rows).toHaveLength(2);
  });
});
