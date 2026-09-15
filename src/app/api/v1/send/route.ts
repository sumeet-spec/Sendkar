import { NextRequest, NextResponse } from "next/server";
import { resolveApiKey } from "@/lib/apiKeys";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendTemplateMessage } from "@/lib/whatsapp";
import { isRateLimited } from "@/lib/rateLimit";

/**
 * Plain REST/JSON send endpoint — the piece that makes Zapier/Make/Pabbly
 * Connect (or literally any tool with a generic "send an HTTP request"
 * action) able to TRIGGER a WhatsApp send, not just receive events from
 * Sendkar. The MCP server speaks JSON-RPC, which most no-code tools don't;
 * this speaks the plain POST-a-JSON-body shape every one of them supports
 * out of the box via their generic webhook/HTTP action.
 */
export async function POST(request: NextRequest) {
  const token = request.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1] ?? null;
  const auth = await resolveApiKey(token);
  if (!auth) return NextResponse.json({ error: "Unauthorized — pass a Sendkar API key as a Bearer token." }, { status: 401 });

  // A leaked or misbehaving key otherwise has nothing standing between it and
  // unlimited WhatsApp sends — real per-message cost, and enough volume can
  // get the number flagged by Meta. 60/min is generous for real automation
  // (Zapier/Make) while capping a runaway loop.
  if (await isRateLimited(`apisend:${auth.apiKeyId}`, 60, 60)) {
    return NextResponse.json({ error: "Rate limit exceeded — max 60 sends per minute per API key." }, { status: 429 });
  }

  let body: { to?: string; templateName?: string; language?: string; bodyParams?: string[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const to = String(body.to ?? "").replace(/[^\d]/g, "");
  const templateName = String(body.templateName ?? "");
  const language = String(body.language ?? "");
  if (!to || !templateName || !language) {
    return NextResponse.json({ error: "to, templateName, and language are required." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: workspace } = await admin
    .from("workspaces")
    .select("whatsapp_phone_number_id, whatsapp_access_token, daily_send_count, daily_reset_at, messaging_tier")
    .eq("id", auth.workspaceId)
    .single();
  if (!workspace) return NextResponse.json({ error: "Workspace not found." }, { status: 404 });

  // Same daily-tier accounting as cron/send.ts — this endpoint bypasses the
  // campaign cron entirely, so without this check a leaked key (or a
  // misconfigured Zapier loop) could push a workspace's number past Meta's
  // own messaging-tier cap with nothing here to stop it.
  const now = new Date();
  let dailySendCount = workspace.daily_send_count;
  if (now >= new Date(workspace.daily_reset_at)) {
    dailySendCount = 0;
    const nextReset = new Date(now);
    nextReset.setUTCHours(0, 0, 0, 0);
    nextReset.setUTCDate(nextReset.getUTCDate() + 1);
    await admin.from("workspaces").update({ daily_send_count: 0, daily_reset_at: nextReset.toISOString() }).eq("id", auth.workspaceId);
  }
  if (dailySendCount >= workspace.messaging_tier) {
    return NextResponse.json({ error: "Daily messaging-tier limit reached for this WhatsApp number — resumes after the daily reset." }, { status: 429 });
  }

  try {
    const { metaMessageId } = await sendTemplateMessage({
      workspace,
      to,
      templateName,
      language,
      bodyParams: Array.isArray(body.bodyParams) ? body.bodyParams : undefined,
    });

    const { data: contact } = await admin.from("contacts").select("id").eq("workspace_id", auth.workspaceId).eq("phone", to).maybeSingle();
    await admin.from("messages").insert({
      workspace_id: auth.workspaceId,
      contact_id: contact?.id ?? null,
      direction: "outbound",
      meta_message_id: metaMessageId,
      status: "sent",
    });
    await admin.from("workspaces").update({ daily_send_count: dailySendCount + 1 }).eq("id", auth.workspaceId);

    return NextResponse.json({ sent: true, metaMessageId });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Send failed." }, { status: 502 });
  }
}
