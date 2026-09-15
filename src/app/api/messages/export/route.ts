import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { isRateLimited } from "@/lib/rateLimit";

// Message bodies and contact names can carry attacker-controlled text — see
// contacts/export's csvEscape for why leading =,+,-,@ get neutralized
// (CSV/formula injection, CWE-1236).
function csvEscape(value: string): string {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  if (/[",\n]/.test(safe)) return `"${safe.replace(/"/g, '""')}"`;
  return safe;
}

/** A real "chat backup" — every message across every conversation, exportable, unlike a feature you just have to trust exists. */
export async function GET() {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return NextResponse.json({ error: "No workspace found." }, { status: 401 });

  // Up to 50k rows per pull — bounding how often that's allowed rather than
  // letting it be re-triggered on a loop, same posture as contacts/export.
  if (await isRateLimited(`messagesexport:${workspace.id}`, 5, 60)) {
    return NextResponse.json({ error: "Too many exports — try again in a minute." }, { status: 429 });
  }

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
