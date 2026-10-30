"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentWorkspace } from "@/lib/workspace";
import { parseReceivables } from "@/lib/reminders";
import { sendReminder, type ReceivableRow } from "@/lib/reminderSend";
import { workspaceCanSend } from "@/lib/plans";
import { refusal } from "@/lib/gateMessages";
import { msg } from "@/lib/i18n/msg";

const CONTACT_LANGUAGES = new Set(["hi", "mr", "ta", "te", "kn", "gu", "en"]);
const MAX_PASTE_CHARS = 200_000;

export interface ImportResult {
  error?: string;
  success?: boolean;
  imported?: number;
  duplicates?: number;
  optedOut?: number;
  problems?: string[];
}

export async function importReceivables(_prev: unknown, formData: FormData): Promise<ImportResult> {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: await msg("noWorkspace") };

  if (formData.get("consent") !== "on") {
    return { error: await msg("remConsent") };
  }
  const language = String(formData.get("language") ?? "").trim();
  if (!CONTACT_LANGUAGES.has(language)) return { error: await msg("remLang") };

  const file = formData.get("file");
  const pasted = String(formData.get("pasted") ?? "");
  const text = file instanceof File && file.size > 0 ? await file.text() : pasted;
  if (text.length > MAX_PASTE_CHARS) return { error: await msg("remTooMuch") };

  const parsed = parseReceivables(text);
  const problems = parsed.errors.slice(0, 8).map((e) => (e.line > 0 ? `Line ${e.line}: ${e.message}` : e.message));
  if (parsed.rows.length === 0) return { error: problems[0] ?? "No valid rows found.", problems };

  const supabase = await createClient();
  const phones = [...new Set(parsed.rows.map((r) => r.phone))];

  // Add customers that aren't contacts yet; never overwrite the name or language of ones that are.
  await supabase.from("contacts").upsert(
    phones.map((phone) => ({
      workspace_id: workspace.id,
      phone,
      name: parsed.rows.find((r) => r.phone === phone)!.partyName,
      language,
      source: "reminder_import",
    })),
    { onConflict: "workspace_id,channel,phone", ignoreDuplicates: true },
  );
  const { data: contacts, error: contactsError } = await supabase
    .from("contacts")
    .select("id, phone, opted_out")
    .eq("workspace_id", workspace.id)
    .in("phone", phones);
  if (contactsError) return { error: contactsError.message };
  const contactByPhone = new Map((contacts ?? []).map((c) => [c.phone, c]));

  // Skip bills already on the list, so pasting the same export twice doesn't double-remind anyone.
  const { data: existing } = await supabase
    .from("receivables")
    .select("phone, amount, due_date, invoice_ref")
    .eq("workspace_id", workspace.id)
    .eq("status", "open")
    .in("phone", phones);
  const existingKeys = new Set((existing ?? []).map((e) => [e.phone, Number(e.amount), e.due_date, e.invoice_ref ?? ""].join("|")));

  let duplicates = 0;
  let optedOut = 0;
  const toInsert = [];
  const consentAt = new Date().toISOString();
  for (const row of parsed.rows) {
    const contact = contactByPhone.get(row.phone);
    if (contact?.opted_out) { optedOut++; continue; }
    if (existingKeys.has([row.phone, row.amount, row.dueDate, row.invoiceRef ?? ""].join("|"))) { duplicates++; continue; }
    toInsert.push({
      workspace_id: workspace.id,
      contact_id: contact?.id ?? null,
      party_name: row.partyName,
      phone: row.phone,
      amount: row.amount,
      due_date: row.dueDate,
      invoice_ref: row.invoiceRef,
      consent_confirmed_at: consentAt,
    });
  }

  if (toInsert.length > 0) {
    const { error } = await supabase.from("receivables").insert(toInsert);
    if (error) return { error: error.message };
  }

  revalidatePath("/reminders");
  return { success: true, imported: toInsert.length, duplicates, optedOut, problems };
}

export async function saveReminderTemplate(templateId: string): Promise<{ error?: string; success?: boolean }> {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: await msg("noWorkspace") };

  const supabase = await createClient();
  if (templateId) {
    const { data: template } = await supabase
      .from("templates")
      .select("id, status")
      .eq("id", templateId)
      .eq("workspace_id", workspace.id)
      .maybeSingle();
    if (!template) return { error: await msg("tplNotFound") };
    if (template.status !== "approved") return { error: await msg("tplNotApproved") };
  }

  const { error } = await supabase.from("workspaces").update({ reminder_template_id: templateId || null }).eq("id", workspace.id);
  if (error) return { error: error.message };
  revalidatePath("/reminders");
  return { success: true };
}

async function ownedReceivable(id: string) {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("receivables")
    .select("id, workspace_id, contact_id, party_name, phone, amount, due_date, payment_link_id, reminders_sent, failed_attempts, last_reminded_at, status")
    .eq("id", id)
    .eq("workspace_id", workspace.id)
    .maybeSingle();
  return data ? { workspace, receivable: data as ReceivableRow & { status: string } } : null;
}

export async function markReceivablePaid(id: string): Promise<{ error?: string }> {
  const owned = await ownedReceivable(id);
  if (!owned) return { error: await msg("notFound") };
  const supabase = await createClient();
  const { error } = await supabase.from("receivables").update({ status: "paid", paid_at: new Date().toISOString() }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/reminders");
  return {};
}

export async function stopReminders(id: string): Promise<{ error?: string }> {
  const owned = await ownedReceivable(id);
  if (!owned) return { error: await msg("notFound") };
  const supabase = await createClient();
  const { error } = await supabase.from("receivables").update({ status: "stopped" }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/reminders");
  return {};
}

export async function resumeReminders(id: string): Promise<{ error?: string }> {
  const owned = await ownedReceivable(id);
  if (!owned) return { error: await msg("notFound") };
  const supabase = await createClient();
  const { error } = await supabase.from("receivables").update({ status: "open", failed_attempts: 0, last_error: null }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/reminders");
  return {};
}

export async function remindNow(id: string): Promise<{ error?: string; sent?: boolean }> {
  const owned = await ownedReceivable(id);
  if (!owned) return { error: await msg("notFound") };
  const { workspace, receivable } = owned;
  if (!workspaceCanSend(workspace)) return { error: await refusal("noPlan") };
  if (receivable.status !== "open") return { error: await msg("onlyOpen") };
  if (!workspace.whatsapp_phone_number_id || !workspace.whatsapp_access_token) return { error: await msg("connectFirst") };
  if (!workspace.reminder_template_id) return { error: await msg("chooseTemplate") };

  const admin = createAdminClient();
  const { data: template } = await admin
    .from("templates")
    .select("meta_template_name, language, status")
    .eq("id", workspace.reminder_template_id)
    .maybeSingle();
  if (template?.status !== "approved") return { error: await msg("tplNotApprovedYet") };

  const h = await headers();
  const origin = `${h.get("x-forwarded-proto") ?? "https"}://${h.get("host")}`;
  const outcome = await sendReminder(admin, { workspace, template, origin }, receivable);

  revalidatePath("/reminders");
  if (outcome.ok) return { sent: true };
  if (outcome.reason === "paid") return { error: await msg("paidAlready") };
  if (outcome.reason === "opted_out") return { error: await msg("optedOutStopped") };
  if (outcome.reason === "skipped") return { error: await msg("couldNotStart") };
  return { error: outcome.error ?? "The send failed." };
}
