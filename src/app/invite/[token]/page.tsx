import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { acceptInvite } from "./actions";
import { INVITE_EXPIRY_DAYS } from "./constants";
import Link from "next/link";

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const admin = createAdminClient();
  const supabase = await createClient();

  const [{ data: invite }, { data: userData }] = await Promise.all([
    admin.from("workspace_invites").select("email, role, accepted_at, created_at, workspaces(name)").eq("token", token).maybeSingle(),
    supabase.auth.getUser(),
  ]);

  const isExpired = Boolean(invite && new Date().getTime() - new Date(invite.created_at).getTime() > INVITE_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  if (!invite || isExpired) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="sk-card max-w-sm p-8 text-center">
          <p className="text-muted">This invite link is invalid or has expired.</p>
        </div>
      </div>
    );
  }

  const workspaceName = (invite.workspaces as { name?: string } | null)?.name ?? "a workspace";

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="sk-card w-full max-w-sm p-8 text-center">
        <h1 className="mb-2 text-xl font-semibold">Join {workspaceName}</h1>
        {invite.accepted_at ? (
          <p className="text-muted">This invite has already been used.</p>
        ) : userData.user ? (
          <form action={async () => { await acceptInvite(token); }}>
            <button type="submit" className="sk-btn sk-btn-primary w-full">Accept invite</button>
          </form>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-muted">Log in or create an account with <span className="text-foreground">{invite.email}</span>, then reopen this link.</p>
            <Link href={`/login?redirect=/invite/${token}`} className="sk-btn sk-btn-primary w-full">Log in</Link>
            <Link href={`/signup?redirect=/invite/${token}`} className="sk-btn sk-btn-ghost w-full">Create account</Link>
          </div>
        )}
      </div>
    </div>
  );
}
