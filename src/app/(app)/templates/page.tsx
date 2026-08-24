import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { NewTemplateForm } from "./NewTemplateForm";
import { explainRejection } from "@/lib/templateRejectionReasons";

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
  const canSubmitToMeta = Boolean(workspace.whatsapp_waba_id && workspace.whatsapp_access_token);

  const { data: templates } = await supabase
    .from("templates")
    .select("*")
    .eq("workspace_id", workspace.id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">Templates</h1>
        <NewTemplateForm canSubmitToMeta={canSubmitToMeta} />
      </div>

      <p className="mb-5 text-sm text-muted">
        {canSubmitToMeta
          ? "New templates submit directly to Meta's review API. Approval status here updates automatically via webhook once Meta decides."
          : "Connect a WhatsApp Business Account in Settings → Channels to submit templates for real Meta review instead of tracking them manually."}
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
              {t.template_group && <span className="sk-pill border-accent text-accent">group: {t.template_group}</span>}
              {Array.isArray(t.carousel_cards) && t.carousel_cards.length > 0 && (
                <span className="sk-pill border-accent text-accent">▭▭ {t.carousel_cards.length} cards</span>
              )}
            </div>
            <div className="font-mono text-[12.5px] text-faint">{t.meta_template_name}</div>
            {t.body_preview && <p className="mt-2 text-[13px] text-muted line-clamp-3">{t.body_preview}</p>}
            {t.status === "rejected" && (() => {
              const { plainLanguage, fix } = explainRejection(t.rejection_reason);
              return (
                <div className="mt-2 rounded-md border border-danger/30 bg-danger/5 p-2.5">
                  <p className="text-[12px] font-medium text-danger">{plainLanguage}</p>
                  <p className="mt-1 text-[11.5px] text-muted">{fix}</p>
                </div>
              );
            })()}
            {t.status === "pending" && (
              <p className="mt-2 text-[11.5px] text-faint">Under Meta review — usually resolves within a few hours, sometimes up to 48h. This updates automatically, no need to refresh.</p>
            )}
          </div>
        ))}
        {(!templates || templates.length === 0) && (
          <p className="col-span-2 py-8 text-center text-muted">
            No templates yet — every campaign needs at least one approved template. Click &quot;New template&quot; above to submit your first one.
          </p>
        )}
      </div>
    </div>
  );
}
