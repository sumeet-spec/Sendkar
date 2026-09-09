import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { NewFormForm } from "./NewFormForm";
import { FormRow } from "./FormRow";

const STATUS_STYLE: Record<string, string> = {
  published: "border-accent text-accent",
  draft: "text-faint",
  error: "border-danger text-danger",
};

export default async function FormsPage() {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return null;
  const supabase = await createClient();

  const { data: forms } = await supabase
    .from("wa_flows")
    .select("id, name, status, error_message, screens")
    .eq("workspace_id", workspace.id)
    .order("created_at", { ascending: false });

  const publishedCount = (forms ?? []).filter((f) => f.status === "published").length;

  return (
    <div className="max-w-3xl">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold tracking-tight">Forms</h1>
          {(forms?.length ?? 0) > 0 && publishedCount > 0 && (
            <span className="sk-pill border-accent text-accent">{publishedCount} published</span>
          )}
        </div>
        <NewFormForm />
      </div>
      <p className="mb-5 text-[13px] text-muted">
        Native WhatsApp Flows — multi-screen forms that open right inside the chat, no browser redirect. Publish one
        here, then send it to a contact from their inbox thread.
      </p>

      <div className="flex flex-col gap-3">
        {(forms ?? []).map((f) => (
          <FormRow key={f.id} form={{ ...f, screen_count: (f.screens as unknown[])?.length ?? 0 }} />
        ))}
        {(!forms || forms.length === 0) && (
          <div className="rounded-lg border border-border py-10 text-center">
            <p className="text-muted">No forms yet.</p>
            <p className="mt-1 text-[12.5px] text-faint">
              Create one above — add screens, then publish to send it from any inbox thread.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
