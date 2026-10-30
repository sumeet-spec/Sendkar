import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace, listWorkspaceMembers } from "@/lib/workspace";
import { getCurrentLanguage } from "@/lib/i18n/getLanguage";
import { INBOX_UI } from "@/lib/i18n/inboxCopy";
import { notFound } from "next/navigation";
import { ReplyBox } from "./ReplyBox";
import { MessageBubble } from "./MessageBubble";
import { AssigneeSelect } from "./AssigneeSelect";
import { NotesPanel } from "./NotesPanel";
import { SummaryPanel } from "./SummaryPanel";
import { OrdersPanel } from "./OrdersPanel";
import { PaymentsPanel } from "./PaymentsPanel";
import { ContactInfoPanel } from "./ContactInfoPanel";
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

  const [{ data: recentMessages }, { data: cannedResponses }, { data: notes }, { data: products }, { data: orders }, { data: paymentLinks }, { data: forms }, members] = await Promise.all([
    // Most-recent-first with a cap, then reversed below — an active seller's
    // thread can run to thousands of messages, and rendering the whole
    // history on every open was blocking the page on fetching + serializing
    // all of it just to show the tail end.
    supabase.from("messages").select("*").eq("contact_id", contactId).order("created_at", { ascending: false }).limit(100),
    supabase.from("canned_responses").select("id, shortcut, body").eq("workspace_id", workspace.id).order("shortcut", { ascending: true }),
    supabase.from("contact_notes").select("id, body, created_at, author_id").eq("contact_id", contactId).eq("kind", "note").order("created_at", { ascending: false }),
    supabase.from("products").select("id, name, price_label").eq("workspace_id", workspace.id).eq("is_active", true).order("name", { ascending: true }),
    supabase.from("orders").select("id, total_amount, currency, source, order_label, attributed_campaign_id, created_at").eq("contact_id", contactId).order("created_at", { ascending: false }),
    supabase.from("payment_links").select("id, provider, amount, url, created_at, paid_at, status, failure_reason").eq("contact_id", contactId).order("created_at", { ascending: false }),
    supabase.from("wa_flows").select("id, name").eq("workspace_id", workspace.id).eq("status", "published").order("name", { ascending: true }),
    listWorkspaceMembers(workspace.id),
  ]);

  const messages = recentMessages ? [...recentMessages].reverse() : recentMessages;
  const emailByUserId = new Map(members.map((m) => [m.userId, m.email]));
  const notesWithAuthor = (notes ?? []).map((n) => ({ ...n, author_email: emailByUserId.get(n.author_id) ?? null }));
  const sessionOpen = Boolean(contact.session_expires_at && new Date(contact.session_expires_at) > new Date());
  const currency = workspace.currency ?? "INR";
  const t = INBOX_UI[await getCurrentLanguage()];

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
                {contact.tags.map((tg: string) => <span key={tg} className="sk-pill">{tg}</span>)}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {contact.opted_out && <span className="sk-pill border-danger text-danger">{t.optedOut}</span>}
            {(contact.last_sentiment === "negative" || contact.last_sentiment === "urgent") && (
              <span className="sk-pill border-warn text-warn">{contact.last_sentiment === "urgent" ? t.urgent : t.negative}</span>
            )}
            <span className={`sk-pill ${sessionOpen ? "border-accent text-accent" : "text-faint"}`}>
              {sessionOpen ? t.windowOpen : t.windowClosed}
            </span>
          </div>
        </div>

        <div className="sk-card flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {(messages ?? []).map((m) => (
              <MessageBubble key={m.id} contactId={contactId} message={{ id: m.id, direction: m.direction, body: m.body, reaction: m.reaction ?? null, sent_by_ai: m.sent_by_ai ?? false, created_at: m.created_at }} />
            ))}
            {(!messages || messages.length === 0) && <p className="text-center text-muted">{t.noMessages}</p>}
          </div>
          <ReplyBox t={t} contactId={contactId} sessionOpen={sessionOpen} cannedResponses={cannedResponses ?? []} products={products ?? []} forms={forms ?? []} />
        </div>
      </div>

      <div className="flex w-72 flex-shrink-0 flex-col gap-4 overflow-y-auto pt-[52px] pb-4">
        <div className="sk-card p-4">
          <div className="mb-2 text-[11px] font-medium uppercase tracking-wide text-faint">{t.assignedTo}</div>
          <AssigneeSelect t={t} contactId={contactId} members={members} assigneeId={contact.assignee_id} />
        </div>
        <ContactInfoPanel
          t={t}
          contactId={contactId}
          name={contact.name ?? null}
          email={contact.email ?? null}
          language={contact.language ?? null}
          source={contact.source ?? null}
          adHeadline={contact.ad_headline ?? null}
          optedOut={Boolean(contact.opted_out)}
          createdAt={contact.created_at}
        />
        {workspace.calling_enabled && <CallPermissionButton t={t} phone={contact.phone} />}
        <SummaryPanel t={t} contactId={contactId} />
        <OrdersPanel t={t} contactId={contactId} orders={orders ?? []} currency={currency} />
        <PaymentsPanel t={t} links={paymentLinks ?? []} currency={currency} />
        <NotesPanel t={t} contactId={contactId} notes={notesWithAuthor} />
      </div>
    </div>
  );
}
