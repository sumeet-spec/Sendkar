"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";

export async function signup(_prevState: unknown, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const workspaceName = String(formData.get("workspaceName") ?? "").trim();

  if (!email || !password || !workspaceName) {
    return { error: "All fields are required." };
  }

  const supabase = await createClient();

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password });
  if (signUpError) return { error: signUpError.message };
  const user = signUpData.user;
  if (!user) return { error: "Sign-up failed unexpectedly — no user returned." };

  // Deliberately the admin (service-role) client here, not the session-bound
  // one above: if this Supabase project requires email confirmation, signUp()
  // returns a user with NO active session yet, so the RLS policy on
  // workspaces (which checks auth.uid() = owner_id) would see an anonymous
  // caller and reject the insert. The admin client bypasses that — safe here
  // specifically because owner_id is set to the id signUp() just returned,
  // never to anything the client submitted.
  const admin = createAdminClient();
  const { error: wsError } = await admin
    .from("workspaces")
    .insert({ name: workspaceName, owner_id: user.id });
  if (wsError) return { error: `Account created, but workspace setup failed: ${wsError.message}` };

  if (!signUpData.session) {
    return { error: "Account created — check your inbox to confirm your email, then log in.", success: true };
  }

  redirect("/onboarding");
}
