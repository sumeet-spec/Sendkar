/**
 * Saved segments — real multi-condition audience filters (AND-combined)
 * instead of a campaign's one free-text tag. Interakt and Wati both call
 * this out as an "advanced" tier feature; this ships it as a first-class
 * saved object any campaign can pick.
 */

export type SegmentField = "tag" | "language" | "source" | "sentiment";

export interface SegmentCondition {
  field: SegmentField;
  value: string;
}

export const SEGMENT_FIELD_LABELS: Record<SegmentField, string> = {
  tag: "Tag",
  language: "Language",
  source: "Source",
  sentiment: "Last sentiment",
};

/**
 * Applies every condition (AND-combined) to a Supabase contacts query
 * builder. Typed loosely on purpose — Supabase's PostgrestFilterBuilder
 * type is deeply generic over the exact select shape, which this helper
 * (used from more than one query with different selected columns) can't
 * usefully parameterize over; the real safety net is the unit test file
 * exercising the actual method-call sequence against a fake builder.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function applySegmentConditions<T extends { contains: (col: string, val: any) => T; eq: (col: string, val: any) => T }>(
  query: T,
  conditions: SegmentCondition[],
): T {
  let q = query;
  for (const c of conditions) {
    if (!c.value) continue;
    if (c.field === "tag") q = q.contains("tags", [c.value]);
    else if (c.field === "language") q = q.eq("language", c.value);
    else if (c.field === "source") q = q.eq("source", c.value);
    else if (c.field === "sentiment") q = q.eq("last_sentiment", c.value);
  }
  return q;
}

/** Human-readable summary, e.g. "Tag: vip, Language: hi" — for list/preview UI. */
export function describeSegmentConditions(conditions: SegmentCondition[]): string {
  if (conditions.length === 0) return "Everyone";
  return conditions.map((c) => `${SEGMENT_FIELD_LABELS[c.field]}: ${c.value}`).join(", ");
}
