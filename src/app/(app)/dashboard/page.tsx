import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { isWhatsAppConfigured } from "@/lib/whatsapp";
import Link from "next/link";

export default async function DashboardPage() {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return null;
  const supabase = await createClient();

  const [{ count: contactCount }, { count: campaignCount }, { data: recipientStats }] = await Promise.all([
    supabase.from("contacts").select("id", { count: "exact", head: true }).eq("workspace_id", workspace.id),
    supabase.from("campaigns").select("id", { count: "exact", head: true }).eq("workspace_id", workspace.id),
    supabase
      .from("campaign_recipients")
      .select("status, campaign_id, campaigns!inner(workspace_id)")
      .eq("campaigns.workspace_id", workspace.id),
  ]);

  const total = recipientStats?.length ?? 0;
  const delivered = recipientStats?.filter((r) => r.status === "delivered" || r.status === "read").length ?? 0;
  const failed = recipientStats?.filter((r) => r.status === "failed").length ?? 0;
  const deliveryRate = total > 0 ? Math.round((delivered / total) * 100) : null;

  const configured = isWhatsAppConfigured(workspace);

  return (
    <div className="max-w-4xl">
      <div className="mb-7 flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">Overview</h1>
        <div className="sk-pill">{configured ? "WhatsApp connected" : "WhatsApp not connected"}</div>
      </div>

      {!configured && (
        <div className="sk-card mb-6 p-5" style={{ borderColor: "rgba(251,191,36,0.3)" }}>
          <p className="text-sm text-foreground">
            No WhatsApp Business number connected yet. <Link href="/onboarding" className="text-accent hover:text-accent-hover">Finish setup</Link> once you
            have a phone number ID and access token from Meta Business Manager — everything else here already works.
          </p>
        </div>
      )}

      <div className="grid grid-cols-4 gap-4">
        <div className="sk-card p-5">
          <div className="mb-2 text-[11px] font-medium uppercase tracking-wide text-faint">Contacts</div>
          <div className="text-2xl font-semibold">{contactCount ?? 0}</div>
        </div>
        <div className="sk-card p-5">
          <div className="mb-2 text-[11px] font-medium uppercase tracking-wide text-faint">Campaigns</div>
          <div className="text-2xl font-semibold">{campaignCount ?? 0}</div>
        </div>
        <div className="sk-card p-5">
          <div className="mb-2 text-[11px] font-medium uppercase tracking-wide text-faint">Messages sent</div>
          <div className="text-2xl font-semibold">{total}</div>
        </div>
        <div className="sk-card p-5">
          <div className="mb-2 text-[11px] font-medium uppercase tracking-wide text-faint">Delivery rate</div>
          <div className="text-2xl font-semibold">{deliveryRate !== null ? `${deliveryRate}%` : "—"}</div>
          {failed > 0 && <div className="mt-1 text-[12px] text-danger">{failed} failed</div>}
        </div>
      </div>

      <div className="sk-card mt-6 p-5">
        <div className="mb-3 text-[11px] font-medium uppercase tracking-wide text-faint">Messaging tier</div>
        <div className="text-sm text-muted">
          {workspace.daily_send_count} / {workspace.messaging_tier} unique recipients sent to today. Meta raises this
          cap (250 → 1,000 → 10,000 → 100,000) as quality stays high — it&apos;s not something Sendkar controls.
        </div>
      </div>
    </div>
  );
}
