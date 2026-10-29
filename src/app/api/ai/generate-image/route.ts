import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { enhanceImagePrompt } from "@/lib/ai";
import { isRateLimited } from "@/lib/rateLimit";
import { effectivePlan, getPlanLimits, imageAllowance } from "@/lib/plans";
import { getImageUsage } from "@/lib/planUsage";

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

  // Monthly allowance by plan, then any image packs they have bought. Every image is a real Gemini
  // charge (about ₹3.5), so the cap is hard: a slot is reserved BEFORE generating, handed back if
  // generation fails, and re-counted after reserving so two requests arriving together cannot both
  // slip under the limit.
  const admin = createAdminClient();
  const { data: workspaceRow } = await admin.from("workspaces").select("plan, trial_ends_at").eq("id", workspaceId).maybeSingle();
  // An ended trial counts as no plan: no monthly images, though packs already bought still work.
  const plan = effectivePlan({ plan: workspaceRow?.plan ?? "free", trial_ends_at: workspaceRow?.trial_ends_at ?? null });
  const monthlyLimit = getPlanLimits(plan).imagesPerMonth;

  const usageBefore = await getImageUsage(admin, workspaceId);
  if (usageBefore === null) {
    // Fail closed: if usage can't be read, spending money on an image is the wrong default.
    return NextResponse.json({ error: "Image generation is temporarily unavailable. Please try again shortly." }, { status: 503 });
  }
  const before = imageAllowance(plan, usageBefore.monthlyUsed, usageBefore.packBalance);
  if (before.exhausted) return NextResponse.json({ error: before.blockedReason, limit: before.limit, remaining: 0 }, { status: 402 });

  // The monthly allowance pays first; packs only once it has run out.
  const fromPack = usageBefore.monthlyUsed >= monthlyLimit;

  const { data: reservation, error: reserveError } = await admin.from("ai_image_usage").insert({ workspace_id: workspaceId, from_pack: fromPack }).select("id").single();
  if (reserveError || !reservation) {
    return NextResponse.json({ error: "Image generation is temporarily unavailable. Please try again shortly." }, { status: 503 });
  }
  const refund = async () => { await admin.from("ai_image_usage").delete().eq("id", reservation.id); };

  const usageAfter = await getImageUsage(admin, workspaceId);
  const overdrawn = usageAfter === null
    || (fromPack ? usageAfter.packUsed > usageAfter.packPurchased : usageAfter.monthlyUsed > monthlyLimit);
  if (overdrawn) {
    await refund();
    return NextResponse.json({ error: before.blockedReason ?? "Image allowance reached.", limit: before.limit, remaining: 0 }, { status: 402 });
  }

  // Enhance prompt with Claude
  let enhancedPrompt: string;
  try {
    enhancedPrompt = await enhanceImagePrompt(description);
  } catch {
    enhancedPrompt = `${description}. Clean, professional marketing image, minimal composition, high quality photography style.`;
  }

  // Generate image with Gemini (Nano Banana). Unlike DALL-E's temporary-URL
  // response, image bytes come back inline as base64 in the same call.
  const geminiRes = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${geminiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: enhancedPrompt }] }],
        generationConfig: { imageConfig: { aspectRatio: "16:9" } },
      }),
      signal: AbortSignal.timeout(55_000),
    },
  );

  if (!geminiRes.ok) {
    const err = await geminiRes.json().catch(() => ({})) as { error?: { message?: string } };
    await refund();
    return NextResponse.json({ error: err.error?.message ?? "Image generation failed." }, { status: 502 });
  }

  const geminiData = await geminiRes.json() as {
    candidates?: Array<{ content?: { parts?: Array<{ inlineData?: { mimeType?: string; data?: string } }> } }>;
  };
  const inlineData = geminiData.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data)?.inlineData;
  if (!inlineData?.data) {
    await refund();
    return NextResponse.json({ error: "No image returned from AI." }, { status: 502 });
  }

  const imgBuffer = Buffer.from(inlineData.data, "base64");

  // Upload to Supabase Storage
  const filename = `${workspaceId}/${Date.now()}.jpg`;

  // Ensure bucket exists (idempotent)
  await admin.storage.createBucket("campaign-images", { public: true, fileSizeLimit: 5242880 }).catch(() => {});

  const { error: uploadError } = await admin.storage
    .from("campaign-images")
    .upload(filename, imgBuffer, { contentType: inlineData.mimeType ?? "image/jpeg", upsert: false });

  if (uploadError) {
    await refund();
    return NextResponse.json({ error: `Storage upload failed: ${uploadError.message}` }, { status: 500 });
  }

  const { data: { publicUrl } } = admin.storage.from("campaign-images").getPublicUrl(filename);

  return NextResponse.json({ url: publicUrl, revisedPrompt: enhancedPrompt, limit: before.limit, remaining: Math.max(before.remaining - 1, 0) });
}
