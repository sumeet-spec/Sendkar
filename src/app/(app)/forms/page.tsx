import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { NewFormForm } from "./NewFormForm";
import { FormRow } from "./FormRow";

export default async function FormsPage() {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return null;
  const supabase = await createClient();

  const { data: forms } = await supabase
    .from("wa_flows")
    .select("id, name, status, error_message, screens")
    .eq("workspace_id", workspace.id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">Forms</h1>
        <NewFormForm />
      </div>
      <p className="mb-5 text-sm text-muted">
        Native WhatsApp Flows — multi-screen forms that open right inside the chat, no browser redirect. Publish
        one here, then send it to a contact from their inbox thread. Needs a connected WhatsApp Business Account.
      </p>

      <div className="flex flex-col gap-3">
        {(forms ?? []).map((f) => (
          <FormRow key={f.id} form={{ ...f, screen_count: (f.screens as unknown[])?.length ?? 0 }} />
        ))}
        {(!forms || forms.length === 0) && <p className="py-8 text-center text-muted">No forms yet.</p>}
      </div>
    </div>
  );
}
