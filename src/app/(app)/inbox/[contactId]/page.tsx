import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace, listWorkspaceMembers } from "@/lib/workspace";
import { notFound } from "next/navigation";
import { ReplyBox } from "./ReplyBox";
import { AssigneeSelect } from "./AssigneeSelect";
import { NotesPanel } from "./NotesPanel";
import { RealtimeRefresher } from "./RealtimeRefresher";

export default async function ThreadPage({ params }: { params: Promise<{ contactId: string }> }) {
  const { contactId } = await params;
  const workspace = await getCurrentWorkspace();
  if (!workspace) return null;
  const supabase = await createClient();

  const { data: contact } = await supabase
    .from("contacts")
    .select("*")
    .eq("id", contactId)
    .eq("workspace_id", workspace.id)
    .maybeSingle();
  if (!contact) notFound();

  const [{ data: messages }, { data: cannedResponses }, { data: notes }, members] = await Promise.all([
    supabase.from("messages").select("*").eq("contact_id", contactId).order("created_at", { ascending: true }),
    supabase.from("canned_responses").select("id, shortcut, body").eq("workspace_id", workspace.id).order("shortcut", { ascending: true }),
    supabase.from("contact_notes").select("id, body, created_at, author_id").eq("contact_id", contactId).order("created_at", { ascending: false }),
    listWorkspaceMembers(workspace.id),
  ]);

  const emailByUserId = new Map(members.map((m) => [m.userId, m.email]));
  const notesWithAuthor = (notes ?? []).map((n) => ({ ...n, author_email: emailByUserId.get(n.author_id) ?? null }));
  const sessionOpen = Boolean(contact.session_expires_at && new Date(contact.session_expires_at) > new Date());

  return (
    <div className="flex h-[calc(100vh-4rem)] max-w-5xl gap-5">
      <RealtimeRefresher contactId={contactId} />
      <div className="flex flex-1 flex-col">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="font-mono text-sm">{contact.phone}</div>
            {contact.name && <div className="text-[13px] text-faint">{contact.name}</div>}
          </div>
          <div className="flex gap-2">
            {contact.opted_out && <span className="sk-pill border-danger text-danger">opted out</span>}
            <span className={`sk-pill ${sessionOpen ? "border-accent text-accent" : "text-faint"}`}>
              {sessionOpen ? "24h window open" : "24h window closed"}
            </span>
          </div>
        </div>

        <div className="sk-card flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {(messages ?? []).map((m) => (
              <div key={m.id} className={`flex ${m.direction === "outbound" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] rounded-lg px-3.5 py-2 text-[13.5px] ${
                    m.direction === "outbound" ? "bg-accent text-[#05130a]" : "bg-surface-2 border border-border"
                  }`}
                >
                  {m.body ?? "[template message]"}
                </div>
              </div>
            ))}
            {(!messages || messages.length === 0) && <p className="text-center text-muted">No messages yet.</p>}
          </div>
          <ReplyBox contactId={contactId} sessionOpen={sessionOpen} cannedResponses={cannedResponses ?? []} />
        </div>
      </div>

      <div className="flex w-72 flex-shrink-0 flex-col gap-4 pt-[52px]">
        <div className="sk-card p-4">
          <div className="mb-2 text-[11px] font-medium uppercase tracking-wide text-faint">Assigned to</div>
          <AssigneeSelect contactId={contactId} members={members} assigneeId={contact.assignee_id} />
        </div>
        <NotesPanel contactId={contactId} notes={notesWithAuthor} />
      </div>
    </div>
  );
}
