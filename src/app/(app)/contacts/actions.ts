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

  // First row is a header (`phone,email`) if its first cell isn't all digits.
  const hasHeader = !/^\d+$/.test(rows[0][0] ?? "");
  const dataRows = hasHeader ? rows.slice(1) : rows;

  const contacts = dataRows
    .map(([phone, email, tagField]) => ({
      phone: (phone ?? "").replace(/[^\d]/g, ""),
      email: email || null,
      tags: (tagField ?? "").split(";").map((t) => t.trim()).filter(Boolean),
    }))
    .filter((c) => c.phone.length >= 10)
    .map((c) => ({
      workspace_id: workspace.id,
      phone: c.phone,
      email: c.email,
      tags: c.tags,
      language,
      source: "apify_scrape",
    }));

  if (contacts.length === 0) return { error: "No valid phone numbers found in that file." };

  const supabase = await createClient();
  const { error } = await supabase
    // "channel" defaults to 'whatsapp' in the schema — matches the unique
    // constraint added when Instagram contacts became a second row shape.
    .from("contacts")
    .upsert(contacts, { onConflict: "workspace_id,channel,phone", ignoreDuplicates: false });

  if (error) return { error: error.message };

  revalidatePath("/contacts");
  return { success: true, imported: contacts.length };
}

export async function deleteContact(contactId: string) {
  const supabase = await createClient();
  await supabase.from("contacts").delete().eq("id", contactId);
  revalidatePath("/contacts");
}
