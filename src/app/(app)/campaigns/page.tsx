import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { NewCampaignForm } from "./NewCampaignForm";
import Link from "next/link";

const STATUS_STYLE: Record<string, string> = {
  sending: "border-accent text-accent",
  completed: "bg-accent text-[#05130a] border-accent",
  paused: "border-warn text-warn",
  draft: "",
};

export default async function CampaignsPage() {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return null;
  const supabase = await createClient();

  const [{ data: campaigns }, { data: templates }] = await Promise.all([
    supabase
      .from("campaigns")
      .select("id, name, status, created_at, templates(name, language)")
      .eq("workspace_id", workspace.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("templates")
      .select("id, name, language, status")
      .eq("workspace_id", workspace.id)
      .order("created_at", { ascending: false }),
  ]);

  return (
    <div className="max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">Campaigns</h1>
        <NewCampaignForm templates={templates ?? []} />
      </div>
      {(templates?.length ?? 0) === 0 && (
        <p className="mb-4 text-sm text-muted">Add a template first before you can create a campaign.</p>
      )}

      <div className="flex flex-col gap-3">
        {(campaigns ?? []).map((c) => {
          const template = c.templates as { name?: string; language?: string } | null;
          return (
            <Link key={c.id} href={`/campaigns/${c.id}`} className="sk-card flex items-center justify-between p-4 hover:border-accent-dim">
              <div>
                <div className="font-medium">{c.name}</div>
                <div className="mt-0.5 text-[12.5px] text-faint">
                  {template?.name} · {template?.language} · {new Date(c.created_at).toLocaleDateString()}
                </div>
              </div>
              <span className={`sk-pill ${STATUS_STYLE[c.status] ?? ""}`}>{c.status}</span>
            </Link>
          );
        })}
        {(!campaigns || campaigns.length === 0) && <p className="py-8 text-center text-muted">No campaigns yet.</p>}
      </div>
    </div>
  );
}
