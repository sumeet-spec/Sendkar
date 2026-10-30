import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { getCurrentLanguage } from "@/lib/i18n/getLanguage";
import { SEGMENTS_UI } from "@/lib/i18n/segmentsCopy";
import { CARE_UI } from "@/lib/i18n/careUi";
import { NewSegmentForm } from "./NewSegmentForm";
import { SegmentRow } from "./SegmentRow";
import { applySegmentConditions, type SegmentCondition } from "@/lib/segments";

export default async function SegmentsPage() {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return null;
  const supabase = await createClient();
  const lang = await getCurrentLanguage();
  const t = SEGMENTS_UI[lang];
  const care = CARE_UI[lang];

  const { data: segments } = await supabase
    .from("segments")
    .select("id, name, conditions")
    .eq("workspace_id", workspace.id)
    .order("created_at", { ascending: false });

  // Count contacts matching each segment's conditions
  const contactCounts = await Promise.all(
    (segments ?? []).map(async (s) => {
      const conditions = (s.conditions as SegmentCondition[]) ?? [];
      const baseQuery = supabase
        .from("contacts")
        .select("id", { count: "exact", head: true })
        .eq("workspace_id", workspace.id)
        .eq("opted_out", false);
      const { count } = await applySegmentConditions(baseQuery, conditions);
      return { id: s.id, count: count ?? 0 };
    }),
  );
  const countById = new Map(contactCounts.map((c) => [c.id, c.count]));

  return (
    <div className="max-w-2xl">
      <div className="mb-2 flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">{t.title}</h1>
      </div>
      <p className="mb-5 text-sm text-muted">{t.intro}</p>

      <div className="mb-5">
        <NewSegmentForm t={t} care={care} />
      </div>

      <div className="flex flex-col gap-3">
        {(segments ?? []).map((s) => (
          <SegmentRow
            t={t}
            care={care}
            key={s.id}
            segment={{ ...s, conditions: (s.conditions as SegmentCondition[]) ?? [] }}
            contactCount={countById.get(s.id) ?? 0}
          />
        ))}
        {(!segments || segments.length === 0) && (
          <p className="py-10 text-center text-muted">{t.empty}</p>
        )}
      </div>
    </div>
  );
}
