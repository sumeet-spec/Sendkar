import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { notFound } from "next/navigation";
import { ScreenRow } from "./ScreenRow";
import { AddScreenForm } from "./AddScreenForm";
import { PublishButton } from "./PublishButton";

interface Field { type: string; label: string; required?: boolean; options?: string[] }
interface Screen { id: string; title: string; fields: Field[] }

export default async function FormDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const workspace = await getCurrentWorkspace();
  if (!workspace) return null;
  const supabase = await createClient();

  const { data: form } = await supabase.from("wa_flows").select("*").eq("id", id).eq("workspace_id", workspace.id).maybeSingle();
  if (!form) notFound();

  const screens = (form.screens as Screen[]) ?? [];

  return (
    <div className="max-w-2xl">
      <div className="mb-1 flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">{form.name}</h1>
        <PublishButton waFlowId={id} status={form.status} disabled={screens.length === 0} />
      </div>
      {form.status === "published" && (
        <p className="mb-6 text-[13px] text-accent">Published — send it to a contact from their inbox thread. Screens are locked; delete and recreate to change them.</p>
      )}
      {form.status === "error" && form.error_message && (
        <p className="mb-6 text-[13px] text-danger">Last publish failed: {form.error_message}</p>
      )}
      {form.status === "draft" && (
        <p className="mb-6 text-[13px] text-faint">Draft — add screens below, then publish.</p>
      )}

      <div className="flex flex-col gap-3">
        {screens.map((s, i) => (
          <ScreenRow key={s.id} waFlowId={id} screen={s} isLast={i === screens.length - 1} locked={form.status === "published"} />
        ))}
        {screens.length === 0 && <p className="py-4 text-center text-muted">No screens yet — add the first one below.</p>}
      </div>

      {form.status !== "published" && (
        <div className="mt-4">
          <AddScreenForm waFlowId={id} />
        </div>
      )}
    </div>
  );
}
