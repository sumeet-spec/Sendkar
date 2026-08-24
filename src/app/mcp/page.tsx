import { headers } from "next/headers";
import { Logo } from "@/components/Logo";

export const metadata = { title: "Sendkar MCP Connector" };

const TOOLS = [
  ["list_contacts", "Search or list contacts by phone, name, or tag"],
  ["list_templates", "List message templates and their Meta approval status"],
  ["list_campaigns", "List recent broadcast campaigns and their status"],
  ["get_campaign_status", "Get sent/delivered/read/failed counts for one campaign"],
  ["list_whatsapp_numbers", "List additional numbers registered on this workspace"],
  ["create_campaign", "Create a draft campaign from an approved template"],
  ["start_campaign", "Snapshot the audience and start sending"],
  ["send_template_message", "Send one approved template to a single number, right now"],
  ["send_session_message", "Send a free-text reply within the 24h window"],
  ["list_products", "List catalog products"],
  ["send_product_message", "Send a product card from the catalog to a contact"],
  ["log_order", "Record a real sale against a contact, no storefront required"],
  ["get_revenue_summary", "Total revenue tracked, broken down by which campaign drove it"],
];

export default async function McpPage() {
  const h = await headers();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? `https://${h.get("host")}`;
  const endpoint = `${appUrl}/api/mcp`;

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <div className="mb-1 flex items-center gap-2.5">
        <Logo />
        <span className="text-[15px] font-semibold tracking-tight">Sendkar</span>
      </div>
      <h1 className="mb-2 mt-6 text-2xl font-semibold tracking-tight">MCP connector</h1>
      <p className="mb-8 text-[14.5px] text-muted">
        Send WhatsApp messages, manage campaigns, and check delivery status from Claude — or any other MCP client —
        without leaving the conversation.
      </p>

      <div className="sk-card mb-6 p-5">
        <div className="mb-2 text-[11px] font-medium uppercase tracking-wide text-faint">Endpoint</div>
        <code className="text-[13px] text-accent">{endpoint}</code>
      </div>

      <div className="sk-card mb-6 p-5">
        <div className="mb-2 text-[11px] font-medium uppercase tracking-wide text-faint">Setup</div>
        <ol className="list-decimal space-y-1.5 pl-5 text-[13.5px] text-muted">
          <li>Create a Sendkar account and connect your WhatsApp Business number.</li>
          <li>Generate an API key under Settings → API keys.</li>
          <li>Add the connector in Claude with the endpoint above and your key as a Bearer token.</li>
        </ol>
      </div>

      <div className="sk-card mb-6 p-5">
        <div className="mb-2 text-[11px] font-medium uppercase tracking-wide text-faint">Claude Desktop config</div>
        <pre className="overflow-x-auto rounded-md bg-surface-2 p-3 text-[12px] text-muted">{`{
  "mcpServers": {
    "sendkar": {
      "url": "${endpoint}",
      "headers": { "Authorization": "Bearer YOUR_SENDKAR_API_KEY" }
    }
  }
}`}</pre>
      </div>

      <div className="sk-card overflow-hidden">
        <div className="border-b border-border p-4 text-[11px] font-medium uppercase tracking-wide text-faint">Tools</div>
        {TOOLS.map(([name, desc]) => (
          <div key={name} className="flex items-center justify-between border-b border-border p-4 last:border-0">
            <code className="text-[13px] text-accent">{name}</code>
            <span className="ml-4 text-right text-[12.5px] text-muted">{desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
