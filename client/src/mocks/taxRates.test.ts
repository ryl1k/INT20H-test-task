import { describe, expect, it } from "vitest";
import { calculateTax, lookupJurisdiction } from "./taxRates";

describe("taxRates", () => {
  describe("lookupJurisdiction", () => {
    it("identifies Manhattan (New York County)", () => {
      const j = lookupJurisdiction(40.78, -73.96);
      expect(j.county).toBe("New York");
      expect(j.city).toBe("New York City");
    });

    it("identifies Brooklyn (Kings County)", () => {
      const j = lookupJurisdiction(40.65, -73.95);
      expect(j.county).toBe("Kings");
    });

    it("identifies Queens", () => {
      const j = lookupJurisdiction(40.73, -73.80);
      expect(j.county).toBe("Queens");
    });

    it("identifies Bronx", () => {
      const j = lookupJurisdiction(40.85, -73.87);
      expect(j.county).toBe("Bronx");
    });

    it("identifies Nassau County", () => {
      const j = lookupJurisdiction(40.75, -73.55);
      expect(j.county).toBe("Nassau");
    });

    it("returns Other for unknown location", () => {
      const j = lookupJurisdiction(44.5, -75.0);
      expect(j.county).toBe("Other");
    });
  });

  describe("calculateTax", () => {
    it("computes NYC tax correctly (8.875%)", () => {
      const result = calculateTax(40.78, -73.96, 100);
      expect(result.composite_tax_rate).toBeCloseTo(0.08875, 4);
      expect(result.tax_amount).toBeCloseTo(8.88, 2);
      expect(result.total_amount).toBeCloseTo(108.88, 2);
      expect(result.jurisdictions).toContain("New York");
      expect(result.jurisdictions).toContain("New York County");
    });

    it("computes Nassau County tax (8.625%)", () => {
      const result = calculateTax(40.75, -73.55, 200);
      expect(result.composite_tax_rate).toBeCloseTo(0.08625, 4);
      expect(result.tax_amount).toBeCloseTo(17.25, 2);
    });

    it("handles zero subtotal edge", () => {
      const result = calculateTax(40.78, -73.96, 0);
      expect(result.tax_amount).toBe(0);
      expect(result.total_amount).toBe(0);
    });

    it("returns jurisdictions as string array", () => {
      const result = calculateTax(40.78, -73.96, 100);
      expect(Array.isArray(result.jurisdictions)).toBe(true);
      expect(result.jurisdictions.length).toBeGreaterThan(0);
    });

    it("returns special_rate in breakdown", () => {
      const result = calculateTax(40.78, -73.96, 100);
      expect(result.breakdown).toHaveProperty("special_rate");
      expect(result.breakdown).not.toHaveProperty("special_rates");
    });
  });
});
