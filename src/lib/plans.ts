export type Plan = "free" | "starter" | "growth" | "scale";

export const PAID_PLANS: Plan[] = ["starter", "growth", "scale"];

export interface PlanLimits {
  maxTeamMembers: number;
  automationsEnabled: boolean;
  outboundWebhooksEnabled: boolean;
  instagramEnabled: boolean;
  catalogEnabled: boolean;
  priceInr: number; // per month, for display only — Dodo's product config is the source of truth for actual billing
}

// Priced at roughly half of Interakt's comparable paid tiers (₹2,799 Growth,
// ₹3,799 Advanced — their own pricing page, checked directly, one tier up:
// Sendkar Starter vs their Growth, Sendkar Growth vs their Advanced), while
// matching or beating their limits at each. That includes seats: Interakt
// gives unlimited agents starting at their Starter tier, so a 5- or 15-seat
// cap on Sendkar's paid tiers would undercut the exact claim being made —
// every paid tier here is uncapped on seats too, same as theirs. Chatbot
// flows still branch at every paid tier here, where Interakt keeps that
// linear-only below their Advanced tier.
export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  free:    { maxTeamMembers: 1,         automationsEnabled: false, outboundWebhooksEnabled: false, instagramEnabled: false, catalogEnabled: false, priceInr: 0 },
  starter: { maxTeamMembers: 1_000_000, automationsEnabled: true,  outboundWebhooksEnabled: false, instagramEnabled: false, catalogEnabled: false, priceInr: 1399 },
  growth:  { maxTeamMembers: 1_000_000, automationsEnabled: true,  outboundWebhooksEnabled: true,  instagramEnabled: true,  catalogEnabled: true,  priceInr: 1899 },
  scale:   { maxTeamMembers: 1_000_000, automationsEnabled: true,  outboundWebhooksEnabled: true,  instagramEnabled: true,  catalogEnabled: true,  priceInr: 4999 },
};

export function getPlanLimits(plan: string): PlanLimits {
  return PLAN_LIMITS[plan as Plan] ?? PLAN_LIMITS.free;
}
