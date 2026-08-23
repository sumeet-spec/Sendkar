"use server";

import crypto from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { getPlanLimits } from "@/lib/plans";
import { revalidatePath } from "next/cache";

const ALL_EVENTS = ["message.received", "campaign.completed", "contact.created"];

export async function createOutboundWebhook(_prevState: unknown, formData: FormData) {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "No workspace found." };

  const limits = getPlanLimits(workspace.plan);
  if (!limits.outboundWebhooksEnabled) return { error: "Outbound webhooks need the Growth plan or above." };

  const url = String(formData.get("url") ?? "").trim();
  if (!url.startsWith("https://")) return { error: "URL must be https://" };

  const events = ALL_EVENTS.filter((e) => formData.get(`event_${e}`) === "on");
  if (events.length === 0) return { error: "Pick at least one event." };

  const secret = crypto.randomBytes(24).toString("hex");
  const supabase = await createClient();
  const { error } = await supabase.from("outbound_webhooks").insert({ workspace_id: workspace.id, url, events, secret });
  if (error) return { error: error.message };

  revalidatePath("/webhooks");
  return { success: true };
}

export async function deleteOutboundWebhook(id: string) {
  const supabase = await createClient();
  await supabase.from("outbound_webhooks").delete().eq("id", id);
  revalidatePath("/webhooks");
}
