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
 *
 * Re-checked 7 Nov 2026: several independent sources (Route Mobile, ecorpit,
 * Free Press Journal) agree on 0.8631 marketing / 0.115 utility, and say the
 * 0.7846 → 0.8631 marketing rise happened on 1 Jan 2026. Meta's own pricing
 * pages render the INR figures only through a selector, so they still were not
 * read first-hand.
 *
 * OPEN: these are ex-tax. One source says 18% GST applies to Meta's charges in
 * India (a GST-registered shop can usually claim it back as input credit, an
 * unregistered one cannot). The public calculator does not say "+ GST" yet.
 * Confirm with an accountant before changing the copy, in all seven languages.
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
