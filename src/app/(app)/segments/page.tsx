import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { NewSegmentForm } from "./NewSegmentForm";
import { SegmentRow } from "./SegmentRow";
import type { SegmentCondition } from "@/lib/segments";

export default async function SegmentsPage() {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return null;
  const supabase = await createClient();

  const { data: segments } = await supabase
    .from("segments")
    .select("id, name, conditions")
    .eq("workspace_id", workspace.id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-2xl">
      <h1 className="mb-2 text-xl font-semibold tracking-tight">Segments</h1>
      <p className="mb-5 text-sm text-muted">
        Multi-condition audience filters — pick one from a campaign&apos;s new-campaign form instead of a single tag.
      </p>

      <div className="mb-5">
        <NewSegmentForm />
      </div>

      <div className="flex flex-col gap-3">
        {(segments ?? []).map((s) => <SegmentRow key={s.id} segment={{ ...s, conditions: (s.conditions as SegmentCondition[]) ?? [] }} />)}
        {(!segments || segments.length === 0) && <p className="py-8 text-center text-muted">No segments yet.</p>}
      </div>
    </div>
  );
}
