"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentWorkspace, getCurrentUserId } from "@/lib/workspace";
import { workspaceCanSend } from "@/lib/plans";
import { refusal } from "@/lib/gateMessages";
import { isRateLimited } from "@/lib/rateLimit";
import { indianMobile } from "@/lib/freeCard";
import { LANGUAGES, type LanguageCode } from "@/lib/i18n/dictionaries";
import { todayInIndia } from "@/lib/reminders";
import { isRecent, matchContact, parseSales, MAX_SALES_ROWS } from "@/lib/bills/salesParse";
import { createBill, sendBill, type BillWorkspace } from "@/lib/bills/billSend";
import type { BillItem } from "@/lib/bills/renderBill";

export interface BillFormResult {
  error?: string;
  success?: boolean;
  billNo?: string;
  sent?: boolean;
  notice?: string;
}

const num = (v: unknown) => {
  const n = Number.parseFloat(String(v ?? "").replace(/,/g, ""));
  return Number.isFinite(n) && n > 0 ? n : undefined;
};

function parseItems(raw: string): BillItem[] {
  try {
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr.slice(0, 14).map((i) => ({ name: String(i?.name ?? "").trim(), qty: num(i?.qty), rate: num(i?.rate) })).filter((i) => i.name);
  } catch {
    return [];
  }
}

export async function makeBill(_prev: unknown, formData: FormData): Promise<BillFormResult> {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "No workspace found." };
  if (!workspaceCanSend(workspace)) return { error: await refusal("noPlan") };

  const phone = indianMobile(String(formData.get("phone") ?? ""));
  if (!phone) return { error: "Enter a 10-digit mobile number." };

  const items = parseItems(String(formData.get("items") ?? "[]"));
  const typed = num(formData.get("amount"));
  const fromItems = items.reduce((t, i) => t + (i.rate ? i.rate * (i.qty ?? 1) : 0), 0);
  const amount = typed ?? (fromItems > 0 ? fromItems : undefined);
  if (!amount) return { error: "Enter the bill amount." };

  const lang = String(formData.get("lang") ?? "");
  if (!LANGUAGES.some((l) => l.code === lang)) return { error: "Pick a language for the bill." };

  const paid = formData.get("paid") !== "later";
  let dueDate: string | null = null;
  if (!paid) {
    dueDate = String(formData.get("dueDate") ?? "");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) return { error: "Pick the date the customer will pay by." };
    if (dueDate < todayInIndia()) return { error: "The pay-by date has already passed." };
  }

  if (await isRateLimited(`bill:${workspace.id}`, 400, 3600)) return { error: "Too many bills just now. Try again in a little while." };

  const result = await createBill(createAdminClient(), workspace as BillWorkspace, {
    phone,
    customerName: String(formData.get("name") ?? "").trim().slice(0, 60),
    lang: lang as LanguageCode,
    items, amount, paid, dueDate,
    note: String(formData.get("note") ?? "").trim().slice(0, 120),
    offersOk: formData.get("offersOk") === "on",
    createdBy: await getCurrentUserId(),
  });

  revalidatePath("/bills");
  revalidatePath("/analytics");
  revalidatePath("/dashboard");
  revalidatePath("/reminders");
  if (!result.ok) return { error: result.error };
  return { success: true, billNo: result.billNo, sent: result.sent, notice: result.notice };
}

export async function resendBill(billId: string): Promise<{ error?: string; sent?: boolean }> {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "No workspace found." };
  if (!workspaceCanSend(workspace)) return { error: await refusal("noPlan") };
  const result = await sendBill(createAdminClient(), workspace as BillWorkspace, billId);
  revalidatePath("/bills");
  return result.ok ? { sent: true } : { error: result.error };
}

export interface SalesImportResult {
  error?: string;
  sent?: number;
  old?: number;
  already?: number;
  noNumber?: string[];
  failed?: string[];
}

/** Bills the last two days' sales from a pasted Tally or Excel list. */
export async function importSalesBills(_prev: unknown, formData: FormData): Promise<SalesImportResult> {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "No workspace found." };
  if (!workspaceCanSend(workspace)) return { error: await refusal("noPlan") };

  const lang = String(formData.get("lang") ?? "");
  if (!LANGUAGES.some((l) => l.code === lang)) return { error: "Pick a language for the bills." };
  const text = String(formData.get("pasted") ?? "");
  if (text.length > 100_000) return { error: "That is too much to paste at once." };

  const parsed = parseSales(text);
  if (parsed.rows.length === 0) return { error: parsed.errors[0]?.message ?? "No sales found in what you pasted." };

  const today = todayInIndia();
  const recent = parsed.rows.filter((r) => isRecent(r.date, today));
  const old = parsed.rows.length - recent.length;
  if (recent.length === 0) return { sent: 0, old };
  if (recent.length > MAX_SALES_ROWS) return { error: `Paste at most ${MAX_SALES_ROWS} sales at a time. You pasted ${recent.length} from the last two days.` };

  const paid = formData.get("paid") !== "later";
  const dueDate = paid ? null : new Date(Date.now() + 5.5 * 3600000 + 7 * 86400000).toISOString().slice(0, 10);

  const admin = createAdminClient();
  const { data: contacts } = await admin.from("contacts").select("name, phone").eq("workspace_id", workspace.id).eq("channel", "whatsapp").limit(10000);
  const refs = recent.map((r) => r.voucher).filter((v): v is string => Boolean(v));
  const { data: done } = refs.length
    ? await admin.from("bills").select("external_ref").eq("workspace_id", workspace.id).in("external_ref", refs.map((v) => `tally:${v}`))
    : { data: [] as Array<{ external_ref: string }> };
  const billed = new Set((done ?? []).map((d) => d.external_ref));

  const userId = await getCurrentUserId();
  const result: SalesImportResult = { sent: 0, old, already: 0, noNumber: [], failed: [] };
  for (const row of recent) {
    const ref = row.voucher ? `tally:${row.voucher}` : null;
    if (ref && billed.has(ref)) { result.already!++; continue; }
    const phone = row.phone ?? matchContact(row.partyName, contacts ?? []);
    if (!phone) { result.noNumber!.push(row.partyName); continue; }
    const made = await createBill(admin, workspace as BillWorkspace, {
      phone, customerName: row.partyName.slice(0, 60), lang: lang as LanguageCode, items: [], amount: row.amount,
      paid, dueDate, externalRef: ref, createdBy: userId,
    });
    if (made.ok && made.sent) result.sent!++;
    else result.failed!.push(`${row.partyName}: ${made.ok ? made.notice ?? "not sent" : made.error}`);
  }
  revalidatePath("/bills");
  revalidatePath("/analytics");
  revalidatePath("/reminders");
  return result;
}
