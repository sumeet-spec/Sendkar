import { getCurrentWorkspace, listWorkspaceMembers } from "@/lib/workspace";
import { getPlanLimits } from "@/lib/plans";
import { InviteForm } from "./InviteForm";
import { AutoAssignmentToggle } from "./AutoAssignmentToggle";
import { createClient } from "@/lib/supabase/server";

export default async function TeamPage() {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return null;
  const supabase = await createClient();
  const limits = getPlanLimits(workspace.plan);

  const [members, { data: invites }] = await Promise.all([
    listWorkspaceMembers(workspace.id),
    supabase
      .from("workspace_invites")
      .select("id, email, role, accepted_at, created_at")
      .eq("workspace_id", workspace.id)
      .is("accepted_at", null),
  ]);

  const atLimit = limits.maxTeamMembers < 1_000_000 && members.length >= limits.maxTeamMembers;

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">Team</h1>
        <div className="sk-pill">
          {members.length}
          {limits.maxTeamMembers < 1_000_000 ? ` / ${limits.maxTeamMembers}` : ""} member{members.length === 1 ? "" : "s"}
        </div>
      </div>

      {atLimit && (
        <div className="sk-card mb-4 p-4" style={{ borderColor: "rgba(251,191,36,0.3)" }}>
          <p className="text-sm">
            You&apos;ve reached the {limits.maxTeamMembers}-member limit on your plan.{" "}
            <a href="/settings/billing" className="text-accent hover:text-accent-hover">Upgrade</a> to add more.
          </p>
        </div>
      )}

      <InviteForm />

      <div className="mt-4">
        <AutoAssignmentToggle enabled={workspace.auto_assignment_enabled} />
      </div>

      <div className="sk-card mt-6 overflow-hidden">
        <div className="border-b border-border px-4 py-2.5 text-[11px] font-medium uppercase tracking-wide text-faint">Members</div>
        {members.map((m) => (
          <div key={m.userId} className="flex items-center justify-between border-b border-border px-4 py-3 last:border-0">
            <div>
              <div className="text-[13.5px]">{m.email ?? <span className="font-mono text-faint text-[12px]">{m.userId}</span>}</div>
            </div>
            <span className="sk-pill capitalize">{m.role}</span>
          </div>
        ))}
        {members.length === 0 && (
          <div className="px-4 py-6 text-center text-[13px] text-muted">No members yet.</div>
        )}
      </div>

      {(invites?.length ?? 0) > 0 && (
        <div className="sk-card mt-4 overflow-hidden">
          <div className="border-b border-border px-4 py-2.5 text-[11px] font-medium uppercase tracking-wide text-faint">Pending invites</div>
          {(invites ?? []).map((i) => (
            <div key={i.id} className="flex items-center justify-between border-b border-border px-4 py-3 last:border-0">
              <span className="text-[13px]">{i.email}</span>
              <div className="flex items-center gap-2">
                <span className="sk-pill capitalize text-faint">{i.role}</span>
                <span className="text-[11.5px] text-faint">invited {new Date(i.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
