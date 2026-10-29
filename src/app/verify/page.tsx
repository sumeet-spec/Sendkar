import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentLanguage } from "@/lib/i18n/getLanguage";
import { VERIFY_COPY } from "@/lib/i18n/verifyCopy";
import { isPhoneVerified, otpRequired } from "@/lib/phoneVerify";
import { VerifyForm } from "./VerifyForm";

export const metadata = { robots: { index: false, follow: false } };

export default async function VerifyPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  // Nothing to verify when the check is switched off, or this account is already verified.
  if (!otpRequired() || isPhoneVerified(user)) redirect("/dashboard");

  const phone = String(user.user_metadata?.whatsapp_number ?? "");
  const shown = phone.length >= 10 ? `+${phone.slice(0, 2)} ${"•".repeat(Math.max(phone.length - 6, 0))}${phone.slice(-4)}` : phone;
  return <VerifyForm t={VERIFY_COPY[await getCurrentLanguage()]} phone={shown} />;
}
