"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { buildInstallUrl, isShopifyAppConfigured } from "@/lib/shopify";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export async function connectShopify(_prevState: unknown, formData: FormData) {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "No workspace found." };
  if (!isShopifyAppConfigured()) return { error: "Shopify integration isn't configured on this server yet." };

  const shop = String(formData.get("shop") ?? "").trim();
  if (!shop) return { error: "Enter your Shopify store domain." };

  const h = await headers();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? `https://${h.get("host")}`;

  let url: string;
  try {
    url = buildInstallUrl(shop, workspace.id, appUrl);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not build the install link." };
  }
  redirect(url);
}

export async function disconnectShopify() {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return;
  const supabase = await createClient();
  await supabase.from("workspaces").update({ shopify_shop_domain: null, shopify_access_token: null }).eq("id", workspace.id);
  revalidatePath("/settings/integrations");
}

export async function setOrderConfirmationTemplate(_prevState: unknown, formData: FormData) {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "No workspace found." };

  const templateId = String(formData.get("templateId") ?? "") || null;
  const supabase = await createClient();
  const { error } = await supabase.from("workspaces").update({ order_confirmation_template_id: templateId }).eq("id", workspace.id);
  if (error) return { error: error.message };

  revalidatePath("/settings/integrations");
  return { success: true };
}

export async function saveWooCommerceCreds(_prevState: unknown, formData: FormData) {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "No workspace found." };

  const storeUrl = String(formData.get("storeUrl") ?? "").trim();
  const webhookSecret = String(formData.get("webhookSecret") ?? "").trim();

  const supabase = await createClient();
  const { error } = await supabase
    .from("workspaces")
    .update({ woocommerce_store_url: storeUrl || null, woocommerce_webhook_secret: webhookSecret || null })
    .eq("id", workspace.id);
  if (error) return { error: error.message };

  revalidatePath("/settings/integrations");
  return { success: true };
}

export async function saveKlaviyoApiKey(_prevState: unknown, formData: FormData) {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "No workspace found." };

  const apiKey = String(formData.get("apiKey") ?? "").trim();
  const supabase = await createClient();
  const { error } = await supabase.from("workspaces").update({ klaviyo_api_key: apiKey || null }).eq("id", workspace.id);
  if (error) return { error: error.message };

  revalidatePath("/settings/integrations");
  return { success: true };
}

export async function importContactsFromSheetUrl(_prevState: unknown, formData: FormData) {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "No workspace found." };

  const sheetUrl = String(formData.get("sheetUrl") ?? "").trim();
  const language = String(formData.get("language") ?? "").trim();
  if (!sheetUrl.startsWith("https://docs.google.com/") && !sheetUrl.startsWith("https://")) {
    return { error: "Paste the sheet's published CSV link (File → Share → Publish to web → CSV)." };
  }
  if (!language) return { error: "Pick a language for this batch." };

  let text: string;
  try {
    const res = await fetch(sheetUrl, { signal: AbortSignal.timeout(15_000) });
    if (!res.ok) return { error: `Could not fetch that sheet (HTTP ${res.status}) — make sure it's published to the web as CSV.` };
    text = await res.text();
  } catch {
    return { error: "Could not reach that URL." };
  }

  const rows = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.split(",").map((cell) => cell.trim().replace(/^"|"$/g, "")));
  if (rows.length === 0) return { error: "That sheet looks empty." };

  const hasHeader = !/^\d+$/.test(rows[0][0] ?? "");
  const dataRows = hasHeader ? rows.slice(1) : rows;

  const contacts = dataRows
    .map(([phone, email]) => ({ phone: (phone ?? "").replace(/[^\d]/g, ""), email: email || null }))
    .filter((c) => c.phone.length >= 10)
    .map((c) => ({ workspace_id: workspace.id, phone: c.phone, email: c.email, language, source: "google_sheets" }));
  if (contacts.length === 0) return { error: "No valid phone numbers found in that sheet." };

  const supabase = await createClient();
  const { error } = await supabase.from("contacts").upsert(contacts, { onConflict: "workspace_id,channel,phone", ignoreDuplicates: false });
  if (error) return { error: error.message };

  revalidatePath("/contacts");
  return { success: true, imported: contacts.length };
}
