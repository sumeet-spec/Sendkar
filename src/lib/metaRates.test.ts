import { describe, it, expect } from "vitest";
import { estimateCampaignCostInr, type RateCardRow } from "./metaRates";

const RATES: RateCardRow[] = [
  { category: "MARKETING", price_inr: 0.958 },
  { category: "UTILITY", price_inr: 0.15 },
];

describe("estimateCampaignCostInr", () => {
  it("multiplies recipient count by the category's rate", () => {
    expect(estimateCampaignCostInr(1000, "MARKETING", RATES)).toBe(958);
  });

  it("returns 0 for a category with no rate row", () => {
    expect(estimateCampaignCostInr(1000, "AUTHENTICATION", RATES)).toBe(0);
  });

  it("rounds to 2 decimal places", () => {
    expect(estimateCampaignCostInr(3, "UTILITY", RATES)).toBe(0.45);
  });
});
