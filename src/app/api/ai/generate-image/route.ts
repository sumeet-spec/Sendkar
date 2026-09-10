import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { enhanceImagePrompt } from "@/lib/ai";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  // Auth
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
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

  // Enhance prompt with Claude
  let enhancedPrompt: string;
  try {
    enhancedPrompt = await enhanceImagePrompt(description);
  } catch {
    enhancedPrompt = `${description}. Clean, professional marketing image, minimal composition, high quality photography style.`;
  }

  // Generate image with DALL-E 3
  const dalleRes = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: { Authorization: `Bearer ${openaiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "dall-e-3",
      prompt: enhancedPrompt,
      n: 1,
      size: "1792x1024",
      quality: "standard",
      response_format: "url",
    }),
    signal: AbortSignal.timeout(55_000),
  });

  if (!dalleRes.ok) {
    const err = await dalleRes.json().catch(() => ({})) as { error?: { message?: string } };
    return NextResponse.json({ error: err.error?.message ?? "Image generation failed." }, { status: 502 });
  }

  const dalleData = await dalleRes.json() as { data: Array<{ url: string; revised_prompt?: string }> };
  const tempUrl = dalleData.data[0]?.url;
  if (!tempUrl) return NextResponse.json({ error: "No image returned from AI." }, { status: 502 });

  // Download from OpenAI's temporary URL
  const imgRes = await fetch(tempUrl, { signal: AbortSignal.timeout(30_000) });
  if (!imgRes.ok) return NextResponse.json({ error: "Failed to fetch generated image." }, { status: 502 });
  const imgBuffer = Buffer.from(await imgRes.arrayBuffer());

  // Upload to Supabase Storage
  const admin = createAdminClient();
  const filename = `${workspaceId}/${Date.now()}.jpg`;

  // Ensure bucket exists (idempotent)
  await admin.storage.createBucket("campaign-images", { public: true, fileSizeLimit: 5242880 }).catch(() => {});

  const { error: uploadError } = await admin.storage
    .from("campaign-images")
    .upload(filename, imgBuffer, { contentType: "image/jpeg", upsert: false });

  if (uploadError) return NextResponse.json({ error: `Storage upload failed: ${uploadError.message}` }, { status: 500 });

  const { data: { publicUrl } } = admin.storage.from("campaign-images").getPublicUrl(filename);

  return NextResponse.json({ url: publicUrl, revisedPrompt: dalleData.data[0]?.revised_prompt ?? enhancedPrompt });
}
