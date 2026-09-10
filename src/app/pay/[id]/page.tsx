import { createAdminClient } from "@/lib/supabase/admin";
import { buildPayuPaymentRequest } from "@/lib/payments";
import { notFound } from "next/navigation";
import { headers } from "next/headers";

function StatusShell({ title, message }: { title: string; message: string }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center px-6 text-center">
      <h1 className="mb-2 text-xl font-semibold tracking-tight">{title}</h1>
      <p className="text-[14px] text-muted">{message}</p>
    </div>
  );
}

/**
 * Public — a customer reaches this straight from a WhatsApp message, before
 * ever creating a Sendkar account. Reads the pending payment_links row with
 * the service-role client since there's no user session to key an RLS policy
 * off, and builds PayU's signed redirect fields fresh (nothing sensitive is
 * stored ahead of time).
 *
 * Deliberately NOT an auto-submitting form — this used to fire the POST via
 * an inline <script> the instant the page loaded, with no user interaction.
 * That's the exact signature automated phishing scanners look for (a hidden
 * form silently carrying phone/email/amount to a different domain with zero
 * interaction), and got sendkar.shop flagged "Dangerous / Phishing" by
 * Kaspersky's threat portal within weeks of the domain going live — clean on
 * Google Safe Browsing, McAfee, ESET, PhishTank, Yandex, and Opera, so this
 * was almost certainly the trigger. A real click before the cross-domain
 * POST fixes the behavior pattern regardless of whether it clears the flag.
 */
export default async function PayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = createAdminClient();

  const { data: link } = await admin
    .from("payment_links")
    .select("id, workspace_id, contact_id, provider, amount, paid_at")
    .eq("id", id)
    .maybeSingle();
  if (!link) notFound();
  if (link.provider !== "payu") notFound(); // Razorpay links point straight at Razorpay's own hosted URL, never at this page

  if (link.paid_at) {
    return <StatusShell title="Already paid" message="This payment has already been completed — no need to pay again." />;
  }

  const [{ data: workspace }, { data: contact }] = await Promise.all([
    admin.from("workspaces").select("payu_merchant_key, payu_salt, name").eq("id", link.workspace_id).single(),
    link.contact_id
      ? admin.from("contacts").select("phone").eq("id", link.contact_id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);
  if (!workspace?.payu_merchant_key || !workspace.payu_salt) {
    return <StatusShell title="Unavailable" message="This payment link's gateway is no longer connected. Ask the business for a new link." />;
  }

  const h = await headers();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? `https://${h.get("host")}`;

  const { action, fields } = await buildPayuPaymentRequest(
    { payu_merchant_key: workspace.payu_merchant_key, payu_salt: workspace.payu_salt },
    {
      amountInRupees: Number(link.amount),
      description: `Payment to ${workspace.name}`,
      contactPhoneE164Digits: contact?.phone ?? "",
      referenceId: link.id,
      successUrl: `${appUrl}/api/payu/return`,
      failureUrl: `${appUrl}/api/payu/return`,
    },
  );

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center px-6 text-center">
      <h1 className="mb-2 text-xl font-semibold tracking-tight">Pay {workspace.name}</h1>
      <p className="mb-6 text-[14px] text-muted">₹{Number(link.amount).toFixed(2)} — you&apos;ll complete this securely on PayU&apos;s own page.</p>
      <form method="POST" action={action}>
        {Object.entries(fields).map(([name, value]) => (
          <input key={name} type="hidden" name={name} value={value} />
        ))}
        <button type="submit" className="sk-btn sk-btn-primary">Continue to PayU →</button>
      </form>
    </div>
  );
}
