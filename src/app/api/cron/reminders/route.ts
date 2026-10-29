import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { decideReminder, todayInIndia } from "@/lib/reminders";
import { workspaceCanSend } from "@/lib/plans";
import { sendReminder, type ReceivableRow, type ReminderWorkspace, type ReminderTemplate } from "@/lib/reminderSend";

/**
 * Sends the payment reminders that have come due. Runs once a day (Vercel
 * Hobby), scheduled after cron/check-payments so links paid overnight are
 * already marked paid and get no reminder. Dates are IST calendar dates; 05:30
 * UTC is 11:00 in India, a sensible hour to ask for money.
 *
 * Capped by a time budget rather than a row count: each send can include a
 * payment-link API call. Anything left over is picked up by the next run.
 */
export const maxDuration = 60;
const TIME_BUDGET_MS = 45_000;
const DELAY_BETWEEN_SENDS_MS = 250;
const MIN_HOURS_BETWEEN_REMINDERS = 20; // belt and braces against a retried run or a manual send the same day
const MAX_OPEN_PER_RUN = 300;

interface PaidSweepRow { id: string; payment_links: { status: string } | null }

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startedAt = Date.now();
  const admin = createAdminClient();
  const today = todayInIndia();

  // Stop reminding anyone whose payment link has been paid since the last run.
  const { data: withLinks } = await admin
    .from("receivables")
    .select("id, payment_links(status)")
    .eq("status", "open")
    .not("payment_link_id", "is", null)
    .limit(MAX_OPEN_PER_RUN)
    .returns<PaidSweepRow[]>();
  const paidIds = (withLinks ?? []).filter((r) => r.payment_links?.status === "paid").map((r) => r.id);
  if (paidIds.length) {
    await admin.from("receivables").update({ status: "paid", paid_at: new Date().toISOString() }).in("id", paidIds);
  }

  const { data: open } = await admin
    .from("receivables")
    .select("id, workspace_id, contact_id, party_name, phone, amount, due_date, payment_link_id, reminders_sent, failed_attempts, last_reminded_at")
    .eq("status", "open")
    .order("due_date", { ascending: true })
    .limit(MAX_OPEN_PER_RUN)
    .returns<ReceivableRow[]>();

  const byWorkspace = new Map<string, ReceivableRow[]>();
  for (const r of open ?? []) {
    if (!byWorkspace.has(r.workspace_id)) byWorkspace.set(r.workspace_id, []);
    byWorkspace.get(r.workspace_id)!.push(r);
  }

  const tally = { sent: 0, failed: 0, stopped: 0, markedPaid: paidIds.length, notDue: 0, deferred: 0 };
  const skippedWorkspaces: Record<string, string> = {};
  const cutoff = Date.now() - MIN_HOURS_BETWEEN_REMINDERS * 3_600_000;

  for (const [workspaceId, receivables] of byWorkspace) {
    const { data: workspace } = await admin
      .from("workspaces")
      .select("id, name, whatsapp_phone_number_id, whatsapp_access_token, razorpay_key_id, razorpay_key_secret, payu_merchant_key, payu_salt, reminder_template_id, plan, trial_ends_at")
      .eq("id", workspaceId)
      .maybeSingle<ReminderWorkspace & { reminder_template_id: string | null; plan: string; trial_ends_at: string | null }>();
    if (!workspace) continue;
    if (!workspaceCanSend(workspace)) {
      skippedWorkspaces[workspaceId] = "no active plan";
      continue;
    }
    if (!workspace.whatsapp_phone_number_id || !workspace.whatsapp_access_token) {
      skippedWorkspaces[workspaceId] = "WhatsApp not connected";
      continue;
    }
    if (!workspace.reminder_template_id) {
      skippedWorkspaces[workspaceId] = "no reminder template chosen";
      continue;
    }
    const { data: template } = await admin
      .from("templates")
      .select("meta_template_name, language, status")
      .eq("id", workspace.reminder_template_id)
      .maybeSingle<ReminderTemplate & { status: string }>();
    if (template?.status !== "approved") {
      skippedWorkspaces[workspaceId] = "reminder template isn't approved by Meta yet";
      continue;
    }

    for (const receivable of receivables) {
      const decision = decideReminder(today, receivable.due_date, receivable.reminders_sent);
      if (!decision.send) { tally.notDue++; continue; }
      if (receivable.last_reminded_at && new Date(receivable.last_reminded_at).getTime() > cutoff) { tally.notDue++; continue; }
      if (Date.now() - startedAt > TIME_BUDGET_MS) { tally.deferred++; continue; }

      const outcome = await sendReminder(admin, { workspace, template, origin: request.nextUrl.origin }, receivable, {
        advanceTo: decision.nextRemindersSent,
      });
      if (outcome.ok) tally.sent++;
      else if (outcome.reason === "paid") tally.markedPaid++;
      else if (outcome.reason === "opted_out") tally.stopped++;
      else if (outcome.reason === "error") tally.failed++;
      await new Promise((r) => setTimeout(r, DELAY_BETWEEN_SENDS_MS));
    }
  }

  return NextResponse.json({ ok: true, today, ...tally, skippedWorkspaces });
}
