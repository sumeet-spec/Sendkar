"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { INVITE_EXPIRY_DAYS } from "./constants";

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
    .select("id, workspace_id, role, email, accepted_at, created_at")
    .eq("token", token)
    .maybeSingle();

  if (!invite) return { error: "This invite link is invalid." };
  if (invite.accepted_at) return { error: "This invite has already been used." };
  if (Date.now() - new Date(invite.created_at).getTime() > INVITE_EXPIRY_DAYS * 24 * 60 * 60 * 1000) {
    return { error: "This invite link has expired — ask for a new one." };
  }
  // Without this, anyone who obtains the link — forwarded email, browser
  // history, a shared screenshot — could log in with ANY account and join
  // this workspace as a full member. The page only tells the user which
  // email to log in with; nothing enforced it before this check.
  if (userData.user.email?.toLowerCase() !== invite.email.toLowerCase()) {
    return { error: `This invite is for ${invite.email} — log in with that account, then reopen this link.` };
  }

  const { error: memberError } = await admin
    .from("workspace_members")
    .insert({ workspace_id: invite.workspace_id, user_id: userData.user.id, role: invite.role });
  if (memberError) return { error: memberError.message };

  await admin.from("workspace_invites").update({ accepted_at: new Date().toISOString() }).eq("id", invite.id);

  redirect("/dashboard");
}
