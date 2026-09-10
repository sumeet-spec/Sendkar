import crypto from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { phoneToAuthEmail } from "@/lib/auth";
import { sendTemplateMessage } from "@/lib/whatsapp";

/**
 * No real email exists for any account — login identity is a WhatsApp
 * number, and the stored email is synthetic, never delivered (see
 * phoneToAuthEmail). So recovery has to ride the one channel that's real:
 * a code sent over WhatsApp itself, via a Meta-approved Authentication
 * template, sent from Sendkar's own connected number rather than each
 * customer's — see SENDER_WORKSPACE_ID below.
 */

const CODE_TTL_MINUTES = 10;
const MAX_ATTEMPTS = 5;
const OTP_TEMPLATE_NAME = "sendkar_password_reset_otp";

// The only workspace with a real, live WhatsApp connection as of writing —
// deliberately a config value, not a hardcoded assumption baked into logic,
// so swapping to a dedicated system number later is a one-line change.
const SENDER_WORKSPACE_ID = process.env.SYSTEM_SENDER_WORKSPACE_ID;

function hashCode(code: string): string {
  return crypto.createHash("sha256").update(code).digest("hex");
}

/** Supabase admin has no getUserByEmail — generateLink both confirms the user exists and returns their id, without the link itself ever being used. */
async function resolveUserIdByPhone(admin: ReturnType<typeof createAdminClient>, phone: string): Promise<string | null> {
  const { data, error } = await admin.auth.admin.generateLink({
    type: "recovery",
    email: phoneToAuthEmail(phone),
  });
  if (error || !data.user) return null;
  return data.user.id;
}

export async function requestPasswordReset(phone: string): Promise<{ success?: boolean; error?: string }> {
  if (!SENDER_WORKSPACE_ID) {
    return { error: "Password reset isn't available on this deployment yet — contact support." };
  }

  const admin = createAdminClient();
  const userId = await resolveUserIdByPhone(admin, phone);
  // Same message whether or not the account exists — don't confirm/deny a WhatsApp number has a Sendkar account.
  if (!userId) return { success: true };

  const { data: sender } = await admin
    .from("workspaces")
    .select("whatsapp_phone_number_id, whatsapp_access_token")
    .eq("id", SENDER_WORKSPACE_ID)
    .single();
  if (!sender?.whatsapp_phone_number_id || !sender.whatsapp_access_token) {
    return { error: "Password reset isn't available right now — contact support." };
  }

  const code = String(crypto.randomInt(100000, 1000000));
  const { error: insertError } = await admin.from("password_reset_codes").insert({
    user_id: userId,
    code_hash: hashCode(code),
    expires_at: new Date(Date.now() + CODE_TTL_MINUTES * 60_000).toISOString(),
  });
  if (insertError) return { error: "Couldn't start password reset — try again." };

  try {
    await sendTemplateMessage({
      workspace: sender,
      to: phone,
      templateName: OTP_TEMPLATE_NAME,
      language: "en",
      bodyParams: [code],
      otpCode: code,
    });
  } catch {
    return { error: "Couldn't send the code over WhatsApp — try again in a moment." };
  }

  return { success: true };
}

export async function verifyPasswordResetCode(phone: string, code: string, newPassword: string): Promise<{ success?: boolean; error?: string }> {
  if (newPassword.length < 6) return { error: "Password must be at least 6 characters." };

  const admin = createAdminClient();
  const userId = await resolveUserIdByPhone(admin, phone);
  if (!userId) return { error: "Invalid or expired code." };

  const { data: row } = await admin
    .from("password_reset_codes")
    .select("id, code_hash, expires_at, attempts")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!row || new Date(row.expires_at) < new Date()) return { error: "Invalid or expired code." };
  if (row.attempts >= MAX_ATTEMPTS) return { error: "Too many attempts — request a new code." };

  if (hashCode(code) !== row.code_hash) {
    await admin.from("password_reset_codes").update({ attempts: row.attempts + 1 }).eq("id", row.id);
    return { error: "Incorrect code." };
  }

  const { error: updateError } = await admin.auth.admin.updateUserById(userId, { password: newPassword });
  if (updateError) return { error: "Couldn't update the password — try again." };

  await admin.from("password_reset_codes").delete().eq("id", row.id);
  return { success: true };
}
