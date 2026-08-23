import type { Workspace } from "@/lib/workspace";
import { PAID_PLANS, type Plan } from "@/lib/plans";

function productIdFor(plan: Plan): string | undefined {
  switch (plan) {
    case "starter": return process.env.DODO_PRODUCT_STARTER;
    case "growth": return process.env.DODO_PRODUCT_GROWTH;
    case "scale": return process.env.DODO_PRODUCT_SCALE;
    default: return undefined;
  }
}

export async function createDodoCheckout(
  workspace: Pick<Workspace, "id">,
  plan: string,
  appUrl: string,
): Promise<{ url?: string; error?: string; status: number }> {
  if (!PAID_PLANS.includes(plan as Plan)) {
    return { error: `plan must be one of: ${PAID_PLANS.join(", ")}`, status: 422 };
  }
  const apiKey = process.env.DODO_PAYMENTS_API_KEY;
  if (!apiKey) return { error: "Billing is not configured yet", status: 503 };

  const productId = productIdFor(plan as Plan);
  if (!productId) return { error: `Billing for the ${plan} plan is not configured yet`, status: 503 };

  const res = await fetch("https://live.dodopayments.com/checkouts", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      product_cart: [{ product_id: productId, quantity: 1 }],
      return_url: `${appUrl}/settings/billing?upgraded=1&plan=${plan}`,
      metadata: { workspace_id: workspace.id, plan },
    }),
    signal: AbortSignal.timeout(15_000),
  });

  const data = (await res.json()) as { checkout_url?: string; url?: string; payment_link?: string };
  if (!res.ok) return { error: "Billing provider error", status: 502 };

  const url = data.checkout_url ?? data.url ?? data.payment_link;
  if (!url) return { error: "Billing provider returned no checkout URL", status: 502 };
  return { url, status: 200 };
}
