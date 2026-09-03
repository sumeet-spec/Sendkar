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
 * off, builds PayU's signed redirect fields fresh (nothing sensitive is
 * stored ahead of time), and auto-submits to PayU's hosted checkout.
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
      <h1 className="mb-2 text-xl font-semibold tracking-tight">Redirecting to PayU…</h1>
      <p className="mb-6 text-[14px] text-muted">Paying {workspace.name} — ₹{Number(link.amount).toFixed(2)}</p>
      <form method="POST" action={action} id="payu-form">
        {Object.entries(fields).map(([name, value]) => (
          <input key={name} type="hidden" name={name} value={value} />
        ))}
        <noscript>
          <button type="submit" className="sk-btn sk-btn-primary">Continue to PayU</button>
        </noscript>
      </form>
      <script
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: `document.getElementById("payu-form").submit();` }}
      />
    </div>
  );
}
