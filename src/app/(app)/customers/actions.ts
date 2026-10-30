"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentWorkspace, getCurrentUserId } from "@/lib/workspace";
import { refreshAutoTags, installCareTemplates } from "@/lib/care/careServer";
import { PACK_LANGUAGES, type PackLang } from "@/lib/templatePack";

export interface CareResult { error?: string; success?: boolean; message?: string }

const YMD = /^\d{4}-\d{2}-\d{2}$/;
function realDate(v: string): string | null {
  if (!YMD.test(v)) return null;
  const [y, m, d] = v.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d ? v : null;
}

/** Birthday, anniversary and credit limit for one customer. */
export async function saveCustomerDetails(_prev: unknown, formData: FormData): Promise<CareResult> {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "No workspace found." };
  const contactId = String(formData.get("contactId") ?? "");

  const dates: Record<string, string | null> = {};
  for (const field of ["birthday", "anniversary"] as const) {
    const raw = String(formData.get(field) ?? "").trim();
    if (!raw) { dates[field] = null; continue; }
    const ok = realDate(raw);
    if (!ok) return { error: "That date does not look right." };
    dates[field] = ok;
  }

  const limitRaw = String(formData.get("creditLimit") ?? "").replace(/,/g, "").trim();
  let creditLimit: number | null = null;
  if (limitRaw) {
    creditLimit = Number.parseFloat(limitRaw);
    if (!Number.isFinite(creditLimit) || creditLimit < 0 || creditLimit > 99_999_999) return { error: "Enter the credit limit as a number, like 20000." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("contacts").update({ ...dates, credit_limit: creditLimit }).eq("id", contactId).eq("workspace_id", workspace.id);
  if (error) return { error: "Could not save. Try again." };
  await refreshAutoTags(createAdminClient(), workspace.id, [contactId]).catch(() => 0);
  revalidatePath(`/customers/${contactId}`);
  revalidatePath("/customers");
  return { success: true };
}

/** A note, or a follow-up task with a day to do it. */
export async function addNote(_prev: unknown, formData: FormData): Promise<CareResult> {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "No workspace found." };
  const contactId = String(formData.get("contactId") ?? "");
  const body = String(formData.get("body") ?? "").replace(/\s+/g, " ").trim().slice(0, 300);
  if (!body) return { error: "Write something first." };
  const kind = formData.get("kind") === "task" ? "task" : "note";
  let dueDate: string | null = null;
  if (kind === "task") {
    dueDate = realDate(String(formData.get("dueDate") ?? ""));
    if (!dueDate) return { error: "Pick the day to follow up." };
  }

  const userId = await getCurrentUserId();
  if (!userId) return { error: "Not logged in." };
  const supabase = await createClient();
  const { data: contact } = await supabase.from("contacts").select("id").eq("id", contactId).eq("workspace_id", workspace.id).maybeSingle();
  if (!contact) return { error: "Customer not found." };
  const { error } = await supabase.from("contact_notes").insert({
    workspace_id: workspace.id, contact_id: contactId, kind, body, due_date: dueDate, author_id: userId,
  });
  if (error) return { error: "Could not save. Try again." };
  revalidatePath(`/customers/${contactId}`);
  revalidatePath("/customers");
  return { success: true };
}

export async function completeTask(id: string): Promise<void> {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return;
  const supabase = await createClient();
  const { data } = await supabase.from("contact_notes").update({ done: true }).eq("id", id).eq("workspace_id", workspace.id).select("contact_id").maybeSingle();
  revalidatePath("/customers");
  if (data?.contact_id) revalidatePath(`/customers/${data.contact_id}`);
}

/** The two switches for messages the system sends by itself. */
export async function saveCareSwitches(_prev: unknown, formData: FormData): Promise<CareResult> {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "No workspace found." };
  const supabase = await createClient();
  const { error } = await supabase.from("workspaces").update({
    birthday_wishes_enabled: formData.get("birthday") === "on",
    reorder_nudges_enabled: formData.get("reorder") === "on",
  }).eq("id", workspace.id);
  if (error) return { error: "Could not save. Try again." };
  revalidatePath("/customers");
  return { success: true };
}

/** Sends the birthday and restock messages to WhatsApp for approval, in Hindi, Gujarati and English. */
export async function setUpCareMessages(): Promise<CareResult> {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "No workspace found." };
  const langs = PACK_LANGUAGES.map((l) => l.code) as PackLang[];
  const result = await installCareTemplates(createAdminClient(), workspace, langs);
  revalidatePath("/customers");
  if (result.problems.length && result.submitted === 0) return { error: result.problems[0] };
  return { success: true, message: String(result.submitted) };
}
