import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace, listWorkspaceMembers } from "@/lib/workspace";
import { notFound } from "next/navigation";
import { ReplyBox } from "./ReplyBox";
import { MessageBubble } from "./MessageBubble";
import { AssigneeSelect } from "./AssigneeSelect";
import { NotesPanel } from "./NotesPanel";
import { SummaryPanel } from "./SummaryPanel";
import { OrdersPanel } from "./OrdersPanel";
import { RealtimeRefresher } from "./RealtimeRefresher";
import { CallPermissionButton } from "./CallPermissionButton";

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

  const [{ data: messages }, { data: cannedResponses }, { data: notes }, { data: products }, { data: orders }, { data: forms }, members] = await Promise.all([
    supabase.from("messages").select("*").eq("contact_id", contactId).order("created_at", { ascending: true }),
    supabase.from("canned_responses").select("id, shortcut, body").eq("workspace_id", workspace.id).order("shortcut", { ascending: true }),
    supabase.from("contact_notes").select("id, body, created_at, author_id").eq("contact_id", contactId).order("created_at", { ascending: false }),
    supabase.from("products").select("id, name, price_label").eq("workspace_id", workspace.id).eq("is_active", true).order("name", { ascending: true }),
    supabase.from("orders").select("id, total_amount, currency, source, order_label, attributed_campaign_id, created_at").eq("contact_id", contactId).order("created_at", { ascending: false }),
    supabase.from("wa_flows").select("id, name").eq("workspace_id", workspace.id).eq("status", "published").order("name", { ascending: true }),
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
            {contact.tags?.length > 0 && (
              <div className="mt-1 flex gap-1">
                {contact.tags.map((t: string) => <span key={t} className="sk-pill">{t}</span>)}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {contact.opted_out && <span className="sk-pill border-danger text-danger">opted out</span>}
            {(contact.last_sentiment === "negative" || contact.last_sentiment === "urgent") && (
              <span className="sk-pill border-warn text-warn">{contact.last_sentiment}</span>
            )}
            <span className={`sk-pill ${sessionOpen ? "border-accent text-accent" : "text-faint"}`}>
              {sessionOpen ? "24h window open" : "24h window closed"}
            </span>
          </div>
        </div>

        <div className="sk-card flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {(messages ?? []).map((m) => (
              <MessageBubble key={m.id} contactId={contactId} message={{ id: m.id, direction: m.direction, body: m.body, reaction: m.reaction ?? null }} />
            ))}
            {(!messages || messages.length === 0) && <p className="text-center text-muted">No messages yet.</p>}
          </div>
          <ReplyBox contactId={contactId} sessionOpen={sessionOpen} cannedResponses={cannedResponses ?? []} products={products ?? []} forms={forms ?? []} />
        </div>
      </div>

      <div className="flex w-72 flex-shrink-0 flex-col gap-4 pt-[52px]">
        <div className="sk-card p-4">
          <div className="mb-2 text-[11px] font-medium uppercase tracking-wide text-faint">Assigned to</div>
          <AssigneeSelect contactId={contactId} members={members} assigneeId={contact.assignee_id} />
        </div>
        {workspace.calling_enabled && <CallPermissionButton phone={contact.phone} />}
        <SummaryPanel contactId={contactId} />
        <OrdersPanel contactId={contactId} orders={orders ?? []} />
        <NotesPanel contactId={contactId} notes={notesWithAuthor} />
      </div>
    </div>
  );
}
