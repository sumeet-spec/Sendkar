import { NextRequest, NextResponse } from "next/server";
import { runCampaignSends } from "@/lib/campaignSender";

// One run may keep sending for up to four minutes (see RUN_BUDGET_MS), so the function needs the headroom.
export const maxDuration = 300;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const results = await runCampaignSends();
  return NextResponse.json({ ok: true, results });
}
