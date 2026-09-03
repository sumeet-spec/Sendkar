import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRazorpayPaymentLinkStatus } from "@/lib/payments";

/**
 * Razorpay's payment_links API is create-only from our side — nothing ever
 * told us when a customer actually paid, so every Razorpay link sat at
 * paid_at = null forever regardless of outcome. A webhook would be more
 * immediate, but it needs the merchant to separately configure a webhook
 * secret in Razorpay's dashboard, which this app doesn't collect anywhere.
 * Polling works today, for every already-connected workspace, with zero
 * extra setup — same "reconcile once a day" posture as quality-check.
 */
export const maxDuration = 60;
const MAX_PER_RUN = 200;

interface PendingLink { id: string; workspace_id: string; provider_ref: string }

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: pending } = await admin
    .from("payment_links")
    .select("id, workspace_id, provider_ref")
    .eq("provider", "razorpay")
    .is("paid_at", null)
    .neq("provider_ref", "pending") // "pending" means link creation itself never completed — nothing to check yet
    .limit(MAX_PER_RUN)
    .returns<PendingLink[]>();

  const byWorkspace = new Map<string, PendingLink[]>();
  for (const link of pending ?? []) {
    if (!byWorkspace.has(link.workspace_id)) byWorkspace.set(link.workspace_id, []);
    byWorkspace.get(link.workspace_id)!.push(link);
  }

  let checked = 0;
  let markedPaid = 0;

  for (const [workspaceId, links] of byWorkspace) {
    const { data: workspace } = await admin
      .from("workspaces")
      .select("razorpay_key_id, razorpay_key_secret")
      .eq("id", workspaceId)
      .single();
    if (!workspace?.razorpay_key_id || !workspace.razorpay_key_secret) continue;

    for (const link of links) {
      checked++;
      try {
        const status = await checkRazorpayPaymentLinkStatus(workspace, link.provider_ref);
        if (status === "paid") {
          await admin.from("payment_links").update({ paid_at: new Date().toISOString() }).eq("id", link.id);
          markedPaid++;
        }
      } catch {
        // Gateway hiccup or a since-revoked key — leave it pending, retried on the next run.
      }
    }
  }

  return NextResponse.json({ ok: true, checked, markedPaid });
}
