import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { isShopifyAppConfigured } from "@/lib/shopify";
import { headers } from "next/headers";
import { ShopifyCard } from "./ShopifyCard";
import { WooCommerceCard } from "./WooCommerceCard";
import { KlaviyoCard } from "./KlaviyoCard";
import { OrderTemplatePicker } from "./OrderTemplatePicker";
import { SheetsImportForm } from "./SheetsImportForm";
import { saveKlaviyoApiKey } from "./actions";

export default async function IntegrationsPage() {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return null;
  const supabase = await createClient();
  const h = await headers();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? `https://${h.get("host")}`;

  const { data: templates } = await supabase
    .from("templates")
    .select("id, name, language")
    .eq("workspace_id", workspace.id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-2xl">
      <h1 className="mb-1 text-xl font-semibold tracking-tight">Integrations</h1>
      <p className="mb-6 text-sm text-muted">
        Real, self-serve connectors. For anything not listed here, the generic{" "}
        <a href="/webhooks" className="text-accent hover:text-accent-hover">outbound webhooks</a> and the plain{" "}
        <code className="text-[12.5px]">POST /api/v1/send</code> endpoint (auth via an{" "}
        <a href="/settings/api-keys" className="text-accent hover:text-accent-hover">API key</a>) work with Zapier,
        Make, or Pabbly Connect&apos;s generic webhook actions.
      </p>

      <div className="flex flex-col gap-4">
        <ShopifyCard connected={Boolean(workspace.shopify_shop_domain)} shopDomain={workspace.shopify_shop_domain} configured={isShopifyAppConfigured()} />
        <WooCommerceCard
          storeUrl={workspace.woocommerce_store_url}
          hasSecret={Boolean(workspace.woocommerce_webhook_secret)}
          webhookUrl={`${appUrl}/api/woocommerce/webhook/${workspace.id}`}
        />
        <OrderTemplatePicker templates={templates ?? []} currentId={workspace.order_confirmation_template_id} />
        <KlaviyoCard hasKey={Boolean(workspace.klaviyo_api_key)} action={saveKlaviyoApiKey} />
        <SheetsImportForm />

        <div className="sk-card p-4">
          <div className="mb-1 font-medium">Salesforce, HubSpot, Zoho CRM/Flow</div>
          <p className="text-[12.5px] text-faint">
            Not built yet — these need a registered OAuth app on each platform (a Salesforce Connected App, a HubSpot
            developer app, a Zoho API console app), same as WhatsApp needed a Meta app. Tell me when you have
            developer credentials for one of these and I&apos;ll wire it up the same way as Shopify.
          </p>
        </div>
      </div>
    </div>
  );
}
