import type { createAdminClient } from "@/lib/supabase/admin";
import type { LanguageCode } from "@/lib/i18n/dictionaries";
import { LANGUAGES } from "@/lib/i18n/dictionaries";
import { BILL_TEMPLATE, BILL_DUE_TEMPLATE, PAY_BUTTON_TEXT, buildPackTemplate, billMessageLang } from "@/lib/templatePack";
import { canCollect, type PayWorkspace } from "@/lib/bills/pay";
import { sendTemplateMessage, submitTemplateToMeta, uploadMediaHandle, type WorkspaceCreds } from "@/lib/whatsapp";
import { attributeOrder } from "@/lib/attribution";
import { enrollOnOrderPlaced } from "@/lib/sequences";
import { contactLine, nameFor, DEFAULT_PRIMARY, sniffImage, type BrandKit } from "@/lib/brandKit";
import { renderBillPng, formatRupees, type BillItem } from "./renderBill";

type Admin = ReturnType<typeof createAdminClient>;

export const BILL_BUCKET = "bills";

export interface BillWorkspace extends WorkspaceCreds, Partial<PayWorkspace> {
  id: string;
  name: string;
  whatsapp_waba_id: string | null;
  whatsapp_access_token: string | null;
}

export interface NewBill {
  /** Digits with country code, already checked. */
  phone: string;
  customerName: string;
  lang: LanguageCode;
  items: BillItem[];
  amount: number;
  paid: boolean;
  /** YYYY-MM-DD. Only for an unpaid bill. */
  dueDate?: string | null;
  note?: string;
  /** The id this sale has in the shop's other software (a Tally voucher number). A sale with the same one is not billed twice. */
  externalRef?: string | null;
  /** The customer agreed, at the counter, to hear about offers. */
  offersOk?: boolean;
  createdBy?: string | null;
}

export type BillResult =
  | { ok: true; billId: string; billNo: string; sent: boolean; notice?: string }
  | { ok: false; error: string };

const isLang = (v: string): v is LanguageCode => LANGUAGES.some((l) => l.code === v);

/** "29 Oct 2026" for a date in India. */
export function billDateText(d: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" }).format(d);
}

export function dueDateText(ymd: string): string {
  const [y, m, d] = ymd.split("-").map(Number);
  return billDateText(new Date(Date.UTC(y, m - 1, d, 6)));
}

/** Meta rejects parameters with newlines, tabs or long runs of spaces. */
const cleanParam = (s: string) => s.replace(/\s+/g, " ").trim().slice(0, 100) || "-";

async function fetchOwnImage(url: string | null): Promise<{ bytes: Buffer; mime: string } | undefined> {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url || !base || !url.startsWith(`${base}/storage/`)) return undefined;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return undefined;
    const bytes = Buffer.from(await res.arrayBuffer());
    const kind = sniffImage(bytes);
    return kind ? { bytes, mime: kind.mime } : undefined;
  } catch {
    return undefined;
  }
}

export type BillTemplateState =
  | { state: "approved"; metaName: string; language: string }
  | { state: "pending" | "rejected" | "missing"; reason?: string };

/**
 * Finds the workspace's bill message for this language, and if it has never been submitted, submits it to
 * the shop's own Meta account with a sample bill as the header picture. Approval is Meta's, per account.
 */
export async function ensureBillTemplate(admin: Admin, ws: BillWorkspace, lang: LanguageCode, kit: BrandKit | null, withPay = false): Promise<BillTemplateState> {
  const built = buildPackTemplate(withPay ? BILL_DUE_TEMPLATE : BILL_TEMPLATE, billMessageLang(lang));
  // The pay button's address ends in each bill's own short code, so one approved message serves every bill.
  const buttons = withPay
    ? [{ type: "URL" as const, text: PAY_BUTTON_TEXT[built.language], url: "https://www.sendkar.shop/p/{{1}}", example: ["https://www.sendkar.shop/p/a1b2c3d4e5f6"] }]
    : undefined;
  const { data: row } = await admin
    .from("templates")
    .select("id, status, rejection_reason")
    .eq("workspace_id", ws.id)
    .eq("meta_template_name", built.metaName)
    .maybeSingle();
  if (row) {
    if (row.status === "approved") return { state: "approved", metaName: built.metaName, language: built.language };
    return { state: row.status === "rejected" ? "rejected" : "pending", reason: row.rejection_reason ?? undefined };
  }

  if (!ws.whatsapp_waba_id || !ws.whatsapp_access_token) return { state: "missing" };

  let status = "pending";
  let metaResponse: unknown = null;
  let submitError: string | null = null;
  try {
    const sample = renderBillPng({
      lang: built.language, shopName: kit?.name?.trim() || ws.name, billNo: "B1", dateText: billDateText(),
      customerName: built.examples[0], items: [{ name: built.language === "en" ? "Sample item" : built.examples[1], qty: 1, rate: 500 }], amount: 500, paid: true,
      primaryColor: kit?.primary_color || DEFAULT_PRIMARY,
    });
    const handle = await uploadMediaHandle({ token: ws.whatsapp_access_token, bytes: sample, mime: "image/png" });
    metaResponse = await submitTemplateToMeta({
      wabaId: ws.whatsapp_waba_id,
      token: ws.whatsapp_access_token,
      name: built.metaName,
      language: built.language,
      category: "UTILITY",
      components: { headerType: "image", headerHandle: handle, bodyText: built.bodyText, buttons, bodyExamples: [built.examples[0], built.examples[1], "B1", "₹500"] },
    });
  } catch (err) {
    submitError = err instanceof Error ? err.message : "Meta did not accept the bill message.";
    status = "rejected";
  }

  await admin.from("templates").insert({
    workspace_id: ws.id,
    name: built.displayName,
    language: built.language,
    meta_template_name: built.metaName,
    category: "UTILITY",
    header_type: "image",
    buttons: buttons ?? null,
    body_text: built.bodyText,
    body_preview: built.bodyText,
    meta_response: metaResponse,
    rejection_reason: submitError,
    template_group: built.templateGroup,
    status,
  });
  return status === "rejected" ? { state: "rejected", reason: submitError ?? undefined } : { state: "pending" };
}

/**
 * Makes the bill: numbers it, draws it, saves it, logs the sale, and (if the customer's WhatsApp is ready)
 * sends it. The bill is saved even when it cannot be sent yet, so nothing the shopkeeper typed is lost.
 */
export async function createBill(admin: Admin, ws: BillWorkspace, input: NewBill): Promise<BillResult> {
  if (!isLang(input.lang)) return { ok: false, error: "Pick a language for the bill." };
  if (!(input.amount > 0) || input.amount > 99_999_999) return { ok: false, error: "Enter the bill amount." };

  const { data: kitRow } = await admin.from("brand_kits").select("*").eq("workspace_id", ws.id).maybeSingle();
  const kit = (kitRow as (BrandKit & { gstin?: string }) | null) ?? null;

  // The customer: found by number, or added. A name typed now fills a blank name but never replaces one.
  const { data: existing } = await admin
    .from("contacts").select("id, name, opted_out, consent_at, language").eq("workspace_id", ws.id).eq("channel", "whatsapp").eq("phone", input.phone).maybeSingle();
  let contactId = existing?.id as string | undefined;
  if (!existing) {
    const { data: created, error } = await admin
      .from("contacts")
      .insert({ workspace_id: ws.id, phone: input.phone, name: input.customerName || null, language: input.lang, source: "bill", ...(input.offersOk ? { consent_at: new Date().toISOString(), consent_source: "bill" } : {}) })
      .select("id").single();
    if (error || !created) return { ok: false, error: "Could not save the customer. Try again." };
    contactId = created.id;
  } else {
    const patch: Record<string, unknown> = {};
    if (!existing.name && input.customerName) patch.name = input.customerName;
    if (input.offersOk && !existing.consent_at) { patch.consent_at = new Date().toISOString(); patch.consent_source = "bill"; }
    if (Object.keys(patch).length) await admin.from("contacts").update(patch).eq("id", existing.id);
  }
  if (existing?.opted_out) return { ok: false, error: "This customer asked not to get messages on WhatsApp. Give them a printed bill instead." };

  const { data: numberRow, error: numErr } = await admin.rpc("next_bill_number", { p_workspace: ws.id });
  if (numErr || typeof numberRow !== "string") return { ok: false, error: "Could not number the bill. Try again." };
  const billNo = numberRow;

  const items = input.items.filter((i) => i.name.trim()).slice(0, 14).map((i) => ({ name: i.name.trim().slice(0, 80), ...(i.qty ? { qty: i.qty } : {}), ...(i.rate ? { rate: i.rate } : {}) }));
  const logo = await fetchOwnImage(kit?.logo_url ?? null);
  const png = renderBillPng({
    lang: input.lang,
    shopName: kit ? nameFor(kit, input.lang) || ws.name : ws.name,
    shopLine: kit ? contactLine(kit) || undefined : undefined,
    gstin: kit?.gstin?.trim() || undefined,
    billNo, dateText: billDateText(),
    customerName: input.customerName || undefined,
    customerPhone: input.phone.replace(/^91/, ""),
    items, amount: input.amount, paid: input.paid,
    dueText: !input.paid && input.dueDate ? dueDateText(input.dueDate) : undefined,
    note: input.note, primaryColor: kit?.primary_color || DEFAULT_PRIMARY, logo,
  });
  const imagePath = `${ws.id}/${billNo}-${Date.now()}.png`;
  const { error: upErr } = await admin.storage.from(BILL_BUCKET).upload(imagePath, png, { contentType: "image/png" });
  if (upErr) return { ok: false, error: "Could not save the bill picture. Try again." };

  const { data: bill, error: billErr } = await admin.from("bills").insert({
    workspace_id: ws.id, contact_id: contactId, bill_no: billNo, customer_name: input.customerName, phone: input.phone, lang: input.lang,
    items, amount: input.amount, paid: input.paid, due_date: input.paid ? null : input.dueDate ?? null, note: input.note || null, external_ref: input.externalRef || null,
    image_path: imagePath, created_by: input.createdBy ?? null,
  }).select("id").single();
  if (billErr || !bill) return { ok: false, error: "Could not save the bill. Try again." };

  // The sale counts as revenue from the moment it is billed. A bill still unpaid also becomes a payment reminder.
  const attributed = contactId ? await attributeOrder(admin, contactId, new Date()) : null;
  const { data: order } = await admin.from("orders").insert({
    workspace_id: ws.id, contact_id: contactId, source: "manual", order_label: billNo, total_amount: input.amount,
    note: input.note || null, attributed_campaign_id: attributed, created_by: input.createdBy ?? null,
  }).select("id").single();

  let receivableId: string | null = null;
  if (!input.paid && input.dueDate) {
    const { data: rec } = await admin.from("receivables").insert({
      workspace_id: ws.id, contact_id: contactId, party_name: input.customerName || input.phone, phone: input.phone, amount: input.amount,
      due_date: input.dueDate, invoice_ref: billNo, consent_confirmed_at: new Date().toISOString(),
    }).select("id").single();
    receivableId = rec?.id ?? null;
  }
  await admin.from("bills").update({ order_id: order?.id ?? null, receivable_id: receivableId }).eq("id", bill.id);

  // Thank-you and come-back messages are promotional, so they only start for customers who agreed to hear from the shop.
  const agreed = Boolean(input.offersOk || existing?.consent_at);
  if (agreed && contactId) await enrollOnOrderPlaced(admin, { workspaceId: ws.id, contactId, amount: input.amount, orderLabel: billNo });

  const sent = await sendBill(admin, ws, bill.id);
  return { ok: true, billId: bill.id, billNo, sent: sent.ok, notice: sent.ok ? undefined : sent.error };
}

/** Sends (or re-sends) a saved bill. Safe to call again after the bill message is approved. */
export async function sendBill(admin: Admin, ws: BillWorkspace, billId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const { data: bill } = await admin.from("bills").select("*").eq("id", billId).eq("workspace_id", ws.id).maybeSingle();
  if (!bill) return { ok: false, error: "Bill not found." };
  const lang = (isLang(bill.lang ?? "") ? bill.lang : "en") as LanguageCode;

  const fail = async (error: string, status: "failed" | "not_sent" = "not_sent") => {
    await admin.from("bills").update({ send_status: status, send_error: error }).eq("id", billId);
    return { ok: false as const, error };
  };

  if (!ws.whatsapp_phone_number_id || !ws.whatsapp_access_token) return fail("Connect your WhatsApp number first. The bill is saved and can be sent later.");

  const { data: kitRow } = await admin.from("brand_kits").select("*").eq("workspace_id", ws.id).maybeSingle();
  // An unpaid bill goes with a Pay now button when the shop has set up how customers pay.
  const withPay = !bill.paid && canCollect(ws as PayWorkspace);
  const tpl = await ensureBillTemplate(admin, ws, lang, (kitRow as BrandKit | null) ?? null, withPay);
  if (tpl.state === "pending") return fail("WhatsApp is still approving your bill message. It usually takes a few minutes. Tap Send again then.");
  if (tpl.state === "rejected") return fail(`WhatsApp did not accept the bill message${tpl.reason ? `: ${tpl.reason}` : "."}`);
  if (tpl.state !== "approved") return fail("Connect your WhatsApp number first. The bill is saved and can be sent later.");

  const { data: signed } = await admin.storage.from(BILL_BUCKET).createSignedUrl(bill.image_path, 3600);
  if (!signed?.signedUrl) return fail("Could not prepare the bill picture.");

  const shop = (kitRow as BrandKit | null)?.name?.trim() || ws.name;
  try {
    const { metaMessageId } = await sendTemplateMessage({
      workspace: ws, to: bill.phone, templateName: tpl.metaName, language: tpl.language, headerImageUrl: signed.signedUrl, urlButtonParam: withPay ? bill.pay_code : undefined,
      bodyParams: [cleanParam(bill.customer_name || "Customer"), cleanParam(shop), cleanParam(bill.bill_no), formatRupees(Number(bill.amount))],
    });
    await admin.from("bills").update({ send_status: "sent", send_error: null, meta_message_id: metaMessageId }).eq("id", billId);
    if (bill.contact_id) {
      await admin.from("messages").insert({
        workspace_id: ws.id, contact_id: bill.contact_id, direction: "outbound",
        body: `Bill ${bill.bill_no}: ${formatRupees(Number(bill.amount))}`, meta_message_id: metaMessageId, status: "sent",
      });
    }
    return { ok: true };
  } catch (err) {
    return fail(err instanceof Error ? err.message : "The send failed.", "failed");
  }
}
