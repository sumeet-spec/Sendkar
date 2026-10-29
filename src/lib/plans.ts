export type Plan = "free" | "starter" | "growth" | "scale";

export const PAID_PLANS: Plan[] = ["starter", "growth", "scale"];

export interface PlanLimits {
  maxTeamMembers: number;
  automationsEnabled: boolean;
  outboundWebhooksEnabled: boolean;
  instagramEnabled: boolean;
  catalogEnabled: boolean;
  aiAgentEnabled: boolean;
  /** How many WhatsApp numbers the workspace may connect (the default number plus any extras). */
  maxWhatsAppNumbers: number;
  /** AI-generated images per calendar month. Each one is a real Gemini charge, so this is a hard cap. */
  imagesPerMonth: number;
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
/**
 * Packages are sold by number of WhatsApp numbers (SIMs): 1, up to 5, up to 10.
 * Free cannot connect a number at all — it is a look-around account, not an
 * automation plan. AI images scale with numbers: IMAGES_PER_NUMBER each.
 * Connections made before a limit existed are never disconnected (see
 * numberAllowance): limits only stop NEW connections.
 */
export const IMAGES_PER_NUMBER = 10;

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  free:    { maxTeamMembers: 1,         automationsEnabled: false, outboundWebhooksEnabled: false, instagramEnabled: false, catalogEnabled: false, aiAgentEnabled: false, maxWhatsAppNumbers: 0, imagesPerMonth: 0, priceInr: 0 },
  starter: { maxTeamMembers: 1_000_000, automationsEnabled: true,  outboundWebhooksEnabled: false, instagramEnabled: false, catalogEnabled: false, aiAgentEnabled: false, maxWhatsAppNumbers: 1, imagesPerMonth: 1 * IMAGES_PER_NUMBER, priceInr: 1399 },
  growth:  { maxTeamMembers: 1_000_000, automationsEnabled: true,  outboundWebhooksEnabled: true,  instagramEnabled: true,  catalogEnabled: true,  aiAgentEnabled: true,  maxWhatsAppNumbers: 5, imagesPerMonth: 5 * IMAGES_PER_NUMBER, priceInr: 1899 },
  scale:   { maxTeamMembers: 1_000_000, automationsEnabled: true,  outboundWebhooksEnabled: true,  instagramEnabled: true,  catalogEnabled: true,  aiAgentEnabled: true,  maxWhatsAppNumbers: 10, imagesPerMonth: 10 * IMAGES_PER_NUMBER, priceInr: 4999 },
};

export function getPlanLimits(plan: string): PlanLimits {
  return PLAN_LIMITS[plan as Plan] ?? PLAN_LIMITS.free;
}

// ── Allowances (pure, so they can be tested without a database) ─────────────

export interface NumberAllowance {
  allowed: number;
  connected: number;
  remaining: number;
  canAdd: boolean;
  /** Why another number can't be added, in words for the customer. Null when it can. */
  blockedReason: string | null;
}

/**
 * `connected` counts the default number plus extras. A workspace already over
 * its limit (it downgraded, or connected before limits existed) keeps what it
 * has; it just cannot add more.
 */
export function numberAllowance(plan: string, connected: number): NumberAllowance {
  const allowed = getPlanLimits(plan).maxWhatsAppNumbers;
  const remaining = Math.max(allowed - connected, 0);
  const canAdd = connected < allowed;
  let blockedReason: string | null = null;
  if (!canAdd) {
    blockedReason = allowed === 0
      ? "Connecting a WhatsApp number needs a paid plan. Choose one in Billing."
      : `Your ${plan} plan includes ${allowed} WhatsApp number${allowed === 1 ? "" : "s"}. Upgrade in Billing to connect more.`;
  }
  return { allowed, connected, remaining, canAdd, blockedReason };
}

export interface ImageAllowance {
  limit: number;
  used: number;
  remaining: number;
  exhausted: boolean;
  blockedReason: string | null;
}

export function imageAllowance(plan: string, usedThisMonth: number): ImageAllowance {
  const limit = getPlanLimits(plan).imagesPerMonth;
  const remaining = Math.max(limit - usedThisMonth, 0);
  const exhausted = remaining === 0;
  let blockedReason: string | null = null;
  if (exhausted) {
    blockedReason = limit === 0
      ? "AI images are included with paid plans. Choose one in Billing."
      : `You have used all ${limit} AI images for this month. They reset on the 1st, or upgrade in Billing for more.`;
  }
  return { limit, used: usedThisMonth, remaining, exhausted, blockedReason };
}

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

/** The instant the current calendar month began in India (00:00 IST on the 1st). */
export function monthStartIst(now: Date = new Date()): Date {
  const ist = new Date(now.getTime() + IST_OFFSET_MS);
  return new Date(Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), 1) - IST_OFFSET_MS);
}

/** When the monthly image allowance next resets: 00:00 IST on the 1st of next month. */
export function nextMonthStartIst(now: Date = new Date()): Date {
  const ist = new Date(now.getTime() + IST_OFFSET_MS);
  return new Date(Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth() + 1, 1) - IST_OFFSET_MS);
}

/** The lines that describe a plan's allowances — one source for the pricing page and Billing. */
export function allowanceLines(plan: string): string[] {
  const l = getPlanLimits(plan);
  if (l.maxWhatsAppNumbers === 0) return ["No WhatsApp number — upgrade to connect one"];
  return [
    l.maxWhatsAppNumbers === 1 ? "1 WhatsApp number" : `Up to ${l.maxWhatsAppNumbers} WhatsApp numbers`,
    `${l.imagesPerMonth} AI images a month`,
  ];
}
