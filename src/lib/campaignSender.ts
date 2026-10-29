import * as Sentry from "@sentry/nextjs";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendTemplateMessage, type WorkspaceCreds } from "@/lib/whatsapp";
import { dispatchOutboundWebhooks } from "@/lib/outboundWebhooks";
import { sendEmail } from "@/lib/email";
import { resolveTemplateParam } from "@/lib/templateVars";
import { workspaceCanSend } from "@/lib/plans";

type Admin = ReturnType<typeof createAdminClient>;

const BATCH_SIZE = 100;
/** Messages sent at the same moment. Meta allows far more; this keeps one run gentle and quick. */
export const PARALLEL_SENDS = 8;
const PAUSE_BETWEEN_GROUPS_MS = Number(process.env.CAMPAIGN_SEND_PAUSE_MS ?? 120);
/** How long one run may keep sending before it hands over to a follow-up run. */
export const RUN_BUDGET_MS = 240_000;
/** A run holds the campaign for this long; if the function dies, the hold simply expires. */
const LOCK_MS = 270_000;
const AUTO_PAUSE_THRESHOLD = 0.20; // pause if >20% of concluded sends fail
const AUTO_PAUSE_MIN_SAMPLE = 10; // don't auto-pause until at least 10 sends concluded

type WorkspaceRow = {
  id: string; whatsapp_phone_number_id: string | null; whatsapp_access_token: string | null;
  messaging_tier: number; daily_send_count: number; daily_reset_at: string;
};

async function resolveSender(admin: Admin, workspace: WorkspaceRow, numberId: string | null) {
  if (numberId) {
    const { data: number } = await admin.from("whatsapp_numbers").select("*").eq("id", numberId).maybeSingle();
    if (number) {
      return {
        table: "whatsapp_numbers" as const,
        id: number.id as string,
        creds: { whatsapp_phone_number_id: number.phone_number_id, whatsapp_access_token: number.access_token } as WorkspaceCreds,
        messagingTier: number.messaging_tier as number,
        dailySendCount: number.daily_send_count as number,
        dailyResetAt: number.daily_reset_at as string,
      };
    }
  }
  return {
    table: "workspaces" as const,
    id: workspace.id,
    creds: workspace as WorkspaceCreds,
    messagingTier: workspace.messaging_tier,
    dailySendCount: workspace.daily_send_count,
    dailyResetAt: workspace.daily_reset_at,
  };
}

async function getWorkspaceOwnerEmail(admin: Admin, workspaceId: string): Promise<string | null> {
  const { data: member } = await admin.from("workspace_members").select("user_id").eq("workspace_id", workspaceId).eq("role", "owner").maybeSingle();
  if (!member) return null;
  const { data: { user } } = await admin.auth.admin.getUserById(member.user_id);
  return user?.email ?? null;
}

type SendableTemplate = { meta_template_name: string; language: string; body_text: string | null; header_type: string | null; header_image_url: string | null };
type RecipientRow = { id: string; contact_id: string; contacts: unknown };

/**
 * Sends one campaign's queued recipients until none are left, the day's sending limit is reached, or the
 * time budget runs out. Safe to call from several places at once: a hold on the campaign makes sure two
 * runs never send to the same people. Returns a short plain description of what happened.
 */
async function runOneCampaign(
  admin: Admin,
  campaign: Record<string, unknown> & { id: string; name: string; workspaces: unknown },
  deadline: number,
  now: Date,
): Promise<{ result: string }> {
  const workspace = campaign.workspaces as WorkspaceRow;

  // No active plan: leave the campaign queued, so it carries on if they subscribe.
  if (!workspaceCanSend(campaign.workspaces as { plan: string; trial_ends_at?: string | null })) {
    return { result: "held — workspace has no active plan" };
  }

  const sender = await resolveSender(admin, workspace, campaign.whatsapp_number_id as string | null);

  let dailySendCount = sender.dailySendCount;
  if (now >= new Date(sender.dailyResetAt)) {
    dailySendCount = 0;
    const nextReset = new Date(now);
    nextReset.setUTCHours(0, 0, 0, 0);
    nextReset.setUTCDate(nextReset.getUTCDate() + 1);
    await admin.from(sender.table).update({ daily_send_count: 0, daily_reset_at: nextReset.toISOString() }).eq("id", sender.id);
  }

  const { data: primaryTemplate } = await admin
    .from("templates")
    .select("meta_template_name, language, body_text, header_type, header_image_url")
    .eq("id", campaign.template_id as string)
    .single();

  let templatesByLanguage = new Map<string, SendableTemplate>();
  if (campaign.template_group) {
    const { data: groupTemplates } = await admin
      .from("templates")
      .select("meta_template_name, language, body_text, header_type, header_image_url")
      .eq("workspace_id", workspace.id)
      .eq("template_group", campaign.template_group as string);
    templatesByLanguage = new Map((groupTemplates ?? []).map((t) => [t.language, t]));
  }
  const variableMapping = (campaign.variable_mapping ?? {}) as Record<string, string>;

  let totalSent = 0;
  let totalSeen = 0;

  const sendOne = async (recipient: RecipientRow): Promise<boolean> => {
    const contactRow = recipient.contacts as { phone?: string; name?: string | null; email?: string | null; opted_out?: boolean; language?: string } | null;
    const fail = async (error: string) => { await admin.from("campaign_recipients").update({ status: "failed", error }).eq("id", recipient.id); return false; };

    const phone = contactRow?.phone;
    const template = (contactRow?.language && templatesByLanguage.get(contactRow.language)) || primaryTemplate;
    // Every recipient must leave the queue, or the loop would keep picking the same one up.
    if (!phone) return fail("Contact has no phone number");
    if (!template) return fail("Template not found");
    if (contactRow?.opted_out) return fail("Contact opted out");

    const placeholderCount = (template.body_text?.match(/\{\{\d+\}\}/g) ?? []).length;
    const bodyParams = placeholderCount > 0
      ? Array.from({ length: placeholderCount }, (_, i) =>
          resolveTemplateParam(variableMapping[String(i + 1)], { name: contactRow?.name, phone, email: contactRow?.email }, template.language))
      : undefined;

    // A template with an image header needs a picture every time: the campaign's own card first, else the template's.
    const headerImageUrl = template.header_type === "image" ? (campaign.image_url as string | null) || template.header_image_url || undefined : undefined;
    if (template.header_type === "image" && !headerImageUrl) return fail("This template needs a picture. Add a card to the campaign.");

    try {
      const { metaMessageId } = await sendTemplateMessage({
        workspace: sender.creds, to: phone, templateName: template.meta_template_name, language: template.language, bodyParams, headerImageUrl,
      });
      await admin.from("campaign_recipients").update({ status: "sent", meta_message_id: metaMessageId, sent_at: new Date().toISOString() }).eq("id", recipient.id);
      await admin.from("messages").insert({ workspace_id: workspace.id, contact_id: recipient.contact_id, direction: "outbound", meta_message_id: metaMessageId, status: "sent" });
      return true;
    } catch (err) {
      return fail(err instanceof Error ? err.message : "Unknown error");
    }
  };

  for (;;) {
    if (Date.now() >= deadline) return { result: `sent ${totalSent} this run, the rest carries on at the next run` };

    const remainingToday = sender.messagingTier - dailySendCount;
    if (remainingToday <= 0) return { result: `sent ${totalSent} | daily tier limit reached — resumes after reset` };

    const { data: recipients } = await admin
      .from("campaign_recipients")
      .select("id, contact_id, contacts(phone, name, email, opted_out, language)")
      .eq("campaign_id", campaign.id)
      .eq("status", "queued")
      .limit(Math.min(BATCH_SIZE, remainingToday));

    if (!recipients || recipients.length === 0) return finish(admin, campaign, workspace, now, totalSent);

    let batchSent = 0;
    for (let i = 0; i < recipients.length; i += PARALLEL_SENDS) {
      if (Date.now() >= deadline) break; // the rest stay queued for the follow-up run
      const group = recipients.slice(i, i + PARALLEL_SENDS) as RecipientRow[];
      const sent = await Promise.all(group.map(sendOne));
      batchSent += sent.filter(Boolean).length;
      totalSeen += group.length;
      if (i + PARALLEL_SENDS < recipients.length) await new Promise((r) => setTimeout(r, PAUSE_BETWEEN_GROUPS_MS));
    }

    totalSent += batchSent;
    dailySendCount += batchSent;
    if (batchSent > 0) await admin.from(sender.table).update({ daily_send_count: dailySendCount }).eq("id", sender.id);

    // Auto-pause check after every batch, so a systemic problem stops the send early.
    const paused = await autoPauseIfFailing(admin, campaign, workspace);
    if (paused) return { result: `sent ${totalSent}/${totalSeen} | auto-paused (${paused}% failure rate)` };
  }
}

async function autoPauseIfFailing(admin: Admin, campaign: { id: string; name: string }, workspace: WorkspaceRow): Promise<number | null> {
  const { data: stats } = await admin.from("campaign_recipients").select("status").eq("campaign_id", campaign.id).neq("status", "queued");
  const concluded = stats?.length ?? 0;
  const failed = stats?.filter((r) => r.status === "failed").length ?? 0;
  if (concluded < AUTO_PAUSE_MIN_SAMPLE || failed / concluded <= AUTO_PAUSE_THRESHOLD) return null;

  const pct = Math.round((failed / concluded) * 100);
  await admin.from("campaigns").update({ status: "paused" }).eq("id", campaign.id);
  // Individual send failures are not sent to Sentry (that would flood it on every large campaign),
  // but this threshold crossing, at most once per campaign, is.
  Sentry.captureMessage(`Campaign auto-paused: ${pct}% failure rate`, { level: "warning", tags: { workspaceId: workspace.id, campaignId: campaign.id } });
  // Awaited here rather than deferred: this can run inside a background task, where deferring again is not allowed.
  await (async () => {
    const email = await getWorkspaceOwnerEmail(admin, workspace.id);
    if (email) {
      await sendEmail(email, `Campaign auto-paused: ${campaign.name}`, `
        <h2 style="margin:0 0 8px">Campaign auto-paused</h2>
        <p><strong>${campaign.name}</strong> was automatically paused because <strong>${pct}%</strong> of sends failed (${failed} of ${concluded}).</p>
        <p>High failure rates hurt your WhatsApp sender reputation. Review the errors, retry fixed contacts, and resume when ready.</p>
        <p><a href="https://app.sendkar.shop/campaigns/${campaign.id}">Review and retry →</a></p>
      `);
    }
  })().catch(() => {});
  return pct;
}

async function finish(
  admin: Admin,
  campaign: { id: string; name: string },
  workspace: WorkspaceRow,
  now: Date,
  totalSent: number,
): Promise<{ result: string }> {
  const paused = await autoPauseIfFailing(admin, campaign, workspace);
  if (paused) return { result: `auto-paused — ${paused}% failure rate` };

  const { data: allStats } = await admin.from("campaign_recipients").select("status").eq("campaign_id", campaign.id).neq("status", "queued");
  const concluded = allStats?.length ?? 0;
  const failedCount = allStats?.filter((r) => r.status === "failed").length ?? 0;

  await admin.from("campaigns").update({ status: "completed", completed_at: now.toISOString() }).eq("id", campaign.id);

  await (async () => {
    dispatchOutboundWebhooks(workspace.id, "campaign.completed", { campaignId: campaign.id });
    const delivered = allStats?.filter((r) => r.status === "delivered" || r.status === "read").length ?? 0;
    const deliveryRate = concluded > 0 ? Math.round((delivered / concluded) * 100) : 0;
    const email = await getWorkspaceOwnerEmail(admin, workspace.id);
    if (email) {
      await sendEmail(email, `Campaign completed: ${campaign.name}`, `
        <h2 style="margin:0 0 8px">Campaign completed ✓</h2>
        <p><strong>${campaign.name}</strong> has finished sending.</p>
        <table style="border-collapse:collapse;margin:12px 0">
          <tr><td style="padding:4px 16px 4px 0;color:#6b7280">Sent</td><td style="font-weight:600">${concluded.toLocaleString()}</td></tr>
          <tr><td style="padding:4px 16px 4px 0;color:#6b7280">Delivery rate</td><td style="font-weight:600;color:#22c55e">${deliveryRate}%</td></tr>
          ${failedCount > 0 ? `<tr><td style="padding:4px 16px 4px 0;color:#6b7280">Failed</td><td style="font-weight:600;color:#ef4444">${failedCount}</td></tr>` : ""}
        </table>
        <p><a href="https://app.sendkar.shop/campaigns/${campaign.id}">View full report →</a></p>
      `);
    }
  })().catch(() => {});
  return { result: totalSent > 0 ? `completed (${totalSent} sent this run)` : "completed" };
}

/** Takes the hold on a campaign. Only one run at a time gets it; null means another run is already sending. */
async function claim(admin: Admin, campaignId: string): Promise<boolean> {
  const now = new Date();
  const { data, error } = await admin
    .from("campaigns")
    .update({ send_lock_until: new Date(now.getTime() + LOCK_MS).toISOString() })
    .eq("id", campaignId)
    .eq("status", "sending")
    .or(`send_lock_until.is.null,send_lock_until.lt.${now.toISOString()}`)
    .select("id");
  if (error) {
    Sentry.captureMessage(`Campaign send hold failed: ${error.message}`, { level: "error", tags: { campaignId } });
    return false;
  }
  return (data?.length ?? 0) > 0;
}

export type RunOptions = {
  /** Only this campaign (used right after "Start"). Without it, every due campaign runs. */
  campaignId?: string;
};

/**
 * Entry point for both the daily job and the "Start" button. Sends as much as the time budget allows
 * (thousands of messages per run). Anything still queued carries on at the next daily run.
 */
export async function runCampaignSends(opts: RunOptions = {}): Promise<Record<string, string>> {
  const admin = createAdminClient();
  const now = new Date();
  const deadline = Date.now() + RUN_BUDGET_MS;

  let query = admin.from("campaigns").select("*, workspaces(*)").eq("status", "sending").or(`scheduled_at.is.null,scheduled_at.lte.${now.toISOString()}`);
  if (opts.campaignId) query = query.eq("id", opts.campaignId);
  const { data: campaigns } = await query;

  const results: Record<string, string> = {};
  for (const campaign of campaigns ?? []) {
    if (!(await claim(admin, campaign.id))) { results[campaign.id] = "already being sent by another run"; continue; }
    try {
      results[campaign.id] = (await runOneCampaign(admin, campaign, deadline, now)).result;
    } finally {
      await admin.from("campaigns").update({ send_lock_until: null }).eq("id", campaign.id);
    }
  }
  return results;
}
