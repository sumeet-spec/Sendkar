import { NextRequest, NextResponse, after } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isMorningInIndia, sendDailySummaries } from "@/lib/dailySummary";
import { runCampaignSends } from "@/lib/campaignSender";

// One run may keep sending for up to four minutes (see RUN_BUDGET_MS), so the function needs the headroom.
export const maxDuration = 300;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const results = await runCampaignSends();
  // This job can run every few minutes; the morning summary goes out only in the 8 AM India hour (and once per day per owner).
  if (isMorningInIndia()) after(async () => { await sendDailySummaries(createAdminClient()); });
  return NextResponse.json({ ok: true, results });
}
