import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace, getCurrentUserId } from "@/lib/workspace";
import { InboxListRefresher } from "./InboxListRefresher";
import Link from "next/link";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "attention", label: "Needs attention" },
  { value: "mine", label: "Assigned to me" },
  { value: "unassigned", label: "Unassigned" },
] as const;

export default async function InboxPage({ searchParams }: { searchParams: Promise<{ q?: string; filter?: string }> }) {
  const { q = "", filter = "all" } = await searchParams;
  const workspace = await getCurrentWorkspace();
  if (!workspace) return null;
  const supabase = await createClient();

  const currentUserId = await getCurrentUserId();

  // Most recent message per contact, newest conversation first.
  const { data: messages } = await supabase
    .from("messages")
    .select("contact_id, body, direction, channel, created_at, contacts(id, phone, name, assignee_id, opted_out, last_sentiment)")
    .eq("workspace_id", workspace.id)
    .order("created_at", { ascending: false })
    .limit(500);

  const threads = new Map<
    string,
    { phone: string; name: string | null; lastBody: string | null; lastAt: string; lastDirection: string; channel: string; assigneeId: string | null; optedOut: boolean; sentiment: string | null }
  >();
  for (const m of messages ?? []) {
    const contact = m.contacts as { id?: string; phone?: string; name?: string | null; assignee_id?: string | null; opted_out?: boolean; last_sentiment?: string | null } | null;
    if (!contact?.id || threads.has(contact.id)) continue;
    threads.set(contact.id, {
      phone: contact.phone ?? "",
      name: contact.name ?? null,
      lastBody: m.body,
      lastAt: m.created_at,
      lastDirection: m.direction,
      channel: m.channel,
      assigneeId: contact.assignee_id ?? null,
      optedOut: Boolean(contact.opted_out),
      sentiment: contact.last_sentiment ?? null,
    });
  }

  const normalizedQuery = q.trim().toLowerCase();
  const filtered = Array.from(threads.entries()).filter(([, t]) => {
    if (normalizedQuery && !t.phone.includes(normalizedQuery) && !t.name?.toLowerCase().includes(normalizedQuery)) return false;
    if (filter === "mine" && t.assigneeId !== currentUserId) return false;
    if (filter === "unassigned" && t.assigneeId) return false;
    if (filter === "attention" && t.sentiment !== "negative" && t.sentiment !== "urgent") return false;
    return true;
  });

  return (
    <div className="max-w-3xl">
      <InboxListRefresher workspaceId={workspace.id} />
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">Inbox</h1>
        <a href="/api/messages/export" className="sk-btn sk-btn-ghost">Export chat backup</a>
      </div>

      <form className="mb-4 flex gap-3">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search by phone or name…"
          className="sk-input flex-1"
        />
        <input type="hidden" name="filter" value={filter} />
        <button type="submit" className="sk-btn sk-btn-ghost">Search</button>
      </form>

      <div className="mb-4 flex gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.value}
            href={`/inbox?filter=${f.value}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
            className={`sk-pill ${filter === f.value ? "border-accent text-accent" : ""}`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className="sk-card overflow-hidden">
        {filtered.map(([contactId, t]) => (
          <Link
            key={contactId}
            href={`/inbox/${contactId}`}
            className="flex items-center justify-between border-b border-border p-4 last:border-0 hover:bg-surface-2"
          >
            <div>
              <div className="flex items-center gap-2 font-mono text-[13px]">
                {t.phone}
                {t.channel !== "whatsapp" && <span className="sk-pill">{t.channel}</span>}
                {t.optedOut && <span className="sk-pill border-danger text-danger">opted out</span>}
                {(t.sentiment === "negative" || t.sentiment === "urgent") && (
                  <span className="sk-pill border-warn text-warn">{t.sentiment}</span>
                )}
              </div>
              <div className="mt-0.5 max-w-md truncate text-[13px] text-muted">
                {t.lastDirection === "outbound" && <span className="text-faint">You: </span>}
                {t.lastBody ?? "[template message]"}
              </div>
            </div>
            <div className="text-[11.5px] text-faint">{new Date(t.lastAt).toLocaleDateString()}</div>
          </Link>
        ))}
        {filtered.length === 0 && <p className="p-8 text-center text-muted">No conversations match.</p>}
      </div>
    </div>
  );
}
