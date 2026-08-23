import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export async function GET() {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return NextResponse.json({ error: "No workspace found." }, { status: 401 });

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
