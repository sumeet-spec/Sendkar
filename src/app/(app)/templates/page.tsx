import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { NewTemplateForm } from "./NewTemplateForm";
import { TemplateActions } from "./TemplateActions";
import { TemplateFilters } from "./TemplateFilters";
import { explainRejection } from "@/lib/templateRejectionReasons";
import { StarterPack } from "./StarterPack";
import { getCurrentLanguage } from "@/lib/i18n/getLanguage";
import { TEMPLATES_UI } from "@/lib/i18n/templatesCopy";

// The starter pack submits ~40 templates to Meta in one action.
export const maxDuration = 60;

const LANGUAGE_LABEL: Record<string, string> = {
  hi: "Hindi", mr: "Marathi", ta: "Tamil", te: "Telugu", kn: "Kannada", en: "English",
  ar: "Arabic", es: "Spanish", pt_BR: "Portuguese", id: "Indonesian", bn: "Bengali",
  gu: "Gujarati", pa: "Punjabi", ur: "Urdu",
};

const STATUS_STYLE: Record<string, string> = {
  approved: "border-accent bg-accent text-[#05130a]",
  pending: "",
  rejected: "border-danger text-danger",
};

type SearchParams = Promise<{ q?: string; status?: string }>;

export default async function TemplatesPage({ searchParams }: { searchParams: SearchParams }) {
  const { q = "", status = "" } = await searchParams;
  const workspace = await getCurrentWorkspace();
  if (!workspace) return null;
  const tx = TEMPLATES_UI[await getCurrentLanguage()];
  const supabase = await createClient();
  const canSubmitToMeta = Boolean(workspace.whatsapp_waba_id && workspace.whatsapp_access_token);
  const aiImageEnabled = Boolean(process.env.GEMINI_API_KEY);

  let query = supabase
    .from("templates")
    .select("*")
    .eq("workspace_id", workspace.id)
    .order("created_at", { ascending: false });

  if (status && status !== "all") query = query.eq("status", status);
  if (q.trim()) {
    const safe = q.trim().replace(/[,.()%]/g, "");
    query = query.or(`name.ilike.%${safe}%,meta_template_name.ilike.%${safe}%`);
  }

  const { data: templates } = await query;

  return (
    <div className="max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{tx.title}</h1>
          <p className="mt-1 text-sm text-muted">
            {canSubmitToMeta
              ? tx.introConnected
              : tx.introNot}
          </p>
        </div>
        <NewTemplateForm canSubmitToMeta={canSubmitToMeta} workspaceId={workspace.id} aiImageEnabled={aiImageEnabled} />
      </div>

      <StarterPack t={tx} canSubmitToMeta={canSubmitToMeta} installedCount={(templates ?? []).filter((t) => String(t.meta_template_name).startsWith("sk_")).length} />

      <Suspense>
        <TemplateFilters t={tx} />
      </Suspense>

      <div className="grid grid-cols-2 gap-4">
        {(templates ?? []).map((t) => (
          <div key={t.id} className="sk-card p-5">
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="font-medium leading-tight">{t.name}</div>
              <span className={`sk-pill flex-shrink-0 ${STATUS_STYLE[t.status] ?? ""}`}>{(tx as unknown as Record<string, string>)[t.status] ?? t.status}</span>
            </div>
            <div className="mb-3 flex flex-wrap gap-2">
              <span className="sk-pill">{LANGUAGE_LABEL[t.language] ?? t.language}</span>
              <span className="sk-pill">{t.category}</span>
              {t.template_group && <span className="sk-pill border-accent text-accent">{tx.group.replace("{name}", t.template_group)}</span>}
              {Array.isArray(t.carousel_cards) && t.carousel_cards.length > 0 && (
                <span className="sk-pill border-accent text-accent">▭▭ {tx.cards.replace("{n}", String(t.carousel_cards.length))}</span>
              )}
            </div>
            <div className="font-mono text-[12.5px] text-faint">{t.meta_template_name}</div>
            {t.body_preview && (
              <p className="mt-2 text-[13px] text-muted line-clamp-3">{t.body_preview}</p>
            )}
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
              <p className="mt-2 text-[11.5px] text-faint">
                {tx.underReview}
              </p>
            )}
            <TemplateActions id={t.id} status={t.status} bodyText={t.body_text} t={tx} />
          </div>
        ))}
        {(!templates || templates.length === 0) && (
          <p className="col-span-2 py-10 text-center text-muted">
            {q || (status && status !== "all")
              ? tx.emptyFilter
              : tx.empty}
          </p>
        )}
      </div>
    </div>
  );
}
