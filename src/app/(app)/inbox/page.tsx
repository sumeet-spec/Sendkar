import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace, getCurrentUserId } from "@/lib/workspace";
import { InboxListRefresher } from "./InboxListRefresher";
import Link from "next/link";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "attention", label: "Needs attention" },
  { value: "mine", label: "Mine" },
  { value: "unassigned", label: "Unassigned" },
  { value: "open", label: "Session open" },
] as const;

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default async function InboxPage({ searchParams }: { searchParams: Promise<{ q?: string; filter?: string }> }) {
  const { q = "", filter = "all" } = await searchParams;
  const workspace = await getCurrentWorkspace();
  if (!workspace) return null;
  const supabase = await createClient();
  const currentUserId = await getCurrentUserId();

  const { data: messages } = await supabase
    .from("messages")
    .select("contact_id, body, direction, channel, created_at, contacts(id, phone, name, assignee_id, opted_out, last_sentiment, session_expires_at)")
    .eq("workspace_id", workspace.id)
    .order("created_at", { ascending: false })
    .limit(500);

  type Thread = {
    phone: string;
    name: string | null;
    lastBody: string | null;
    lastAt: string;
    lastDirection: string;
    channel: string;
    assigneeId: string | null;
    optedOut: boolean;
    sentiment: string | null;
    sessionOpen: boolean;
  };

  const threads = new Map<string, Thread>();
  for (const m of messages ?? []) {
    const contact = m.contacts as {
      id?: string; phone?: string; name?: string | null; assignee_id?: string | null;
      opted_out?: boolean; last_sentiment?: string | null; session_expires_at?: string | null;
    } | null;
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
      sessionOpen: Boolean(contact.session_expires_at && new Date(contact.session_expires_at) > new Date()),
    });
  }

  const normalizedQuery = q.trim().toLowerCase();
  const filtered = Array.from(threads.entries()).filter(([, t]) => {
    if (normalizedQuery && !t.phone.includes(normalizedQuery) && !t.name?.toLowerCase().includes(normalizedQuery)) return false;
    if (filter === "mine" && t.assigneeId !== currentUserId) return false;
    if (filter === "unassigned" && t.assigneeId) return false;
    if (filter === "attention" && t.sentiment !== "negative" && t.sentiment !== "urgent") return false;
    if (filter === "open" && !t.sessionOpen) return false;
    return true;
  });

  // Threads where the last message was inbound = customer is waiting for a reply
  const needsReply = (t: Thread) => t.lastDirection === "inbound";

  return (
    <div className="max-w-3xl">
      <InboxListRefresher workspaceId={workspace.id} />
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Inbox</h1>
          <p className="mt-0.5 text-[12.5px] text-faint">
            {filtered.length} conversation{filtered.length === 1 ? "" : "s"}
            {filtered.some((([, t]) => needsReply(t))) && (
              <span className="ml-2 text-warn">
                · {filtered.filter(([, t]) => needsReply(t)).length} awaiting reply
              </span>
            )}
          </p>
        </div>
        <a href="/api/messages/export" className="sk-btn sk-btn-ghost text-[12.5px]">Export backup</a>
      </div>

      <form className="mb-3 flex gap-3">
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

      <div className="mb-4 flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <Link
            key={f.value}
            href={`/inbox?filter=${f.value}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
            className={`sk-pill transition-colors ${
              filter === f.value ? "border-accent bg-accent text-[#05130a]" : "hover:border-foreground/50"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className="sk-card overflow-hidden">
        {filtered.map(([contactId, t]) => {
          const waiting = needsReply(t);
          return (
            <Link
              key={contactId}
              href={`/inbox/${contactId}`}
              className="group flex items-center gap-3 border-b border-border p-4 last:border-0 hover:bg-[var(--surface-2)]"
              style={waiting ? { borderLeft: "3px solid var(--accent)" } : undefined}
            >
              {/* Avatar */}
              <div
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-[13px] font-bold"
                style={
                  t.name
                    ? { background: "var(--accent-glow)", color: "var(--accent)" }
                    : { background: "var(--surface-2)", color: "var(--faint)", border: "1px solid var(--border)" }
                }
              >
                {t.name ? t.name[0].toUpperCase() : "#"}
              </div>

              <div className="min-w-0 flex-1">
                {/* Name + phone row */}
                <div className="flex items-center gap-2">
                  <span className={`text-[13.5px] ${t.name ? "font-medium" : "font-mono text-[13px] text-muted"}`}>
                    {t.name ?? t.phone}
                  </span>
                  {t.name && (
                    <span className="font-mono text-[11.5px] text-faint">{t.phone}</span>
                  )}
                  {t.channel !== "whatsapp" && <span className="sk-pill text-[10.5px]">{t.channel}</span>}
                  {t.optedOut && <span className="sk-pill border-danger text-danger text-[10.5px]">opted out</span>}
                  {(t.sentiment === "negative" || t.sentiment === "urgent") && (
                    <span className="sk-pill border-warn text-warn text-[10.5px]">{t.sentiment}</span>
                  )}
                  {t.sessionOpen && (
                    <span className="inline-block h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ background: "var(--accent)" }} title="24h window open" />
                  )}
                </div>
                {/* Last message preview */}
                <div className={`mt-0.5 max-w-md truncate text-[12.5px] ${waiting ? "font-medium text-foreground" : "text-muted"}`}>
                  {!waiting && <span className="text-faint">You: </span>}
                  {t.lastBody ?? "[template message]"}
                </div>
              </div>

              <div className="flex-shrink-0 text-right">
                <div className="text-[11.5px] text-faint">{relativeTime(t.lastAt)}</div>
                {waiting && (
                  <div className="mt-0.5 text-[10.5px] font-medium" style={{ color: "var(--accent)" }}>Reply ↗</div>
                )}
              </div>
            </Link>
          );
        })}
        {filtered.length === 0 && (
          <p className="p-10 text-center text-muted">
            {q || filter !== "all" ? "No conversations match this filter." : "No conversations yet."}
          </p>
        )}
      </div>
    </div>
  );
}
