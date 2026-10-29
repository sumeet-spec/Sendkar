import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sniffImage } from "@/lib/brandKit";

export const runtime = "nodejs";

const MAX_BYTES = 1024 * 1024;

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  const workspaceId = String(form?.get("workspaceId") ?? "");
  if (!(file instanceof File) || !workspaceId) return NextResponse.json({ error: "Choose a logo file." }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "Logo must be under 1 MB." }, { status: 400 });

  const { data: member } = await supabase
    .from("workspace_members").select("id").eq("workspace_id", workspaceId).eq("user_id", user.id).maybeSingle();
  if (!member) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  // Judge by the actual bytes, not the file name or the type the browser claims.
  const bytes = new Uint8Array(await file.arrayBuffer());
  const kind = sniffImage(bytes);
  if (!kind) return NextResponse.json({ error: "Use a PNG, JPG or WebP picture." }, { status: 400 });

  const admin = createAdminClient();
  const path = `${workspaceId}/logo-${Date.now()}.${kind.ext}`;
  const { error: uploadError } = await admin.storage.from("brand-assets").upload(path, bytes, { contentType: kind.mime, upsert: false });
  if (uploadError) return NextResponse.json({ error: "Could not upload the logo." }, { status: 500 });
  const { data: { publicUrl } } = admin.storage.from("brand-assets").getPublicUrl(path);

  const { error: saveError } = await admin.from("brand_kits").upsert(
    { workspace_id: workspaceId, logo_url: publicUrl, updated_at: new Date().toISOString() },
    { onConflict: "workspace_id", ignoreDuplicates: false },
  );
  if (saveError) return NextResponse.json({ error: "Could not save the logo." }, { status: 500 });

  return NextResponse.json({ url: publicUrl });
}
