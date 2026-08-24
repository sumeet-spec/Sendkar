// Meta's webhook delivery makes no ordering guarantee — retries and network
// reordering mean a "sent" event can genuinely arrive after "delivered" or
// "read" already did. Applying status updates unconditionally lets a late,
// stale event regress what's shown (delivered → sent) for no reason. failed
// is terminal in the other direction: once a message is confirmed delivered
// or read, a later "failed" for the same wamid doesn't retroactively undo it.
export const STATUS_RANK: Record<"sent" | "delivered" | "read" | "failed", number> = {
  sent: 1, delivered: 2, read: 3, failed: 1,
};

export function isStatusRegression(current: string | null, incoming: string): boolean {
  if (!current || !(current in STATUS_RANK)) return false;
  if (incoming === "failed") return current === "delivered" || current === "read";
  const currentRank = STATUS_RANK[current as keyof typeof STATUS_RANK];
  const incomingRank = STATUS_RANK[incoming as keyof typeof STATUS_RANK];
  return incomingRank < currentRank;
}
