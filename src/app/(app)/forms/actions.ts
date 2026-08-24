"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { createMetaFlow, uploadFlowJson, publishMetaFlow, compileFlowJson, sendFlowMessage, type WaFlowScreen, type WaFlowScreenField } from "@/lib/whatsapp";
import { resolveNumberCredentials } from "@/lib/whatsappNumbers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createWaFlow(_prevState: unknown, formData: FormData) {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "No workspace found." };

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Name is required." };

  const supabase = await createClient();
  const { data, error } = await supabase.from("wa_flows").insert({ workspace_id: workspace.id, name }).select("id").single();
  if (error) return { error: error.message };

  redirect(`/forms/${data.id}`);
}

export async function deleteWaFlow(id: string) {
  const supabase = await createClient();
  await supabase.from("wa_flows").delete().eq("id", id);
  revalidatePath("/forms");
}

/**
 * One field per line: "type: label" — optionally "| option1, option2" for
 * choice fields, and a trailing "*" on the label to mark it required. A
 * plain-text mini-format instead of a drag-and-drop builder, same posture
 * as the chatbot flow branches format elsewhere in this app.
 */
function parseScreenFields(raw: string): WaFlowScreenField[] {
  const TYPE_MAP: Record<string, WaFlowScreenField["type"]> = {
    heading: "text_heading", body: "text_body", text: "text_input", textarea: "text_area",
    radio: "radio_buttons", checkbox: "checkbox",
  };
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, i) => {
      const colonIdx = line.indexOf(":");
      if (colonIdx === -1) return null;
      const type = TYPE_MAP[line.slice(0, colonIdx).trim().toLowerCase()];
      if (!type) return null;
      let rest = line.slice(colonIdx + 1).trim();
      let options: string[] | undefined;
      const pipeIdx = rest.indexOf("|");
      if (pipeIdx !== -1) {
        options = rest.slice(pipeIdx + 1).split(",").map((o) => o.trim()).filter(Boolean);
        rest = rest.slice(0, pipeIdx).trim();
      }
      const required = rest.endsWith("*");
      const label = required ? rest.slice(0, -1).trim() : rest;
      const field: WaFlowScreenField = { type, label, required, options, name: `field_${i + 1}` };
      return field;
    })
    .filter((f): f is WaFlowScreenField => f !== null);
}

export async function addWaFlowScreen(_prevState: unknown, formData: FormData) {
  const waFlowId = String(formData.get("waFlowId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const fieldsRaw = String(formData.get("fields") ?? "");
  if (!waFlowId || !title) return { error: "A title is required." };

  const fields = parseScreenFields(fieldsRaw);
  if (fields.length === 0) return { error: "Add at least one valid field line." };

  const supabase = await createClient();
  const { data: flow } = await supabase.from("wa_flows").select("screens, status").eq("id", waFlowId).single();
  if (!flow) return { error: "Form not found." };
  if (flow.status === "published") return { error: "This form is already published — Meta doesn't allow editing a published flow's screens." };

  const screens = (flow.screens as WaFlowScreen[]) ?? [];
  // Based on the highest existing numeric suffix, not screens.length — after
  // deleting a middle screen, length-based numbering would collide with a
  // screen id that still exists (delete SCREEN_2 from [1,2,3], add one back,
  // length is 2 so length+1 is 3 — already taken by the surviving SCREEN_3).
  const maxSuffix = screens.reduce((max, s) => {
    const n = Number(s.id.replace("SCREEN_", ""));
    return Number.isFinite(n) ? Math.max(max, n) : max;
  }, 0);
  const newScreen: WaFlowScreen = { id: `SCREEN_${maxSuffix + 1}`, title, fields };

  const { error } = await supabase.from("wa_flows").update({ screens: [...screens, newScreen], updated_at: new Date().toISOString() }).eq("id", waFlowId);
  if (error) return { error: error.message };

  revalidatePath(`/forms/${waFlowId}`);
  return { success: true };
}

export async function deleteWaFlowScreen(waFlowId: string, screenId: string) {
  const supabase = await createClient();
  const { data: flow } = await supabase.from("wa_flows").select("screens").eq("id", waFlowId).single();
  if (!flow) return;
  const screens = ((flow.screens as WaFlowScreen[]) ?? []).filter((s) => s.id !== screenId);
  await supabase.from("wa_flows").update({ screens }).eq("id", waFlowId);
  revalidatePath(`/forms/${waFlowId}`);
}

/** Creates the flow on Meta's side (first publish only), uploads the compiled JSON, and publishes it. */
export async function publishWaFlow(waFlowId: string): Promise<{ success?: boolean; error?: string }> {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "No workspace found." };
  if (!workspace.whatsapp_waba_id || !workspace.whatsapp_access_token) {
    return { error: "Connect a WhatsApp Business Account in Onboarding first — Flows are created against your WABA, not just a phone number." };
  }

  const supabase = await createClient();
  const { data: flow } = await supabase.from("wa_flows").select("*").eq("id", waFlowId).eq("workspace_id", workspace.id).single();
  if (!flow) return { error: "Form not found." };
  const screens = (flow.screens as WaFlowScreen[]) ?? [];
  if (screens.length === 0) return { error: "Add at least one screen first." };

  let metaFlowId = flow.meta_flow_id;
  try {
    if (!metaFlowId) {
      metaFlowId = await createMetaFlow(workspace.whatsapp_waba_id, workspace.whatsapp_access_token, flow.name, flow.categories ?? ["OTHER"]);
      // Persisted immediately, before upload/publish can fail — otherwise a
      // retry after a JSON-validation error would call createMetaFlow again
      // and orphan a duplicate draft Flow on Meta's side every time.
      await supabase.from("wa_flows").update({ meta_flow_id: metaFlowId }).eq("id", waFlowId);
    }
    const flowJson = compileFlowJson(screens);
    await uploadFlowJson(metaFlowId, workspace.whatsapp_access_token, flowJson);
    await publishMetaFlow(metaFlowId, workspace.whatsapp_access_token);
    await supabase.from("wa_flows").update({ status: "published", error_message: null }).eq("id", waFlowId);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Publish failed.";
    await supabase.from("wa_flows").update({ status: "error", error_message: message }).eq("id", waFlowId);
    return { error: message };
  }

  revalidatePath(`/forms/${waFlowId}`);
  return { success: true };
}

export async function sendWaFlowToContact(contactId: string, waFlowId: string, bodyText: string): Promise<{ success?: boolean; error?: string }> {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "No workspace found." };

  const supabase = await createClient();
  const [{ data: contact }, { data: flow }] = await Promise.all([
    supabase.from("contacts").select("phone, session_expires_at, whatsapp_number_id").eq("id", contactId).single(),
    supabase.from("wa_flows").select("id, name, meta_flow_id, status, screens").eq("id", waFlowId).eq("workspace_id", workspace.id).single(),
  ]);
  if (!contact) return { error: "Contact not found." };
  if (!flow?.meta_flow_id || flow.status !== "published") return { error: "Publish this form before sending it." };
  if (!contact.session_expires_at || new Date(contact.session_expires_at) < new Date()) {
    return { error: "The 24h reply window has closed for this contact." };
  }

  const firstScreen = (flow.screens as WaFlowScreen[])[0];
  if (!firstScreen) return { error: "This form has no screens." };

  const creds = await resolveNumberCredentials(workspace, contact.whatsapp_number_id);
  const flowToken = crypto.randomUUID();

  try {
    const { metaMessageId } = await sendFlowMessage({
      workspace: creds, to: contact.phone, bodyText: bodyText || `Please fill out: ${flow.name}`,
      buttonText: "Open form", flowId: flow.meta_flow_id, flowToken, firstScreenId: firstScreen.id,
    });
    await supabase.from("wa_flow_sends").insert({ workspace_id: workspace.id, wa_flow_id: waFlowId, contact_id: contactId, flow_token: flowToken });
    await supabase.from("messages").insert({
      workspace_id: workspace.id, contact_id: contactId, direction: "outbound",
      body: `[Form sent: ${flow.name}]`, meta_message_id: metaMessageId, status: "sent",
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Send failed." };
  }

  revalidatePath(`/inbox/${contactId}`);
  return { success: true };
}
