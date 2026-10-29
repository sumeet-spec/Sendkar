import type { createAdminClient } from "@/lib/supabase/admin";
import { callClaude } from "@/lib/ai";
import { canCollect, cleanPayLink, cleanUpiId, payPageUrl, type PayWorkspace } from "@/lib/bills/pay";
import { buildAssistantPrompt, buildKnowledge, parseAssistantReply, type AssistantReply, type KnowledgeItem, type ThreadLine } from "@/lib/shopAssistantCore";

type Admin = ReturnType<typeof createAdminClient>;

const LANGUAGE_NAMES: Record<string, string> = { en: "English", hi: "Hindi", mr: "Marathi", gu: "Gujarati", ta: "Tamil", te: "Telugu", kn: "Kannada" };

export const APP_ORIGIN = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.sendkar.shop";

/** Gathers everything the assistant may use for one customer in one shop. */
export async function loadShopKnowledge(admin: Admin, workspaceId: string, contactId: string): Promise<{ knowledge: string; customerName: string | null }> {
  const [{ data: ws }, { data: kit }, { data: hours }, { data: items }, { data: contact }, { data: bills }] = await Promise.all([
    admin.from("workspaces").select("name, ai_agent_knowledge, pay_mode, upi_id, upi_name, manual_pay_link, razorpay_key_id, razorpay_key_secret, payu_merchant_key, payu_salt").eq("id", workspaceId).single(),
    admin.from("brand_kits").select("name, phone, address, website").eq("workspace_id", workspaceId).maybeSingle(),
    admin.from("business_hours").select("day_of_week, opens_at, closes_at").eq("workspace_id", workspaceId),
    admin.from("shop_items").select("kind, name, price, unit, description").eq("workspace_id", workspaceId).eq("is_active", true).order("sort_order").order("created_at").limit(80),
    admin.from("contacts").select("name, language").eq("id", contactId).maybeSingle(),
    admin.from("bills").select("bill_no, amount, pay_code").eq("workspace_id", workspaceId).eq("contact_id", contactId).eq("paid", false).order("created_at", { ascending: false }).limit(5),
  ]);

  const pay = (ws ?? {}) as unknown as PayWorkspace;
  const collect = canCollect(pay);
  const upi = pay.pay_mode === "upi" && pay.upi_id ? cleanUpiId(pay.upi_id) : null;
  const link = pay.pay_mode === "link" && pay.manual_pay_link ? cleanPayLink(pay.manual_pay_link) : null;

  const knowledge = buildKnowledge({
    shopName: kit?.name?.trim() || ws?.name || "the shop",
    address: kit?.address?.trim() || undefined,
    phone: kit?.phone?.trim() || undefined,
    website: kit?.website?.trim() || undefined,
    hours: hours ?? [],
    items: (items ?? []).map((i) => ({ ...i, price: i.price === null ? null : Number(i.price) })) as KnowledgeItem[],
    payUpi: upi ? { id: upi, name: pay.upi_name || ws?.name || "" } : undefined,
    payLink: link ?? undefined,
    customerName: contact?.name ?? null,
    customerLanguage: contact?.language ? LANGUAGE_NAMES[contact.language] ?? null : null,
    unpaid: (bills ?? []).map((b) => ({ billNo: b.bill_no, amount: Number(b.amount), payUrl: collect ? payPageUrl(APP_ORIGIN, b.pay_code) : null })),
    notes: ws?.ai_agent_knowledge ?? undefined,
  });
  return { knowledge, customerName: contact?.name ?? null };
}

export async function generateShopReply(thread: ThreadLine[], knowledge: string, customerName: string | null): Promise<AssistantReply> {
  const raw = await callClaude(buildAssistantPrompt(knowledge, thread, customerName), 500);
  return parseAssistantReply(raw);
}
