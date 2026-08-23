"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ACTIVE_WORKSPACE_COOKIE } from "@/lib/workspace";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/** Switches which workspace is "active" for this browser session — agency mode's core primitive. */
export async function switchWorkspace(workspaceId: string) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return;

  // Only ever switch to a workspace this user actually belongs to.
  const { data: membership } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", userData.user.id)
    .eq("workspace_id", workspaceId)
    .maybeSingle();
  if (!membership) return;

  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_WORKSPACE_COOKIE, workspaceId, { httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 365, path: "/" });
  redirect("/dashboard");
}

/**
 * Creates a new workspace for the ALREADY-LOGGED-IN current user — the
 * agency move: one login adding a second (third, fourth...) client
 * account, instead of every client needing their own separate signup.
 * Same admin-client justification as the original signup flow: there's no
 * RLS policy letting a user insert their own workspace_members row, only
 * the on-workspace-created trigger can (SECURITY DEFINER) — safe here
 * because owner_id is set to the caller's own verified id, never client input.
 */
export async function createAdditionalWorkspace(_prevState: unknown, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Name is required." };

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { error: "Not logged in." };

  const admin = createAdminClient();
  const { data: workspace, error } = await admin
    .from("workspaces")
    .insert({ name, owner_id: userData.user.id })
    .select("id")
    .single();
  if (error) return { error: error.message };

  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_WORKSPACE_COOKIE, workspace.id, { httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 365, path: "/" });
  redirect("/onboarding");
}
