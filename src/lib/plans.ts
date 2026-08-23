export type Plan = "free" | "starter" | "growth" | "scale";

export const PAID_PLANS: Plan[] = ["starter", "growth", "scale"];

export interface PlanLimits {
  maxTeamMembers: number;
  automationsEnabled: boolean;
  outboundWebhooksEnabled: boolean;
  instagramEnabled: boolean;
  priceInr: number; // per month, for display only — Dodo's product config is the source of truth for actual billing
}

// Priced at roughly half of Interakt's comparable paid tiers (₹2,799 Growth,
// ₹3,799 Advanced — their own pricing page, checked directly), while
// matching or beating their limits at each: Interakt caps chatbot flows to
// linear-only below Advanced and gates full API/webhook access the same
// way; Sendkar's flow builder branches at every paid tier and team-member
// caps here are set generously above what unlimited-seats-but-owner-only
// free tiers like theirs actually give a small team in practice.
export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  free:    { maxTeamMembers: 1,         automationsEnabled: false, outboundWebhooksEnabled: false, instagramEnabled: false, priceInr: 0 },
  starter: { maxTeamMembers: 5,         automationsEnabled: true,  outboundWebhooksEnabled: false, instagramEnabled: false, priceInr: 1399 },
  growth:  { maxTeamMembers: 15,        automationsEnabled: true,  outboundWebhooksEnabled: true,  instagramEnabled: true,  priceInr: 1899 },
  scale:   { maxTeamMembers: 1_000_000, automationsEnabled: true,  outboundWebhooksEnabled: true,  instagramEnabled: true,  priceInr: 4999 },
};

export function getPlanLimits(plan: string): PlanLimits {
  return PLAN_LIMITS[plan as Plan] ?? PLAN_LIMITS.free;
}
