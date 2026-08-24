import { NextRequest, NextResponse, after } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendTemplateMessage, type WorkspaceCreds } from "@/lib/whatsapp";
import { dispatchOutboundWebhooks } from "@/lib/outboundWebhooks";

/**
 * Vercel Cron hits this on a schedule (see vercel.json). No BullMQ/Redis —
 * at this scale (a few thousand contacts, and Meta's own 250/24h tier cap
 * on a fresh number regardless), a cron-triggered batch is enough and a
 * queue worker would be over-engineering.
 *
 * Runs ONCE A DAY, not every few minutes: the Hobby plan Vercel account
 * this deploys to rejects any cron expression that fires more than once
 * per 24h (a real deploy-time error, not a guess) — Pro lifts that, but
 * isn't worth paying for yet. One run/day still clears the FULL daily tier
 * allowance in that single invocation (not a small slice of it), it just
 * means all of a given day's sends land in one window each morning rather
 * than trickling through the day. MAX_PER_RUN exists only to keep that one
 * invocation inside Vercel's function-duration limit, not as pacing.
 */
const MAX_PER_RUN = 100; // ~100 sequential Graph API calls comfortably fits maxDuration below
const DELAY_BETWEEN_SENDS_MS = 250; // avoids bursting Meta's per-second send-rate limit

export const maxDuration = 60; // seconds — Hobby plan's ceiling for a Serverless Function

/**
 * Every workspace's default number tracks its own daily tier in the
 * `workspaces` row; a secondary registered number tracks its own in
 * `whatsapp_numbers` instead — this resolves which table/row a given
 * campaign's sends should be metered and credentialed against, so adding
 * a second number doesn't silently share (or corrupt) the default
 * number's daily count.
 */
async function resolveSender(
  admin: ReturnType<typeof createAdminClient>,
  workspace: { id: string; whatsapp_phone_number_id: string | null; whatsapp_access_token: string | null; messaging_tier: number; daily_send_count: number; daily_reset_at: string },
  numberId: string | null,
) {
  if (numberId) {
    const { data: number } = await admin.from("whatsapp_numbers").select("*").eq("id", numberId).maybeSingle();
    if (number) {
      return {
        table: "whatsapp_numbers" as const,
        id: number.id,
        creds: { whatsapp_phone_number_id: number.phone_number_id, whatsapp_access_token: number.access_token } as WorkspaceCreds,
        messagingTier: number.messaging_tier,
        dailySendCount: number.daily_send_count,
        dailyResetAt: number.daily_reset_at,
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

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const now = new Date();

  const { data: campaigns } = await admin
    .from("campaigns")
    .select("*, workspaces(*)")
    .eq("status", "sending");

  const results: Record<string, unknown> = {};

  for (const campaign of campaigns ?? []) {
    const workspace = campaign.workspaces as {
      id: string; whatsapp_phone_number_id: string | null; whatsapp_access_token: string | null;
      messaging_tier: number; daily_send_count: number; daily_reset_at: string;
    };

    const sender = await resolveSender(admin, workspace, campaign.whatsapp_number_id);

    // Roll the daily counter over if we've crossed into a new day.
    let dailySendCount = sender.dailySendCount;
    if (now >= new Date(sender.dailyResetAt)) {
      dailySendCount = 0;
      const nextReset = new Date(now);
      nextReset.setUTCHours(0, 0, 0, 0);
      nextReset.setUTCDate(nextReset.getUTCDate() + 1);
      await admin.from(sender.table).update({ daily_send_count: 0, daily_reset_at: nextReset.toISOString() }).eq("id", sender.id);
    }

    const remainingToday = sender.messagingTier - dailySendCount;
    if (remainingToday <= 0) {
      results[campaign.id] = "daily tier limit reached — resumes after reset";
      continue;
    }

    const { data: recipients } = await admin
      .from("campaign_recipients")
      .select("id, contact_id, contacts(phone, name, opted_out, language)")
      .eq("campaign_id", campaign.id)
      .eq("status", "queued")
      .limit(Math.min(MAX_PER_RUN, remainingToday));

    if (!recipients || recipients.length === 0) {
      // Nothing left queued — the campaign is done.
      await admin
        .from("campaigns")
        .update({ status: "completed", completed_at: now.toISOString() })
        .eq("id", campaign.id);
      after(() => dispatchOutboundWebhooks(workspace.id, "campaign.completed", { campaignId: campaign.id }));
      results[campaign.id] = "completed";
      continue;
    }

    const { data: primaryTemplate } = await admin
      .from("templates")
      .select("meta_template_name, language, body_text")
      .eq("id", campaign.template_id)
      .single();

    // Multi-language campaign: every group member is a candidate, resolved
    // per recipient by their own language — not one fixed template for
    // everyone regardless of what language they actually read.
    let templatesByLanguage = new Map<string, { meta_template_name: string; language: string; body_text: string | null }>();
    if (campaign.template_group) {
      const { data: groupTemplates } = await admin
        .from("templates")
        .select("meta_template_name, language, body_text")
        .eq("workspace_id", workspace.id)
        .eq("template_group", campaign.template_group);
      templatesByLanguage = new Map((groupTemplates ?? []).map((t) => [t.language, t]));
    }

    let sentCount = 0;
    for (const recipient of recipients) {
      const contactRow = recipient.contacts as { phone?: string; name?: string | null; opted_out?: boolean; language?: string } | null;
      const phone = contactRow?.phone;
      const template = (contactRow?.language && templatesByLanguage.get(contactRow.language)) || primaryTemplate;
      if (!phone || !template) continue;

      // Opted out after being queued (e.g. they replied STOP mid-campaign) — skip, don't fail it.
      if (contactRow?.opted_out) {
        await admin.from("campaign_recipients").update({ status: "failed", error: "Contact opted out" }).eq("id", recipient.id);
        continue;
      }

      if (sentCount > 0) await new Promise((r) => setTimeout(r, DELAY_BETWEEN_SENDS_MS));

      // Meta rejects a send whose param count doesn't exactly match what the
      // template was approved with — a template with {{1}} and {{2}} sent
      // only one param 400s for every recipient, not just a cosmetic gap.
      const placeholderCount = (template.body_text?.match(/\{\{\d+\}\}/g) ?? []).length;
      // Sendkar has no per-contact custom-field system yet, so only slot
      // {{1}} (the contact's name) carries real data — any further slots
      // repeat it rather than send an empty string, which Meta also rejects.
      const bodyParams = placeholderCount > 0
        ? Array.from({ length: placeholderCount }, () => contactRow?.name || "there")
        : undefined;

      try {
        const { metaMessageId } = await sendTemplateMessage({
          workspace: sender.creds,
          to: phone,
          templateName: template.meta_template_name,
          language: template.language,
          bodyParams,
        });

        await admin
          .from("campaign_recipients")
          .update({ status: "sent", meta_message_id: metaMessageId, sent_at: now.toISOString() })
          .eq("id", recipient.id);

        await admin.from("messages").insert({
          workspace_id: workspace.id,
          contact_id: recipient.contact_id,
          direction: "outbound",
          meta_message_id: metaMessageId,
          status: "sent",
        });

        sentCount += 1;
      } catch (err) {
        await admin
          .from("campaign_recipients")
          .update({ status: "failed", error: err instanceof Error ? err.message : "Unknown error" })
          .eq("id", recipient.id);
      }
    }

    if (sentCount > 0) {
      await admin.from(sender.table).update({ daily_send_count: dailySendCount + sentCount }).eq("id", sender.id);
    }

    results[campaign.id] = `sent ${sentCount}/${recipients.length}`;
  }

  return NextResponse.json({ ok: true, results });
}
