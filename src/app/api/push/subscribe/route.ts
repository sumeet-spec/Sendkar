import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace, getCurrentUserId } from "@/lib/workspace";

interface SubscribeBody {
  endpoint?: string;
  keys?: { p256dh?: string; auth?: string };
}

/** Called from the browser once a user grants Notification permission and PushManager.subscribe() resolves. */
export async function POST(request: NextRequest) {
  const workspace = await getCurrentWorkspace();
  const userId = await getCurrentUserId();
  if (!workspace || !userId) return NextResponse.json({ error: "No workspace found." }, { status: 401 });

  const body = (await request.json().catch(() => null)) as SubscribeBody | null;
  const endpoint = body?.endpoint;
  const p256dh = body?.keys?.p256dh;
  const auth = body?.keys?.auth;
  if (!endpoint || !p256dh || !auth) {
    return NextResponse.json({ error: "endpoint and keys.p256dh/keys.auth are required." }, { status: 422 });
  }

  const supabase = await createClient();
  // Re-subscribing with the same endpoint (e.g. after a token refresh) updates
  // the row rather than creating a duplicate — endpoint is unique per browser
  // install, never shared across users.
  const { error } = await supabase
    .from("push_subscriptions")
    .upsert({ workspace_id: workspace.id, user_id: userId, endpoint, p256dh, auth_key: auth }, { onConflict: "endpoint" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ subscribed: true });
}
