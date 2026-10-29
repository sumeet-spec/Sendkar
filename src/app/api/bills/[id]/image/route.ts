import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { BILL_BUCKET } from "@/lib/bills/billSend";

export const runtime = "nodejs";

/** Opens a bill's picture for a member of the shop that made it. The picture is private, so this hands out a short-lived link. */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Row-level security limits this read to bills of the user's own workspaces.
  const { data: bill } = await supabase.from("bills").select("image_path").eq("id", id).maybeSingle();
  if (!bill?.image_path) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: signed } = await createAdminClient().storage.from(BILL_BUCKET).createSignedUrl(bill.image_path, 300);
  if (!signed?.signedUrl) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.redirect(signed.signedUrl);
}
