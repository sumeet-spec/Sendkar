import crypto from "node:crypto";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Module-load-time env capture (SENDER_WORKSPACE_ID reads process.env once,
// at import) means this must be set before the module is first imported —
// see passwordReset.unconfigured.test.ts for the case where it's absent.
process.env.SYSTEM_SENDER_WORKSPACE_ID = "sender-ws-1";

const generateLinkMock = vi.fn();
const updateUserByIdMock = vi.fn();
const workspacesSingleMock = vi.fn();
const codesInsertMock = vi.fn();
const codesMaybeSingleMock = vi.fn();
const codesUpdateEqMock = vi.fn();
const codesDeleteEqMock = vi.fn();
const sendTemplateMessageMock = vi.fn();

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    auth: { admin: { generateLink: generateLinkMock, updateUserById: updateUserByIdMock } },
    from: (table: string) => {
      if (table === "workspaces") {
        return { select: () => ({ eq: () => ({ single: workspacesSingleMock }) }) };
      }
      if (table === "password_reset_codes") {
        return {
          insert: codesInsertMock,
          select: () => ({ eq: () => ({ order: () => ({ limit: () => ({ maybeSingle: codesMaybeSingleMock }) }) }) }),
          update: (fields: Record<string, unknown>) => ({ eq: (col: string, val: unknown) => codesUpdateEqMock(fields, col, val) }),
          delete: () => ({ eq: (col: string, val: unknown) => codesDeleteEqMock(col, val) }),
        };
      }
      throw new Error(`passwordReset.test.ts: no mock wired for table "${table}"`);
    },
  }),
}));

vi.mock("@/lib/whatsapp", () => ({
  sendTemplateMessage: sendTemplateMessageMock,
}));

const { requestPasswordReset, verifyPasswordResetCode } = await import("./passwordReset");

const CONFIGURED_SENDER = { whatsapp_phone_number_id: "phone-1", whatsapp_access_token: "token-1" };

beforeEach(() => {
  generateLinkMock.mockReset();
  updateUserByIdMock.mockReset().mockResolvedValue({ error: null });
  workspacesSingleMock.mockReset().mockResolvedValue({ data: CONFIGURED_SENDER });
  codesInsertMock.mockReset().mockResolvedValue({ error: null });
  codesMaybeSingleMock.mockReset();
  codesUpdateEqMock.mockReset().mockResolvedValue({ data: null, error: null });
  codesDeleteEqMock.mockReset().mockResolvedValue({ data: null, error: null });
  sendTemplateMessageMock.mockReset().mockResolvedValue({ metaMessageId: "wamid.1" });
});

describe("requestPasswordReset", () => {
  it("returns the same success response for a phone with no account — never confirms or denies an account exists", async () => {
    generateLinkMock.mockResolvedValueOnce({ data: { user: null }, error: { message: "not found" } });
    const result = await requestPasswordReset("919999999999");
    expect(result).toEqual({ success: true });
    expect(codesInsertMock).not.toHaveBeenCalled();
    expect(sendTemplateMessageMock).not.toHaveBeenCalled();
  });

  it("errors clearly when the system sender workspace has no live WhatsApp connection", async () => {
    generateLinkMock.mockResolvedValueOnce({ data: { user: { id: "user-1" } }, error: null });
    workspacesSingleMock.mockResolvedValueOnce({ data: { whatsapp_phone_number_id: null, whatsapp_access_token: null } });
    const result = await requestPasswordReset("919999999999");
    expect(result.error).toMatch(/isn't available/i);
    expect(sendTemplateMessageMock).not.toHaveBeenCalled();
  });

  it("surfaces a generic error when the code can't be persisted, without sending anything", async () => {
    generateLinkMock.mockResolvedValueOnce({ data: { user: { id: "user-1" } }, error: null });
    codesInsertMock.mockResolvedValueOnce({ error: { message: "db down" } });
    const result = await requestPasswordReset("919999999999");
    expect(result.error).toBeTruthy();
    expect(sendTemplateMessageMock).not.toHaveBeenCalled();
  });

  it("reports a send failure distinctly, after the code was already persisted", async () => {
    generateLinkMock.mockResolvedValueOnce({ data: { user: { id: "user-1" } }, error: null });
    sendTemplateMessageMock.mockRejectedValueOnce(new Error("Meta rejected the template"));
    const result = await requestPasswordReset("919999999999");
    expect(result.error).toMatch(/couldn't send the code/i);
  });

  it("hashes the exact code it sends over WhatsApp — the stored hash must match what the user is asked to type back", async () => {
    generateLinkMock.mockResolvedValueOnce({ data: { user: { id: "user-1" } }, error: null });
    await requestPasswordReset("919999999999");

    expect(codesInsertMock).toHaveBeenCalledTimes(1);
    const insertedRow = codesInsertMock.mock.calls[0][0] as { code_hash: string; user_id: string };
    expect(insertedRow.user_id).toBe("user-1");

    expect(sendTemplateMessageMock).toHaveBeenCalledTimes(1);
    const sendArgs = sendTemplateMessageMock.mock.calls[0][0] as { otpCode: string; bodyParams: string[] };
    expect(sendArgs.otpCode).toMatch(/^\d{6}$/);
    expect(sendArgs.bodyParams).toEqual([sendArgs.otpCode]);
    expect(insertedRow.code_hash).toBe(crypto.createHash("sha256").update(sendArgs.otpCode).digest("hex"));
  });
});

describe("verifyPasswordResetCode", () => {
  it("rejects a too-short new password before touching the database", async () => {
    const result = await verifyPasswordResetCode("919999999999", "123456", "short");
    expect(result.error).toMatch(/at least 6 characters/i);
    expect(generateLinkMock).not.toHaveBeenCalled();
  });

  it("gives the same 'invalid or expired' error for a phone with no account as for a wrong code — doesn't leak which", async () => {
    generateLinkMock.mockResolvedValueOnce({ data: { user: null }, error: { message: "not found" } });
    const result = await verifyPasswordResetCode("919999999999", "123456", "newpassword1");
    expect(result.error).toMatch(/invalid or expired/i);
  });

  it("rejects when no reset code row exists for this user", async () => {
    generateLinkMock.mockResolvedValueOnce({ data: { user: { id: "user-1" } }, error: null });
    codesMaybeSingleMock.mockResolvedValueOnce({ data: null });
    const result = await verifyPasswordResetCode("919999999999", "123456", "newpassword1");
    expect(result.error).toMatch(/invalid or expired/i);
  });

  it("rejects an expired code", async () => {
    generateLinkMock.mockResolvedValueOnce({ data: { user: { id: "user-1" } }, error: null });
    codesMaybeSingleMock.mockResolvedValueOnce({
      data: { id: "code-1", code_hash: crypto.createHash("sha256").update("123456").digest("hex"), expires_at: new Date(Date.now() - 60_000).toISOString(), attempts: 0 },
    });
    const result = await verifyPasswordResetCode("919999999999", "123456", "newpassword1");
    expect(result.error).toMatch(/invalid or expired/i);
  });

  it("locks out after the max attempt count, even with the correct code", async () => {
    generateLinkMock.mockResolvedValueOnce({ data: { user: { id: "user-1" } }, error: null });
    codesMaybeSingleMock.mockResolvedValueOnce({
      data: { id: "code-1", code_hash: crypto.createHash("sha256").update("123456").digest("hex"), expires_at: new Date(Date.now() + 60_000).toISOString(), attempts: 5 },
    });
    const result = await verifyPasswordResetCode("919999999999", "123456", "newpassword1");
    expect(result.error).toMatch(/too many attempts/i);
    expect(updateUserByIdMock).not.toHaveBeenCalled();
  });

  it("increments the attempt count on a wrong code instead of updating the password", async () => {
    generateLinkMock.mockResolvedValueOnce({ data: { user: { id: "user-1" } }, error: null });
    codesMaybeSingleMock.mockResolvedValueOnce({
      data: { id: "code-1", code_hash: crypto.createHash("sha256").update("123456").digest("hex"), expires_at: new Date(Date.now() + 60_000).toISOString(), attempts: 2 },
    });
    const result = await verifyPasswordResetCode("919999999999", "000000", "newpassword1");
    expect(result.error).toMatch(/incorrect code/i);
    expect(codesUpdateEqMock).toHaveBeenCalledWith({ attempts: 3 }, "id", "code-1");
    expect(updateUserByIdMock).not.toHaveBeenCalled();
  });

  it("updates the password and deletes the used code on a correct match", async () => {
    generateLinkMock.mockResolvedValueOnce({ data: { user: { id: "user-1" } }, error: null });
    codesMaybeSingleMock.mockResolvedValueOnce({
      data: { id: "code-1", code_hash: crypto.createHash("sha256").update("123456").digest("hex"), expires_at: new Date(Date.now() + 60_000).toISOString(), attempts: 0 },
    });
    const result = await verifyPasswordResetCode("919999999999", "123456", "newpassword1");
    expect(result).toEqual({ success: true });
    expect(updateUserByIdMock).toHaveBeenCalledWith("user-1", { password: "newpassword1" });
    expect(codesDeleteEqMock).toHaveBeenCalledWith("id", "code-1");
  });

  it("doesn't delete the code or report success if the password update itself fails", async () => {
    generateLinkMock.mockResolvedValueOnce({ data: { user: { id: "user-1" } }, error: null });
    codesMaybeSingleMock.mockResolvedValueOnce({
      data: { id: "code-1", code_hash: crypto.createHash("sha256").update("123456").digest("hex"), expires_at: new Date(Date.now() + 60_000).toISOString(), attempts: 0 },
    });
    updateUserByIdMock.mockResolvedValueOnce({ error: { message: "boom" } });
    const result = await verifyPasswordResetCode("919999999999", "123456", "newpassword1");
    expect(result.error).toMatch(/couldn't update the password/i);
    expect(codesDeleteEqMock).not.toHaveBeenCalled();
  });
});
