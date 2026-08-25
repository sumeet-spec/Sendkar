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

/**
 * Parses branch lines into branch objects — a plain-text format instead of a
 * drag-and-drop graph editor for v1. Two forms:
 *   "keyword => 3"            — matches the reply to THIS step (original behavior)
 *   "varName:keyword => 3"    — matches a variable an earlier step captured,
 *                                not the current reply — the "ask now, decide
 *                                later" pattern Wati's condition nodes support.
 *
 * Not a "use server" file so it can be unit-tested directly — parseBranches
 * used to live inline in the server-actions file, where every export must be
 * an async function, ruling out a direct test.
 */
export function parseBranches(raw: string): FlowBranch[] {
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line): FlowBranch | null => {
      const [left, stepStr] = line.split("=>").map((s) => s.trim());
      const nextStepOrder = Number(stepStr);
      if (!left || !Number.isInteger(nextStepOrder)) return null;

      const colonIdx = left.indexOf(":");
      if (colonIdx > 0) {
        const sourceVariable = left.slice(0, colonIdx).trim().toLowerCase();
        const keyword = left.slice(colonIdx + 1).trim().toLowerCase();
        if (!sourceVariable || !keyword) return null;
        return { sourceVariable, keyword, matchType: "contains", nextStepOrder };
      }
      return { keyword: left.toLowerCase(), matchType: "contains", nextStepOrder };
    })
    .filter((b): b is FlowBranch => b !== null);
}
