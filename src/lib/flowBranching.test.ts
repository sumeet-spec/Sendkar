import { describe, it, expect } from "vitest";
import { matchFlowBranch, parseBranches, type FlowBranch } from "./flowBranching";

describe("matchFlowBranch", () => {
  it("matches the current reply when no sourceVariable is set", () => {
    const branches: FlowBranch[] = [
      { keyword: "pricing", matchType: "contains", nextStepOrder: 2 },
      { keyword: "support", matchType: "contains", nextStepOrder: 3 },
    ];
    expect(matchFlowBranch(branches, "tell me about pricing please", {})?.nextStepOrder).toBe(2);
  });

  it("matches a captured variable instead of the reply when sourceVariable is set", () => {
    const branches: FlowBranch[] = [
      { keyword: "premium", matchType: "contains", nextStepOrder: 5, sourceVariable: "budget" },
      { keyword: "basic", matchType: "contains", nextStepOrder: 6, sourceVariable: "budget" },
    ];
    // the current reply ("yes please") doesn't contain either keyword —
    // only the variable captured three steps earlier should decide the branch
    expect(matchFlowBranch(branches, "yes please", { budget: "I want the premium plan" })?.nextStepOrder).toBe(5);
  });

  it("returns undefined when nothing matches", () => {
    const branches: FlowBranch[] = [{ keyword: "pricing", matchType: "contains", nextStepOrder: 2 }];
    expect(matchFlowBranch(branches, "hello", {})).toBeUndefined();
  });

  it("supports exact matchType", () => {
    const branches: FlowBranch[] = [{ keyword: "yes", matchType: "exact", nextStepOrder: 4 }];
    expect(matchFlowBranch(branches, "yes indeed", {})).toBeUndefined();
    expect(matchFlowBranch(branches, "yes", {})?.nextStepOrder).toBe(4);
  });

  it("treats a missing variable as an empty string, not a crash", () => {
    const branches: FlowBranch[] = [{ keyword: "premium", matchType: "contains", nextStepOrder: 5, sourceVariable: "budget" }];
    expect(matchFlowBranch(branches, "premium", {})).toBeUndefined();
  });
});

describe("parseBranches", () => {
  it("parses a plain keyword branch", () => {
    expect(parseBranches("pricing => 2")).toEqual([{ keyword: "pricing", matchType: "contains", nextStepOrder: 2 }]);
  });

  it("parses a variable-sourced branch", () => {
    expect(parseBranches("budget:premium => 5")).toEqual([
      { sourceVariable: "budget", keyword: "premium", matchType: "contains", nextStepOrder: 5 },
    ]);
  });

  it("lowercases both the variable name and the keyword, so capture and branch always agree regardless of how the user typed them", () => {
    expect(parseBranches("Budget:Premium => 5")).toEqual([
      { sourceVariable: "budget", keyword: "premium", matchType: "contains", nextStepOrder: 5 },
    ]);
  });

  it("skips malformed lines", () => {
    expect(parseBranches("no arrow here\npricing => not-a-number\n\nsupport => 3")).toEqual([
      { keyword: "support", matchType: "contains", nextStepOrder: 3 },
    ]);
  });
});
