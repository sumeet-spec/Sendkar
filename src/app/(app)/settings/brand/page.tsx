import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { BrandKitForm } from "./BrandKitForm";
import type { BrandKit } from "@/lib/brandKit";
import { getCurrentLanguage } from "@/lib/i18n/getLanguage";
import { APP_COPY } from "@/lib/i18n/appCopy";

export default async function BrandKitPage() {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return null;
  const t = APP_COPY[await getCurrentLanguage()].brand;
  const supabase = await createClient();
  const { data: kit } = await supabase.from("brand_kits").select("*").eq("workspace_id", workspace.id).maybeSingle();

  return (
    <div className="max-w-2xl">
      <h1 className="mb-2 text-xl font-semibold tracking-tight">{t.title}</h1>
      <p className="mb-6 text-sm text-muted">
        {t.intro}
      </p>
      <BrandKitForm t={t} workspaceName={workspace.name} workspaceId={workspace.id} kit={(kit as BrandKit | null) ?? null} />
    </div>
  );
}
