import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { getPlanLimits } from "@/lib/plans";
import { InviteForm } from "./InviteForm";

export default async function TeamPage() {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return null;
  const supabase = await createClient();

  const { data: members } = await supabase
    .from("workspace_members")
    .select("user_id, role, created_at")
    .eq("workspace_id", workspace.id);

  const { data: invites } = await supabase
    .from("workspace_invites")
    .select("id, email, role, accepted_at, created_at")
    .eq("workspace_id", workspace.id)
    .is("accepted_at", null);

  const limits = getPlanLimits(workspace.plan);

  return (
    <div className="max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">Team</h1>
        <div className="sk-pill">
          {members?.length ?? 0} {limits.maxTeamMembers >= 1_000_000 ? "members" : `/ ${limits.maxTeamMembers} members`}
        </div>
      </div>

      <InviteForm />

      <div className="sk-card mt-6 overflow-hidden">
        <div className="border-b border-border px-4 py-2.5 text-[11px] font-medium uppercase tracking-wide text-faint">Members</div>
        {(members ?? []).map((m) => (
          <div key={m.user_id} className="flex items-center justify-between border-b border-border px-4 py-3 last:border-0">
            <span className="font-mono text-[13px] text-muted">{m.user_id}</span>
            <span className="sk-pill">{m.role}</span>
          </div>
        ))}
      </div>

      {(invites?.length ?? 0) > 0 && (
        <div className="sk-card mt-4 overflow-hidden">
          <div className="border-b border-border px-4 py-2.5 text-[11px] font-medium uppercase tracking-wide text-faint">Pending invites</div>
          {(invites ?? []).map((i) => (
            <div key={i.id} className="flex items-center justify-between border-b border-border px-4 py-3 last:border-0">
              <span className="text-[13px]">{i.email}</span>
              <span className="sk-pill text-faint">pending</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
