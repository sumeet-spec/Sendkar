import { createAdminClient } from "@/lib/supabase/admin";
import { sendTemplateMessage } from "@/lib/whatsapp";
import { workspaceCanSend } from "@/lib/plans";

type Admin = ReturnType<typeof createAdminClient>;

const SUMMARY_TEMPLATE = process.env.SUMMARY_TEMPLATE_NAME ?? "sendkar_daily_summary";
const MAX_PER_RUN = 300;

export type Summary = { sent: number; replies: number; read: number; newCustomers: number };

/** Yesterday in India (Asia/Kolkata, UTC+5:30), as UTC timestamps, plus its calendar date. */
export function yesterdayInIndia(now: Date = new Date()): { from: string; to: string; date: string; today: string } {
  const ist = new Date(now.getTime() + 330 * 60_000);
  const startToday = Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate()) - 330 * 60_000;
  const startYesterday = startToday - 86_400_000;
  return {
    from: new Date(startYesterday).toISOString(),
    to: new Date(startToday).toISOString(),
    date: new Date(startYesterday + 330 * 60_000).toISOString().slice(0, 10),
    today: new Date(startToday + 330 * 60_000).toISOString().slice(0, 10),
  };
}

/** True during the 8 AM hour in India, when owners get their morning summary. */
export const isMorningInIndia = (now: Date = new Date()) => new Date(now.getTime() + 330 * 60_000).getUTCHours() === 8;

export const hasNews = (s: Summary) => s.sent + s.replies + s.newCustomers > 0;

/** Counts for one workspace between two moments. Counts only, nothing about individual customers. */
export async function gatherSummary(admin: Admin, workspaceId: string, from: string, to: string): Promise<Summary> {
  const count = async (q: PromiseLike<{ count: number | null }>) => (await q).count ?? 0;
  const [sent, replies, read, newCustomers] = await Promise.all([
    count(admin.from("messages").select("id", { count: "exact", head: true }).eq("workspace_id", workspaceId).eq("direction", "outbound").gte("created_at", from).lt("created_at", to)),
    count(admin.from("messages").select("id", { count: "exact", head: true }).eq("workspace_id", workspaceId).eq("direction", "inbound").gte("created_at", from).lt("created_at", to)),
    count(admin.from("messages").select("id", { count: "exact", head: true }).eq("workspace_id", workspaceId).eq("direction", "outbound").eq("status", "read").gte("created_at", from).lt("created_at", to)),
    count(admin.from("contacts").select("id", { count: "exact", head: true }).eq("workspace_id", workspaceId).gte("created_at", from).lt("created_at", to)),
  ]);
  return { sent, replies, read, newCustomers };
}

export function summaryWhatsAppEnabled(): boolean {
  return process.env.DAILY_SUMMARY_WHATSAPP === "true" && Boolean(process.env.SYSTEM_SENDER_WORKSPACE_ID);
}

/**
 * Sends each owner their short morning summary from Sendkar's own number, through an approved utility template.
 * Skips: workspaces that turned it off, have no active plan, already got today's, or had a quiet day (a message
 * that says "0, 0, 0" only teaches people to ignore us). Off until DAILY_SUMMARY_WHATSAPP=true and the system number exist.
 */
export async function sendDailySummaries(admin: Admin, now: Date = new Date()): Promise<{ sent: number; skipped: number }> {
  const senderId = process.env.SYSTEM_SENDER_WORKSPACE_ID;
  if (!summaryWhatsAppEnabled() || !senderId) return { sent: 0, skipped: 0 };

  const { data: sender } = await admin.from("workspaces").select("whatsapp_phone_number_id, whatsapp_access_token").eq("id", senderId).single();
  if (!sender?.whatsapp_phone_number_id || !sender.whatsapp_access_token) return { sent: 0, skipped: 0 };

  const { from, to, today } = yesterdayInIndia(now);
  const { data: workspaces } = await admin
    .from("workspaces")
    .select("id, plan, trial_ends_at, daily_summary_sent_on")
    .eq("daily_summary", true)
    .neq("id", senderId)
    .limit(MAX_PER_RUN);

  let sent = 0, skipped = 0;
  for (const ws of workspaces ?? []) {
    try {
      if (ws.daily_summary_sent_on === today || !workspaceCanSend(ws as { plan: string; trial_ends_at?: string | null })) { skipped++; continue; }
      const summary = await gatherSummary(admin, ws.id as string, from, to);
      if (!hasNews(summary)) { skipped++; continue; }

      const { data: member } = await admin.from("workspace_members").select("user_id").eq("workspace_id", ws.id).eq("role", "owner").maybeSingle();
      const { data: u } = member ? await admin.auth.admin.getUserById(member.user_id) : { data: null };
      const phone = typeof u?.user?.user_metadata?.whatsapp_number === "string" ? (u.user.user_metadata.whatsapp_number as string) : null;
      if (!phone) { skipped++; continue; }

      await sendTemplateMessage({ workspace: sender, to: phone, templateName: SUMMARY_TEMPLATE, language: "en", bodyParams: [String(summary.sent), String(summary.replies), String(summary.newCustomers)] });
      await admin.from("workspaces").update({ daily_summary_sent_on: today }).eq("id", ws.id);
      sent++;
    } catch {
      skipped++; // one failure (a blocked number, a template problem) never stops the others
    }
  }
  return { sent, skipped };
}
