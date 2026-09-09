import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { CallingToggle } from "./CallingToggle";

function formatDuration(seconds: number | null): string {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s}s`;
}

const DIRECTION_LABEL: Record<string, string> = {
  inbound: "↙ Inbound",
  outbound: "↗ Outbound",
};

const STATUS_COLOR: Record<string, string> = {
  answered: "text-accent",
  missed: "text-warn",
  rejected: "text-danger",
  failed: "text-danger",
};

export default async function CallingPage() {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return null;
  const supabase = await createClient();

  const { data: calls } = await supabase
    .from("calls")
    .select("direction, status, started_at, duration_seconds, contacts(name, phone)")
    .eq("workspace_id", workspace.id)
    .order("started_at", { ascending: false })
    .limit(20);

  return (
    <div className="max-w-2xl">
      <h1 className="mb-2 text-xl font-semibold tracking-tight">Calling</h1>
      <p className="mb-6 text-sm text-muted">
        WhatsApp voice calls, inside the same thread as your chat history. Permission requests and the call log work
        today; placing or answering a call with live audio needs a media integration this build doesn&apos;t have yet.
      </p>

      <div className="mb-5">
        <CallingToggle enabled={workspace.calling_enabled} />
      </div>

      <div className="sk-card overflow-hidden">
        <div className="border-b border-border px-4 py-2.5 text-[11px] font-medium uppercase tracking-wide text-faint">
          Recent calls
        </div>
        {(calls ?? []).map((c, i) => {
          const contact = c.contacts as { name?: string | null; phone?: string } | null;
          return (
            <div key={i} className="flex items-center justify-between border-b border-border px-4 py-2.5 text-[12.5px] last:border-0">
              <div>
                <span className="font-medium">{contact?.name || contact?.phone || "Unknown"}</span>
                <span className="ml-2 text-faint">{DIRECTION_LABEL[c.direction] ?? c.direction}</span>
              </div>
              <div className="flex items-center gap-3 text-right">
                <span className="text-faint">{formatDuration(c.duration_seconds)}</span>
                <span className={STATUS_COLOR[c.status] ?? "text-muted"}>{c.status}</span>
                <span className="text-faint">{new Date(c.started_at).toLocaleDateString()}</span>
              </div>
            </div>
          );
        })}
        {(!calls || calls.length === 0) && (
          <p className="px-4 py-8 text-center text-muted">No calls yet.</p>
        )}
      </div>
    </div>
  );
}
