"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentWorkspace } from "@/lib/workspace";
import { workspaceCanSend } from "@/lib/plans";
import { refusal } from "@/lib/gateMessages";
import { isRateLimited } from "@/lib/rateLimit";
import { LANGUAGES, type LanguageCode } from "@/lib/i18n/dictionaries";
import { submitTemplateToMeta, sendTemplateMessage } from "@/lib/whatsapp";
import { AiNotConfiguredError, draftFollowupText } from "@/lib/ai";
import { msg } from "@/lib/i18n/msg";
import {
  FOLLOWUP_EXAMPLES, FOLLOWUP_SEQUENCE_NAME, FOLLOWUP_TEMPLATE_PREFIX, FOLLOWUP_WHEN, OPT_OUT_FOOTER,
  absoluteDelays, checkFollowupBody, followupTemplateName, insertByTime, type FollowupWhen,
} from "@/lib/bills/followups";

export interface FollowupDraft { error?: string; draft?: string }
export interface FollowupSaveResult { error?: string; ok?: boolean }

const WHEN_TEXT: Record<FollowupWhen, string> = {
  day1: "yesterday", week1: "about a week ago", week6: "about six weeks ago", month3: "about three months ago",
};

const isLangCode = (v: string): v is LanguageCode => LANGUAGES.some((l) => l.code === v);
const isWhen = (v: string): v is FollowupWhen => FOLLOWUP_WHEN.some((w) => w.key === v);

/** AI writes the follow-up from the shop's one line, in the language chosen. Nothing is saved or sent. */
export async function draftFollowup(_prev: unknown, formData: FormData): Promise<FollowupDraft> {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: await msg("noWorkspace") };
  const lang = String(formData.get("lang") ?? "");
  const when = String(formData.get("when") ?? "");
  const goal = String(formData.get("goal") ?? "").trim().slice(0, 300);
  if (!isLangCode(lang) || !isWhen(when)) return { error: await msg("pickLangTime") };
  if (goal.length < 3) return { error: await msg("goalShort") };
  if (await isRateLimited(`followup-draft:${workspace.id}`, 40, 3600)) return { error: await msg("tooManyDrafts") };

  try {
    // One automatic second try when the first draft breaks WhatsApp's rules for message text.
    let text = await draftFollowupText({ goal, lang, timing: WHEN_TEXT[when] });
    let check = checkFollowupBody(text);
    if (!check.ok) {
      text = await draftFollowupText({ goal, lang, timing: WHEN_TEXT[when], previous: text });
      check = checkFollowupBody(text);
    }
    return check.ok ? { draft: check.body } : { error: await msg("aiRule", { reason: await msg(check.key) }) };
  } catch (err) {
    return { error: await msg(err instanceof AiNotConfiguredError ? "aiOff" : "aiFail") };
  }
}

/** Submits the message to WhatsApp for approval and puts it in the shop's after-bill journey. */
export async function saveFollowup(_prev: unknown, formData: FormData): Promise<FollowupSaveResult> {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: await msg("noWorkspace") };
  if (!workspaceCanSend(workspace)) return { error: await refusal("noPlan") };
  if (!workspace.whatsapp_waba_id || !workspace.whatsapp_access_token) return { error: await refusal("noNumber") };

  const lang = String(formData.get("lang") ?? "");
  const when = String(formData.get("when") ?? "");
  if (!isLangCode(lang) || !isWhen(when)) return { error: await msg("pickLangTime") };
  const check = checkFollowupBody(String(formData.get("body") ?? ""));
  if (!check.ok) return { error: await msg(check.key) };

  const supabase = await createClient();
  const stamp = Date.now();
  const metaName = followupTemplateName(lang, stamp);
  const footerText = OPT_OUT_FOOTER[lang];
  const buttons = [{ type: "QUICK_REPLY" as const, text: "Stop" }];
  let metaResponse: unknown = null;
  try {
    metaResponse = await submitTemplateToMeta({
      wabaId: workspace.whatsapp_waba_id, token: workspace.whatsapp_access_token, name: metaName, language: lang, category: "MARKETING",
      components: { headerType: "none", bodyText: check.body, footerText, buttons, bodyExamples: [...FOLLOWUP_EXAMPLES[lang]] },
    });
  } catch (err) {
    return { error: await msg("whatsappRefused", { reason: err instanceof Error ? err.message : "?" }) };
  }

  const { data: template, error: tplErr } = await supabase.from("templates").insert({
    workspace_id: workspace.id, name: `Follow-up (${lang}, ${when})`, language: lang, meta_template_name: metaName, category: "MARKETING",
    header_type: "none", body_text: check.body, body_preview: check.body, footer_text: footerText, buttons, meta_response: metaResponse,
    template_group: `${FOLLOWUP_TEMPLATE_PREFIX}${stamp.toString(36)}`, status: "pending",
  }).select("id").single();
  if (tplErr || !template) return { error: await msg("msgSavedElsewhere") };

  let { data: sequence } = await supabase.from("sequences").select("id").eq("workspace_id", workspace.id).eq("name", FOLLOWUP_SEQUENCE_NAME).maybeSingle();
  if (!sequence) {
    const made = await supabase.from("sequences").insert({ workspace_id: workspace.id, name: FOLLOWUP_SEQUENCE_NAME, trigger_type: "order_placed", match_type: "contains" }).select("id").single();
    sequence = made.data;
  }
  if (!sequence) return { error: await msg("journeyFail") };
  const sequenceId = sequence.id as string;

  const { data: steps } = await supabase.from("sequence_steps").select("*").eq("sequence_id", sequenceId).order("step_order");
  const old = steps ?? [];
  const minutes = FOLLOWUP_WHEN.find((w) => w.key === when)!.minutes;
  const { order, newIndex } = insertByTime(absoluteDelays(old), minutes);
  const { data: kit } = await supabase.from("brand_kits").select("name").eq("workspace_id", workspace.id).maybeSingle();
  const shop = kit?.name?.trim() || workspace.name;

  const rows = order.map((delay, i) => {
    if (i === newIndex) {
      return { sequence_id: sequenceId, step_order: i + 1, delay_minutes: delay, message_body: check.body, include_payment_link: false, template_id: template.id, variable_mapping: { "1": "name", "2": `text:${shop}` } };
    }
    const s = old[i < newIndex ? i : i - 1];
    return { sequence_id: sequenceId, step_order: i + 1, delay_minutes: delay, message_body: s.message_body, include_payment_link: s.include_payment_link, template_id: s.template_id, variable_mapping: s.variable_mapping };
  });
  await supabase.from("sequence_steps").delete().eq("sequence_id", sequenceId);
  const { error: stepErr } = await supabase.from("sequence_steps").insert(rows);
  if (stepErr) {
    // Put the earlier steps back rather than leave the journey empty.
    if (old.length) await supabase.from("sequence_steps").insert(old.map((s) => ({ ...s, id: undefined })));
    return { error: await msg("journeyAddFail") };
  }
  revalidatePath("/bills");
  return { ok: true };
}

const NAME_FALLBACK: Record<LanguageCode, string> = { en: "Customer", hi: "ग्राहक", mr: "ग्राहक", gu: "ગ્રાહક", ta: "வாடிக்கையாளர்", te: "కస్టమర్", kn: "ಗ್ರಾಹಕ" };

/** Sends one approved follow-up message to one customer now. Only to customers who agreed to offers. */
export async function sendFollowupNow(contactId: string, templateId: string): Promise<{ error?: string; sent?: boolean }> {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: await msg("noWorkspace") };
  if (!workspaceCanSend(workspace)) return { error: await refusal("noPlan") };
  if (!workspace.whatsapp_phone_number_id || !workspace.whatsapp_access_token) return { error: await refusal("noNumber") };

  const admin = createAdminClient();
  const { data: contact } = await admin.from("contacts").select("id, phone, name, opted_out, consent_at").eq("id", contactId).eq("workspace_id", workspace.id).maybeSingle();
  if (!contact) return { error: await msg("customerNotFound") };
  if (contact.opted_out) return { error: await msg("customerOptedOut") };
  if (!contact.consent_at) return { error: await msg("noConsent") };

  const { data: template } = await admin.from("templates").select("meta_template_name, language, body_text, status, template_group").eq("id", templateId).eq("workspace_id", workspace.id).maybeSingle();
  if (!template || !String(template.template_group ?? "").startsWith(FOLLOWUP_TEMPLATE_PREFIX)) return { error: await msg("messageNotFound") };
  if (template.status !== "approved") return { error: await msg("templatePending") };

  const lang = (isLangCode(template.language) ? template.language : "en") as LanguageCode;
  const { data: kit } = await admin.from("brand_kits").select("name").eq("workspace_id", workspace.id).maybeSingle();
  const params = [(contact.name || NAME_FALLBACK[lang]).replace(/\s+/g, " ").trim().slice(0, 60), (kit?.name?.trim() || workspace.name).replace(/\s+/g, " ").slice(0, 60)];
  try {
    const { metaMessageId } = await sendTemplateMessage({ workspace, to: contact.phone, templateName: template.meta_template_name, language: template.language, bodyParams: params });
    await admin.from("messages").insert({
      workspace_id: workspace.id, contact_id: contact.id, direction: "outbound",
      body: String(template.body_text ?? "").replace(/\{\{(\d+)\}\}/g, (_m, n: string) => params[Number(n) - 1] ?? ""), meta_message_id: metaMessageId, status: "sent",
    });
    return { sent: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "The send failed." };
  }
}
