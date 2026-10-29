"use server";

import { getCurrentWorkspace } from "@/lib/workspace";
import { createDodoCheckout, createImagePackCheckout } from "@/lib/billing";
import { PAID_PLANS, effectivePlan, type Plan } from "@/lib/plans";
import { headers } from "next/headers";

export async function startCheckout(plan: string): Promise<{ url?: string; error?: string }> {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "No workspace found." };

  const h = await headers();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? `https://${h.get("host")}`;
  const result = await createDodoCheckout(workspace, plan, appUrl);
  if (result.error) return { error: result.error };
  return { url: result.url };
}

export async function startImagePackCheckout(packKey: string): Promise<{ url?: string; error?: string }> {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "No workspace found." };
  // Packs top up a plan; they are not a way around choosing one.
  if (!PAID_PLANS.includes(effectivePlan(workspace) as Plan)) return { error: "Image packs are for paid plans. Choose a plan first." };

  const h = await headers();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? `https://${h.get("host")}`;
  const result = await createImagePackCheckout(workspace, packKey, appUrl);
  if (result.error) return { error: result.error };
  return { url: result.url };
}
