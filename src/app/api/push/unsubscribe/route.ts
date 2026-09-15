import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/lib/workspace";

/** Called on explicit opt-out, or by the client after a push send comes back expired (see the WhatsApp webhook route). RLS scopes this to the caller's own subscriptions regardless of which endpoint is passed. */
export async function POST(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const body = (await request.json().catch(() => null)) as { endpoint?: string } | null;
  if (!body?.endpoint) return NextResponse.json({ error: "endpoint is required." }, { status: 422 });

  const supabase = await createClient();
  await supabase.from("push_subscriptions").delete().eq("endpoint", body.endpoint);

  return NextResponse.json({ unsubscribed: true });
}
