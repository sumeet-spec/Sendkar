import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { notFound } from "next/navigation";
import { ReplyBox } from "./ReplyBox";

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

  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("contact_id", contactId)
    .order("created_at", { ascending: true });

  return (
    <div className="flex h-[calc(100vh-4rem)] max-w-2xl flex-col">
      <div className="mb-4">
        <div className="font-mono text-sm">{contact.phone}</div>
        {contact.name && <div className="text-[13px] text-faint">{contact.name}</div>}
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
        <ReplyBox contactId={contactId} />
      </div>
    </div>
  );
}
