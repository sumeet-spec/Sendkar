import { NextRequest, NextResponse } from "next/server";
import { resolveApiKey } from "@/lib/apiKeys";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendTemplateMessage, sendSessionMessage, sendProductMessage } from "@/lib/whatsapp";
import { resolveNumberCredentials } from "@/lib/whatsappNumbers";
import { attributeOrder } from "@/lib/attribution";

/**
 * Sendkar's MCP server — lets Claude (or any MCP client) send WhatsApp
 * messages, manage contacts/templates/campaigns directly, without a
 * browser session. Auth is a Sendkar API key (Settings -> API keys) as a
 * Bearer token, resolved to a workspace on every call — there's no
 * concept of a login here, only "this key belongs to this workspace."
 *
 * Implements the MCP Streamable HTTP transport in its simplest legal
 * form: one stateless JSON response per JSON-RPC request, no server-held
 * session between calls (nothing here needs multi-turn state) and no
 * SSE stream (GET returns 405, which the spec allows for a server that
 * has nothing to push).
 */

const PROTOCOL_VERSION = "2025-06-18";

// PostgREST filter metacharacters — stripped before any value reaches an
// .ilike()/.or() filter string built by hand below.
function sanitizeFilterValue(v: string): string {
  return v.replace(/[,.()%]/g, "");
}

function textResult(id: unknown, text: string, isError = false) {
  return NextResponse.json({ jsonrpc: "2.0", id, result: { content: [{ type: "text", text }], isError } });
}
function rpcResult(id: unknown, result: unknown) {
  return NextResponse.json({ jsonrpc: "2.0", id, result });
}
function rpcError(id: unknown, code: number, message: string, status = 200) {
  return NextResponse.json({ jsonrpc: "2.0", id, error: { code, message } }, { status });
}

const TOOLS = [
  {
    name: "list_contacts",
    description: "List or search WhatsApp contacts in this workspace.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Filter by phone number or name substring" },
        tag: { type: "string", description: "Filter to contacts with this exact tag" },
        limit: { type: "number", description: "Max results, default 50" },
      },
    },
  },
  {
    name: "list_templates",
    description: "List message templates and their Meta approval status.",
    inputSchema: { type: "object", properties: { limit: { type: "number" } } },
  },
  {
    name: "list_campaigns",
    description: "List recent broadcast campaigns with their status.",
    inputSchema: { type: "object", properties: { limit: { type: "number" } } },
  },
  {
    name: "get_campaign_status",
    description: "Get send/delivery/read/failed counts for one campaign.",
    inputSchema: { type: "object", properties: { campaignId: { type: "string" } }, required: ["campaignId"] },
  },
  {
    name: "list_whatsapp_numbers",
    description: "List additional WhatsApp numbers registered on this workspace beyond the default one.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "create_campaign",
    description: "Create a draft campaign from an existing approved template. Does not send anything until start_campaign is called.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string" },
        templateId: { type: "string", description: "From list_templates" },
        segmentTag: { type: "string", description: "Optional — only send to contacts with this tag" },
        whatsappNumberId: { type: "string", description: "Optional — from list_whatsapp_numbers. Defaults to the primary number." },
      },
      required: ["name", "templateId"],
    },
  },
  {
    name: "start_campaign",
    description: "Snapshot the audience and start sending a draft campaign. Actual sends happen on the next scheduled run, respecting Meta's daily tier limit.",
    inputSchema: { type: "object", properties: { campaignId: { type: "string" } }, required: ["campaignId"] },
  },
  {
    name: "send_template_message",
    description: "Send one approved template message to a single phone number right now (not a broadcast).",
    inputSchema: {
      type: "object",
      properties: {
        to: { type: "string", description: "Digits only, with country code, e.g. 919876543210" },
        templateName: { type: "string", description: "The Meta template name from list_templates" },
        language: { type: "string" },
        bodyParams: { type: "array", items: { type: "string" }, description: "Positional {{1}}, {{2}}... values, if the template has any" },
        whatsappNumberId: { type: "string", description: "Optional — from list_whatsapp_numbers. Defaults to the primary number." },
      },
      required: ["to", "templateName", "language"],
    },
  },
  {
    name: "send_session_message",
    description: "Send a free-text reply to a contact. Only works within 24h of their last inbound message.",
    inputSchema: {
      type: "object",
      properties: { to: { type: "string" }, body: { type: "string" } },
      required: ["to", "body"],
    },
  },
  {
    name: "list_products",
    description: "List products in the catalog (must also exist in the connected Meta Commerce catalog to actually be sendable).",
    inputSchema: { type: "object", properties: { limit: { type: "number" } } },
  },
  {
    name: "log_order",
    description: "Record a real sale against a contact — no Shopify/WooCommerce connection required. Attributes it to whichever campaign this contact was most recently sent, if any, within the last 7 days.",
    inputSchema: {
      type: "object",
      properties: {
        to: { type: "string", description: "The contact's phone number — must already exist as a contact." },
        amount: { type: "number", description: "Sale amount in the workspace's currency (INR by default)." },
        note: { type: "string", description: "Optional — what they bought." },
      },
      required: ["to", "amount"],
    },
  },
  {
    name: "get_revenue_summary",
    description: "Total revenue tracked in Sendkar (manual + Shopify + WooCommerce), broken down by which campaign — if any — drove each sale.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "send_product_message",
    description: "Send a single product card from the catalog to a contact. Only works within the 24h window and requires a catalog ID configured in Settings.",
    inputSchema: {
      type: "object",
      properties: { to: { type: "string" }, productRetailerId: { type: "string", description: "From list_products" } },
      required: ["to", "productRetailerId"],
    },
  },
];

export async function GET() {
  return NextResponse.json({ error: "This MCP server only supports POST (no server-push stream is offered)." }, { status: 405 });
}

export async function POST(request: NextRequest) {
  let body: { jsonrpc?: string; id?: unknown; method?: string; params?: Record<string, unknown> };
  try {
    body = await request.json();
  } catch {
    return rpcError(null, -32700, "Parse error", 400);
  }

  const { id = null, method, params = {} } = body;
  if (!method) return rpcError(id, -32600, "Invalid request — missing method");

  if (method === "initialize") {
    return rpcResult(id, {
      protocolVersion: PROTOCOL_VERSION,
      capabilities: { tools: {} },
      serverInfo: { name: "sendkar", version: "1.0.0" },
    });
  }
  if (method === "notifications/initialized" || method === "ping") {
    return new NextResponse(null, { status: 202 });
  }

  const authHeader = request.headers.get("authorization");
  const token = authHeader?.match(/^Bearer\s+(.+)$/i)?.[1] ?? null;
  const auth = await resolveApiKey(token);

  if (method === "tools/list") {
    return rpcResult(id, { tools: TOOLS });
  }

  if (method !== "tools/call") {
    return rpcError(id, -32601, `Unknown method: ${method}`);
  }

  if (!auth) {
    return textResult(id, "Unauthorized — the API key is missing, invalid, or revoked. Create one in Sendkar under Settings -> API keys.", true);
  }

  const toolName = params.name as string;
  const args = (params.arguments as Record<string, unknown>) ?? {};
  const admin = createAdminClient();
  const workspaceId = auth.workspaceId;

  try {
    switch (toolName) {
      case "list_contacts": {
        let q = admin
          .from("contacts")
          .select("id, phone, name, language, tags, opted_out")
          .eq("workspace_id", workspaceId)
          .limit(Math.min(Number(args.limit) || 50, 200));
        const query = typeof args.query === "string" ? sanitizeFilterValue(args.query) : "";
        if (query) q = q.or(`phone.ilike.%${query}%,name.ilike.%${query}%`);
        if (typeof args.tag === "string" && args.tag) q = q.contains("tags", [args.tag]);
        const { data } = await q;
        return textResult(id, JSON.stringify(data ?? []));
      }

      case "list_templates": {
        const { data } = await admin
          .from("templates")
          .select("id, name, meta_template_name, language, category, status, rejection_reason")
          .eq("workspace_id", workspaceId)
          .order("created_at", { ascending: false })
          .limit(Math.min(Number(args.limit) || 50, 200));
        return textResult(id, JSON.stringify(data ?? []));
      }

      case "list_campaigns": {
        const { data } = await admin
          .from("campaigns")
          .select("id, name, status, created_at, templates(name, language)")
          .eq("workspace_id", workspaceId)
          .order("created_at", { ascending: false })
          .limit(Math.min(Number(args.limit) || 50, 200));
        return textResult(id, JSON.stringify(data ?? []));
      }

      case "list_whatsapp_numbers": {
        const { data } = await admin.from("whatsapp_numbers").select("id, label, display_number").eq("workspace_id", workspaceId).order("created_at", { ascending: false });
        return textResult(id, JSON.stringify(data ?? []));
      }

      case "get_campaign_status": {
        const campaignId = String(args.campaignId ?? "");
        const { data: campaign } = await admin.from("campaigns").select("id, name, status").eq("id", campaignId).eq("workspace_id", workspaceId).maybeSingle();
        if (!campaign) return textResult(id, "Campaign not found.", true);
        const { data: recipients } = await admin.from("campaign_recipients").select("status").eq("campaign_id", campaignId);
        const counts = (recipients ?? []).reduce<Record<string, number>>((acc, r) => {
          acc[r.status] = (acc[r.status] ?? 0) + 1;
          return acc;
        }, {});
        return textResult(id, JSON.stringify({ ...campaign, counts }));
      }

      case "create_campaign": {
        const name = String(args.name ?? "").trim();
        const templateId = String(args.templateId ?? "");
        if (!name || !templateId) return textResult(id, "name and templateId are required.", true);
        const { data: chosenTemplate } = await admin.from("templates").select("template_group").eq("id", templateId).single();
        const { data, error } = await admin
          .from("campaigns")
          .insert({
            workspace_id: workspaceId,
            name,
            template_id: templateId,
            template_group: chosenTemplate?.template_group ?? null,
            segment_tag: args.segmentTag || null,
            whatsapp_number_id: args.whatsappNumberId || null,
            status: "draft",
          })
          .select("id")
          .single();
        if (error) return textResult(id, error.message, true);
        return textResult(id, JSON.stringify({ campaignId: data.id }));
      }

      case "start_campaign": {
        const campaignId = String(args.campaignId ?? "");
        const { data: campaign } = await admin
          .from("campaigns")
          .select("id, workspace_id, segment_tag, template_group, status, templates(language)")
          .eq("id", campaignId)
          .eq("workspace_id", workspaceId)
          .maybeSingle();
        if (!campaign || campaign.status !== "draft") return textResult(id, "Campaign not found or not in draft state.", true);

        let recipientQuery = admin.from("contacts").select("id").eq("workspace_id", workspaceId).eq("opted_out", false);
        if (campaign.template_group) {
          const { data: groupTemplates } = await admin
            .from("templates")
            .select("language")
            .eq("workspace_id", workspaceId)
            .eq("template_group", campaign.template_group);
          const coveredLanguages = [...new Set((groupTemplates ?? []).map((t) => t.language))];
          recipientQuery = recipientQuery.in("language", coveredLanguages);
        } else {
          const language = (campaign.templates as { language?: string } | null)?.language;
          recipientQuery = recipientQuery.eq("language", language);
        }
        if (campaign.segment_tag) recipientQuery = recipientQuery.contains("tags", [campaign.segment_tag]);
        const { data: contacts } = await recipientQuery;

        if (contacts && contacts.length > 0) {
          await admin.from("campaign_recipients").insert(contacts.map((c) => ({ campaign_id: campaignId, contact_id: c.id, status: "queued" as const })));
        }
        await admin.from("campaigns").update({ status: "sending", started_at: new Date().toISOString() }).eq("id", campaignId);
        return textResult(id, JSON.stringify({ queued: contacts?.length ?? 0 }));
      }

      case "send_template_message": {
        const to = String(args.to ?? "").replace(/[^\d]/g, "");
        const templateName = String(args.templateName ?? "");
        const language = String(args.language ?? "");
        if (!to || !templateName || !language) return textResult(id, "to, templateName, and language are required.", true);

        const { data: workspace } = await admin
          .from("workspaces")
          .select("id, whatsapp_phone_number_id, whatsapp_access_token, daily_send_count, messaging_tier")
          .eq("id", workspaceId)
          .single();
        if (!workspace) return textResult(id, "Workspace not found.", true);

        const numberId = typeof args.whatsappNumberId === "string" ? args.whatsappNumberId : null;
        const creds = await resolveNumberCredentials(workspace, numberId);

        const { metaMessageId } = await sendTemplateMessage({
          workspace: creds,
          to,
          templateName,
          language,
          bodyParams: Array.isArray(args.bodyParams) ? (args.bodyParams as string[]) : undefined,
        });

        const { data: contact } = await admin.from("contacts").select("id").eq("workspace_id", workspaceId).eq("phone", to).maybeSingle();
        await admin.from("messages").insert({
          workspace_id: workspaceId,
          contact_id: contact?.id ?? null,
          direction: "outbound",
          meta_message_id: metaMessageId,
          status: "sent",
        });

        // Track the daily count against whichever number actually sent this — the
        // pinned secondary number if one was given, otherwise the workspace default.
        if (numberId) {
          const { data: number } = await admin.from("whatsapp_numbers").select("daily_send_count").eq("id", numberId).maybeSingle();
          if (number) await admin.from("whatsapp_numbers").update({ daily_send_count: number.daily_send_count + 1 }).eq("id", numberId);
        } else {
          await admin.from("workspaces").update({ daily_send_count: workspace.daily_send_count + 1 }).eq("id", workspaceId);
        }

        return textResult(id, JSON.stringify({ sent: true, metaMessageId }));
      }

      case "send_session_message": {
        const to = String(args.to ?? "").replace(/[^\d]/g, "");
        const messageBody = String(args.body ?? "").trim();
        if (!to || !messageBody) return textResult(id, "to and body are required.", true);

        const { data: contact } = await admin
          .from("contacts")
          .select("id, session_expires_at")
          .eq("workspace_id", workspaceId)
          .eq("phone", to)
          .maybeSingle();
        if (!contact) return textResult(id, "No contact with that phone number has messaged this workspace yet.", true);
        if (!contact.session_expires_at || new Date(contact.session_expires_at) < new Date()) {
          return textResult(id, "The 24h reply window has closed for this contact — use send_template_message instead.", true);
        }

        const { data: workspace } = await admin
          .from("workspaces")
          .select("whatsapp_phone_number_id, whatsapp_access_token")
          .eq("id", workspaceId)
          .single();
        if (!workspace) return textResult(id, "Workspace not found.", true);

        const { metaMessageId } = await sendSessionMessage({ workspace, to, body: messageBody });
        await admin.from("messages").insert({
          workspace_id: workspaceId,
          contact_id: contact.id,
          direction: "outbound",
          body: messageBody,
          meta_message_id: metaMessageId,
          status: "sent",
        });

        return textResult(id, JSON.stringify({ sent: true, metaMessageId }));
      }

      case "list_products": {
        const { data } = await admin
          .from("products")
          .select("id, retailer_id, name, price_label, is_active")
          .eq("workspace_id", workspaceId)
          .order("created_at", { ascending: false })
          .limit(Math.min(Number(args.limit) || 50, 200));
        return textResult(id, JSON.stringify(data ?? []));
      }

      case "log_order": {
        const to = String(args.to ?? "").replace(/[^\d]/g, "");
        const amount = Number(args.amount);
        if (!to || !Number.isFinite(amount) || amount <= 0) return textResult(id, "to and a positive amount are required.", true);

        const { data: contact } = await admin.from("contacts").select("id").eq("workspace_id", workspaceId).eq("phone", to).maybeSingle();
        if (!contact) return textResult(id, "No contact with that phone number has messaged this workspace yet.", true);

        const orderDate = new Date();
        const attributedCampaignId = await attributeOrder(admin, contact.id, orderDate);
        const { error } = await admin.from("orders").insert({
          workspace_id: workspaceId,
          contact_id: contact.id,
          source: "manual",
          total_amount: amount,
          note: typeof args.note === "string" ? args.note : null,
          attributed_campaign_id: attributedCampaignId,
        });
        if (error) return textResult(id, error.message, true);
        return textResult(id, JSON.stringify({ logged: true, attributedCampaignId }));
      }

      case "get_revenue_summary": {
        const { data: orders } = await admin
          .from("orders")
          .select("total_amount, attributed_campaign_id, campaigns(name)")
          .eq("workspace_id", workspaceId);

        let totalRevenue = 0;
        let organicRevenue = 0;
        const byCampaign = new Map<string, { name: string; revenue: number; orderCount: number }>();
        for (const o of orders ?? []) {
          const campaign = o.campaigns as { name?: string } | null;
          totalRevenue += Number(o.total_amount);
          if (!o.attributed_campaign_id || !campaign?.name) {
            organicRevenue += Number(o.total_amount);
            continue;
          }
          const bucket = byCampaign.get(o.attributed_campaign_id) ?? { name: campaign.name, revenue: 0, orderCount: 0 };
          bucket.revenue += Number(o.total_amount);
          bucket.orderCount += 1;
          byCampaign.set(o.attributed_campaign_id, bucket);
        }

        return textResult(id, JSON.stringify({
          totalRevenue,
          organicRevenue,
          byCampaign: Array.from(byCampaign.entries()).map(([campaignId, c]) => ({ campaignId, ...c })),
        }));
      }

      case "send_product_message": {
        const to = String(args.to ?? "").replace(/[^\d]/g, "");
        const productRetailerId = String(args.productRetailerId ?? "");
        if (!to || !productRetailerId) return textResult(id, "to and productRetailerId are required.", true);

        const { data: workspace } = await admin
          .from("workspaces")
          .select("whatsapp_phone_number_id, whatsapp_access_token, catalog_id")
          .eq("id", workspaceId)
          .single();
        if (!workspace) return textResult(id, "Workspace not found.", true);
        if (!workspace.catalog_id) return textResult(id, "No catalog ID configured — add one in Settings -> Channels.", true);

        const { data: contact } = await admin.from("contacts").select("id, session_expires_at").eq("workspace_id", workspaceId).eq("phone", to).maybeSingle();
        if (!contact) return textResult(id, "No contact with that phone number has messaged this workspace yet.", true);
        if (!contact.session_expires_at || new Date(contact.session_expires_at) < new Date()) {
          return textResult(id, "The 24h reply window has closed for this contact.", true);
        }

        const { metaMessageId } = await sendProductMessage({ workspace, to, catalogId: workspace.catalog_id, productRetailerId });
        await admin.from("messages").insert({
          workspace_id: workspaceId,
          contact_id: contact.id,
          direction: "outbound",
          body: `[Product: ${productRetailerId}]`,
          meta_message_id: metaMessageId,
          status: "sent",
        });
        return textResult(id, JSON.stringify({ sent: true, metaMessageId }));
      }

      default:
        return textResult(id, `Unknown tool: ${toolName}`, true);
    }
  } catch (err) {
    return textResult(id, err instanceof Error ? err.message : "Tool call failed.", true);
  }
}
