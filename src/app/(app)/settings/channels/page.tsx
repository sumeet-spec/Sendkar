import { getCurrentWorkspace } from "@/lib/workspace";
import { getPlanLimits } from "@/lib/plans";
import { WhatsAppForm, InstagramForm } from "./ChannelForms";

export default async function ChannelsPage() {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return null;
  const limits = getPlanLimits(workspace.plan);

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-xl font-semibold tracking-tight">Channels</h1>
      <div className="flex flex-col gap-5">
        <WhatsAppForm workspace={workspace} />
        <InstagramForm workspace={workspace} locked={!limits.instagramEnabled} />
      </div>
    </div>
  );
}
