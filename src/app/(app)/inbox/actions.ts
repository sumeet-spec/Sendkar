"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { sendSessionMessage } from "@/lib/whatsapp";
import { revalidatePath } from "next/cache";

export async function replyToContact(_prevState: unknown, formData: FormData) {
  const contactId = String(formData.get("contactId") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  if (!contactId || !body) return { error: "Nothing to send." };

  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "No workspace found." };

  const supabase = await createClient();
  const { data: contact } = await supabase.from("contacts").select("phone").eq("id", contactId).single();
  if (!contact) return { error: "Contact not found." };

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
