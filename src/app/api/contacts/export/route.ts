import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { isRateLimited } from "@/lib/rateLimit";

// Contact names/tags can carry attacker-controlled text (a WhatsApp profile
// name, for instance) — prefixing a leading =,+,-,@ with a quote stops
// Excel/Sheets from treating the cell as a formula on open (CSV/formula
// injection, CWE-1236).
function csvEscape(value: string): string {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  if (/[",\n]/.test(safe)) return `"${safe.replace(/"/g, '""')}"`;
  return safe;
}

export async function GET() {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return NextResponse.json({ error: "No workspace found." }, { status: 401 });

  // A full contact export is a real DB scan every time — bounding how often
  // one workspace can trigger it, same posture as the other cost-bearing
  // routes in this app.
  if (await isRateLimited(`contactsexport:${workspace.id}`, 5, 60)) {
    return NextResponse.json({ error: "Too many exports — try again in a minute." }, { status: 429 });
  }

  const supabase = await createClient();
  const { data: contacts } = await supabase
    .from("contacts")
    .select("phone, name, email, language, tags, opted_out, source, created_at")
    .eq("workspace_id", workspace.id)
    .order("created_at", { ascending: false });

  const header = "phone,name,email,language,tags,opted_out,source,created_at";
  const rows = (contacts ?? []).map((c) =>
    [c.phone, c.name ?? "", c.email ?? "", c.language ?? "", (c.tags ?? []).join(";"), c.opted_out, c.source, c.created_at]
      .map((v) => csvEscape(String(v ?? "")))
      .join(","),
  );

  const csv = [header, ...rows].join("\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="sendkar-contacts-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
