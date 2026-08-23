import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { ImportForm } from "./ImportForm";

const LANGUAGE_LABEL: Record<string, string> = {
  hi: "Hindi", mr: "Marathi", ta: "Tamil", te: "Telugu", kn: "Kannada", en: "English",
};

export default async function ContactsPage() {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return null;
  const supabase = await createClient();

  const { data: contacts } = await supabase
    .from("contacts")
    .select("id, phone, name, language, source, created_at")
    .eq("workspace_id", workspace.id)
    .order("created_at", { ascending: false })
    .limit(200);

  const { count: totalCount } = await supabase
    .from("contacts")
    .select("id", { count: "exact", head: true })
    .eq("workspace_id", workspace.id);

  return (
    <div className="max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">Contacts</h1>
        <div className="sk-pill">{totalCount ?? 0} total</div>
      </div>

      <ImportForm />

      <div className="sk-card mt-6 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              {["Phone", "Name", "Language", "Source", "Added"].map((h) => (
                <th key={h} className="px-4 py-2.5 text-[11px] font-medium uppercase tracking-wide text-faint">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(contacts ?? []).map((c) => (
              <tr key={c.id} className="border-b border-border last:border-0">
                <td className="px-4 py-2.5 font-mono text-[13px]">{c.phone}</td>
                <td className="px-4 py-2.5 text-muted">{c.name ?? "—"}</td>
                <td className="px-4 py-2.5">
                  <span className="sk-pill">{LANGUAGE_LABEL[c.language ?? ""] ?? c.language ?? "—"}</span>
                </td>
                <td className="px-4 py-2.5 text-faint">{c.source}</td>
                <td className="px-4 py-2.5 text-faint">{new Date(c.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {(!contacts || contacts.length === 0) && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted">
                  No contacts yet — import a CSV above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {(totalCount ?? 0) > 200 && (
        <p className="mt-3 text-xs text-faint">Showing the most recent 200 of {totalCount} contacts.</p>
      )}
    </div>
  );
}
