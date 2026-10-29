import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { enhanceImagePrompt } from "@/lib/ai";
import { isRateLimited } from "@/lib/rateLimit";
import { generateWorkspaceImage } from "@/lib/aiImage";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  // Auth
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) {
    // User-facing message — never leak the env var name to someone who can't act on it.
    return NextResponse.json({ error: "AI image generation isn't available on this deployment yet." }, { status: 503 });
  }

  const { description, workspaceId } = (await req.json()) as { description?: string; workspaceId?: string };
  if (!description?.trim()) return NextResponse.json({ error: "Describe the image first." }, { status: 400 });
  if (!workspaceId) return NextResponse.json({ error: "Missing workspaceId." }, { status: 400 });

  // Verify user belongs to this workspace
  const { data: member } = await supabase
    .from("workspace_members")
    .select("id")
    .eq("workspace_id", workspaceId)
    .eq("user_id", user.id)
    .single();
  if (!member) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  // Every call is a real Gemini image-gen charge — without a cap, a retry
  // loop (or a teammate clicking generate repeatedly) burns credit with no limit.
  if (await isRateLimited(`aiimage:${workspaceId}`, 20, 3600)) {
    return NextResponse.json({ error: "Image generation limit reached for this workspace. Try again in an hour." }, { status: 429 });
  }

  const admin = createAdminClient();

  // Enhance prompt with Claude
  let enhancedPrompt: string;
  try {
    enhancedPrompt = await enhanceImagePrompt(description);
  } catch {
    enhancedPrompt = `${description}. Clean, professional marketing image, minimal composition, high quality photography style.`;
  }

  const result = await generateWorkspaceImage(admin, workspaceId, enhancedPrompt, "16:9");
  if (!result.ok) return NextResponse.json({ error: result.error, limit: result.limit, remaining: result.remaining }, { status: result.status });

  const imgBuffer = result.bytes;

  // Upload to Supabase Storage
  const filename = `${workspaceId}/${Date.now()}.jpg`;

  // Ensure bucket exists (idempotent)
  await admin.storage.createBucket("campaign-images", { public: true, fileSizeLimit: 5242880 }).catch(() => {});

  const { error: uploadError } = await admin.storage
    .from("campaign-images")
    .upload(filename, imgBuffer, { contentType: result.mime, upsert: false });

  if (uploadError) {
    await result.refund();
    return NextResponse.json({ error: `Storage upload failed: ${uploadError.message}` }, { status: 500 });
  }

  const { data: { publicUrl } } = admin.storage.from("campaign-images").getPublicUrl(filename);

  return NextResponse.json({ url: publicUrl, revisedPrompt: enhancedPrompt, limit: result.limit, remaining: result.remaining });
}
