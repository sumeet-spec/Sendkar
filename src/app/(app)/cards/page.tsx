import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { CardMaker } from "./CardMaker";

export default async function CardsPage() {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return null;
  const supabase = await createClient();
  const { data: kit } = await supabase.from("brand_kits").select("name, logo_url").eq("workspace_id", workspace.id).maybeSingle();
  const ready = Boolean(kit?.name?.trim());

  return (
    <div className="max-w-3xl">
      <h1 className="mb-2 text-xl font-semibold tracking-tight">Make a card</h1>
      <p className="mb-6 text-sm text-muted">
        Pick a festival or write what you want to say. Your name, logo and colours are added for you, in the language you choose.
      </p>
      {ready ? (
        <CardMaker workspaceId={workspace.id} hasLogo={Boolean(kit?.logo_url)} />
      ) : (
        <div className="sk-card p-5 text-[13.5px]">
          Set up your brand kit first, so every card carries your name and logo.{" "}
          <Link href="/settings/brand" className="text-accent hover:text-accent-hover">Set up brand kit →</Link>
        </div>
      )}
    </div>
  );
}
