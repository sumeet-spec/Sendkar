import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { NewApiKeyForm } from "./NewApiKeyForm";
import { ApiKeyRow } from "./ApiKeyRow";

export default async function ApiKeysPage() {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return null;
  const supabase = await createClient();

  const { data: keys } = await supabase
    .from("api_keys")
    .select("id, name, key_prefix, last_used_at, created_at")
    .eq("workspace_id", workspace.id)
    .is("revoked_at", null)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">API keys</h1>
        <NewApiKeyForm />
      </div>
      <p className="mb-5 text-sm text-muted">
        Used by the <a href="/mcp" className="text-accent hover:text-accent-hover">MCP connector</a> and any other
        external integration — never shared with contacts or exposed in the browser.
      </p>

      <div className="flex flex-col gap-3">
        {(keys ?? []).map((k) => <ApiKeyRow key={k.id} apiKey={k} />)}
        {(!keys || keys.length === 0) && <p className="py-8 text-center text-muted">No API keys yet.</p>}
      </div>
    </div>
  );
}
