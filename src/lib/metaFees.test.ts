import { describe, it, expect } from "vitest";
import { estimateMonthlyMetaFees, META_INDIA_RATES_INR } from "./metaFees";

describe("estimateMonthlyMetaFees", () => {
  it("prices marketing and utility messages separately", () => {
    const e = estimateMonthlyMetaFees(1000, 2000);
    expect(e.marketing).toBe(863.1);
    expect(e.utility).toBe(230);
    expect(e.total).toBe(1093.1);
  });
  it("is zero for no messages", () => expect(estimateMonthlyMetaFees(0, 0).total).toBe(0));
  it("treats junk and negative input as zero instead of showing NaN", () => {
    expect(estimateMonthlyMetaFees(NaN, -5).total).toBe(0);
    expect(estimateMonthlyMetaFees(Infinity, 0).total).toBe(0);
  });
  it("caps absurd input", () => {
    expect(estimateMonthlyMetaFees(1e15, 0).marketing).toBe(Math.round(10_000_000 * META_INDIA_RATES_INR.marketing * 100) / 100);
  });
  it("floors fractional counts", () => expect(estimateMonthlyMetaFees(10.9, 0).marketing).toBe(8.63));
});
