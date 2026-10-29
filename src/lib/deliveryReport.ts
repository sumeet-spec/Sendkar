/**
 * Turns a campaign's raw counts and Meta's error texts into plain words a shopkeeper understands:
 * "412 got it, 12 could not be sent because they are not on WhatsApp".
 */

export type FailureKind = "optedOut" | "notOnWhatsApp" | "noPhone" | "needsPicture" | "limit" | "other";

export const FAILURE_LABEL: Record<FailureKind, string> = {
  optedOut: "asked to stop receiving messages",
  notOnWhatsApp: "are not on WhatsApp, or cannot receive this message",
  noPhone: "have no phone number saved",
  needsPicture: "could not be sent because the message needs a picture",
  limit: "were stopped by WhatsApp's sending limit",
  other: "could not be sent for another reason",
};

export function failureKind(error: string | null | undefined): FailureKind {
  const e = (error ?? "").toLowerCase();
  if (e.includes("opted out")) return "optedOut";
  if (e.includes("no phone")) return "noPhone";
  if (e.includes("needs a picture")) return "needsPicture";
  if (/undeliverable|not a valid whatsapp|not in allowed list|invalid parameter.*phone|recipient/.test(e)) return "notOnWhatsApp";
  if (/rate limit|spam|pair rate|too many|limit/.test(e)) return "limit";
  return "other";
}

export type Counts = Record<"queued" | "sent" | "delivered" | "read" | "failed", number>;

export type Report = {
  total: number;
  /** 0-100: how much of the list has been handled, sent or failed. */
  percentDone: number;
  gotIt: number;
  read: number;
  stillWaiting: number;
  failed: Array<{ kind: FailureKind; count: number; label: string }>;
};

export function buildReport(counts: Counts, failedErrors: Array<string | null>): Report {
  const total = counts.queued + counts.sent + counts.delivered + counts.read + counts.failed;
  const handled = total - counts.queued;
  const byKind = new Map<FailureKind, number>();
  for (const e of failedErrors) byKind.set(failureKind(e), (byKind.get(failureKind(e)) ?? 0) + 1);
  // The error list can be shorter than the failed count (it is capped); put the rest under "other".
  const listed = failedErrors.length;
  if (counts.failed > listed) byKind.set("other", (byKind.get("other") ?? 0) + (counts.failed - listed));

  return {
    total,
    percentDone: total === 0 ? 0 : Math.round((handled / total) * 100),
    gotIt: counts.delivered + counts.read,
    read: counts.read,
    stillWaiting: counts.queued,
    failed: [...byKind.entries()].sort((a, b) => b[1] - a[1]).map(([kind, count]) => ({ kind, count, label: FAILURE_LABEL[kind] })),
  };
}
