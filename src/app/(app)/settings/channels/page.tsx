import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { getPlanLimits } from "@/lib/plans";
import { WhatsAppForm, InstagramForm, MessengerForm } from "./ChannelForms";
import { AdditionalNumbers } from "./AdditionalNumbers";

export default async function ChannelsPage() {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return null;
  const supabase = await createClient();
  const limits = getPlanLimits(workspace.plan);

  const { data: numbers } = await supabase
    .from("whatsapp_numbers")
    .select("id, label, phone_number_id, display_number")
    .eq("workspace_id", workspace.id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-xl font-semibold tracking-tight">Channels</h1>
      <div className="flex flex-col gap-5">
        <WhatsAppForm workspace={workspace} />
        <AdditionalNumbers numbers={numbers ?? []} />
        <InstagramForm workspace={workspace} locked={!limits.instagramEnabled} />
        <MessengerForm workspace={workspace} locked={!limits.instagramEnabled} />
      </div>
    </div>
  );
}
