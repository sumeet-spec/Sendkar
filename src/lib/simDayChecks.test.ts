import { describe, it, expect } from "vitest";
import {
  mask, checkEnv, checkWorkspace, checkPhone, checkSubscribedApps, checkTemplates,
  checkWebhookHandshake, checkFlags, checkTables, formatReport,
} from "./simDayChecks";

describe("mask", () => {
  it("never reveals more than the last 4 characters", () => {
    expect(mask("abcdefghijkl")).toBe("…ijkl");
    expect(mask("short")).toBe("****");
    expect(mask(undefined)).toBe("(not set)");
  });
});

describe("checkEnv", () => {
  it("fails and names what is missing", () => {
    const [r] = checkEnv({ NEXT_PUBLIC_SUPABASE_URL: "x" });
    expect(r.status).toBe("fail");
    expect(r.title).toContain("META_APP_SECRET");
  });
  it("passes when everything is set", () => {
    const env = Object.fromEntries(["NEXT_PUBLIC_SUPABASE_URL","SUPABASE_SECRET_KEY","NEXT_PUBLIC_META_APP_ID","META_APP_SECRET","WHATSAPP_WEBHOOK_VERIFY_TOKEN","NEXT_PUBLIC_META_EMBEDDED_SIGNUP_CONFIG_ID","SYSTEM_SENDER_WORKSPACE_ID","CRON_SECRET"].map((k) => [k, "v"]));
    expect(checkEnv(env)[0].status).toBe("pass");
  });
});

describe("checkWorkspace", () => {
  it("fails when the workspace is missing", () => expect(checkWorkspace(null)[0].status).toBe("fail"));
  it("fails when no number is connected yet (the SIM-day blocker)", () => {
    const r = checkWorkspace({ plan: "scale", trial_ends_at: null });
    expect(r.find((x) => x.id === "workspace-connection")?.status).toBe("fail");
  });
  it("fails on a trial/free plan or a trial end date", () => {
    expect(checkWorkspace({ plan: "trial", whatsapp_phone_number_id: "1", whatsapp_access_token: "t", whatsapp_waba_id: "w" }).find((x) => x.id === "workspace-plan")?.status).toBe("fail");
    expect(checkWorkspace({ plan: "scale", trial_ends_at: "2026-12-01", whatsapp_phone_number_id: "1", whatsapp_access_token: "t", whatsapp_waba_id: "w" }).find((x) => x.id === "workspace-plan")?.status).toBe("fail");
  });
  it("passes a fully set-up system workspace", () => {
    const r = checkWorkspace({ plan: "scale", trial_ends_at: null, whatsapp_phone_number_id: "1", whatsapp_access_token: "t", whatsapp_waba_id: "w" });
    expect(r.every((x) => x.status === "pass")).toBe(true);
  });
});

describe("checkPhone", () => {
  it("explains an expired token (Graph error 190)", () => {
    const [r] = checkPhone({ ok: false, status: 401, body: { error: { code: 190, message: "expired" } } });
    expect(r.status).toBe("fail");
    expect(r.fix).toContain("no expiry");
  });
  it("passes GREEN, warns UNKNOWN, fails RED", () => {
    const base = { display_phone_number: "+91 90000 00000", verified_name: "Sendkar" };
    const q = (rating: string) => checkPhone({ ok: true, status: 200, body: { ...base, quality_rating: rating } }).find((x) => x.id === "quality")!.status;
    expect(q("GREEN")).toBe("pass");
    expect(q("UNKNOWN")).toBe("warn");
    expect(q("RED")).toBe("fail");
  });
  it("fails an unverified number", () => {
    const r = checkPhone({ ok: true, status: 200, body: { quality_rating: "GREEN", code_verification_status: "NOT_VERIFIED" } });
    expect(r.some((x) => x.id === "verification" && x.status === "fail")).toBe(true);
  });
});

describe("checkSubscribedApps", () => {
  const ok = (data: unknown[]) => ({ ok: true, status: 200, body: { data } });
  it("passes only when our app id is subscribed", () => {
    expect(checkSubscribedApps(ok([{ whatsapp_business_api_data: { id: "123" } }]), "123").status).toBe("pass");
    expect(checkSubscribedApps(ok([{ whatsapp_business_api_data: { id: "999" } }]), "123").status).toBe("fail");
    expect(checkSubscribedApps(ok([]), "123").status).toBe("fail");
  });
});

describe("checkTemplates", () => {
  it("fails when the system templates do not exist", () => {
    const r = checkTemplates([]);
    expect(r.filter((x) => x.status === "fail")).toHaveLength(2);
  });
  it("passes approved ones and surfaces a rejection reason", () => {
    const r = checkTemplates([
      { name: "sendkar_password_reset_otp", status: "APPROVED", category: "AUTHENTICATION" },
      { name: "sendkar_daily_summary", status: "REJECTED", category: "UTILITY", rejected_reason: "INVALID_FORMAT" },
    ]);
    expect(r.find((x) => x.id === "tpl-sendkar_password_reset_otp")?.status).toBe("pass");
    const bad = r.find((x) => x.id === "tpl-sendkar_daily_summary")!;
    expect(bad.status).toBe("fail");
    expect(bad.detail).toContain("INVALID_FORMAT");
  });
  it("warns while pending and on an unexpected category", () => {
    const r = checkTemplates([
      { name: "sendkar_password_reset_otp", status: "PENDING" },
      { name: "sendkar_daily_summary", status: "APPROVED", category: "MARKETING" },
    ]);
    expect(r.find((x) => x.id === "tpl-sendkar_password_reset_otp")?.status).toBe("warn");
    expect(r.find((x) => x.id === "tpl-sendkar_daily_summary")?.status).toBe("warn");
  });
  it("summarises bill/reminder templates and shows their rejections", () => {
    const r = checkTemplates([
      { name: "sendkar_password_reset_otp", status: "APPROVED", category: "AUTHENTICATION" },
      { name: "sendkar_daily_summary", status: "APPROVED", category: "UTILITY" },
      { name: "sk_bill_sent_hi", status: "APPROVED" },
      { name: "sk_bill_sent_gu", status: "REJECTED", rejected_reason: "TAG_CONTENT_MISMATCH" },
    ]);
    const sk = r.find((x) => x.id === "tpl-sk")!;
    expect(sk.status).toBe("warn");
    expect(sk.detail).toContain("sk_bill_sent_gu: TAG_CONTENT_MISMATCH");
  });
});

describe("checkWebhookHandshake", () => {
  it("passes when the challenge is echoed and a wrong token is rejected", () => {
    const r = checkWebhookHandshake({ status: 200, text: "abc" }, { status: 403 }, "abc");
    expect(r.every((x) => x.status === "pass")).toBe(true);
  });
  it("fails on a token mismatch or a webhook that accepts anything", () => {
    expect(checkWebhookHandshake({ status: 403, text: "" }, { status: 403 }, "abc")[0].status).toBe("fail");
    expect(checkWebhookHandshake({ status: 200, text: "abc" }, { status: 200 }, "abc")[1].status).toBe("fail");
  });
});

describe("checkFlags", () => {
  const notApproved = checkTemplates([]);
  it("fails when signup OTP is required but its template is not approved", () => {
    expect(checkFlags({ SIGNUP_OTP_REQUIRED: "true" }, notApproved)[0].status).toBe("fail");
  });
  it("passes when flags are off or templates are approved", () => {
    expect(checkFlags({}, notApproved)[0].status).toBe("pass");
    const approved = checkTemplates([
      { name: "sendkar_password_reset_otp", status: "APPROVED", category: "AUTHENTICATION" },
      { name: "sendkar_daily_summary", status: "APPROVED", category: "UTILITY" },
    ]);
    expect(checkFlags({ SIGNUP_OTP_REQUIRED: "true", DAILY_SUMMARY_WHATSAPP: "true" }, approved)[0].status).toBe("pass");
  });
});

describe("checkTables / formatReport", () => {
  it("lists missing tables", () => {
    expect(checkTables([{ table: "bills", ok: true }, { table: "ai_image_usage", ok: false }]).title).toContain("ai_image_usage");
  });
  it("counts failures, shows fixes only for failures, and sums up", () => {
    const { text, failed, warned } = formatReport([
      { id: "a", status: "pass", title: "fine" },
      { id: "b", status: "fail", title: "broken", fix: "do this" },
      { id: "c", status: "warn", title: "hmm", fix: "should not show" },
    ]);
    expect(failed).toBe(1);
    expect(warned).toBe(1);
    expect(text).toContain("-> do this");
    expect(text).not.toContain("should not show");
    expect(text).toContain("1 problem(s)");
  });
});
