import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendSessionMessage, type WorkspaceCreds } from "@/lib/whatsapp";
import { interpolate, enrollContactInSequence } from "@/lib/sequences";
import { createRazorpayPaymentLink } from "@/lib/payments";

/**
 * Advances every due sequence enrollment by one step — the same engine for
 * keyword-triggered drips and abandoned-cart recovery, since both are just
 * a sequence with a different trigger_type.
 *
 * Same Hobby-plan cron constraint as cron/send: this can only run once a
 * day. A step's delay_minutes is honored precisely against next_send_at,
 * but because the cron itself only sweeps once/24h, a step scheduled for
 * "2 hours later" can actually go out anywhere up to ~24h later depending
 * on when in the day it became due. Upgrading to Vercel Pro (finer cron
 * granularity) is what closes that gap — this is a known, accepted
 * limitation, not a bug.
 */
export const maxDuration = 60;
const MAX_PER_RUN = 100;
const ABANDON_AFTER_MINUTES = 60;

interface SequenceRow { id: string; workspace_id: string; is_active: boolean }
interface ContactRow { phone?: string; name?: string; opted_out?: boolean }
interface StepRow { step_order: number; delay_minutes: number; message_body: string; include_payment_link: boolean }

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const now = new Date();

  // ── Sweep carts that have gone cold into "abandoned", then enroll each
  // into its workspace's active cart_abandoned sequence, if one exists. ────
  const abandonCutoff = new Date(now.getTime() - ABANDON_AFTER_MINUTES * 60_000).toISOString();
  const { data: coldCarts } = await admin
    .from("carts")
    .select("id, workspace_id, contact_id, total_amount, checkout_url")
    .eq("status", "open")
    .not("contact_id", "is", null)
    .lt("created_at", abandonCutoff)
    .limit(MAX_PER_RUN);

  let cartsAbandoned = 0;
  for (const cart of coldCarts ?? []) {
    await admin.from("carts").update({ status: "abandoned" }).eq("id", cart.id);
    const { data: sequence } = await admin
      .from("sequences")
      .select("id")
      .eq("workspace_id", cart.workspace_id)
      .eq("trigger_type", "cart_abandoned")
      .eq("is_active", true)
      .limit(1)
      .maybeSingle();
    if (sequence && cart.contact_id) {
      await enrollContactInSequence(admin, {
        sequenceId: sequence.id,
        contactId: cart.contact_id,
        workspaceId: cart.workspace_id,
        context: { amount: cart.total_amount, checkout_url: cart.checkout_url ?? "", cart_id: cart.id },
      });
      cartsAbandoned++;
    }
  }

  const { data: enrollments } = await admin
    .from("sequence_enrollments")
    .select("*, sequences(id, workspace_id, is_active), contacts(phone, name, opted_out)")
    .eq("status", "active")
    .lte("next_send_at", now.toISOString())
    .limit(MAX_PER_RUN);

  const results: Record<string, string> = {};

  for (const enrollment of enrollments ?? []) {
    const sequence = enrollment.sequences as SequenceRow | null;
    const contactRow = enrollment.contacts as ContactRow | null;

    if (!sequence?.is_active || !contactRow?.phone || contactRow.opted_out) {
      await admin.from("sequence_enrollments").update({ status: "cancelled" }).eq("id", enrollment.id);
      results[enrollment.id] = "cancelled — inactive sequence, missing contact, or opted out";
      continue;
    }

    const nextStepOrder = enrollment.current_step_order + 1;
    const { data: step } = await admin
      .from("sequence_steps")
      .select("step_order, delay_minutes, message_body, include_payment_link")
      .eq("sequence_id", sequence.id)
      .eq("step_order", nextStepOrder)
      .maybeSingle<StepRow>();

    if (!step) {
      await admin.from("sequence_enrollments").update({ status: "completed" }).eq("id", enrollment.id);
      results[enrollment.id] = "completed";
      continue;
    }

    const { data: workspace } = await admin.from("workspaces").select("*").eq("id", sequence.workspace_id).single();
    if (!workspace) {
      results[enrollment.id] = "workspace missing";
      continue;
    }

    const context = (enrollment.context ?? {}) as Record<string, unknown>;
    let body = interpolate(step.message_body, context);

    if (step.include_payment_link && workspace.razorpay_key_id) {
      try {
        const amount = Number(context.amount ?? 0);
        const { data: linkRow } = await admin
          .from("payment_links")
          .insert({
            workspace_id: workspace.id,
            contact_id: enrollment.contact_id,
            cart_id: (context.cart_id as string | undefined) ?? null,
            provider: "razorpay",
            provider_ref: "pending",
            amount,
            url: "",
          })
          .select("id")
          .single();

        const link = await createRazorpayPaymentLink(workspace, {
          amountInRupees: amount,
          description: `Order from ${workspace.name}`,
          contactPhoneE164Digits: contactRow.phone,
          referenceId: linkRow?.id ?? enrollment.id,
        });
        if (linkRow) {
          await admin.from("payment_links").update({ provider_ref: link.providerRef, url: link.url }).eq("id", linkRow.id);
        }
        body = `${body}\n${link.url}`;
      } catch {
        // Payment-link generation failing (gateway not connected, API error) shouldn't block the message text itself.
      }
    }

    try {
      const creds: WorkspaceCreds = workspace;
      const { metaMessageId } = await sendSessionMessage({ workspace: creds, to: contactRow.phone, body });
      await admin.from("messages").insert({
        workspace_id: workspace.id,
        contact_id: enrollment.contact_id,
        direction: "outbound",
        body,
        meta_message_id: metaMessageId,
        status: "sent",
      });

      const { data: laterStep } = await admin
        .from("sequence_steps")
        .select("delay_minutes")
        .eq("sequence_id", sequence.id)
        .eq("step_order", nextStepOrder + 1)
        .maybeSingle();

      if (laterStep) {
        await admin
          .from("sequence_enrollments")
          .update({ current_step_order: nextStepOrder, next_send_at: new Date(Date.now() + laterStep.delay_minutes * 60_000).toISOString() })
          .eq("id", enrollment.id);
      } else {
        await admin.from("sequence_enrollments").update({ current_step_order: nextStepOrder, status: "completed" }).eq("id", enrollment.id);
      }
      results[enrollment.id] = "sent";
    } catch (err) {
      // Most likely cause: outside the 24h session window. A template-based
      // re-engagement send would need a pre-approved Meta template — a
      // separate capability this doesn't attempt. Cancel rather than retry
      // forever against the same failure.
      await admin.from("sequence_enrollments").update({ status: "cancelled" }).eq("id", enrollment.id);
      results[enrollment.id] = err instanceof Error ? `failed: ${err.message}` : "failed";
    }
  }

  return NextResponse.json({ ok: true, cartsAbandoned, results });
}
