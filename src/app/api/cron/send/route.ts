import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendTemplateMessage } from "@/lib/whatsapp";

/**
 * Vercel Cron hits this on a schedule (see vercel.json). No BullMQ/Redis —
 * at this scale (a few thousand contacts, and Meta's own 250/24h tier cap
 * on a fresh number regardless), a cron-triggered batch is enough and a
 * queue worker would be over-engineering. BATCH_SIZE also doubles as
 * natural pacing: a small batch every run reads as organic sending
 * behavior, not a burst, which is exactly what protects the number's
 * quality rating.
 */
const BATCH_SIZE = 20;

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

    // Roll the daily counter over if we've crossed into a new day.
    let dailySendCount = workspace.daily_send_count;
    if (now >= new Date(workspace.daily_reset_at)) {
      dailySendCount = 0;
      const nextReset = new Date(now);
      nextReset.setUTCHours(0, 0, 0, 0);
      nextReset.setUTCDate(nextReset.getUTCDate() + 1);
      await admin.from("workspaces").update({ daily_send_count: 0, daily_reset_at: nextReset.toISOString() }).eq("id", workspace.id);
    }

    const remainingToday = workspace.messaging_tier - dailySendCount;
    if (remainingToday <= 0) {
      results[campaign.id] = "daily tier limit reached — resumes after reset";
      continue;
    }

    const { data: recipients } = await admin
      .from("campaign_recipients")
      .select("id, contact_id, contacts(phone)")
      .eq("campaign_id", campaign.id)
      .eq("status", "queued")
      .limit(Math.min(BATCH_SIZE, remainingToday));

    if (!recipients || recipients.length === 0) {
      // Nothing left queued — the campaign is done.
      await admin
        .from("campaigns")
        .update({ status: "completed", completed_at: now.toISOString() })
        .eq("id", campaign.id);
      results[campaign.id] = "completed";
      continue;
    }

    const { data: template } = await admin
      .from("templates")
      .select("meta_template_name, language")
      .eq("id", campaign.template_id)
      .single();

    let sentCount = 0;
    for (const recipient of recipients) {
      const phone = (recipient.contacts as { phone?: string } | null)?.phone;
      if (!phone || !template) continue;

      try {
        const { metaMessageId } = await sendTemplateMessage({
          workspace,
          to: phone,
          templateName: template.meta_template_name,
          language: template.language,
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
      await admin
        .from("workspaces")
        .update({ daily_send_count: dailySendCount + sentCount })
        .eq("id", workspace.id);
    }

    results[campaign.id] = `sent ${sentCount}/${recipients.length}`;
  }

  return NextResponse.json({ ok: true, results });
}
