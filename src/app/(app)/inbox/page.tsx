import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import Link from "next/link";

export default async function InboxPage() {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return null;
  const supabase = await createClient();

  // Most recent message per contact, newest conversation first.
  const { data: messages } = await supabase
    .from("messages")
    .select("contact_id, body, direction, created_at, contacts(id, phone, name)")
    .eq("workspace_id", workspace.id)
    .order("created_at", { ascending: false })
    .limit(500);

  const threads = new Map<string, { phone: string; name: string | null; lastBody: string | null; lastAt: string; lastDirection: string }>();
  for (const m of messages ?? []) {
    const contact = m.contacts as { id?: string; phone?: string; name?: string | null } | null;
    if (!contact?.id || threads.has(contact.id)) continue;
    threads.set(contact.id, {
      phone: contact.phone ?? "",
      name: contact.name ?? null,
      lastBody: m.body,
      lastAt: m.created_at,
      lastDirection: m.direction,
    });
  }

  return (
    <div className="max-w-3xl">
      <h1 className="mb-6 text-xl font-semibold tracking-tight">Inbox</h1>

      <div className="sk-card overflow-hidden">
        {Array.from(threads.entries()).map(([contactId, t]) => (
          <Link
            key={contactId}
            href={`/inbox/${contactId}`}
            className="flex items-center justify-between border-b border-border p-4 last:border-0 hover:bg-surface-2"
          >
            <div>
              <div className="font-mono text-[13px]">{t.phone}</div>
              <div className="mt-0.5 max-w-md truncate text-[13px] text-muted">
                {t.lastDirection === "outbound" && <span className="text-faint">You: </span>}
                {t.lastBody ?? "[template message]"}
              </div>
            </div>
            <div className="text-[11.5px] text-faint">{new Date(t.lastAt).toLocaleDateString()}</div>
          </Link>
        ))}
        {threads.size === 0 && <p className="p-8 text-center text-muted">No conversations yet.</p>}
      </div>
    </div>
  );
}
