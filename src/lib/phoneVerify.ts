import crypto from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendTemplateMessage } from "@/lib/whatsapp";
import { isRateLimited } from "@/lib/rateLimit";
import { trialStartFields } from "@/lib/plans";

/**
 * Proves a new account's owner holds the WhatsApp number they signed up with, by sending a 6-digit code over
 * WhatsApp from Sendkar's own system number (the same sender and Meta "authentication" template that password
 * reset uses). Nothing is switched on until SIGNUP_OTP_REQUIRED=true and SYSTEM_SENDER_WORKSPACE_ID is set, so
 * this can ship before the number exists.
 *
 * An account that has not verified yet has no trial and cannot send. The trial starts the moment the code is
 * entered, so a fake or borrowed number gets nothing.
 */

const CODE_TTL_MINUTES = 10;
const MAX_ATTEMPTS = 5;
const OTP_TEMPLATE_NAME = process.env.OTP_TEMPLATE_NAME ?? "sendkar_password_reset_otp";

export function otpRequired(): boolean {
  return process.env.SIGNUP_OTP_REQUIRED === "true" && Boolean(process.env.SYSTEM_SENDER_WORKSPACE_ID);
}

/** Accounts made before the check existed carry no flag and count as verified; only a new account is marked false. */
export function isPhoneVerified(user: { app_metadata?: Record<string, unknown> | null } | null | undefined): boolean {
  return user?.app_metadata?.phone_verified !== false;
}

export type VerifyError = "notAvailable" | "wait" | "tooMany" | "sendFailed" | "wrong" | "expired" | "tooManyAttempts";
export type VerifyResult = { ok: true } | { ok: false; error: VerifyError };

const hashCode = (code: string) => crypto.createHash("sha256").update(code).digest("hex");

export async function sendVerificationCode(userId: string, phone: string): Promise<VerifyResult> {
  const senderId = process.env.SYSTEM_SENDER_WORKSPACE_ID;
  if (!otpRequired() || !senderId) return { ok: false, error: "notAvailable" };

  // Each code costs a little, so asking for them is limited: one a minute, five an hour, per account.
  if (await isRateLimited(`otp-cool:${userId}`, 1, 45)) return { ok: false, error: "wait" };
  if (await isRateLimited(`otp-hour:${userId}`, 5, 3600)) return { ok: false, error: "tooMany" };

  const admin = createAdminClient();
  const { data: sender } = await admin.from("workspaces").select("whatsapp_phone_number_id, whatsapp_access_token").eq("id", senderId).single();
  if (!sender?.whatsapp_phone_number_id || !sender.whatsapp_access_token) return { ok: false, error: "notAvailable" };

  const code = String(crypto.randomInt(100000, 1000000));
  const { error: insertError } = await admin.from("phone_verification_codes").insert({
    user_id: userId,
    code_hash: hashCode(code),
    expires_at: new Date(Date.now() + CODE_TTL_MINUTES * 60_000).toISOString(),
  });
  if (insertError) return { ok: false, error: "sendFailed" };

  try {
    await sendTemplateMessage({ workspace: sender, to: phone, templateName: OTP_TEMPLATE_NAME, language: "en", bodyParams: [code], otpCode: code });
  } catch {
    return { ok: false, error: "sendFailed" };
  }
  return { ok: true };
}

export async function checkVerificationCode(userId: string, code: string): Promise<VerifyResult> {
  const admin = createAdminClient();
  const { data: row } = await admin
    .from("phone_verification_codes")
    .select("id, code_hash, expires_at, attempts")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!row || new Date(row.expires_at) < new Date()) return { ok: false, error: "expired" };
  if (row.attempts >= MAX_ATTEMPTS) return { ok: false, error: "tooManyAttempts" };
  if (hashCode(code.trim()) !== row.code_hash) {
    await admin.from("phone_verification_codes").update({ attempts: row.attempts + 1 }).eq("id", row.id);
    return { ok: false, error: "wrong" };
  }

  const { error } = await admin.auth.admin.updateUserById(userId, { app_metadata: { phone_verified: true } });
  if (error) return { ok: false, error: "sendFailed" };

  // The trial begins now, on the workspaces this person owns that have not had one.
  await admin.from("workspaces").update(trialStartFields()).eq("owner_id", userId).eq("plan", "free").is("trial_ends_at", null);
  await admin.from("phone_verification_codes").delete().eq("user_id", userId);
  return { ok: true };
}
