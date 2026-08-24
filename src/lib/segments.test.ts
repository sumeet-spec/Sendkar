import { describe, it, expect } from "vitest";
import { describeSegmentConditions, applySegmentConditions, type SegmentCondition } from "./segments";

describe("describeSegmentConditions", () => {
  it("describes an empty condition list as everyone", () => {
    expect(describeSegmentConditions([])).toBe("Everyone");
  });

  it("joins multiple conditions readably", () => {
    const conditions: SegmentCondition[] = [{ field: "tag", value: "vip" }, { field: "language", value: "hi" }];
    expect(describeSegmentConditions(conditions)).toBe("Tag: vip, Language: hi");
  });
});

function fakeQuery() {
  const calls: Array<{ method: string; args: unknown[] }> = [];
  const builder = {
    calls,
    contains(col: string, val: unknown) {
      calls.push({ method: "contains", args: [col, val] });
      return builder;
    },
    eq(col: string, val: unknown) {
      calls.push({ method: "eq", args: [col, val] });
      return builder;
    },
  };
  return builder;
}

describe("applySegmentConditions", () => {
  it("applies a tag condition via contains", () => {
    const q = fakeQuery();
    applySegmentConditions(q, [{ field: "tag", value: "vip" }]);
    expect(q.calls).toEqual([{ method: "contains", args: ["tags", ["vip"]] }]);
  });

  it("applies multiple AND-combined conditions in order", () => {
    const q = fakeQuery();
    applySegmentConditions(q, [
      { field: "language", value: "hi" },
      { field: "sentiment", value: "urgent" },
    ]);
    expect(q.calls).toEqual([
      { method: "eq", args: ["language", "hi"] },
      { method: "eq", args: ["last_sentiment", "urgent"] },
    ]);
  });

  it("skips conditions with an empty value", () => {
    const q = fakeQuery();
    applySegmentConditions(q, [{ field: "tag", value: "" }]);
    expect(q.calls).toEqual([]);
  });
});
