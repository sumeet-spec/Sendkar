export interface FlowBranch {
  keyword: string;
  matchType: "exact" | "contains";
  nextStepOrder: number;
  sourceVariable?: string; // when set, matches a variable an earlier step captured instead of the current reply
}

/**
 * Picks which branch (if any) a reply matches — extracted from the webhook
 * route so the "ask now, decide later" variable-branching logic (added
 * after reading Wati's own chatbot-builder docs, which support this and
 * Sendkar's flows didn't) has a real regression test instead of only ever
 * being exercised by a live WhatsApp message no test suite can send.
 */
export function matchFlowBranch(
  branches: FlowBranch[],
  currentReplyNormalized: string,
  variables: Record<string, string>,
): FlowBranch | undefined {
  return branches.find((b) => {
    const haystack = b.sourceVariable ? (variables[b.sourceVariable] ?? "").toLowerCase() : currentReplyNormalized;
    return b.matchType === "exact" ? haystack === b.keyword : haystack.includes(b.keyword);
  });
}
