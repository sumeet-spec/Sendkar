import { NextRequest, NextResponse } from "next/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { createDodoCheckout } from "@/lib/billing";

/**
 * POST /api/billing/checkout — called by the dashboard with the logged-in
 * user's session. Returns a Dodo checkout URL carrying the workspace id in
 * metadata so the webhook knows which workspace to upgrade.
 */
export async function POST(request: NextRequest) {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return NextResponse.json({ error: "No workspace" }, { status: 401 });

  const body = (await request.json().catch(() => null)) as { plan?: string } | null;
  if (!body?.plan) return NextResponse.json({ error: "plan is required" }, { status: 422 });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;
  const result = await createDodoCheckout(workspace, body.plan, appUrl);
  if (result.error) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json({ url: result.url });
}
