import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Multi-step, delay-aware sequences — the generic engine behind both
 * keyword-triggered drips and abandoned-cart recovery (a cart_abandoned
 * sequence is just a sequence enrolled from the Shopify webhook instead of
 * an inbound keyword). `context` carries per-enrollment data (cart total,
 * checkout URL, ...) that a step's message body can reference with
 * {{placeholders}}, and that payment-link generation reads its amount from.
 */

export function interpolate(body: string, context: Record<string, unknown>): string {
  return body.replace(/\{\{(\w+)\}\}/g, (_match, key: string) => (context[key] != null ? String(context[key]) : ""));
}

export interface EnrollInput {
  sequenceId: string;
  contactId: string;
  workspaceId: string;
  context?: Record<string, unknown>;
}

/** What a sequence step can read about the sale that started it ("ctx:amount_display", "ctx:bill"). */
export function buildOrderContext(input: { amount: number; orderLabel?: string | null }): Record<string, unknown> {
  return {
    amount: input.amount,
    amount_display: input.amount.toLocaleString("en-IN", { maximumFractionDigits: 2 }),
    bill: input.orderLabel?.trim() || "",
  };
}

/**
 * Starts every active "order placed" sequence for a contact who just bought.
 * The trigger existed in the schema and the sequence form but nothing ever
 * called it, so those sequences could never fire. Never throws: logging a
 * sale must not fail because a follow-up could not be scheduled.
 */
export async function enrollOnOrderPlaced(
  admin: SupabaseClient,
  input: { workspaceId: string; contactId: string; amount: number; orderLabel?: string | null },
): Promise<number> {
  try {
    const { data: sequences } = await admin
      .from("sequences")
      .select("id")
      .eq("workspace_id", input.workspaceId)
      .eq("trigger_type", "order_placed")
      .eq("is_active", true);
    const context = buildOrderContext(input);
    for (const sequence of sequences ?? []) {
      await enrollContactInSequence(admin, { sequenceId: sequence.id, contactId: input.contactId, workspaceId: input.workspaceId, context });
    }
    return sequences?.length ?? 0;
  } catch {
    return 0;
  }
}

/** Enrolls a contact at step 0, scheduled for step 1's own delay from now. No-ops if the sequence has no steps. */
export async function enrollContactInSequence(admin: SupabaseClient, input: EnrollInput): Promise<void> {
  const { data: firstStep } = await admin
    .from("sequence_steps")
    .select("delay_minutes")
    .eq("sequence_id", input.sequenceId)
    .order("step_order", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (!firstStep) return;

  await admin.from("sequence_enrollments").upsert(
    {
      sequence_id: input.sequenceId,
      contact_id: input.contactId,
      workspace_id: input.workspaceId,
      current_step_order: 0,
      status: "active",
      context: input.context ?? {},
      next_send_at: new Date(Date.now() + firstStep.delay_minutes * 60_000).toISOString(),
    },
    { onConflict: "sequence_id,contact_id" },
  );
}
