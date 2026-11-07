// Pure evaluators for scripts/sim-day-check.mjs. No imports and no I/O so that
// Node can run this file directly and vitest can test it. The script does the
// network calls and feeds the responses in here.

export type CheckStatus = "pass" | "fail" | "warn" | "skip";
export interface CheckResult {
  id: string;
  status: CheckStatus;
  title: string;
  detail?: string;
  fix?: string;
}

export const SYSTEM_TEMPLATES = [
  { name: "sendkar_password_reset_otp", category: "AUTHENTICATION" },
  { name: "sendkar_daily_summary", category: "UTILITY" },
] as const;

const REQUIRED_ENV = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SECRET_KEY",
  "NEXT_PUBLIC_META_APP_ID",
  "META_APP_SECRET",
  "WHATSAPP_WEBHOOK_VERIFY_TOKEN",
  "NEXT_PUBLIC_META_EMBEDDED_SIGNUP_CONFIG_ID",
  "SYSTEM_SENDER_WORKSPACE_ID",
  "CRON_SECRET",
];

export function mask(value: string | undefined | null): string {
  if (!value) return "(not set)";
  return value.length <= 8 ? "****" : `…${value.slice(-4)}`;
}

export function checkEnv(env: Record<string, string | undefined>): CheckResult[] {
  const missing = REQUIRED_ENV.filter((k) => !env[k]);
  return [
    missing.length === 0
      ? { id: "env", status: "pass", title: "Required environment variables are set locally" }
      : {
          id: "env",
          status: "fail",
          title: `Missing environment variables: ${missing.join(", ")}`,
          fix: "Set them in .env.local to run this check, and on Vercel for the live site, then redeploy.",
        },
  ];
}

export interface WorkspaceRow {
  id?: string;
  plan?: string | null;
  trial_ends_at?: string | null;
  whatsapp_phone_number_id?: string | null;
  whatsapp_access_token?: string | null;
  whatsapp_waba_id?: string | null;
}

export function checkWorkspace(ws: WorkspaceRow | null): CheckResult[] {
  if (!ws) {
    return [{ id: "workspace", status: "fail", title: "System sender workspace not found", fix: "Check SYSTEM_SENDER_WORKSPACE_ID is the id of the 'Sendkar System' workspace." }];
  }
  const out: CheckResult[] = [];
  const missing = [
    !ws.whatsapp_phone_number_id && "phone number id",
    !ws.whatsapp_access_token && "access token",
    !ws.whatsapp_waba_id && "business account id",
  ].filter(Boolean);
  out.push(
    missing.length
      ? { id: "workspace-connection", status: "fail", title: `System workspace has no WhatsApp ${missing.join(", ")}`, fix: "Step 5 of the checklist: enter Phone number ID, Business Account ID and the system-user token in its Onboarding." }
      : { id: "workspace-connection", status: "pass", title: "System workspace has a number, business account and token saved" },
  );
  const planOk = !!ws.plan && !["free", "trial"].includes(ws.plan);
  out.push(
    planOk && !ws.trial_ends_at
      ? { id: "workspace-plan", status: "pass", title: `System workspace plan is '${ws.plan}' with no trial expiry` }
      : { id: "workspace-plan", status: "fail", title: `System workspace plan is '${ws.plan ?? "none"}'${ws.trial_ends_at ? " and has a trial end date" : ""}, so sending could be blocked`, fix: "update workspaces set plan = 'scale', trial_ends_at = null where id = '<system workspace id>';" },
  );
  return out;
}

export interface GraphResult {
  ok: boolean;
  status: number;
  body: any;
}

export function checkPhone(r: GraphResult): CheckResult[] {
  if (!r.ok) {
    const msg = r.body?.error?.message ?? `HTTP ${r.status}`;
    const expired = r.body?.error?.code === 190;
    return [{ id: "phone", status: "fail", title: `Meta rejected the phone number lookup: ${msg}`, fix: expired ? "The token is invalid or expired. Create a system-user token with no expiry (checklist step 4)." : "Check the Phone number ID and that the token has whatsapp_business_management." }];
  }
  const b = r.body ?? {};
  const out: CheckResult[] = [
    { id: "phone", status: "pass", title: `Number ${b.display_phone_number ?? "?"} reachable as "${b.verified_name ?? "?"}"` },
  ];
  const q = String(b.quality_rating ?? "UNKNOWN").toUpperCase();
  out.push(
    q === "GREEN"
      ? { id: "quality", status: "pass", title: "Quality rating GREEN" }
      : q === "RED"
        ? { id: "quality", status: "fail", title: "Quality rating RED: sending will be restricted", fix: "Stop sending to anyone who has not agreed and wait for the rating to recover." }
        : { id: "quality", status: "warn", title: `Quality rating ${q}`, detail: q === "UNKNOWN" ? "Normal for a brand-new number with no sends yet." : "Watch blocks and reports." },
  );
  if (b.code_verification_status && String(b.code_verification_status).toUpperCase() !== "VERIFIED") {
    out.push({ id: "verification", status: "fail", title: `Number verification is ${b.code_verification_status}`, fix: "Finish the SMS or call verification in WhatsApp Manager (checklist step 3)." });
  }
  if (b.name_status && !["APPROVED", "AVAILABLE_WITHOUT_REVIEW"].includes(String(b.name_status).toUpperCase())) {
    out.push({ id: "display-name", status: "warn", title: `Display name status is ${b.name_status}`, detail: "A pending name can take a few hours." });
  }
  return out;
}

export function checkSubscribedApps(r: GraphResult, appId: string | undefined): CheckResult {
  if (!r.ok) return { id: "subscribed", status: "fail", title: `Could not read webhook subscriptions: ${r.body?.error?.message ?? `HTTP ${r.status}`}` };
  const apps: any[] = r.body?.data ?? [];
  const hit = apps.some((a) => String(a?.whatsapp_business_api_data?.id ?? a?.id ?? "") === String(appId));
  if (!appId) return { id: "subscribed", status: "warn", title: "Cannot confirm the app is subscribed: NEXT_PUBLIC_META_APP_ID is not set" };
  return hit
    ? { id: "subscribed", status: "pass", title: "The Sendkar app is subscribed to this business account's webhooks" }
    : { id: "subscribed", status: "fail", title: "The Sendkar app is not subscribed to this business account", fix: "Connect it through Sendkar's onboarding, or POST /{waba_id}/subscribed_apps." };
}

export interface TemplateRow {
  name: string;
  status: string;
  category?: string;
  language?: string;
  rejected_reason?: string;
}

export function checkTemplates(rows: TemplateRow[]): CheckResult[] {
  const out: CheckResult[] = [];
  for (const want of SYSTEM_TEMPLATES) {
    const hits = rows.filter((t) => t.name === want.name);
    if (!hits.length) {
      out.push({ id: `tpl-${want.name}`, status: "fail", title: `Template ${want.name} does not exist`, fix: `Create it in WhatsApp Manager as ${want.category} (checklist step 6).` });
      continue;
    }
    const approved = hits.find((t) => t.status === "APPROVED");
    if (approved) {
      const wrongCat = approved.category && approved.category !== want.category;
      out.push(wrongCat
        ? { id: `tpl-${want.name}`, status: "warn", title: `${want.name} is approved but categorised ${approved.category}, expected ${want.category}`, detail: "Meta may re-categorise; check pricing." }
        : { id: `tpl-${want.name}`, status: "pass", title: `${want.name} approved` });
      continue;
    }
    const rejected = hits.find((t) => t.status === "REJECTED");
    out.push(rejected
      ? { id: `tpl-${want.name}`, status: "fail", title: `${want.name} was REJECTED`, detail: rejected.rejected_reason ? `Reason: ${rejected.rejected_reason}` : undefined, fix: "Edit and resubmit; write the reason down (checklist section 8)." }
      : { id: `tpl-${want.name}`, status: "warn", title: `${want.name} is ${hits[0].status}`, detail: "Wait for approval before turning the matching flag on." });
  }
  const sk = rows.filter((t) => t.name.startsWith("sk_"));
  if (sk.length) {
    const by: Record<string, number> = {};
    for (const t of sk) by[t.status] = (by[t.status] ?? 0) + 1;
    out.push({ id: "tpl-sk", status: by.REJECTED ? "warn" : "pass", title: `${sk.length} Sendkar bill/reminder template(s): ${Object.entries(by).map(([k, v]) => `${v} ${k.toLowerCase()}`).join(", ")}`, detail: sk.filter((t) => t.status === "REJECTED").map((t) => `${t.name}: ${t.rejected_reason ?? "no reason given"}`).join("; ") || undefined });
  }
  return out;
}

export function checkWebhookHandshake(good: { status: number; text: string }, bad: { status: number }, challenge: string): CheckResult[] {
  return [
    good.status === 200 && good.text.trim() === challenge
      ? { id: "webhook", status: "pass", title: "Live webhook answers Meta's handshake with the local verify token" }
      : { id: "webhook", status: "fail", title: `Live webhook handshake failed (HTTP ${good.status})`, fix: "WHATSAPP_WEBHOOK_VERIFY_TOKEN on Vercel must equal the one in Meta's webhook settings and in .env.local. Redeploy after changing it." },
    bad.status === 403 || bad.status === 401
      ? { id: "webhook-reject", status: "pass", title: "Live webhook rejects a wrong verify token" }
      : { id: "webhook-reject", status: "fail", title: `Live webhook accepted a wrong verify token (HTTP ${bad.status})`, fix: "The verify token check is not enforced; fix before going live." },
  ];
}

export function checkFlags(env: Record<string, string | undefined>, templates: CheckResult[]): CheckResult[] {
  const approved = (name: string) => templates.some((t) => t.id === `tpl-${name}` && t.status === "pass");
  const out: CheckResult[] = [];
  const otpOn = env.SIGNUP_OTP_REQUIRED === "true";
  const sumOn = env.DAILY_SUMMARY_WHATSAPP === "true";
  if (otpOn && !approved("sendkar_password_reset_otp")) out.push({ id: "flag-otp", status: "fail", title: "SIGNUP_OTP_REQUIRED=true but the OTP template is not approved: new signups will be locked out", fix: "Turn the flag off until the template is approved." });
  if (sumOn && !approved("sendkar_daily_summary")) out.push({ id: "flag-summary", status: "warn", title: "DAILY_SUMMARY_WHATSAPP=true but the summary template is not approved: summaries will silently fail" });
  if (!out.length) out.push({ id: "flags", status: "pass", title: `Feature flags consistent (OTP ${otpOn ? "on" : "off"}, daily summary ${sumOn ? "on" : "off"})` });
  return out;
}

export function checkTables(results: { table: string; ok: boolean; error?: string }[]): CheckResult {
  const bad = results.filter((r) => !r.ok);
  return bad.length
    ? { id: "tables", status: "fail", title: `Missing or unreadable tables: ${bad.map((b) => b.table).join(", ")}`, fix: "Apply the missing migrations in supabase/migrations." }
    : { id: "tables", status: "pass", title: `Key tables exist (${results.map((r) => r.table).join(", ")})` };
}

const ICON: Record<CheckStatus, string> = { pass: "PASS", fail: "FAIL", warn: "WARN", skip: "SKIP" };

export function formatReport(results: CheckResult[]): { text: string; failed: number; warned: number } {
  const lines: string[] = [];
  for (const r of results) {
    lines.push(`[${ICON[r.status]}] ${r.title}`);
    if (r.detail) lines.push(`        ${r.detail}`);
    if (r.status === "fail" && r.fix) lines.push(`        -> ${r.fix}`);
  }
  const failed = results.filter((r) => r.status === "fail").length;
  const warned = results.filter((r) => r.status === "warn").length;
  lines.push("", failed ? `${failed} problem(s) to fix before SIM day is done.` : warned ? `No blockers. ${warned} thing(s) to keep an eye on.` : "All checks passed. Move on to the tests in section 7.");
  return { text: lines.join("\n"), failed, warned };
}
