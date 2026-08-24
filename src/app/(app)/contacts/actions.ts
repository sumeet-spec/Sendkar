"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { revalidatePath } from "next/cache";

const LANGUAGES = new Set(["hi", "mr", "ta", "te", "kn", "en"]);

/** Minimal CSV parser — this data has no quoted/escaped commas, so a split() is enough. */
function parseCsv(text: string): string[][] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.split(",").map((cell) => cell.trim()));
}

export async function importContacts(_prevState: unknown, formData: FormData) {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "No workspace found." };

  const language = String(formData.get("language") ?? "").trim();
  if (!LANGUAGES.has(language)) return { error: "Pick a language for this batch." };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Choose a CSV file." };

  const text = await file.text();
  const rows = parseCsv(text);
  if (rows.length === 0) return { error: "That file is empty." };

  // First row is a header (`phone,email`) if its first cell doesn't look like
  // a real phone number once non-digit characters are stripped — checking
  // the raw cell against /^\d+$/ misfires on a very common export format
  // like "+919876543210" (or "91-987-654-3210"), wrongly treating the first
  // real contact as a header and silently dropping it.
  const firstCellDigits = (rows[0][0] ?? "").replace(/[^\d]/g, "");
  const hasHeader = firstCellDigits.length < 10;
  const dataRows = hasHeader ? rows.slice(1) : rows;

  const rawContacts = dataRows
    .map(([phone, email, tagField]) => ({
      phone: (phone ?? "").replace(/[^\d]/g, ""),
      email: email || null,
      tags: (tagField ?? "").split(";").map((t) => t.trim()).filter(Boolean),
    }))
    .filter((c) => c.phone.length >= 10);

  // Postgres's ON CONFLICT DO UPDATE errors ("command cannot affect row a
  // second time") if the same conflict key appears twice in one upsert —
  // a real-world scraped CSV repeating the same phone number would
  // otherwise fail the entire import, not just that one row. Last
  // occurrence wins, same as a plain object key collision would.
  const dedupedByPhone = new Map(rawContacts.map((c) => [c.phone, c]));
  const contacts = [...dedupedByPhone.values()].map((c) => ({
    workspace_id: workspace.id,
    phone: c.phone,
    email: c.email,
    tags: c.tags,
    language,
    source: "apify_scrape",
  }));

  if (contacts.length === 0) return { error: "No valid phone numbers found in that file." };

  const supabase = await createClient();

  // Know which of these already exist BEFORE upserting, so the result can
  // report new vs. updated instead of silently overwriting duplicates with
  // no visibility into what happened.
  const { data: existing } = await supabase
    .from("contacts")
    .select("phone")
    .eq("workspace_id", workspace.id)
    .in("phone", contacts.map((c) => c.phone));
  const existingPhones = new Set((existing ?? []).map((c) => c.phone));

  const { error } = await supabase
    // "channel" defaults to 'whatsapp' in the schema — matches the unique
    // constraint added when Instagram contacts became a second row shape.
    .from("contacts")
    .upsert(contacts, { onConflict: "workspace_id,channel,phone", ignoreDuplicates: false });

  if (error) return { error: error.message };

  const updated = contacts.filter((c) => existingPhones.has(c.phone)).length;
  const imported = contacts.length - updated;

  revalidatePath("/contacts");
  return { success: true, imported, updated };
}

export async function deleteContact(contactId: string) {
  const supabase = await createClient();
  await supabase.from("contacts").delete().eq("id", contactId);
  revalidatePath("/contacts");
}
