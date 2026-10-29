import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isRateLimited, getClientIp } from "@/lib/rateLimit";
import { normalizePhone } from "@/lib/reminders";
import { isJoinCode } from "@/lib/joinCode";
import { LANGUAGES } from "@/lib/i18n/dictionaries";

export const runtime = "nodejs";

/**
 * A customer adds themselves to a shop's list from the counter QR. The only things this can do are
 * add or update THAT person's own contact in THAT shop, with the permission they just gave.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  if (!isJoinCode(code)) return NextResponse.json({ error: "notFound" }, { status: 404 });

  const ip = await getClientIp();
  if ((await isRateLimited(`join-ip:${ip}`, 20, 3600)) || (await isRateLimited(`join-code:${code}`, 600, 3600))) {
    return NextResponse.json({ error: "tooMany" }, { status: 429 });
  }

  const body = (await req.json().catch(() => ({}))) as { name?: string; phone?: string; lang?: string; consent?: boolean };
  if (body.consent !== true) return NextResponse.json({ error: "needConsent" }, { status: 400 });
  const phone = normalizePhone(body.phone ?? "");
  if (!phone) return NextResponse.json({ error: "badNumber" }, { status: 400 });
  const name = (body.name ?? "").trim().slice(0, 60) || null;
  const language = LANGUAGES.find((l) => l.code === body.lang)?.code ?? null;

  const admin = createAdminClient();
  const { data: workspace } = await admin.from("workspaces").select("id").eq("join_code", code).maybeSingle();
  if (!workspace) return NextResponse.json({ error: "notFound" }, { status: 404 });

  const consent = { consent_at: new Date().toISOString(), consent_source: "counter_qr" };
  const { data: existing } = await admin.from("contacts").select("id, name, language").eq("workspace_id", workspace.id).eq("phone", phone).maybeSingle();

  if (existing) {
    // Their own fresh "yes" also undoes an earlier STOP, and never overwrites details the shop already has.
    const { error } = await admin.from("contacts").update({
      ...consent, opted_out: false, name: existing.name || name, language: existing.language || language,
    }).eq("id", existing.id);
    if (error) return NextResponse.json({ error: "error" }, { status: 500 });
  } else {
    const { error } = await admin.from("contacts").insert({ workspace_id: workspace.id, phone, name, language, source: "counter_qr", ...consent });
    if (error) return NextResponse.json({ error: "error" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
