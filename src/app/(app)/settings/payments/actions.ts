"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { revalidatePath } from "next/cache";
import { cleanPayLink, cleanUpiId, hasGateway } from "@/lib/bills/pay";

export async function saveRazorpayCreds(_prevState: unknown, formData: FormData) {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "No workspace found." };

  const keyId = String(formData.get("keyId") ?? "").trim();
  const keySecret = String(formData.get("keySecret") ?? "").trim();

  const supabase = await createClient();
  // Blank fields mean "unchanged" — same reasoning as every other secret
  // field in this app (WhatsApp/Instagram tokens, WooCommerce's webhook
  // secret): a field left blank on an edit shouldn't silently wipe out an
  // already-working credential.
  const update: Record<string, string> = {};
  if (keyId) update.razorpay_key_id = keyId;
  if (keySecret) update.razorpay_key_secret = keySecret;
  if (Object.keys(update).length === 0) return { error: "Enter at least one field." };

  const { error } = await supabase.from("workspaces").update(update).eq("id", workspace.id);
  if (error) return { error: error.message };

  revalidatePath("/settings/payments");
  return { success: true };
}

export async function disconnectRazorpay() {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "No workspace found." };
  const supabase = await createClient();
  await supabase.from("workspaces").update({ razorpay_key_id: null, razorpay_key_secret: null }).eq("id", workspace.id);
  revalidatePath("/settings/payments");
}

export async function savePayuCreds(_prevState: unknown, formData: FormData) {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "No workspace found." };

  const merchantKey = String(formData.get("merchantKey") ?? "").trim();
  const salt = String(formData.get("salt") ?? "").trim();

  const supabase = await createClient();
  const update: Record<string, string> = {};
  if (merchantKey) update.payu_merchant_key = merchantKey;
  if (salt) update.payu_salt = salt;
  if (Object.keys(update).length === 0) return { error: "Enter at least one field." };

  const { error } = await supabase.from("workspaces").update(update).eq("id", workspace.id);
  if (error) return { error: error.message };

  revalidatePath("/settings/payments");
  return { success: true };
}

export async function disconnectPayu() {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "No workspace found." };
  const supabase = await createClient();
  await supabase.from("workspaces").update({ payu_merchant_key: null, payu_salt: null }).eq("id", workspace.id);
  revalidatePath("/settings/payments");
}

export async function savePayMode(_prevState: unknown, formData: FormData) {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "No workspace found." };

  const mode = String(formData.get("mode") ?? "");
  const update: Record<string, string | null> = {};

  if (mode === "upi") {
    const upi = cleanUpiId(String(formData.get("upiId") ?? ""));
    if (!upi) return { error: "That does not look like a UPI ID. It looks like name@bank, for example sharma@okhdfcbank." };
    const name = String(formData.get("upiName") ?? "").trim().slice(0, 40);
    if (!name) return { error: "Enter the name customers should see when they pay, usually your shop name." };
    update.pay_mode = "upi"; update.upi_id = upi; update.upi_name = name;
  } else if (mode === "gateway") {
    if (!hasGateway(workspace)) return { error: "Connect Razorpay or PayU below first, then choose this." };
    update.pay_mode = "gateway";
  } else if (mode === "link") {
    const link = cleanPayLink(String(formData.get("payLink") ?? ""));
    if (!link) return { error: "Paste a full payment link that starts with https://" };
    update.pay_mode = "link"; update.manual_pay_link = link;
  } else if (mode === "none") {
    update.pay_mode = null;
  } else {
    return { error: "Pick how customers pay you." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("workspaces").update(update).eq("id", workspace.id);
  if (error) return { error: error.message };
  revalidatePath("/settings/payments");
  revalidatePath("/bills");
  return { success: true };
}
