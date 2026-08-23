import { createClient } from "@/lib/supabase/server";
import { listUserWorkspaces } from "@/lib/workspace";
import { NewWorkspaceForm } from "./NewWorkspaceForm";
import { switchWorkspace } from "../workspace-actions";

/**
 * Agency mode: one login, several client workspaces, one glance at all of
 * them — the structural move neither WATI nor Interakt's self-serve tiers
 * offer (their multi-client story is a manual partner/reseller deal, not
 * something a single account can just do). Built on data the schema
 * already supported (workspace_members allows >1 membership per user) —
 * this page and the switcher are what actually turns that into a feature.
 */
export default async function AgencyPage() {
  const workspaces = await listUserWorkspaces();
  const supabase = await createClient();
  const ids = workspaces.map((w) => w.id);

  const [{ data: workspaceRows }, { data: contacts }, { data: campaigns }, { data: messages }] = await Promise.all([
    supabase.from("workspaces").select("id, plan").in("id", ids),
    supabase.from("contacts").select("workspace_id").in("workspace_id", ids),
    supabase.from("campaigns").select("workspace_id").in("workspace_id", ids),
    supabase.from("messages").select("workspace_id").in("workspace_id", ids),
  ]);

  const planById = new Map((workspaceRows ?? []).map((w) => [w.id, w.plan]));
  const countBy = (rows: { workspace_id: string }[] | null, id: string) => (rows ?? []).filter((r) => r.workspace_id === id).length;

  return (
    <div className="max-w-4xl">
      <div className="mb-1 flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">Agency</h1>
        <NewWorkspaceForm />
      </div>
      <p className="mb-6 text-sm text-muted">Every workspace this login has access to. Switch into one from the sidebar, or add a new client here.</p>

      <div className="sk-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              {["Workspace", "Plan", "Contacts", "Campaigns", "Messages", ""].map((h) => (
                <th key={h} className="px-4 py-2.5 text-[11px] font-medium uppercase tracking-wide text-faint">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {workspaces.map((w) => (
              <tr key={w.id} className="border-b border-border last:border-0">
                <td className="px-4 py-2.5 font-medium">{w.name}</td>
                <td className="px-4 py-2.5"><span className="sk-pill">{planById.get(w.id) ?? "free"}</span></td>
                <td className="px-4 py-2.5 text-muted">{countBy(contacts, w.id)}</td>
                <td className="px-4 py-2.5 text-muted">{countBy(campaigns, w.id)}</td>
                <td className="px-4 py-2.5 text-muted">{countBy(messages, w.id)}</td>
                <td className="px-4 py-2.5 text-right">
                  <form action={switchWorkspace.bind(null, w.id)}>
                    <button type="submit" className="text-[12.5px] text-accent hover:text-accent-hover">Switch in →</button>
                  </form>
                </td>
              </tr>
            ))}
            {workspaces.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted">No workspaces yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
