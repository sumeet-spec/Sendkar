"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { sendSessionMessage } from "@/lib/whatsapp";
import { draftReply } from "@/lib/ai";
import { revalidatePath } from "next/cache";

export async function replyToContact(_prevState: unknown, formData: FormData) {
  const contactId = String(formData.get("contactId") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  if (!contactId || !body) return { error: "Nothing to send." };

  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "No workspace found." };

  const supabase = await createClient();
  const { data: contact } = await supabase.from("contacts").select("phone, session_expires_at").eq("id", contactId).single();
  if (!contact) return { error: "Contact not found." };

  // Meta only allows free-text replies within 24h of the customer's last inbound message —
  // outside that window a template message is required instead. Check it here, not just
  // let Meta's API reject it, so the error is clear instead of a raw API failure.
  if (!contact.session_expires_at || new Date(contact.session_expires_at) < new Date()) {
    return { error: "The 24h reply window has closed for this contact — send a template message instead." };
  }

  try {
    const { metaMessageId } = await sendSessionMessage({ workspace, to: contact.phone, body });
    await supabase.from("messages").insert({
      workspace_id: workspace.id,
      contact_id: contactId,
      direction: "outbound",
      body,
      meta_message_id: metaMessageId,
      status: "sent",
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Send failed." };
  }

  revalidatePath(`/inbox/${contactId}`);
  return { success: true };
}

export async function draftReplySuggestion(contactId: string): Promise<{ text?: string; error?: string }> {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "No workspace found." };

  const supabase = await createClient();
  const [{ data: contact }, { data: messages }] = await Promise.all([
    supabase.from("contacts").select("name").eq("id", contactId).single(),
    supabase.from("messages").select("direction, body").eq("contact_id", contactId).order("created_at", { ascending: true }),
  ]);

  try {
    const text = await draftReply(messages ?? [], contact?.name ?? null);
    return { text };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "AI draft failed." };
  }
}
