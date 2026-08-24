import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { CallingToggle } from "./CallingToggle";

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
        today; placing or answering a call with live audio needs a media integration this build doesn&apos;t have
        yet — see the note on the toggle below.
      </p>

      <div className="mb-5">
        <CallingToggle enabled={workspace.calling_enabled} />
      </div>

      <div className="sk-card overflow-hidden">
        <div className="border-b border-border px-4 py-2.5 text-[11px] font-medium uppercase tracking-wide text-faint">Recent calls</div>
        {(calls ?? []).map((c, i) => {
          const contact = c.contacts as { name?: string | null; phone?: string } | null;
          return (
            <div key={i} className="flex items-center justify-between border-b border-border px-4 py-2.5 text-[12.5px] last:border-0">
              <span>{contact?.name || contact?.phone || "Unknown"} <span className="text-faint">· {c.direction}</span></span>
              <span className="text-muted">{c.status} · {new Date(c.started_at).toLocaleString()}</span>
            </div>
          );
        })}
        {(!calls || calls.length === 0) && <p className="px-4 py-8 text-center text-muted">No calls yet.</p>}
      </div>
    </div>
  );
}
