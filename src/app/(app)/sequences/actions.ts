"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { getPlanLimits, effectivePlan } from "@/lib/plans";
import { revalidatePath } from "next/cache";
import { JOURNEY_STEPS, PACK_LANGUAGES, PACK_TEMPLATES, journeyMapping, type PackLang } from "@/lib/templatePack";

export async function createSequence(_prevState: unknown, formData: FormData) {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "No workspace found." };

  const limits = getPlanLimits(effectivePlan(workspace));
  if (!limits.automationsEnabled) return { error: "Sequences need the Starter plan or above." };

  const name = String(formData.get("name") ?? "").trim();
  const triggerType = String(formData.get("triggerType") ?? "keyword");
  const triggerKeyword = String(formData.get("triggerKeyword") ?? "").trim().toLowerCase();
  const matchType = String(formData.get("matchType") ?? "contains");

  if (!name) return { error: "Name is required." };
  if (triggerType === "keyword" && !triggerKeyword) return { error: "A keyword trigger needs a keyword." };
  if (triggerType === "cart_abandoned" && !workspace.shopify_shop_domain) {
    return { error: "Connect Shopify first — cart_abandoned sequences enroll from real checkout events." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sequences")
    .insert({
      workspace_id: workspace.id,
      name,
      trigger_type: triggerType,
      trigger_keyword: triggerType === "keyword" ? triggerKeyword : null,
      match_type: matchType,
    })
    .select("id")
    .single();
  if (error) return { error: error.message };

  revalidatePath("/sequences");
  return { success: true, id: data.id };
}

export async function toggleSequence(id: string, isActive: boolean) {
  const supabase = await createClient();
  await supabase.from("sequences").update({ is_active: isActive }).eq("id", id);
  revalidatePath("/sequences");
}

export async function deleteSequence(id: string) {
  const supabase = await createClient();
  await supabase.from("sequences").delete().eq("id", id);
  revalidatePath("/sequences");
}

// What a step's template variable can be filled with: a contact field, a detail of the sale, or fixed text.
const MAPPING_VALUE = /^(name|phone|email|ctx:(amount_display|bill)|text:.{1,200})$/;
const MAX_DELAY_MINUTES = 365 * 24 * 60;

function parseMapping(raw: string): Record<string, string> | null {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const out: Record<string, string> = {};
    for (const [slot, value] of Object.entries(parsed)) {
      if (!/^d{1,2}$/.test(slot) || typeof value !== "string" || !MAPPING_VALUE.test(value)) return null;
      out[slot] = value;
    }
    return out;
  } catch {
    return null;
  }
}

export async function addSequenceStep(_prevState: unknown, formData: FormData) {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "No workspace found." };

  const sequenceId = String(formData.get("sequenceId") ?? "");
  const unit = String(formData.get("delayUnit") ?? "minutes");
  const delayValue = Number(formData.get("delayValue") ?? formData.get("delayMinutes") ?? 0);
  const delayMinutes = Math.round(delayValue * (unit === "days" ? 1440 : unit === "hours" ? 60 : 1));
  const templateId = String(formData.get("templateId") ?? "").trim() || null;
  let messageBody = String(formData.get("messageBody") ?? "").trim();
  const includePaymentLink = formData.get("includePaymentLink") === "on";
  if (!sequenceId) return { error: "Missing sequence." };
  if (!Number.isFinite(delayMinutes) || delayMinutes < 0) return { error: "Delay can't be negative." };
  if (delayMinutes > MAX_DELAY_MINUTES) return { error: "Delay can't be more than a year." };

  const supabase = await createClient();
  const { data: sequence } = await supabase.from("sequences").select("id").eq("id", sequenceId).eq("workspace_id", workspace.id).maybeSingle();
  if (!sequence) return { error: "Sequence not found." };

  let variableMapping: Record<string, string> = {};
  if (templateId) {
    const { data: template } = await supabase
      .from("templates")
      .select("body_text, status")
      .eq("id", templateId)
      .eq("workspace_id", workspace.id)
      .maybeSingle();
    if (!template) return { error: "That template wasn't found." };
    if (template.status === "rejected") return { error: "Meta rejected that template — pick another." };
    messageBody = template.body_text ?? "";
    const mapping = parseMapping(String(formData.get("variableMapping") ?? ""));
    if (!mapping) return { error: "One of the variable choices isn't valid — re-select them." };
    variableMapping = mapping;
  } else if (!messageBody) {
    return { error: "Pick a template or write a message." };
  }

  const { data: existing } = await supabase.from("sequence_steps").select("step_order").eq("sequence_id", sequenceId).order("step_order", { ascending: false }).limit(1).maybeSingle();
  const nextOrder = (existing?.step_order ?? 0) + 1;

  const { error } = await supabase.from("sequence_steps").insert({
    sequence_id: sequenceId,
    step_order: nextOrder,
    delay_minutes: delayMinutes,
    message_body: messageBody,
    include_payment_link: templateId ? false : includePaymentLink,
    // Only template steps touch the newer columns, so plain steps keep working before that migration is applied.
    ...(templateId ? { template_id: templateId, variable_mapping: variableMapping } : {}),
  });
  if (error) return { error: error.message };

  revalidatePath(`/sequences/${sequenceId}`);
  return { success: true };
}

export async function deleteSequenceStep(id: string, sequenceId: string) {
  const supabase = await createClient();
  await supabase.from("sequence_steps").delete().eq("id", id);
  revalidatePath(`/sequences/${sequenceId}`);
}

/**
 * Creates the "thank you, then stay in touch" journey for shops that sell at a
 * counter: every sale you log sends a thank-you at once, a check-in a week
 * later and a we-miss-you note after six weeks. Built from the starter pack,
 * so those templates must already be in the account.
 */
export async function createThankYouJourney(language: string): Promise<{ error?: string; id?: string }> {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "No workspace found." };
  const lang = PACK_LANGUAGES.find((l) => l.code === language);
  if (!lang) return { error: "Pick a language." };

  const supabase = await createClient();
  const names = JOURNEY_STEPS.map((step) => `sk_${step.key}_${lang.code}`);
  const { data: templates } = await supabase
    .from("templates")
    .select("id, meta_template_name, status")
    .eq("workspace_id", workspace.id)
    .in("meta_template_name", names);
  const byName = new Map((templates ?? []).map((t) => [t.meta_template_name, t]));
  if (names.some((n) => !byName.has(n))) {
    return { error: `Add the Starter pack in ${lang.label} first (Templates page) — this journey uses its messages.` };
  }

  const { data: sequence, error: seqError } = await supabase
    .from("sequences")
    .insert({ workspace_id: workspace.id, name: `Thank you & stay in touch (${lang.label})`, trigger_type: "order_placed", match_type: "contains" })
    .select("id")
    .single();
  if (seqError || !sequence) return { error: seqError?.message ?? "Couldn't create the journey." };

  const steps = JOURNEY_STEPS.map((step, i) => {
    const pack = PACK_TEMPLATES.find((t) => t.key === step.key)!;
    return {
      sequence_id: sequence.id,
      step_order: i + 1,
      delay_minutes: step.delayMinutes,
      message_body: pack.body[lang.code as PackLang],
      include_payment_link: false,
      template_id: byName.get(`sk_${step.key}_${lang.code}`)!.id,
      variable_mapping: journeyMapping(pack, { shop: workspace.name }),
    };
  });
  const { error: stepsError } = await supabase.from("sequence_steps").insert(steps);
  if (stepsError) {
    await supabase.from("sequences").delete().eq("id", sequence.id);
    return { error: stepsError.message };
  }

  revalidatePath("/sequences");
  return { id: sequence.id };
}
