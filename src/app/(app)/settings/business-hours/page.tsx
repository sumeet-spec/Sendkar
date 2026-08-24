import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { BusinessHoursForm } from "./BusinessHoursForm";

export default async function BusinessHoursPage() {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return null;
  const supabase = await createClient();

  const { data: hours } = await supabase
    .from("business_hours")
    .select("day_of_week, opens_at, closes_at")
    .eq("workspace_id", workspace.id);

  return (
    <div className="max-w-2xl">
      <h1 className="mb-2 text-xl font-semibold tracking-tight">Business hours</h1>
      <p className="mb-6 text-sm text-muted">
        Outside these hours, anyone messaging you for the first time in a while gets your away message
        automatically — Sendkar checks this on every fresh conversation, not just once.
      </p>
      <BusinessHoursForm
        enabled={workspace.business_hours_enabled}
        timezone={workspace.business_hours_timezone}
        awayMessage={workspace.away_message}
        hours={hours ?? []}
      />
    </div>
  );
}
