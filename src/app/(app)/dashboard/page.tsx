import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { isWhatsAppConfigured } from "@/lib/whatsapp";
import { getCurrentLanguage } from "@/lib/i18n/getLanguage";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { ActivationChecklist } from "./ActivationChecklist";
import Link from "next/link";

export default async function DashboardPage() {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return null;
  const supabase = await createClient();
  const t = getDictionary(await getCurrentLanguage()).dashboard;

  const [{ count: contactCount }, { count: campaignCount }, { data: recipientStats }, { data: orders }, { count: approvedTemplateCount }] = await Promise.all([
    supabase.from("contacts").select("id", { count: "exact", head: true }).eq("workspace_id", workspace.id),
    supabase.from("campaigns").select("id", { count: "exact", head: true }).eq("workspace_id", workspace.id),
    supabase
      .from("campaign_recipients")
      .select("status, campaign_id, campaigns!inner(workspace_id)")
      .eq("campaigns.workspace_id", workspace.id),
    supabase.from("orders").select("contact_id, total_amount, attributed_campaign_id, contacts(phone, name)").eq("workspace_id", workspace.id),
    supabase.from("templates").select("id", { count: "exact", head: true }).eq("workspace_id", workspace.id).eq("status", "approved"),
  ]);

  const total = recipientStats?.length ?? 0;
  const delivered = recipientStats?.filter((r) => r.status === "delivered" || r.status === "read").length ?? 0;
  const failed = recipientStats?.filter((r) => r.status === "failed").length ?? 0;
  // Out of recipients actually sent to so far, not the whole audience —
  // counting still-queued ones in the denominator understates the rate for
  // any campaign the cron hasn't finished working through yet.
  const concluded = recipientStats?.filter((r) => r.status !== "queued").length ?? 0;
  const deliveryRate = concluded > 0 ? Math.round((delivered / concluded) * 100) : null;

  const totalRevenue = (orders ?? []).reduce((sum, o) => sum + Number(o.total_amount), 0);
  const attributedRevenue = (orders ?? []).filter((o) => o.attributed_campaign_id).reduce((sum, o) => sum + Number(o.total_amount), 0);

  const spendByContact = new Map<string, { phone: string; name: string | null; spend: number }>();
  for (const o of orders ?? []) {
    if (!o.contact_id) continue;
    const c = o.contacts as { phone?: string; name?: string } | null;
    const bucket = spendByContact.get(o.contact_id) ?? { phone: c?.phone ?? "—", name: c?.name ?? null, spend: 0 };
    bucket.spend += Number(o.total_amount);
    spendByContact.set(o.contact_id, bucket);
  }
  const topCustomers = Array.from(spendByContact.entries()).sort((a, b) => b[1].spend - a[1].spend).slice(0, 5);

  const configured = isWhatsAppConfigured(workspace);

  return (
    <div className="max-w-4xl">
      <div className="mb-7 flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">{t.title}</h1>
        <div className="sk-pill">{configured ? t.whatsappConnected : t.whatsappNotConnected}</div>
      </div>

      {!configured && (
        <div className="sk-card mb-6 p-5" style={{ borderColor: "rgba(251,191,36,0.3)" }}>
          <p className="text-sm text-foreground">
            {t.noWhatsappBanner} <Link href="/onboarding" className="text-accent hover:text-accent-hover">Finish setup →</Link>
          </p>
        </div>
      )}

      <ActivationChecklist
        title={t.checklistTitle}
        steps={[
          { label: t.checklistConnect, done: configured, href: "/onboarding" },
          { label: t.checklistTemplate, done: (approvedTemplateCount ?? 0) > 0, href: "/templates" },
          { label: t.checklistContacts, done: (contactCount ?? 0) > 0, href: "/contacts" },
          { label: t.checklistCampaign, done: (campaignCount ?? 0) > 0, href: "/campaigns" },
        ]}
      />

      <div className="grid grid-cols-4 gap-4">
        <div className="sk-card p-5">
          <div className="mb-2 text-[11px] font-medium uppercase tracking-wide text-faint">{t.contacts}</div>
          <div className="text-2xl font-semibold">{contactCount ?? 0}</div>
        </div>
        <div className="sk-card p-5">
          <div className="mb-2 text-[11px] font-medium uppercase tracking-wide text-faint">{t.campaigns}</div>
          <div className="text-2xl font-semibold">{campaignCount ?? 0}</div>
        </div>
        <div className="sk-card p-5">
          <div className="mb-2 text-[11px] font-medium uppercase tracking-wide text-faint">{t.messagesSent}</div>
          <div className="text-2xl font-semibold">{total}</div>
        </div>
        <div className="sk-card p-5">
          <div className="mb-2 text-[11px] font-medium uppercase tracking-wide text-faint">{t.deliveryRate}</div>
          <div className="text-2xl font-semibold">{deliveryRate !== null ? `${deliveryRate}%` : "—"}</div>
          {failed > 0 && <div className="mt-1 text-[12px] text-danger">{failed} {t.failedSuffix}</div>}
        </div>
      </div>

      {(orders?.length ?? 0) > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="sk-card p-5">
            <div className="mb-2 text-[11px] font-medium uppercase tracking-wide text-faint">{t.revenueTracked}</div>
            <div className="text-2xl font-semibold">₹{totalRevenue.toLocaleString("en-IN")}</div>
          </div>
          <div className="sk-card p-5">
            <div className="mb-2 text-[11px] font-medium uppercase tracking-wide text-faint">{t.fromCampaign}</div>
            <div className="text-2xl font-semibold text-accent">₹{attributedRevenue.toLocaleString("en-IN")}</div>
          </div>
        </div>
      )}

      {topCustomers.length > 0 && (
        <div className="sk-card mt-4 overflow-hidden">
          <div className="border-b border-border p-4 text-[11px] font-medium uppercase tracking-wide text-faint">{t.topCustomers}</div>
          <div className="flex flex-col">
            {topCustomers.map(([contactId, c]) => (
              <div key={contactId} className="flex items-center justify-between border-b border-border px-4 py-2.5 text-sm last:border-0">
                <span className="font-mono text-[13px]">{c.phone}{c.name ? ` · ${c.name}` : ""}</span>
                <span className="text-accent">₹{c.spend.toLocaleString("en-IN")}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="sk-card mt-6 p-5">
        <div className="mb-3 text-[11px] font-medium uppercase tracking-wide text-faint">{t.messagingTier}</div>
        <div className="text-sm text-muted">
          {workspace.daily_send_count} / {workspace.messaging_tier} unique recipients sent to today. Meta raises this
          cap (250 → 1,000 → 10,000 → 100,000) as quality stays high — it&apos;s not something Sendkar controls.
        </div>
      </div>
    </div>
  );
}
