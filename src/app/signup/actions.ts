"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizePhone, phoneToAuthEmail } from "@/lib/auth";
import { isRateLimited, getClientIp } from "@/lib/rateLimit";
import { redirect } from "next/navigation";
import { trialStartFields } from "@/lib/plans";
import { otpRequired } from "@/lib/phoneVerify";
import { resolveUserIdByPhone } from "@/lib/passwordReset";

export async function signup(_prevState: unknown, formData: FormData) {
  // The form only collects the 10-digit local number — India-only product,
  // so +91 is fixed in the UI rather than something every signup has to type.
  const phone = normalizePhone("91" + String(formData.get("phone") ?? ""));
  const password = String(formData.get("password") ?? "");
  const workspaceName = String(formData.get("workspaceName") ?? "").trim();

  if (phone.length !== 12) return { error: "Enter a valid 10-digit WhatsApp number." };
  if (!password || !workspaceName) return { error: "All fields are required." };

  // createUser() below goes through the admin API, which bypasses Supabase
  // Auth's own built-in throttling on the public signup endpoint — this is
  // the one thing standing between this form and a script creating unlimited
  // accounts.
  const ip = await getClientIp();
  if (await isRateLimited(`signup:${ip}`, 5, 3600)) {
    return { error: "Too many signup attempts from this network. Try again in a bit." };
  }

  const email = phoneToAuthEmail(phone);
  const admin = createAdminClient();
  // When number verification is on, the account starts unverified with no trial; the trial begins when the code is entered.
  const needOtp = otpRequired();

  // Created via the admin API with email_confirm: true, not the session-bound
  // signUp() — that sidesteps this project's email-confirmation setting
  // entirely, which matters a lot here since the "email" is synthetic and
  // never delivered: nobody could ever click a confirmation link sent to it.
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { whatsapp_number: phone },
    ...(needOtp ? { app_metadata: { phone_verified: false } } : {}),
  });

  let user = created?.user ?? null;
  let takenOver = false;
  if (createError) {
    const alreadyThere = createError.message.includes("already been registered");
    // A number that was signed up but never verified belongs to nobody yet. Whoever now proves they hold it with
    // the code takes it over, so one person typing someone else's number cannot lock the real owner out.
    if (alreadyThere && needOtp) {
      const existingId = await resolveUserIdByPhone(admin, phone);
      const { data: existing } = existingId ? await admin.auth.admin.getUserById(existingId) : { data: null };
      if (existing?.user && existing.user.app_metadata?.phone_verified === false) {
        const { error: pwError } = await admin.auth.admin.updateUserById(existing.user.id, { password });
        if (!pwError) {
          await admin.from("workspaces").update({ name: workspaceName }).eq("owner_id", existing.user.id).eq("plan", "free").is("trial_ends_at", null);
          user = existing.user;
          takenOver = true;
        }
      }
    }
    if (!user) {
      return { error: alreadyThere ? "That WhatsApp number already has an account — log in instead." : createError.message };
    }
  }
  if (!user) return { error: "Could not create the account. Please try again." };

  // Deliberately the admin client here too, same reasoning as before: no RLS
  // policy lets a user insert their own workspace_members row (only the
  // on-workspace-created trigger can, via SECURITY DEFINER) — safe because
  // owner_id is set to the id createUser() just returned, never client input.
  const { error: wsError } = takenOver ? { error: null } : await admin.from("workspaces").insert({ name: workspaceName, owner_id: user.id, ...(needOtp ? {} : trialStartFields()) });
  if (wsError) return { error: `Account created, but workspace setup failed: ${wsError.message}` };

  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
  if (signInError) return { error: "Account created — log in with your WhatsApp number to continue." };

  redirect(needOtp ? "/verify" : "/onboarding");
}
