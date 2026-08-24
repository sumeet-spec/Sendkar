import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyPhoneNumberCreds } from "@/lib/whatsapp";

/**
 * Daily quality-rating snapshot for every connected number — turns Meta's
 * quality_rating (fetched today only once, at connect-time verification)
 * into an actual trend on the dashboard, so a drop is visible before the
 * number gets throttled instead of being discovered from a stream of
 * failed sends.
 */
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  let checked = 0;

  const { data: workspaces } = await admin
    .from("workspaces")
    .select("id, whatsapp_phone_number_id, whatsapp_access_token")
    .not("whatsapp_phone_number_id", "is", null)
    .not("whatsapp_access_token", "is", null);

  for (const ws of workspaces ?? []) {
    try {
      const info = await verifyPhoneNumberCreds(ws.whatsapp_phone_number_id!, ws.whatsapp_access_token!);
      if (info.qualityRating) {
        await admin.from("quality_rating_history").insert({ workspace_id: ws.id, whatsapp_number_id: null, quality_rating: info.qualityRating });
        checked++;
      }
    } catch {
      // A workspace whose credentials have since gone bad shouldn't stop the sweep for everyone else.
    }
  }

  const { data: numbers } = await admin.from("whatsapp_numbers").select("id, workspace_id, phone_number_id, access_token");
  for (const num of numbers ?? []) {
    try {
      const info = await verifyPhoneNumberCreds(num.phone_number_id, num.access_token);
      if (info.qualityRating) {
        await admin.from("quality_rating_history").insert({ workspace_id: num.workspace_id, whatsapp_number_id: num.id, quality_rating: info.qualityRating });
        checked++;
      }
    } catch {
      // Same reasoning as above.
    }
  }

  return NextResponse.json({ ok: true, checked });
}
