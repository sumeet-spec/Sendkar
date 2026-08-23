"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";

export async function acceptInvite(token: string) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { error: "Log in first, then reopen this link." };

  // Admin client deliberately here, same reasoning as the signup flow:
  // there's no RLS policy letting a user INSERT their own workspace_members
  // row (only the on-workspace-created trigger can, via SECURITY DEFINER) —
  // and that's correct, membership shouldn't be self-grantable in general.
  // This path is safe specifically because we've already verified a real,
  // unused invite token exists for this exact workspace before writing.
  const admin = createAdminClient();

  const { data: invite } = await admin
    .from("workspace_invites")
    .select("id, workspace_id, role, email, accepted_at")
    .eq("token", token)
    .maybeSingle();

  if (!invite) return { error: "This invite link is invalid." };
  if (invite.accepted_at) return { error: "This invite has already been used." };

  const { error: memberError } = await admin
    .from("workspace_members")
    .insert({ workspace_id: invite.workspace_id, user_id: userData.user.id, role: invite.role });
  if (memberError) return { error: memberError.message };

  await admin.from("workspace_invites").update({ accepted_at: new Date().toISOString() }).eq("id", invite.id);

  redirect("/dashboard");
}
