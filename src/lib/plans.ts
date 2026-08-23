export type Plan = "free" | "starter" | "growth" | "scale";

export const PAID_PLANS: Plan[] = ["starter", "growth", "scale"];

export interface PlanLimits {
  maxTeamMembers: number;
  automationsEnabled: boolean;
  outboundWebhooksEnabled: boolean;
  instagramEnabled: boolean;
  priceInr: number; // per month, for display only — Dodo's product config is the source of truth for actual billing
}

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  free:    { maxTeamMembers: 1,         automationsEnabled: false, outboundWebhooksEnabled: false, instagramEnabled: false, priceInr: 0 },
  starter: { maxTeamMembers: 3,         automationsEnabled: true,  outboundWebhooksEnabled: false, instagramEnabled: false, priceInr: 999 },
  growth:  { maxTeamMembers: 10,        automationsEnabled: true,  outboundWebhooksEnabled: true,  instagramEnabled: true,  priceInr: 2999 },
  scale:   { maxTeamMembers: 1_000_000, automationsEnabled: true,  outboundWebhooksEnabled: true,  instagramEnabled: true,  priceInr: 7999 },
};

export function getPlanLimits(plan: string): PlanLimits {
  return PLAN_LIMITS[plan as Plan] ?? PLAN_LIMITS.free;
}
