import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const workspace = await getCurrentWorkspace();
  if (!workspace) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = await createClient();

  // Verify campaign belongs to this workspace
  const { data: campaign } = await supabase
    .from("campaigns")
    .select("id, name")
    .eq("id", id)
    .eq("workspace_id", workspace.id)
    .maybeSingle();
  if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: recipients } = await supabase
    .from("campaign_recipients")
    .select("status, error, sent_at, contacts(phone, name, email)")
    .eq("campaign_id", id)
    .order("sent_at", { ascending: false, nullsFirst: false });

  const header = "phone,name,email,status,sent_at,error";
  const rows = (recipients ?? []).map((r) => {
    const c = r.contacts as { phone?: string; name?: string; email?: string } | null;
    return [c?.phone ?? "", c?.name ?? "", c?.email ?? "", r.status, r.sent_at ?? "", r.error ?? ""]
      .map((v) => csvEscape(String(v)))
      .join(",");
  });

  const slug = campaign.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  const csv = [header, ...rows].join("\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="sendkar-campaign-${slug}-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
