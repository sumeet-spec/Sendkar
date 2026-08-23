import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { getPlanLimits } from "@/lib/plans";
import { NewWebhookForm } from "./NewWebhookForm";
import { WebhookRow } from "./WebhookRow";

export default async function WebhooksPage() {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return null;
  const supabase = await createClient();
  const limits = getPlanLimits(workspace.plan);

  const { data: webhooks } = await supabase
    .from("outbound_webhooks")
    .select("id, url, events, secret")
    .eq("workspace_id", workspace.id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">Webhooks</h1>
        <NewWebhookForm />
      </div>
      <p className="mb-5 text-sm text-muted">
        Point these at Zapier, Make, or your own endpoint — an alternative to a dedicated Shopify/HubSpot/Salesforce
        connector for each platform individually.
      </p>

      {!limits.outboundWebhooksEnabled && (
        <div className="sk-card mb-5 p-4" style={{ borderColor: "rgba(251,191,36,0.3)" }}>
          <p className="text-sm">Outbound webhooks need the Growth plan or above — <a href="/settings/billing" className="text-accent hover:text-accent-hover">upgrade</a>.</p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {(webhooks ?? []).map((w) => <WebhookRow key={w.id} webhook={w} />)}
        {(!webhooks || webhooks.length === 0) && <p className="py-8 text-center text-muted">No webhooks yet.</p>}
      </div>
    </div>
  );
}
