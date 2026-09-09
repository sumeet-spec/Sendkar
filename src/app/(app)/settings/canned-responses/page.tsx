import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { NewCannedResponseForm } from "./NewCannedResponseForm";
import { CannedResponseRow } from "./CannedResponseRow";

export default async function CannedResponsesPage() {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return null;
  const supabase = await createClient();

  const { data: responses } = await supabase
    .from("canned_responses")
    .select("id, shortcut, body")
    .eq("workspace_id", workspace.id)
    .order("shortcut", { ascending: true });

  const count = responses?.length ?? 0;

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold tracking-tight">Canned responses</h1>
          {count > 0 && <span className="sk-pill text-faint">{count}</span>}
        </div>
        <NewCannedResponseForm />
      </div>
      <p className="mb-5 text-[13px] text-muted">
        Type <span className="font-mono text-accent">/shortcut</span> in any inbox thread to insert a saved reply instantly.
      </p>

      <div className="flex flex-col gap-3">
        {(responses ?? []).map((r) => <CannedResponseRow key={r.id} response={r} />)}
        {count === 0 && (
          <div className="rounded-lg border border-border py-10 text-center">
            <p className="text-muted">No canned responses yet.</p>
            <p className="mt-1 text-[12.5px] text-faint">Add one above — each shortcut becomes available in every inbox thread.</p>
          </div>
        )}
      </div>
    </div>
  );
}
