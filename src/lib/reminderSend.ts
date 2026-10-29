import type { createAdminClient } from "@/lib/supabase/admin";
import { sendTemplateMessage, type WorkspaceCreds } from "@/lib/whatsapp";
import { createRazorpayPaymentLink } from "@/lib/payments";
import { formatDueDate, formatInr } from "@/lib/reminders";

type Admin = ReturnType<typeof createAdminClient>;

export const MAX_FAILED_ATTEMPTS = 3;

export interface ReminderWorkspace extends WorkspaceCreds {
  id: string;
  name: string;
  razorpay_key_id: string | null;
  razorpay_key_secret: string | null;
  payu_merchant_key: string | null;
  payu_salt: string | null;
}

export interface ReminderTemplate {
  meta_template_name: string;
  language: string;
}

export interface ReceivableRow {
  id: string;
  workspace_id: string;
  contact_id: string | null;
  party_name: string;
  phone: string;
  amount: number | string;
  due_date: string;
  payment_link_id: string | null;
  reminders_sent: number;
  failed_attempts: number;
  last_reminded_at: string | null;
}

export type ReminderOutcome =
  | { ok: true }
  | { ok: false; reason: "paid" | "opted_out" | "skipped" | "error"; error?: string };

interface LinkResult { url: string | null; paid: boolean }

/**
 * Returns the receivable's payment link, creating one if there is none or the
 * old one can no longer be paid. Reports `paid` so the caller can stop
 * reminding instead of chasing money that already arrived.
 */
async function ensurePaymentLink(
  admin: Admin,
  workspace: ReminderWorkspace,
  receivable: ReceivableRow,
  origin: string,
): Promise<LinkResult> {
  if (receivable.payment_link_id) {
    const { data: existing } = await admin
      .from("payment_links")
      .select("status, url")
      .eq("id", receivable.payment_link_id)
      .maybeSingle();
    if (existing?.status === "paid") return { url: null, paid: true };
    if (existing?.status === "pending" && existing.url) return { url: existing.url, paid: false };
  }

  const provider = workspace.razorpay_key_id && workspace.razorpay_key_secret
    ? "razorpay"
    : workspace.payu_merchant_key && workspace.payu_salt ? "payu" : null;
  if (!provider) return { url: null, paid: false };

  const amount = Number(receivable.amount);
  const { data: row } = await admin
    .from("payment_links")
    .insert({
      workspace_id: workspace.id,
      contact_id: receivable.contact_id,
      provider,
      provider_ref: "pending",
      amount,
      url: "",
    })
    .select("id")
    .single();
  if (!row) return { url: null, paid: false };

  let url: string;
  if (provider === "razorpay") {
    const link = await createRazorpayPaymentLink(workspace, {
      amountInRupees: amount,
      description: `Payment to ${workspace.name}`,
      contactPhoneE164Digits: receivable.phone,
      referenceId: row.id,
    });
    url = link.url;
    await admin.from("payment_links").update({ provider_ref: link.providerRef, url }).eq("id", row.id);
  } else {
    // PayU builds its signed redirect when the customer opens /pay/[id]; the row only reserves the amount.
    url = `${origin}/pay/${row.id}`;
    await admin.from("payment_links").update({ provider_ref: row.id, url }).eq("id", row.id);
  }

  await admin.from("receivables").update({ payment_link_id: row.id }).eq("id", receivable.id);
  return { url, paid: false };
}

/** Meta rejects template parameters containing newlines, tabs or long runs of spaces. */
function cleanParam(s: string): string {
  return s.replace(/\s+/g, " ").trim().slice(0, 120) || "-";
}

/**
 * Sends one reminder. `advanceTo` is the stage the schedule moves to (cron);
 * leave it out for a manual "Remind now", which does not move the schedule.
 *
 * The stage is claimed with a compare-and-set BEFORE sending, so a retried or
 * overlapping cron run can't message the same customer twice. A failed send
 * releases the claim and counts toward MAX_FAILED_ATTEMPTS.
 */
export async function sendReminder(
  admin: Admin,
  ctx: { workspace: ReminderWorkspace; template: ReminderTemplate; origin: string },
  receivable: ReceivableRow,
  opts: { advanceTo?: number } = {},
): Promise<ReminderOutcome> {
  const { workspace, template, origin } = ctx;

  if (receivable.contact_id) {
    const { data: contact } = await admin.from("contacts").select("opted_out").eq("id", receivable.contact_id).maybeSingle();
    if (contact?.opted_out) {
      await admin.from("receivables").update({ status: "stopped", last_error: "Customer opted out of messages." }).eq("id", receivable.id);
      return { ok: false, reason: "opted_out" };
    }
  }

  let link: LinkResult = { url: null, paid: false };
  try {
    link = await ensurePaymentLink(admin, workspace, receivable, origin);
  } catch {
    // A gateway hiccup shouldn't stop the reminder itself — it goes out telling them to reply to pay.
  }
  if (link.paid) {
    await admin.from("receivables").update({ status: "paid", paid_at: new Date().toISOString() }).eq("id", receivable.id);
    return { ok: false, reason: "paid" };
  }

  const nowIso = new Date().toISOString();
  const claim = admin
    .from("receivables")
    .update(opts.advanceTo !== undefined
      ? { reminders_sent: opts.advanceTo, last_reminded_at: nowIso }
      : { last_reminded_at: nowIso })
    .eq("id", receivable.id)
    .eq("status", "open");
  const { data: claimed } = await (opts.advanceTo !== undefined
    ? claim.eq("reminders_sent", receivable.reminders_sent)
    : claim
  ).select("id");
  if (!claimed?.length) return { ok: false, reason: "skipped" };

  const params = [
    cleanParam(receivable.party_name),
    formatInr(Number(receivable.amount)),
    formatDueDate(receivable.due_date),
    link.url ?? "reply to this message",
  ];

  try {
    const { metaMessageId } = await sendTemplateMessage({
      workspace,
      to: receivable.phone,
      templateName: template.meta_template_name,
      language: template.language,
      bodyParams: params,
    });

    if (receivable.contact_id) {
      await admin.from("messages").insert({
        workspace_id: workspace.id,
        contact_id: receivable.contact_id,
        direction: "outbound",
        body: `Payment reminder: ₹${params[1]} due ${params[2]}`,
        meta_message_id: metaMessageId,
        status: "sent",
      });
    }
    await admin.from("receivables").update({ failed_attempts: 0, last_error: null }).eq("id", receivable.id);
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Send failed";
    const attempts = receivable.failed_attempts + 1;
    await admin
      .from("receivables")
      .update({
        reminders_sent: receivable.reminders_sent,
        last_reminded_at: receivable.last_reminded_at,
        failed_attempts: attempts,
        last_error: message,
        ...(attempts >= MAX_FAILED_ATTEMPTS ? { status: "failed" } : {}),
      })
      .eq("id", receivable.id);
    return { ok: false, reason: "error", error: message };
  }
}
