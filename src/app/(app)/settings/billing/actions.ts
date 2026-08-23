"use server";

import { getCurrentWorkspace } from "@/lib/workspace";
import { createDodoCheckout } from "@/lib/billing";
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
