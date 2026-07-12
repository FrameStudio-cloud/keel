import { describe, it, expect, beforeEach } from "vitest";
import { formatPrice, setCurrency, getCurrency } from "./format";

describe("format", () => {
  beforeEach(() => {
    setCurrency("KSh");
  });

  describe("getCurrency / setCurrency", () => {
    it("defaults to KSh", () => {
      expect(getCurrency()).toBe("KSh");
    });

    it("setCurrency changes the symbol", () => {
      setCurrency("KES");
      expect(getCurrency()).toBe("KES");
    });

    it("setCurrency accepts empty string", () => {
      setCurrency("");
      expect(getCurrency()).toBe("");
    });
  });

  describe("formatPrice", () => {
    it("formats a number with default currency", () => {
      expect(formatPrice(1500)).toBe("KSh 1,500");
    });

    it("formats zero", () => {
      expect(formatPrice(0)).toBe("KSh 0");
    });

    it("handles null/undefined", () => {
      expect(formatPrice(null)).toBe("KSh 0");
      expect(formatPrice(undefined)).toBe("KSh 0");
    });

    it("formats large numbers with commas", () => {
      expect(formatPrice(1000000)).toBe("KSh 1,000,000");
    });

    it("uses the current currency symbol", () => {
      setCurrency("KES");
      expect(formatPrice(500)).toBe("KES 500");
    });

    it("formats decimal amounts", () => {
      expect(formatPrice(99.99)).toBe("KSh 99.99");
    });
  });
});
