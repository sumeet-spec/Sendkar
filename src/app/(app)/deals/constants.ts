// Deliberately NOT in actions.ts — that file is "use server", which only
// allows exporting async server actions. A plain const array export from a
// "use server" module silently breaks for anything importing it (client
// components, SSR) instead of erroring at build time — confirmed live, this
// is exactly what crashed /deals in production.
export const DEAL_STAGES = ["new", "contacted", "negotiating", "won", "lost"] as const;
export type DealStage = (typeof DEAL_STAGES)[number];
