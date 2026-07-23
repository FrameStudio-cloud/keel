import { describe, it, expect, beforeEach } from "vitest";
import { getPaymentMethods, setPaymentConfig, getDefaultPayment } from "./paymentConfig";

describe("paymentConfig", () => {
  beforeEach(() => {
    setPaymentConfig(["Cash", "M-Pesa", "Bank"], "Cash");
  });

  describe("getPaymentMethods", () => {
    it("returns default methods", () => {
      expect(getPaymentMethods()).toEqual(["Cash", "M-Pesa", "Bank"]);
    });

    it("returns updated methods after setPaymentConfig", () => {
      setPaymentConfig(["Card", "M-Pesa"], undefined);
      expect(getPaymentMethods()).toEqual(["Card", "M-Pesa"]);
    });

    it("returns empty array when set to empty", () => {
      setPaymentConfig([], "Cash");
      expect(getPaymentMethods()).toEqual([]);
    });
  });

  describe("getDefaultPayment", () => {
    it("returns default payment method", () => {
      expect(getDefaultPayment()).toBe("Cash");
    });

    it("returns updated default after setPaymentConfig", () => {
      setPaymentConfig(undefined, "M-Pesa");
      expect(getDefaultPayment()).toBe("M-Pesa");
    });

    it("does not change default when not provided", () => {
      setPaymentConfig(["Card"], undefined);
      expect(getDefaultPayment()).toBe("Cash");
    });
  });
});
