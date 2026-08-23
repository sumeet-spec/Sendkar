import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { ImportForm } from "./ImportForm";

const LANGUAGE_LABEL: Record<string, string> = {
  hi: "Hindi", mr: "Marathi", ta: "Tamil", te: "Telugu", kn: "Kannada", en: "English",
};

export default async function ContactsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const workspace = await getCurrentWorkspace();
  if (!workspace) return null;
  const supabase = await createClient();

  let query = supabase
    .from("contacts")
    .select("id, phone, name, language, source, tags, opted_out, ad_headline, created_at")
    .eq("workspace_id", workspace.id)
    .order("created_at", { ascending: false })
    .limit(200);
  // Strip PostgREST filter-syntax metacharacters (`,` `.` `(` `)` `%`) — this
  // interpolates directly into an .or() filter string, so raw punctuation
  // from the search box could otherwise inject extra filter clauses.
  const safeQuery = q.trim().replace(/[,.()%]/g, "");
  if (safeQuery) query = query.or(`phone.ilike.%${safeQuery}%,name.ilike.%${safeQuery}%`);
  const { data: contacts } = await query;

  const { count: totalCount } = await supabase
    .from("contacts")
    .select("id", { count: "exact", head: true })
    .eq("workspace_id", workspace.id);

  return (
    <div className="max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">Contacts</h1>
        <div className="flex items-center gap-3">
          <div className="sk-pill">{totalCount ?? 0} total</div>
          <a href="/api/contacts/export" className="sk-btn sk-btn-ghost">Export CSV</a>
        </div>
      </div>

      <form className="mb-4 flex gap-3">
        <input type="text" name="q" defaultValue={q} placeholder="Search by phone or name…" className="sk-input flex-1" />
        <button type="submit" className="sk-btn sk-btn-ghost">Search</button>
      </form>

      <ImportForm />

      <div className="sk-card mt-6 overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              {["Phone", "Name", "Language", "Tags", "Source", "Added"].map((h) => (
                <th key={h} className="px-4 py-2.5 text-[11px] font-medium uppercase tracking-wide text-faint">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(contacts ?? []).map((c) => (
              <tr key={c.id} className="border-b border-border last:border-0">
                <td className="px-4 py-2.5 font-mono text-[13px]">
                  {c.phone}
                  {c.opted_out && <span className="sk-pill ml-2 border-danger text-danger">opted out</span>}
                </td>
                <td className="px-4 py-2.5 text-muted">{c.name ?? "—"}</td>
                <td className="px-4 py-2.5">
                  <span className="sk-pill">{LANGUAGE_LABEL[c.language ?? ""] ?? c.language ?? "—"}</span>
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex flex-wrap gap-1">
                    {(c.tags ?? []).map((t: string) => <span key={t} className="sk-pill">{t}</span>)}
                    {(!c.tags || c.tags.length === 0) && <span className="text-faint">—</span>}
                  </div>
                </td>
                <td className="px-4 py-2.5 text-faint">
                  {c.source}
                  {c.ad_headline && <div className="mt-0.5 text-[11px] text-accent">via ad: {c.ad_headline}</div>}
                </td>
                <td className="px-4 py-2.5 text-faint">{new Date(c.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {(!contacts || contacts.length === 0) && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted">
                  No contacts yet — import a CSV above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
      {(totalCount ?? 0) > 200 && (
        <p className="mt-3 text-xs text-faint">Showing the most recent 200 of {totalCount} contacts.</p>
      )}
    </div>
  );
}
