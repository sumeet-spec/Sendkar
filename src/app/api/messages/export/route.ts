import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

/** A real "chat backup" — every message across every conversation, exportable, unlike a feature you just have to trust exists. */
export async function GET() {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return NextResponse.json({ error: "No workspace found." }, { status: 401 });

  const supabase = await createClient();
  const { data: messages } = await supabase
    .from("messages")
    .select("created_at, direction, channel, body, status, contacts(phone, name)")
    .eq("workspace_id", workspace.id)
    .order("created_at", { ascending: true })
    .limit(50_000);

  const header = "created_at,contact_phone,contact_name,channel,direction,status,body";
  const rows = (messages ?? []).map((m) => {
    const contact = m.contacts as { phone?: string; name?: string | null } | null;
    return [m.created_at, contact?.phone ?? "", contact?.name ?? "", m.channel, m.direction, m.status, m.body ?? "[template message]"]
      .map((v) => csvEscape(String(v ?? "")))
      .join(",");
  });

  const csv = [header, ...rows].join("\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="sendkar-chat-backup-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
