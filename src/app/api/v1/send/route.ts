import { NextRequest, NextResponse } from "next/server";
import { resolveApiKey } from "@/lib/apiKeys";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendTemplateMessage } from "@/lib/whatsapp";

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
    .select("whatsapp_phone_number_id, whatsapp_access_token, daily_send_count, messaging_tier")
    .eq("id", auth.workspaceId)
    .single();
  if (!workspace) return NextResponse.json({ error: "Workspace not found." }, { status: 404 });

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
    await admin.from("workspaces").update({ daily_send_count: workspace.daily_send_count + 1 }).eq("id", auth.workspaceId);

    return NextResponse.json({ sent: true, metaMessageId });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Send failed." }, { status: 502 });
  }
}
