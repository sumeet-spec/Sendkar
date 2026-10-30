import type { createAdminClient } from "@/lib/supabase/admin";
import { sendTemplateMessage, submitTemplateToMeta, type WorkspaceCreds } from "@/lib/whatsapp";
import { PACK_TEMPLATES, REORDER_ITEM_TEMPLATE, billMessageLang, buildPackTemplate, type PackLang } from "@/lib/templatePack";
import { workspaceCanSend } from "@/lib/plans";
import { todayInIndia } from "@/lib/reminders";
import { AUTO_TAGS, bigSpenderThreshold, computeAutoTags } from "./autoTags";
import { reorderCandidates } from "./reorder";
import { OCCASION_WORD, isOccasionToday, type Occasion } from "./dates";

type Admin = ReturnType<typeof createAdminClient>;

const CUSTOMER_WORD: Record<PackLang, string> = { en: "Customer", hi: "ग्राहक", gu: "ગ્રાહક" };
const clean = (s: string) => s.replace(/\s+/g, " ").trim().slice(0, 60) || "-";

// ── Auto tags ─────────────────────────────────────────────────────────────

/** Recalculates the system tags for a shop's customers (all of them, or just `contactIds`), writing only what changed. */
export async function refreshAutoTags(admin: Admin, workspaceId: string, contactIds?: string[], now: Date = new Date()): Promise<number> {
  // A few customers (right after a bill) only need their own bills; the whole shop is read for the daily run, which is
  // also where "big spender" is decided, since that compares customers with each other.
  let billsQuery = admin.from("bills").select("contact_id, amount, paid, created_at").eq("workspace_id", workspaceId).not("contact_id", "is", null).limit(30000);
  if (contactIds) billsQuery = billsQuery.in("contact_id", contactIds);
  const { data: bills } = await billsQuery;
  if (!bills?.length) return 0;

  const byContact = new Map<string, Array<{ amount: number; paid: boolean; created_at: string }>>();
  for (const b of bills) {
    const list = byContact.get(b.contact_id as string) ?? [];
    list.push({ amount: Number(b.amount), paid: b.paid, created_at: b.created_at });
    byContact.set(b.contact_id as string, list);
  }
  const threshold = bigSpenderThreshold([...byContact.values()].map((l) => l.reduce((s, b) => s + b.amount, 0)));

  const ids = contactIds ? contactIds.filter((id) => byContact.has(id)) : [...byContact.keys()];
  if (!ids.length) return 0;
  const { data: contacts } = await admin.from("contacts").select("id, credit_limit, auto_tags").eq("workspace_id", workspaceId).in("id", ids.slice(0, 5000));

  let changed = 0;
  for (const c of contacts ?? []) {
    let next = computeAutoTags({ bills: byContact.get(c.id) ?? [], creditLimit: c.credit_limit === null ? null : Number(c.credit_limit), now, bigSpenderFrom: threshold });
    if (contactIds && ((c.auto_tags ?? []) as string[]).includes("big_spender") && !next.includes("big_spender")) next = [...next, "big_spender"];
    const have = ((c.auto_tags ?? []) as string[]).filter((t) => (AUTO_TAGS as string[]).includes(t)).sort().join(",");
    if (have === [...next].sort().join(",")) continue;
    await admin.from("contacts").update({ auto_tags: next }).eq("id", c.id);
    changed++;
  }
  return changed;
}

// ── Message templates the care messages use ──────────────────────────────

export const CARE_TEMPLATE_KEYS = ["birthday_anniversary", "reorder_item"] as const;

const careTemplates = () => [PACK_TEMPLATES.find((t) => t.key === "birthday_anniversary")!, REORDER_ITEM_TEMPLATE];

interface CareWorkspace extends WorkspaceCreds {
  id: string;
  name: string;
  whatsapp_waba_id: string | null;
  whatsapp_access_token: string | null;
}

/** Submits the birthday and restock messages to the shop's own WhatsApp account in each language, once. */
export async function installCareTemplates(admin: Admin, ws: CareWorkspace, languages: PackLang[]): Promise<{ submitted: number; problems: string[] }> {
  if (!ws.whatsapp_waba_id || !ws.whatsapp_access_token) return { submitted: 0, problems: ["Connect your WhatsApp number first."] };
  const wanted = careTemplates().flatMap((t) => languages.map((l) => buildPackTemplate(t, l)));
  const { data: existing } = await admin.from("templates").select("meta_template_name").eq("workspace_id", ws.id).in("meta_template_name", wanted.map((w) => w.metaName));
  const have = new Set((existing ?? []).map((e) => e.meta_template_name));
  let submitted = 0;
  const problems: string[] = [];

  for (const t of wanted.filter((w) => !have.has(w.metaName))) {
    let status = "pending";
    let metaResponse: unknown = null;
    let error: string | null = null;
    try {
      metaResponse = await submitTemplateToMeta({
        wabaId: ws.whatsapp_waba_id, token: ws.whatsapp_access_token, name: t.metaName, language: t.language, category: t.category,
        components: { headerType: "none", bodyText: t.bodyText, footerText: t.footerText, buttons: t.buttons, bodyExamples: t.examples },
      });
    } catch (err) {
      error = err instanceof Error ? err.message : "WhatsApp did not accept it.";
      status = "rejected";
      problems.push(`${t.displayName}: ${error}`);
    }
    await admin.from("templates").insert({
      workspace_id: ws.id, name: t.displayName, language: t.language, meta_template_name: t.metaName, category: t.category, header_type: "none",
      body_text: t.bodyText, body_preview: t.bodyText, footer_text: t.footerText ?? null, buttons: t.buttons ?? null, meta_response: metaResponse,
      rejection_reason: error, template_group: t.templateGroup, status,
    });
    if (!error) submitted++;
  }
  return { submitted, problems };
}

// ── The daily run: wishes and restock nudges ──────────────────────────────

interface ApprovedTemplate { meta_template_name: string; language: string; body_text: string | null }

async function approvedTemplate(admin: Admin, workspaceId: string, key: string, lang: PackLang): Promise<ApprovedTemplate | null> {
  const { data } = await admin.from("templates").select("meta_template_name, language, body_text, status")
    .eq("workspace_id", workspaceId).eq("meta_template_name", `sk_${key}_${lang}`).maybeSingle();
  return data?.status === "approved" ? { meta_template_name: data.meta_template_name, language: data.language, body_text: data.body_text } : null;
}

export interface CareRunResult { tagsChanged: number; wishes: number; nudges: number; skipped: string[] }

const MAX_MESSAGES_PER_SHOP = 100;

export async function runCareForWorkspace(
  admin: Admin,
  ws: CareWorkspace & { plan: string; trial_ends_at: string | null; birthday_wishes_enabled: boolean; reorder_nudges_enabled: boolean },
  now: Date = new Date(),
): Promise<CareRunResult> {
  const result: CareRunResult = { tagsChanged: await refreshAutoTags(admin, ws.id, undefined, now), wishes: 0, nudges: 0, skipped: [] };
  if (!workspaceCanSend(ws) || !ws.whatsapp_phone_number_id || !ws.whatsapp_access_token) return result;

  const { data: kit } = await admin.from("brand_kits").select("name").eq("workspace_id", ws.id).maybeSingle();
  const shop = kit?.name?.trim() || ws.name;
  const today = todayInIndia(now);
  const year = Number(today.slice(0, 4));
  let sent = 0;

  const log = (contactId: string, body: string, id: string) =>
    admin.from("messages").insert({ workspace_id: ws.id, contact_id: contactId, direction: "outbound", body, meta_message_id: id, status: "sent" });

  // Birthdays and anniversaries.
  if (ws.birthday_wishes_enabled) {
    const { data: people } = await admin.from("contacts")
      .select("id, phone, name, language, birthday, anniversary, birthday_wished_year, anniversary_wished_year")
      .eq("workspace_id", ws.id).eq("opted_out", false).not("consent_at", "is", null)
      .or("birthday.not.is.null,anniversary.not.is.null").limit(5000);
    for (const p of people ?? []) {
      for (const occasion of ["birthday", "anniversary"] as Occasion[]) {
        if (sent >= MAX_MESSAGES_PER_SHOP) break;
        const date = occasion === "birthday" ? p.birthday : p.anniversary;
        const wishedYear = occasion === "birthday" ? p.birthday_wished_year : p.anniversary_wished_year;
        if (!isOccasionToday(date, today) || wishedYear === year) continue;
        const lang = billMessageLang(p.language ?? "en");
        const tpl = await approvedTemplate(admin, ws.id, "birthday_anniversary", lang);
        if (!tpl) { if (!result.skipped.includes("birthday template not approved")) result.skipped.push("birthday template not approved"); continue; }
        const params = [clean(p.name || CUSTOMER_WORD[lang]), OCCASION_WORD[occasion][lang], clean(shop)];
        try {
          const { metaMessageId } = await sendTemplateMessage({ workspace: ws, to: p.phone, templateName: tpl.meta_template_name, language: tpl.language, bodyParams: params });
          await log(p.id, (tpl.body_text ?? "").replace(/\{\{(\d+)\}\}/g, (_m, n: string) => params[Number(n) - 1] ?? ""), metaMessageId);
          await admin.from("contacts").update(occasion === "birthday" ? { birthday_wished_year: year } : { anniversary_wished_year: year }).eq("id", p.id);
          result.wishes++; sent++;
        } catch { /* one failed send must not stop the rest; it is tried again tomorrow */ }
      }
    }
  }

  // Restock nudges for things a customer buys on a rhythm.
  if (ws.reorder_nudges_enabled) {
    const since = new Date(now.getTime() - 400 * 86_400_000).toISOString();
    const { data: bills } = await admin.from("bills").select("contact_id, created_at, items").eq("workspace_id", ws.id).not("contact_id", "is", null).gte("created_at", since).limit(20000);
    const byContact = new Map<string, Array<{ created_at: string; items: Array<{ name?: string }> | null }>>();
    for (const b of bills ?? []) {
      const l = byContact.get(b.contact_id as string) ?? [];
      l.push({ created_at: b.created_at, items: b.items as Array<{ name?: string }> | null });
      byContact.set(b.contact_id as string, l);
    }
    const ids = [...byContact.keys()].filter((id) => reorderCandidates(byContact.get(id)!, now).length > 0).slice(0, 2000);
    const { data: people } = ids.length
      ? await admin.from("contacts").select("id, phone, name, language, last_reorder_nudge_at").eq("workspace_id", ws.id).eq("opted_out", false).not("consent_at", "is", null).in("id", ids)
      : { data: [] as Array<{ id: string; phone: string; name: string | null; language: string | null; last_reorder_nudge_at: string | null }> };
    for (const p of people ?? []) {
      if (sent >= MAX_MESSAGES_PER_SHOP) break;
      const top = reorderCandidates(byContact.get(p.id)!, now)[0];
      // Once per purchase: not again until they buy something after the last nudge.
      if (p.last_reorder_nudge_at && p.last_reorder_nudge_at >= top.lastBoughtAt) continue;
      const lang = billMessageLang(p.language ?? "en");
      const tpl = await approvedTemplate(admin, ws.id, "reorder_item", lang);
      if (!tpl) { if (!result.skipped.includes("restock template not approved")) result.skipped.push("restock template not approved"); continue; }
      const params = [clean(p.name || CUSTOMER_WORD[lang]), clean(top.name), clean(shop)];
      try {
        const { metaMessageId } = await sendTemplateMessage({ workspace: ws, to: p.phone, templateName: tpl.meta_template_name, language: tpl.language, bodyParams: params });
        await log(p.id, (tpl.body_text ?? "").replace(/\{\{(\d+)\}\}/g, (_m, n: string) => params[Number(n) - 1] ?? ""), metaMessageId);
        await admin.from("contacts").update({ last_reorder_nudge_at: now.toISOString() }).eq("id", p.id);
        result.nudges++; sent++;
      } catch { /* tried again tomorrow */ }
    }
  }
  return result;
}
