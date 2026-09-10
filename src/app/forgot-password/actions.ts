"use server";

import { normalizePhone } from "@/lib/auth";
import { requestPasswordReset, verifyPasswordResetCode } from "@/lib/passwordReset";
import { isRateLimited, getClientIp } from "@/lib/rateLimit";

export async function requestReset(_prevState: unknown, formData: FormData) {
  const phone = normalizePhone("91" + String(formData.get("phone") ?? ""));
  if (phone.length !== 12) return { error: "Enter a valid 10-digit WhatsApp number." };

  const ip = await getClientIp();
  if (await isRateLimited(`reset-request:${ip}`, 5, 3600) || await isRateLimited(`reset-request:${phone}`, 3, 3600)) {
    return { error: "Too many reset attempts. Try again in a bit." };
  }

  const result = await requestPasswordReset(phone);
  if (result.error) return { error: result.error };
  return { success: true, phone };
}

export async function confirmReset(_prevState: unknown, formData: FormData) {
  const phone = String(formData.get("phone") ?? "");
  const code = String(formData.get("code") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!code || !password) return { error: "Enter the code and a new password." };

  const ip = await getClientIp();
  if (await isRateLimited(`reset-confirm:${ip}`, 10, 3600)) {
    return { error: "Too many attempts. Try again in a bit." };
  }

  const result = await verifyPasswordResetCode(phone, code, password);
  if (result.error) return { error: result.error };
  return { success: true };
}
