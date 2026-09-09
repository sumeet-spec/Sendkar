import { NextRequest, NextResponse, after } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendTemplateMessage, type WorkspaceCreds } from "@/lib/whatsapp";
import { dispatchOutboundWebhooks } from "@/lib/outboundWebhooks";
import { sendEmail } from "@/lib/email";

const MAX_PER_RUN = 100;
const DELAY_BETWEEN_SENDS_MS = 250;
const AUTO_PAUSE_THRESHOLD = 0.20; // pause if >20% of concluded sends fail
const AUTO_PAUSE_MIN_SAMPLE = 10; // don't auto-pause until at least 10 sends concluded

export const maxDuration = 60;

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

async function getWorkspaceOwnerEmail(admin: ReturnType<typeof createAdminClient>, workspaceId: string): Promise<string | null> {
  const { data: member } = await admin
    .from("workspace_members")
    .select("user_id")
    .eq("workspace_id", workspaceId)
    .eq("role", "owner")
    .maybeSingle();
  if (!member) return null;
  const { data: { user } } = await admin.auth.admin.getUserById(member.user_id);
  return user?.email ?? null;
}

function resolveParam(field: string, contact: { name?: string | null; phone?: string; email?: string | null }): string {
  if (field === "name") return contact.name || "there";
  if (field === "phone") return contact.phone || "";
  if (field === "email") return contact.email || "";
  return contact.name || "there";
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const now = new Date();

  // Only process campaigns whose scheduled time has arrived (or has no schedule)
  const { data: campaigns } = await admin
    .from("campaigns")
    .select("*, workspaces(*)")
    .eq("status", "sending")
    .or(`scheduled_at.is.null,scheduled_at.lte.${now.toISOString()}`);

  const results: Record<string, unknown> = {};

  for (const campaign of campaigns ?? []) {
    const workspace = campaign.workspaces as {
      id: string; whatsapp_phone_number_id: string | null; whatsapp_access_token: string | null;
      messaging_tier: number; daily_send_count: number; daily_reset_at: string;
    };

    const sender = await resolveSender(admin, workspace, campaign.whatsapp_number_id);

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
      .select("id, contact_id, contacts(phone, name, email, opted_out, language)")
      .eq("campaign_id", campaign.id)
      .eq("status", "queued")
      .limit(Math.min(MAX_PER_RUN, remainingToday));

    if (!recipients || recipients.length === 0) {
      // Check auto-pause threshold before marking complete
      const { data: allStats } = await admin
        .from("campaign_recipients")
        .select("status")
        .eq("campaign_id", campaign.id)
        .neq("status", "queued");
      const concluded = allStats?.length ?? 0;
      const failedCount = allStats?.filter((r) => r.status === "failed").length ?? 0;

      if (concluded >= AUTO_PAUSE_MIN_SAMPLE && failedCount / concluded > AUTO_PAUSE_THRESHOLD) {
        await admin.from("campaigns").update({ status: "paused" }).eq("id", campaign.id);
        after(async () => {
          const email = await getWorkspaceOwnerEmail(admin, workspace.id);
          if (email) {
            await sendEmail(email, `Campaign auto-paused: ${campaign.name}`, `
              <h2 style="margin:0 0 8px">Campaign auto-paused</h2>
              <p><strong>${campaign.name}</strong> was automatically paused because <strong>${Math.round(failedCount / concluded * 100)}%</strong> of sends failed (${failedCount} of ${concluded}).</p>
              <p>High failure rates hurt your WhatsApp sender reputation. Review the errors, retry fixed contacts, and resume when ready.</p>
              <p><a href="https://app.sendkar.shop/campaigns/${campaign.id}">View campaign →</a></p>
            `);
          }
        });
        results[campaign.id] = `auto-paused — ${Math.round(failedCount / concluded * 100)}% failure rate`;
        continue;
      }

      await admin
        .from("campaigns")
        .update({ status: "completed", completed_at: now.toISOString() })
        .eq("id", campaign.id);

      after(async () => {
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
      });

      results[campaign.id] = "completed";
      continue;
    }

    const { data: primaryTemplate } = await admin
      .from("templates")
      .select("meta_template_name, language, body_text")
      .eq("id", campaign.template_id)
      .single();

    let templatesByLanguage = new Map<string, { meta_template_name: string; language: string; body_text: string | null }>();
    if (campaign.template_group) {
      const { data: groupTemplates } = await admin
        .from("templates")
        .select("meta_template_name, language, body_text")
        .eq("workspace_id", workspace.id)
        .eq("template_group", campaign.template_group);
      templatesByLanguage = new Map((groupTemplates ?? []).map((t) => [t.language, t]));
    }

    const variableMapping = (campaign.variable_mapping ?? {}) as Record<string, string>;

    let sentCount = 0;
    for (const recipient of recipients) {
      const contactRow = recipient.contacts as { phone?: string; name?: string | null; email?: string | null; opted_out?: boolean; language?: string } | null;
      const phone = contactRow?.phone;
      const template = (contactRow?.language && templatesByLanguage.get(contactRow.language)) || primaryTemplate;
      if (!phone || !template) continue;

      if (contactRow?.opted_out) {
        await admin.from("campaign_recipients").update({ status: "failed", error: "Contact opted out" }).eq("id", recipient.id);
        continue;
      }

      if (sentCount > 0) await new Promise((r) => setTimeout(r, DELAY_BETWEEN_SENDS_MS));

      const placeholderCount = (template.body_text?.match(/\{\{\d+\}\}/g) ?? []).length;
      const bodyParams = placeholderCount > 0
        ? Array.from({ length: placeholderCount }, (_, i) => {
            const field = variableMapping[String(i + 1)];
            return field ? resolveParam(field, { name: contactRow?.name, phone: contactRow?.phone, email: contactRow?.email }) : (contactRow?.name || "there");
          })
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

    // Auto-pause check after this batch
    const { data: batchStats } = await admin
      .from("campaign_recipients")
      .select("status")
      .eq("campaign_id", campaign.id)
      .neq("status", "queued");
    const batchConcluded = batchStats?.length ?? 0;
    const batchFailed = batchStats?.filter((r) => r.status === "failed").length ?? 0;
    if (batchConcluded >= AUTO_PAUSE_MIN_SAMPLE && batchFailed / batchConcluded > AUTO_PAUSE_THRESHOLD) {
      await admin.from("campaigns").update({ status: "paused" }).eq("id", campaign.id);
      after(async () => {
        const email = await getWorkspaceOwnerEmail(admin, workspace.id);
        if (email) {
          await sendEmail(email, `Campaign auto-paused: ${campaign.name}`, `
            <h2 style="margin:0 0 8px">Campaign auto-paused</h2>
            <p><strong>${campaign.name}</strong> was automatically paused because <strong>${Math.round(batchFailed / batchConcluded * 100)}%</strong> of sends failed (${batchFailed} of ${batchConcluded}).</p>
            <p>High failure rates hurt your WhatsApp sender reputation. Review the errors, retry fixed contacts, and resume when ready.</p>
            <p><a href="https://app.sendkar.shop/campaigns/${campaign.id}">Review and retry →</a></p>
          `);
        }
      });
      results[campaign.id] = `sent ${sentCount}/${recipients.length} | auto-paused (${Math.round(batchFailed / batchConcluded * 100)}% failure rate)`;
      continue;
    }

    results[campaign.id] = `sent ${sentCount}/${recipients.length}`;
  }

  return NextResponse.json({ ok: true, results });
}
