// SIM-day self-check: proves (or disproves) that Sendkar's own WhatsApp number
// is really connected and ready. Read-only: it never sends a message.
//
//   node scripts/sim-day-check.mjs                 # check against the live site
//   node scripts/sim-day-check.mjs --site https://www.sendkar.shop
//   node scripts/sim-day-check.mjs --offline       # env + report format only, no network/DB
//
// Reads .env.local. Secrets are never printed (last 4 characters at most).
// Exit code 1 if anything FAILs, so it can gate a deploy.
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import {
  checkEnv, checkWorkspace, checkPhone, checkSubscribedApps, checkTemplates,
  checkWebhookHandshake, checkFlags, checkTables, formatReport, mask,
} from "../src/lib/simDayChecks.ts";

function loadEnv(file) {
  const env = {};
  if (!existsSync(file)) return env;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

const env = { ...loadEnv(resolve(process.cwd(), ".env.local")), ...process.env };
const args = process.argv.slice(2);
const offline = args.includes("--offline");
const siteIdx = args.indexOf("--site");
const site = (siteIdx >= 0 ? args[siteIdx + 1] : env.NEXT_PUBLIC_APP_URL || "https://www.sendkar.shop").replace(/\/$/, "");
const GRAPH = "https://graph.facebook.com/v22.0";

async function graph(path, token) {
  try {
    const res = await fetch(`${GRAPH}/${path}`, { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(15000) });
    return { ok: res.ok, status: res.status, body: await res.json().catch(() => ({})) };
  } catch (e) {
    return { ok: false, status: 0, body: { error: { message: String(e.message || e) } } };
  }
}

const results = [];
results.push(...checkEnv(env));
console.log(`Sendkar SIM-day check against ${site}${offline ? " (offline)" : ""}\n`);
console.log(`  system workspace: ${mask(env.SYSTEM_SENDER_WORKSPACE_ID)}   verify token: ${mask(env.WHATSAPP_WEBHOOK_VERIFY_TOKEN)}\n`);

if (!offline) {
  // 1. Workspace + token from the database
  let ws = null;
  const tableResults = [];
  if (env.NEXT_PUBLIC_SUPABASE_URL && env.SUPABASE_SECRET_KEY) {
    const { createClient } = await import("@supabase/supabase-js");
    const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY, { auth: { autoRefreshToken: false, persistSession: false } });
    if (env.SYSTEM_SENDER_WORKSPACE_ID) {
      const { data } = await sb.from("workspaces")
        .select("id, plan, trial_ends_at, whatsapp_phone_number_id, whatsapp_access_token, whatsapp_waba_id")
        .eq("id", env.SYSTEM_SENDER_WORKSPACE_ID).maybeSingle();
      ws = data;
    }
    for (const table of ["bills", "password_reset_codes", "contact_notes", "ai_image_usage", "workspaces"]) {
      const { error } = await sb.from(table).select("*", { head: true, count: "exact" }).limit(1);
      tableResults.push({ table, ok: !error, error: error?.message });
    }
    results.push(checkTables(tableResults));
  } else {
    results.push({ id: "db", status: "skip", title: "Database checks skipped: Supabase keys not set locally" });
  }
  results.push(...(env.SYSTEM_SENDER_WORKSPACE_ID ? checkWorkspace(ws) : []));

  // 2. Meta: number, subscriptions, templates
  let templateResults = [];
  if (ws?.whatsapp_access_token && ws.whatsapp_phone_number_id) {
    const phone = await graph(`${ws.whatsapp_phone_number_id}?fields=display_phone_number,verified_name,quality_rating,code_verification_status,name_status`, ws.whatsapp_access_token);
    results.push(...checkPhone(phone));
    if (!phone.ok) {
      // Same bad token would fail every Meta call; say so once.
      results.push({ id: "meta-rest", status: "skip", title: "Subscription and template checks skipped until the phone lookup works" });
    } else if (ws.whatsapp_waba_id) {
      results.push(checkSubscribedApps(await graph(`${ws.whatsapp_waba_id}/subscribed_apps`, ws.whatsapp_access_token), env.NEXT_PUBLIC_META_APP_ID));
      const tpl = await graph(`${ws.whatsapp_waba_id}/message_templates?fields=name,status,category,language,rejected_reason&limit=200`, ws.whatsapp_access_token);
      if (tpl.ok) templateResults = checkTemplates(tpl.body?.data ?? []);
      else templateResults = [{ id: "templates", status: "fail", title: `Could not list templates: ${tpl.body?.error?.message ?? `HTTP ${tpl.status}`}` }];
      results.push(...templateResults);
    }
  } else {
    results.push({ id: "meta", status: "skip", title: "Meta checks skipped: system workspace has no number/token yet (this is the SIM-day blocker)" });
  }
  results.push(...checkFlags(env, templateResults));

  // 3. Live webhook handshake
  if (env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
    const url = (token) => `${site}/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=${encodeURIComponent(token)}&hub.challenge=sendkar-check-123`;
    try {
      const g = await fetch(url(env.WHATSAPP_WEBHOOK_VERIFY_TOKEN), { signal: AbortSignal.timeout(15000) });
      const b = await fetch(url("definitely-wrong-token"), { signal: AbortSignal.timeout(15000) });
      results.push(...checkWebhookHandshake({ status: g.status, text: await g.text() }, { status: b.status }, "sendkar-check-123"));
    } catch (e) {
      results.push({ id: "webhook", status: "fail", title: `Could not reach ${site}: ${e.message}` });
    }
  }
}

const { text, failed } = formatReport(results);
console.log(text);
process.exitCode = failed ? 1 : 0;
