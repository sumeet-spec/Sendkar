import { describe, it, expect, vi } from "vitest";

// Deliberately a separate file: SENDER_WORKSPACE_ID is captured from
// process.env once, at module import — this only observes the case where
// SYSTEM_SENDER_WORKSPACE_ID was never set (a fresh/misconfigured
// deployment). See passwordReset.test.ts for the configured case.
delete process.env.SYSTEM_SENDER_WORKSPACE_ID;

const createAdminClientMock = vi.fn(() => {
  throw new Error("should not touch the database before the sender-workspace check");
});

vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: createAdminClientMock }));
vi.mock("@/lib/whatsapp", () => ({ sendTemplateMessage: vi.fn() }));

const { requestPasswordReset } = await import("./passwordReset");

describe("requestPasswordReset without SYSTEM_SENDER_WORKSPACE_ID configured", () => {
  it("fails fast with a clear message instead of touching the database", async () => {
    const result = await requestPasswordReset("919999999999");
    expect(result.error).toMatch(/isn't available/i);
    expect(createAdminClientMock).not.toHaveBeenCalled();
  });
});
