import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { BrandKitForm } from "./BrandKitForm";
import type { BrandKit } from "@/lib/brandKit";

export default async function BrandKitPage() {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return null;
  const supabase = await createClient();
  const { data: kit } = await supabase.from("brand_kits").select("*").eq("workspace_id", workspace.id).maybeSingle();

  return (
    <div className="max-w-2xl">
      <h1 className="mb-2 text-xl font-semibold tracking-tight">Brand kit</h1>
      <p className="mb-6 text-sm text-muted">
        Fill this in once. Every festival card, offer card and thank-you card you make will use your name, logo and
        colours automatically, in the language of the people you are sending to.
      </p>
      <BrandKitForm workspaceName={workspace.name} workspaceId={workspace.id} kit={(kit as BrandKit | null) ?? null} />
    </div>
  );
}
