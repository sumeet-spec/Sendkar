import type { SupabaseClient } from "@supabase/supabase-js";
import { effectivePlan, getPlanLimits, imageAllowance } from "@/lib/plans";
import { getImageUsage } from "@/lib/planUsage";

export type ImageResult =
  | { ok: true; bytes: Buffer; mime: string; limit: number; remaining: number; refund: () => Promise<void> }
  | { ok: false; status: number; error: string; limit?: number; remaining?: number };

/**
 * One AI image for a workspace, with the plan's image allowance enforced.
 *
 * Every image is a real Gemini charge (about ₹3.5), so the cap is hard: a slot is reserved BEFORE
 * generating, handed back if generation fails, and re-counted after reserving so two requests
 * arriving together cannot both slip under the limit. The monthly allowance pays first; bought
 * packs only once it has run out. Shared by the image generator and the card maker.
 */
export async function generateWorkspaceImage(
  admin: SupabaseClient,
  workspaceId: string,
  prompt: string,
  aspectRatio: "16:9" | "1:1",
): Promise<ImageResult> {
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) return { ok: false, status: 503, error: "AI image generation isn't available on this deployment yet." };

  const { data: workspaceRow } = await admin.from("workspaces").select("plan, trial_ends_at").eq("id", workspaceId).maybeSingle();
  // An ended trial counts as no plan: no monthly images, though packs already bought still work.
  const plan = effectivePlan({ plan: workspaceRow?.plan ?? "free", trial_ends_at: workspaceRow?.trial_ends_at ?? null });
  const monthlyLimit = getPlanLimits(plan).imagesPerMonth;

  const usageBefore = await getImageUsage(admin, workspaceId);
  // Fail closed: if usage can't be read, spending money on an image is the wrong default.
  if (usageBefore === null) return { ok: false, status: 503, error: "Image generation is temporarily unavailable. Please try again shortly." };
  const before = imageAllowance(plan, usageBefore.monthlyUsed, usageBefore.packBalance);
  if (before.exhausted) return { ok: false, status: 402, error: before.blockedReason ?? "Image allowance reached.", limit: before.limit, remaining: 0 };

  const fromPack = usageBefore.monthlyUsed >= monthlyLimit;
  const { data: reservation, error: reserveError } = await admin.from("ai_image_usage").insert({ workspace_id: workspaceId, from_pack: fromPack }).select("id").single();
  if (reserveError || !reservation) return { ok: false, status: 503, error: "Image generation is temporarily unavailable. Please try again shortly." };
  const refund = async () => { await admin.from("ai_image_usage").delete().eq("id", reservation.id); };

  const usageAfter = await getImageUsage(admin, workspaceId);
  const overdrawn = usageAfter === null
    || (fromPack ? usageAfter.packUsed > usageAfter.packPurchased : usageAfter.monthlyUsed > monthlyLimit);
  if (overdrawn) {
    await refund();
    return { ok: false, status: 402, error: before.blockedReason ?? "Image allowance reached.", limit: before.limit, remaining: 0 };
  }

  // Gemini (Nano Banana): image bytes come back inline as base64 in the same call.
  let geminiRes: Response;
  try {
    geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { imageConfig: { aspectRatio } },
        }),
        signal: AbortSignal.timeout(55_000),
      },
    );
  } catch {
    await refund();
    return { ok: false, status: 502, error: "Image generation timed out. Please try again." };
  }

  if (!geminiRes.ok) {
    const err = (await geminiRes.json().catch(() => ({}))) as { error?: { message?: string } };
    await refund();
    return { ok: false, status: 502, error: err.error?.message ?? "Image generation failed." };
  }

  const data = (await geminiRes.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ inlineData?: { mimeType?: string; data?: string } }> } }>;
  };
  const inline = data.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data)?.inlineData;
  if (!inline?.data) {
    await refund();
    return { ok: false, status: 502, error: "No image returned from AI." };
  }

  return {
    ok: true,
    bytes: Buffer.from(inline.data, "base64"),
    mime: inline.mimeType ?? "image/jpeg",
    limit: before.limit,
    remaining: Math.max(before.remaining - 1, 0),
    refund,
  };
}
