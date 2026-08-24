/**
 * Cost-transparency meter — estimates a campaign's Meta message fees before
 * it sends, using the rate card seeded in migration 0014 (checked against
 * Interakt's published India card). Includes the service-message rate that
 * starts billing October 1, 2026, so the estimate doesn't quietly go stale
 * the moment that change lands.
 */

export type TemplateCategory = "MARKETING" | "UTILITY" | "AUTHENTICATION" | "SERVICE";

export interface RateCardRow {
  category: string;
  price_inr: number;
}

export function estimateCampaignCostInr(recipientCount: number, category: TemplateCategory, rates: RateCardRow[]): number {
  const rate = rates.find((r) => r.category === category)?.price_inr ?? 0;
  return Math.round(recipientCount * rate * 100) / 100;
}
