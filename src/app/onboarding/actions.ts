"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { redirect } from "next/navigation";

export async function saveWhatsAppCreds(_prevState: unknown, formData: FormData) {
  const phoneNumberId = String(formData.get("phoneNumberId") ?? "").trim();
  const wabaId = String(formData.get("wabaId") ?? "").trim();
  const accessToken = String(formData.get("accessToken") ?? "").trim();

  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "No workspace found for this account." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("workspaces")
    .update({
      whatsapp_phone_number_id: phoneNumberId || null,
      whatsapp_waba_id: wabaId || null,
      whatsapp_access_token: accessToken || null,
    })
    .eq("id", workspace.id);

  if (error) return { error: error.message };
  redirect("/dashboard");
}

export async function skipOnboarding() {
  redirect("/dashboard");
}
