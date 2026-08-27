"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizePhone, phoneToAuthEmail } from "@/lib/auth";
import { isRateLimited, getClientIp } from "@/lib/rateLimit";
import { redirect } from "next/navigation";

export async function signup(_prevState: unknown, formData: FormData) {
  const phone = normalizePhone(String(formData.get("phone") ?? ""));
  const password = String(formData.get("password") ?? "");
  const workspaceName = String(formData.get("workspaceName") ?? "").trim();

  if (phone.length < 10) return { error: "Enter a valid WhatsApp number with country code." };
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

  // Created via the admin API with email_confirm: true, not the session-bound
  // signUp() — that sidesteps this project's email-confirmation setting
  // entirely, which matters a lot here since the "email" is synthetic and
  // never delivered: nobody could ever click a confirmation link sent to it.
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { whatsapp_number: phone },
  });
  if (createError) {
    return { error: createError.message.includes("already been registered") ? "That WhatsApp number already has an account — log in instead." : createError.message };
  }
  const user = created.user;

  // Deliberately the admin client here too, same reasoning as before: no RLS
  // policy lets a user insert their own workspace_members row (only the
  // on-workspace-created trigger can, via SECURITY DEFINER) — safe because
  // owner_id is set to the id createUser() just returned, never client input.
  const { error: wsError } = await admin.from("workspaces").insert({ name: workspaceName, owner_id: user.id });
  if (wsError) return { error: `Account created, but workspace setup failed: ${wsError.message}` };

  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
  if (signInError) return { error: "Account created — log in with your WhatsApp number to continue." };

  redirect("/onboarding");
}
