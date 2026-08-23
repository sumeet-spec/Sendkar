import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { NewTemplateForm } from "./NewTemplateForm";

const LANGUAGE_LABEL: Record<string, string> = {
  hi: "Hindi", mr: "Marathi", ta: "Tamil", te: "Telugu", kn: "Kannada", en: "English",
};

const STATUS_STYLE: Record<string, string> = {
  approved: "bg-accent text-[#05130a] border-accent",
  pending: "",
  rejected: "border-danger text-danger",
};

export default async function TemplatesPage() {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return null;
  const supabase = await createClient();

  const { data: templates } = await supabase
    .from("templates")
    .select("*")
    .eq("workspace_id", workspace.id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">Templates</h1>
        <NewTemplateForm />
      </div>

      <p className="mb-5 text-sm text-muted">
        Submitting a template to Meta for approval still happens once, manually, in Business Manager — this page
        just tracks what you&apos;ve submitted and whether it&apos;s cleared review yet.
      </p>

      <div className="grid grid-cols-2 gap-4">
        {(templates ?? []).map((t) => (
          <div key={t.id} className="sk-card p-5">
            <div className="mb-2 flex items-center justify-between">
              <div className="font-medium">{t.name}</div>
              <span className={`sk-pill ${STATUS_STYLE[t.status] ?? ""}`}>{t.status}</span>
            </div>
            <div className="mb-3 flex gap-2">
              <span className="sk-pill">{LANGUAGE_LABEL[t.language] ?? t.language}</span>
              <span className="sk-pill">{t.category}</span>
            </div>
            <div className="font-mono text-[12.5px] text-faint">{t.meta_template_name}</div>
            {t.body_preview && <p className="mt-2 text-[13px] text-muted line-clamp-3">{t.body_preview}</p>}
          </div>
        ))}
        {(!templates || templates.length === 0) && (
          <p className="col-span-2 py-8 text-center text-muted">No templates yet.</p>
        )}
      </div>
    </div>
  );
}
