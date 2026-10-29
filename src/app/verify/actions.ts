"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { checkVerificationCode, otpRequired, sendVerificationCode, type VerifyError } from "@/lib/phoneVerify";

/** The signed-in person's own number, taken from their session, never from what the browser sends. */
async function currentUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const phone = typeof user?.user_metadata?.whatsapp_number === "string" ? (user.user_metadata.whatsapp_number as string) : null;
  return user && phone ? { id: user.id, phone } : null;
}

export async function requestCode(): Promise<{ ok: boolean; error?: VerifyError }> {
  const me = await currentUser();
  if (!me || !otpRequired()) return { ok: false, error: "notAvailable" };
  const res = await sendVerificationCode(me.id, me.phone);
  return res.ok ? { ok: true } : { ok: false, error: res.error };
}

export async function submitCode(_prev: unknown, formData: FormData): Promise<{ error?: VerifyError }> {
  const me = await currentUser();
  if (!me) return { error: "notAvailable" };
  const code = String(formData.get("code") ?? "").replace(/\D/g, "");
  if (code.length !== 6) return { error: "wrong" };
  const res = await checkVerificationCode(me.id, code);
  if (!res.ok) return { error: res.error };
  redirect("/onboarding");
}
