import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { runCareForWorkspace } from "@/lib/care/careServer";

/**
 * The daily customer-care run: refreshes each shop's automatic customer tags (regular, lapsed, owes money...),
 * and for shops that switched them on, sends birthday and anniversary wishes and "time to restock" nudges to
 * customers who agreed to hear from the shop. Runs once a day, at 10:00 in India (04:30 UTC).
 *
 * Capped by a time budget; a shop not reached today is reached by tomorrow's run, and a wish or nudge is only
 * recorded as sent when it actually went out, so nothing is sent twice.
 */
export const maxDuration = 60;
const TIME_BUDGET_MS = 50_000;

export async function GET(request: NextRequest) {
  if (request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const started = Date.now();
  const admin = createAdminClient();

  // Shops that have billed anyone, plus shops that turned on a message even before their first bill.
  const [{ data: billed }, { data: switched }] = await Promise.all([
    admin.from("bills").select("workspace_id").limit(5000),
    admin.from("workspaces").select("id").or("birthday_wishes_enabled.eq.true,reorder_nudges_enabled.eq.true").limit(2000),
  ]);
  const ids = [...new Set([...(billed ?? []).map((b) => b.workspace_id as string), ...(switched ?? []).map((w) => w.id as string)])];

  let shops = 0, tags = 0, wishes = 0, nudges = 0;
  const skipped: string[] = [];
  for (const id of ids) {
    if (Date.now() - started > TIME_BUDGET_MS) break;
    const { data: ws } = await admin.from("workspaces").select("*").eq("id", id).maybeSingle();
    if (!ws) continue;
    try {
      const r = await runCareForWorkspace(admin, ws);
      shops++; tags += r.tagsChanged; wishes += r.wishes; nudges += r.nudges;
      skipped.push(...r.skipped.map((s) => `${id.slice(0, 8)}: ${s}`));
    } catch {
      skipped.push(`${id.slice(0, 8)}: failed`);
    }
  }
  return NextResponse.json({ shops, tags, wishes, nudges, skipped, ms: Date.now() - started });
}
