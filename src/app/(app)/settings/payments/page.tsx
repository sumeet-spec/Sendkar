import { getCurrentWorkspace } from "@/lib/workspace";
import { PaymentGatewayCard } from "./PaymentGatewayCard";
import { saveRazorpayCreds, disconnectRazorpay, savePayuCreds, disconnectPayu } from "./actions";

export default async function PaymentsPage() {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return null;

  return (
    <div className="max-w-2xl">
      <h1 className="mb-2 text-xl font-semibold tracking-tight">Payments</h1>
      <p className="mb-6 text-sm text-muted">
        Connect a gateway to send a real payment link inside a WhatsApp thread — in an abandoned-cart nudge, a
        manual reply, or a sequence step. Sendkar never touches the card/UPI details themselves; the customer pays
        on the gateway&apos;s own hosted page.
      </p>

      <div className="flex flex-col gap-4">
        <PaymentGatewayCard
          title="Razorpay"
          description="From Razorpay Dashboard → Settings → API Keys. Generates a real hosted payment link per customer."
          configured={Boolean(workspace.razorpay_key_id)}
          fields={[
            { name: "keyId", placeholder: workspace.razorpay_key_id ? "•••••••• (set) — Key ID" : "rzp_live_... or rzp_test_..." },
            { name: "keySecret", placeholder: "Key secret" },
          ]}
          saveAction={saveRazorpayCreds}
          disconnectAction={disconnectRazorpay}
        />
        <PaymentGatewayCard
          title="PayU"
          description="From PayU Dashboard → My Account → Merchant Key & Salt. Uses PayU's signed hosted-checkout redirect. New — send yourself a ₹1 test link before relying on it for real orders."
          configured={Boolean(workspace.payu_merchant_key)}
          fields={[
            { name: "merchantKey", placeholder: workspace.payu_merchant_key ? "•••••••• (set) — Merchant key" : "Merchant key" },
            { name: "salt", placeholder: "Salt" },
          ]}
          saveAction={savePayuCreds}
          disconnectAction={disconnectPayu}
        />
      </div>
    </div>
  );
}
