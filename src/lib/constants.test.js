import { describe, it, expect } from "vitest";
import { CRITICAL_STOCK_THRESHOLD } from "./constants";

describe("constants", () => {
  it("CRITICAL_STOCK_THRESHOLD is 2", () => {
    expect(CRITICAL_STOCK_THRESHOLD).toBe(2);
  });
});
