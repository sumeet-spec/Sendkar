/**
 * "free" no longer exists as something you can choose. It is what a workspace
 * is when it has NO active plan: a trial that ended, or a subscription that was
 * cancelled. It can look around but cannot send or connect anything.
 */
export type Plan = "free" | "trial" | "starter" | "growth" | "scale";

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

/** A new account gets this many days with the whole product, no card needed. */
export const TRIAL_DAYS = 7;
/** Images during the trial: each is a real Gemini charge (about ₹3.5), so a small taste, not a tier. */
export const TRIAL_IMAGES = 5;

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  free:    { maxTeamMembers: 1,         automationsEnabled: false, outboundWebhooksEnabled: false, instagramEnabled: false, catalogEnabled: false, aiAgentEnabled: false, maxWhatsAppNumbers: 0, imagesPerMonth: 0, priceInr: 0 },
  // The trial shows everything a paid plan can do, on one number, so people judge the real product.
  trial:   { maxTeamMembers: 1_000_000, automationsEnabled: true,  outboundWebhooksEnabled: true,  instagramEnabled: true,  catalogEnabled: true,  aiAgentEnabled: true,  maxWhatsAppNumbers: 1, imagesPerMonth: TRIAL_IMAGES, priceInr: 0 },
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
      ? "Connecting a WhatsApp number needs an active plan. Choose one in Billing."
      : `Your ${plan} plan includes ${allowed} WhatsApp number${allowed === 1 ? "" : "s"}. Upgrade in Billing to connect more.`;
  }
  return { allowed, connected, remaining, canAdd, blockedReason };
}

export interface ImageAllowance {
  /** The plan's monthly allowance. */
  limit: number;
  /** Used from the monthly allowance this month. */
  used: number;
  /** Extra images bought as packs and not yet used. They never expire. */
  packBalance: number;
  /** Monthly allowance left plus pack balance: what can be generated right now. */
  remaining: number;
  exhausted: boolean;
  blockedReason: string | null;
}

/**
 * `usedThisMonth` is images drawn from the monthly allowance. Purchased packs
 * are spent only after it runs out, and they carry over from month to month.
 */
export function imageAllowance(plan: string, usedThisMonth: number, packBalance = 0): ImageAllowance {
  const limit = getPlanLimits(plan).imagesPerMonth;
  const monthlyLeft = Math.max(limit - usedThisMonth, 0);
  const packs = Math.max(packBalance, 0);
  const remaining = monthlyLeft + packs;
  const exhausted = remaining === 0;
  let blockedReason: string | null = null;
  if (exhausted) {
    blockedReason = limit === 0
      ? "AI images come with an active plan. Choose one in Billing."
      : `You have used all ${limit} AI images for this month. They reset on the 1st — or buy an image pack in Billing to keep going now.`;
  }
  return { limit, used: usedThisMonth, packBalance: packs, remaining, exhausted, blockedReason };
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
  if (plan === "trial") return ["1 WhatsApp number", `${l.imagesPerMonth} AI images`, `Everything unlocked for ${TRIAL_DAYS} days`];
  if (l.maxWhatsAppNumbers === 0) return ["No WhatsApp number — choose a plan to connect one"];
  return [
    l.maxWhatsAppNumbers === 1 ? "1 WhatsApp number" : `Up to ${l.maxWhatsAppNumbers} WhatsApp numbers`,
    `${l.imagesPerMonth} AI images a month`,
  ];
}

// ── Trial, and what "plan" really means right now ──────────────────────────

interface PlanHolder {
  plan: string;
  trial_ends_at?: string | null;
}

/**
 * The plan to apply limits for. A trial that has run out counts as no plan at
 * all ("free"), whatever the stored value says: expiry is computed from the
 * clock, so nothing has to run at the moment a trial ends.
 */
export function effectivePlan(w: PlanHolder, now: Date = new Date()): string {
  if (w.plan !== "trial") return w.plan;
  return w.trial_ends_at && new Date(w.trial_ends_at) > now ? "trial" : "free";
}

/** Whole days left in an active trial (a partial day counts), or null when not on a trial. */
export function trialDaysLeft(w: PlanHolder, now: Date = new Date()): number | null {
  if (w.plan !== "trial" || !w.trial_ends_at) return null;
  const ms = new Date(w.trial_ends_at).getTime() - now.getTime();
  return ms > 0 ? Math.ceil(ms / 86_400_000) : 0;
}

/** True once a trial has ended without a plan being bought. */
export function trialExpired(w: PlanHolder, now: Date = new Date()): boolean {
  return w.plan === "trial" && effectivePlan(w, now) === "free";
}

/** Whether a workspace may send messages at all. No plan, no sending. */
export function canSendWithPlan(effective: string): boolean {
  return effective !== "free" && effective in PLAN_LIMITS;
}

export function workspaceCanSend(w: PlanHolder, now: Date = new Date()): boolean {
  return canSendWithPlan(effectivePlan(w, now));
}

/** A plan name for people to read. */
export function planLabel(plan: string): string {
  return plan === "trial" ? "free trial" : plan === "free" ? "no active plan" : plan;
}

// ── Extra AI image packs ────────────────────────────────────────────────────
// Bought once, never expire, and are used only after the monthly allowance runs
// out. Each image costs about ₹3.5 to generate (Gemini), more with retries, so
// these are priced at roughly ₹12-15 an image. Prices are yours to change here;
// the matching one-time products must exist in Dodo, with their ids in the env
// variable named below.

export interface ImagePack {
  key: string;
  images: number;
  priceInr: number;
  /** Env var holding the Dodo product id for this pack. */
  envVar: string;
}

export const IMAGE_PACKS: ImagePack[] = [
  { key: "images_10", images: 10, priceInr: 149, envVar: "DODO_PRODUCT_IMAGES_10" },
  { key: "images_30", images: 30, priceInr: 399, envVar: "DODO_PRODUCT_IMAGES_30" },
  { key: "images_100", images: 100, priceInr: 1199, envVar: "DODO_PRODUCT_IMAGES_100" },
];

export function findImagePack(key: string): ImagePack | undefined {
  return IMAGE_PACKS.find((p) => p.key === key);
}

/** What a brand-new account is created with: the trial plan, ending TRIAL_DAYS from now. */
export function trialStartFields(now: Date = new Date()): { plan: "trial"; trial_ends_at: string } {
  return { plan: "trial", trial_ends_at: new Date(now.getTime() + TRIAL_DAYS * 86_400_000).toISOString() };
}
