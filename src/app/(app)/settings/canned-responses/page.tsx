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

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">Canned responses</h1>
        <NewCannedResponseForm />
      </div>
      <p className="mb-5 text-sm text-muted">Quick-insert replies available in every inbox thread.</p>

      <div className="flex flex-col gap-3">
        {(responses ?? []).map((r) => <CannedResponseRow key={r.id} response={r} />)}
        {(!responses || responses.length === 0) && <p className="py-8 text-center text-muted">No canned responses yet.</p>}
      </div>
    </div>
  );
}
