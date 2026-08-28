import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { PipelineBoard } from "./PipelineBoard";
import { NewDealForm } from "./NewDealForm";
import type { DealStage } from "./constants";

export default async function DealsPage() {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return null;
  const supabase = await createClient();

  const [{ data: deals }, { data: contacts }] = await Promise.all([
    supabase
      .from("deals")
      .select("id, title, value, stage, contacts(name, phone)")
      .eq("workspace_id", workspace.id)
      .order("created_at", { ascending: false }),
    supabase.from("contacts").select("id, name, phone").eq("workspace_id", workspace.id).order("name", { ascending: true }).limit(200),
  ]);

  const boardDeals = (deals ?? []).map((d) => {
    const contactField = d.contacts as { name: string | null; phone: string } | { name: string | null; phone: string }[] | null;
    const contact = Array.isArray(contactField) ? contactField[0] : contactField;
    return { id: d.id, title: d.title, value: Number(d.value), stage: d.stage as DealStage, contactName: contact?.name ?? contact?.phone ?? null };
  });

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Deals</h1>
          <p className="text-sm text-muted">Track leads through your sales process — drag a card to move its stage.</p>
        </div>
        <NewDealForm contacts={contacts ?? []} />
      </div>
      <PipelineBoard deals={boardDeals} />
    </div>
  );
}
