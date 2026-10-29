import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isRateLimited, getClientIp } from "@/lib/rateLimit";
import { indianMobile } from "@/lib/freeCard";
import { LANGUAGES } from "@/lib/i18n/dictionaries";
import { designById } from "@/lib/cards/designs";

export const runtime = "nodejs";

/** A shopkeeper who made a free card leaves their WhatsApp number, having ticked the box, to hear about new festival designs. */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { shopName?: string; phone?: string; lang?: string; designId?: string; consent?: boolean; src?: string };
  if (body.consent !== true) return NextResponse.json({ error: "needConsent" }, { status: 400 });
  const phone = indianMobile(body.phone ?? "");
  if (!phone) return NextResponse.json({ error: "badNumber" }, { status: 400 });

  if (await isRateLimited(`freecard-lead:${await getClientIp()}`, 10, 3600)) return NextResponse.json({ error: "tooMany" }, { status: 429 });

  const row = {
    shop_name: (body.shopName ?? "").replace(/[\u0000-\u001f]/g, " ").trim().slice(0, 40) || "-",
    lang: LANGUAGES.find((l) => l.code === body.lang)?.code ?? null,
    design_id: designById(body.designId ?? "")?.id ?? null,
    phone,
    consent_at: new Date().toISOString(),
    source: (body.src ?? "").slice(0, 40) || null,
  };

  const admin = createAdminClient();
  const { data: existing } = await admin.from("free_card_leads").select("id").eq("phone", phone).maybeSingle();
  const { error } = existing ? await admin.from("free_card_leads").update(row).eq("id", existing.id) : await admin.from("free_card_leads").insert(row);
  if (error) return NextResponse.json({ error: "error" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
