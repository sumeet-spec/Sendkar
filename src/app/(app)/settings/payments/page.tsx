import { getCurrentWorkspace } from "@/lib/workspace";
import { getCurrentLanguage } from "@/lib/i18n/getLanguage";
import { PAY_SETTINGS_UI } from "@/lib/i18n/settingsCopy";
import { PaymentGatewayCard } from "./PaymentGatewayCard";
import { PayModeCard } from "./PayModeCard";
import { hasGateway } from "@/lib/bills/pay";
import { saveRazorpayCreds, disconnectRazorpay, savePayuCreds, disconnectPayu } from "./actions";

export default async function PaymentsPage() {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return null;
  const t = PAY_SETTINGS_UI[await getCurrentLanguage()];

  return (
    <div className="max-w-2xl">
      <h1 className="mb-2 text-xl font-semibold tracking-tight">{t.title}</h1>
      <p className="mb-6 text-sm text-muted">{t.intro}</p>

      <div className="flex flex-col gap-4">
        <PayModeCard t={t} initialMode={workspace.pay_mode} upiId={workspace.upi_id ?? ""} upiName={workspace.upi_name ?? ""} payLink={workspace.manual_pay_link ?? ""} gatewayConnected={hasGateway(workspace)} />
        <PaymentGatewayCard
          t={t}
          title="Razorpay"
          description={t.razorpayDesc}
          configured={Boolean(workspace.razorpay_key_id)}
          fields={[
            { name: "keyId", placeholder: workspace.razorpay_key_id ? t.keyIdSet : "rzp_live_... / rzp_test_..." },
            { name: "keySecret", placeholder: t.keySecret },
          ]}
          saveAction={saveRazorpayCreds}
          disconnectAction={disconnectRazorpay}
        />
        <PaymentGatewayCard
          t={t}
          title="PayU"
          description={t.payuDesc}
          configured={Boolean(workspace.payu_merchant_key)}
          fields={[
            { name: "merchantKey", placeholder: workspace.payu_merchant_key ? t.merchantKeySet : t.merchantKey },
            { name: "salt", placeholder: t.salt },
          ]}
          saveAction={savePayuCreds}
          disconnectAction={disconnectPayu}
        />
      </div>
    </div>
  );
}
