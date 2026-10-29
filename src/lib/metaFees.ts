/**
 * Meta's India list rates, per delivered message, for the public bill
 * calculator. Meta bills these to the business's own WhatsApp account — they
 * are not part of the Sendkar plan price.
 *
 * VERIFICATION STATUS: these figures come from a third-party summary of
 * Meta's INR rate card effective 1 Oct 2026 (instantdm.com), and they match
 * Meta's long-standing utility rate and its previous marketing rate plus 10%.
 * Meta's own page keeps the INR numbers in a downloadable file that was not
 * checked directly. Re-check against Meta's rate card (India, INR) before
 * leaning on them, and update here — this is the only place they live.
 */
export const META_INDIA_RATES_INR = {
  marketing: 0.8631,
  utility: 0.115,
  asOf: "1 Oct 2026",
  source: "https://developers.facebook.com/docs/whatsapp/pricing/",
} as const;

export interface FeeEstimate {
  marketing: number;
  utility: number;
  total: number;
}

const MAX_MESSAGES = 10_000_000;

function clampCount(n: number): number {
  return Number.isFinite(n) ? Math.min(Math.max(Math.floor(n), 0), MAX_MESSAGES) : 0;
}

const paise = (n: number) => Math.round(n * 100) / 100;

export function estimateMonthlyMetaFees(marketingMessages: number, utilityMessages: number): FeeEstimate {
  const marketing = paise(clampCount(marketingMessages) * META_INDIA_RATES_INR.marketing);
  const utility = paise(clampCount(utilityMessages) * META_INDIA_RATES_INR.utility);
  return { marketing, utility, total: paise(marketing + utility) };
}
