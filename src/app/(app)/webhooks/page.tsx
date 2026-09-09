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

  const webhookIds = (webhooks ?? []).map((w) => w.id);
  const { data: deliveries } = webhookIds.length
    ? await supabase
        .from("webhook_deliveries")
        .select("webhook_id, event, status, attempts, response_status, created_at")
        .in("webhook_id", webhookIds)
        .order("created_at", { ascending: false })
        .limit(50)
    : { data: [] };

  const deliveriesByWebhook = new Map<string, typeof deliveries>();
  for (const d of deliveries ?? []) {
    const list = deliveriesByWebhook.get(d.webhook_id) ?? [];
    list.push(d);
    deliveriesByWebhook.set(d.webhook_id, list);
  }

  const failedRecently = (deliveries ?? []).some((d) => d.status === "failed");

  return (
    <div className="max-w-3xl">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold tracking-tight">Webhooks</h1>
          {failedRecently && (
            <span className="sk-pill border-danger text-danger">failures</span>
          )}
        </div>
        <NewWebhookForm />
      </div>
      <p className="mb-5 text-[13px] text-muted">
        Point these at Zapier, Make, or your own endpoint — events fire on every inbound message, campaign send, and
        order — an alternative to per-platform connectors.
      </p>

      {!limits.outboundWebhooksEnabled && (
        <div className="sk-card mb-5 p-4" style={{ borderColor: "rgba(251,191,36,0.3)" }}>
          <p className="text-sm">
            Outbound webhooks need the Growth plan or above —{" "}
            <a href="/settings/billing" className="text-accent hover:text-accent-hover">upgrade</a>.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {(webhooks ?? []).map((w) => (
          <WebhookRow key={w.id} webhook={w} recentDeliveries={deliveriesByWebhook.get(w.id) ?? []} />
        ))}
        {(!webhooks || webhooks.length === 0) && (
          <div className="rounded-lg border border-border py-10 text-center">
            <p className="text-muted">No webhooks yet.</p>
            <p className="mt-1 text-[12.5px] text-faint">Add one above to start forwarding events to Zapier, Make, or your own server.</p>
          </div>
        )}
      </div>
    </div>
  );
}
