import crypto from "node:crypto";
import { describe, it, expect, vi, beforeEach } from "vitest";

// resolveApiKey is the entire auth model for the MCP server and
// /api/v1/send — mocking the admin client's exact call shape (select+eq+
// maybeSingle for the lookup, update+eq for the last-used bump) is the only
// way to exercise the found/not-found/revoked branches without a live DB.
const maybeSingleMock = vi.fn();
const updateEqMock = vi.fn();

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: (table: string) => ({
      select: () => ({ eq: () => ({ maybeSingle: maybeSingleMock }) }),
      update: (fields: Record<string, unknown>) => ({ eq: (col: string, val: unknown) => updateEqMock(table, fields, col, val) }),
    }),
  }),
}));

import { generateApiKey, resolveApiKey } from "./apiKeys";

beforeEach(() => {
  maybeSingleMock.mockReset();
  updateEqMock.mockReset().mockResolvedValue({ data: null, error: null });
});

describe("generateApiKey", () => {
  it("produces a plaintext key with the sk_live_ prefix", () => {
    expect(generateApiKey().plaintext.startsWith("sk_live_")).toBe(true);
  });

  it("stores only a sha256 hash of the plaintext, never the plaintext itself", () => {
    const { plaintext, hash } = generateApiKey();
    expect(hash).toBe(crypto.createHash("sha256").update(plaintext).digest("hex"));
  });

  it("truncates the displayed prefix well short of the full secret", () => {
    const { plaintext, prefix } = generateApiKey();
    expect(plaintext.startsWith(prefix)).toBe(true);
    expect(prefix.length).toBeLessThan(plaintext.length - 10);
  });

  it("generates a different key on every call", () => {
    expect(generateApiKey().plaintext).not.toBe(generateApiKey().plaintext);
  });
});

describe("resolveApiKey", () => {
  it("rejects a null token without querying the database", async () => {
    expect(await resolveApiKey(null)).toBeNull();
    expect(maybeSingleMock).not.toHaveBeenCalled();
  });

  it("rejects a token with the wrong prefix without querying the database", async () => {
    expect(await resolveApiKey("sk_test_notarealprefix")).toBeNull();
    expect(maybeSingleMock).not.toHaveBeenCalled();
  });

  it("rejects a well-formed token whose hash matches no stored key", async () => {
    maybeSingleMock.mockResolvedValueOnce({ data: null });
    expect(await resolveApiKey("sk_live_doesnotexist")).toBeNull();
  });

  it("rejects a revoked key even though its hash matches", async () => {
    maybeSingleMock.mockResolvedValueOnce({ data: { id: "key-1", workspace_id: "ws-1", revoked_at: "2026-01-01T00:00:00Z" } });
    expect(await resolveApiKey("sk_live_validkey")).toBeNull();
  });

  it("resolves a valid, non-revoked key to its workspace", async () => {
    maybeSingleMock.mockResolvedValueOnce({ data: { id: "key-1", workspace_id: "ws-1", revoked_at: null } });
    expect(await resolveApiKey("sk_live_validkey")).toEqual({ workspaceId: "ws-1", apiKeyId: "key-1" });
  });

  it("bumps last_used_at for the resolved key", async () => {
    maybeSingleMock.mockResolvedValueOnce({ data: { id: "key-1", workspace_id: "ws-1", revoked_at: null } });
    await resolveApiKey("sk_live_validkey");
    expect(updateEqMock).toHaveBeenCalledWith(
      "api_keys",
      expect.objectContaining({ last_used_at: expect.any(String) }),
      "id",
      "key-1",
    );
  });
});
