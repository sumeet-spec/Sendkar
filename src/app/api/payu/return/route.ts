import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyPayuResponseHash } from "@/lib/payments";

function htmlPage(title: string, message: string) {
  return new NextResponse(
    `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
     <title>${title}</title></head>
     <body style="font-family:system-ui,sans-serif;background:#0a0d0b;color:#e8ece9;display:flex;min-height:100vh;align-items:center;justify-content:center;text-align:center;padding:24px">
       <div><h1 style="font-size:20px;margin-bottom:8px">${title}</h1><p style="color:#9aa39c;font-size:14px">${message}</p></div>
     </body></html>`,
    { headers: { "content-type": "text/html; charset=utf-8" } },
  );
}

/**
 * PayU POSTs the transaction outcome to this one route for both success
 * (surl) and failure (furl) — it's the same handler either way, branching on
 * the `status` field it sends. Public: PayU calls this directly, no session.
 */
export async function POST(request: NextRequest) {
  const fields: Record<string, string> = {};
  try {
    const formData = await request.formData();
    formData.forEach((value, key) => {
      fields[key] = String(value);
    });
  } catch {
    // A public endpoint gets scanner/bot traffic with no body at all —
    // that's not a real PayU callback, just treat it as "not found" below.
  }

  const admin = createAdminClient();
  const { data: link } = await admin
    .from("payment_links")
    .select("id, workspace_id, paid_at")
    .eq("id", fields.txnid ?? "")
    .eq("provider", "payu")
    .maybeSingle();
  if (!link) return htmlPage("Payment not found", "We couldn't find a matching payment for this transaction.");

  const { data: workspace } = await admin
    .from("workspaces")
    .select("payu_merchant_key, payu_salt")
    .eq("id", link.workspace_id)
    .single();
  if (!workspace?.payu_merchant_key || !workspace.payu_salt) {
    return htmlPage("Unavailable", "This payment gateway is no longer connected.");
  }

  const validHash = await verifyPayuResponseHash(fields, workspace.payu_salt, workspace.payu_merchant_key);
  if (!validHash) {
    // A mismatch here means either a stale/misconfigured salt, or someone
    // posting a forged outcome straight to this endpoint — never mark paid.
    return htmlPage("Verification failed", "We couldn't verify this payment's authenticity. If you completed a payment, contact the business directly.");
  }

  if (fields.status === "success") {
    if (!link.paid_at) {
      await admin
        .from("payment_links")
        .update({ paid_at: new Date().toISOString(), provider_ref: fields.mihpayid ?? link.id })
        .eq("id", link.id);
    }
    return htmlPage("Payment successful", "Thank you — your payment has been received.");
  }

  return htmlPage("Payment not completed", "The payment wasn't completed. You can ask the business for a new link.");
}
