"use server";

import crypto from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace, getCurrentUserId } from "@/lib/workspace";
import { getPlanLimits } from "@/lib/plans";
import { sendEmail } from "@/lib/email";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export async function inviteTeamMember(_prevState: unknown, formData: FormData) {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "No workspace found." };

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) return { error: "Email is required." };

  const supabase = await createClient();
  const { count: memberCount } = await supabase
    .from("workspace_members")
    .select("*", { count: "exact", head: true })
    .eq("workspace_id", workspace.id);

  const limits = getPlanLimits(workspace.plan);
  if ((memberCount ?? 0) >= limits.maxTeamMembers) {
    return { error: `Your ${workspace.plan} plan is capped at ${limits.maxTeamMembers} team members — upgrade to invite more.` };
  }

  const userId = await getCurrentUserId();
  if (!userId) return { error: "Not logged in." };

  const token = crypto.randomBytes(24).toString("base64url");
  const { error } = await supabase.from("workspace_invites").insert({
    workspace_id: workspace.id,
    email,
    role: "member",
    token,
    invited_by: userId,
  });
  if (error) return { error: error.message };

  const h = await headers();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? `https://${h.get("host")}`;
  const inviteLink = `${appUrl}/invite/${token}`;

  const { error: emailError } = await sendEmail(
    email,
    `You've been invited to join ${workspace.name} on Sendkar`,
    `<p>You've been invited to join <strong>${workspace.name}</strong> on Sendkar — a WhatsApp marketing platform.</p>
     <p><a href="${inviteLink}">Accept the invite</a></p>
     <p style="color:#888;font-size:12px">Or paste this link into your browser: ${inviteLink}</p>`,
  );

  revalidatePath("/settings/team");
  // The invite row is already saved either way — email is best-effort, so a
  // Resend outage or missing API key shouldn't block the invite itself, just
  // fall back to the admin sharing the link by hand.
  return { success: true, inviteLink, emailSent: !emailError, emailError };
}

export async function removeInvite(inviteId: string) {
  const supabase = await createClient();
  await supabase.from("workspace_invites").delete().eq("id", inviteId);
  revalidatePath("/settings/team");
}

export async function toggleAutoAssignment(_prevState: unknown, formData: FormData) {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "No workspace found." };

  const enabled = formData.get("enabled") === "on";
  const supabase = await createClient();
  const { error } = await supabase.from("workspaces").update({ auto_assignment_enabled: enabled }).eq("id", workspace.id);
  if (error) return { error: error.message };

  revalidatePath("/settings/team");
  return { success: true };
}
