import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { getCurrentLanguage } from "@/lib/i18n/getLanguage";
import { ITEMS_UI } from "@/lib/i18n/itemsUi";
import { rupees } from "@/lib/shopAssistantCore";
import { ItemForm } from "./ItemForm";
import { ItemRowButtons } from "./ItemRowButtons";

interface Row { id: string; kind: "item" | "service"; name: string; price: number | string | null; unit: string | null; description: string | null; image_url: string | null; is_active: boolean }

export default async function ItemsPage() {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return null;
  const t = ITEMS_UI[await getCurrentLanguage()];
  const supabase = await createClient();
  const { data } = await supabase
    .from("shop_items")
    .select("id, kind, name, price, unit, description, image_url, is_active")
    .eq("workspace_id", workspace.id)
    .order("sort_order")
    .order("created_at")
    .limit(500)
    .returns<Row[]>();
  const rows = data ?? [];

  return (
    <div className="max-w-3xl">
      <h1 className="mb-1 text-xl font-semibold tracking-tight">{t.title}</h1>
      <p className="mb-1 text-[13px] text-muted">{t.intro}</p>
      <p className="mb-5 text-[12.5px] text-faint">{t.assistantNote}</p>

      <ItemForm t={t} />

      {rows.length === 0 ? (
        <div className="rounded-lg border border-border py-8 text-center text-[13px] text-muted">{t.empty}</div>
      ) : (
        <div className="sk-card divide-y divide-border p-0">
          {rows.map((r) => (
            <div key={r.id} className={`flex items-center gap-3 px-4 py-3 ${r.is_active ? "" : "opacity-60"}`}>
              {r.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={r.image_url} alt="" className="h-12 w-12 flex-none rounded-lg object-cover" />
              ) : (
                <div className="h-12 w-12 flex-none rounded-lg bg-black/10" />
              )}
              <div className="min-w-0 flex-1">
                <div className="truncate text-[14px] font-medium">{r.name} <span className="text-[12px] font-normal text-faint">{r.kind === "service" ? t.kindService : t.kindItem}</span></div>
                <div className="text-[12.5px] text-muted">
                  {r.price === null ? t.onRequest : `${rupees(Number(r.price))}${r.unit ? " " + r.unit : ""}`}
                  {r.description ? ` · ${r.description}` : ""}
                  {!r.is_active ? ` · ${t.hidden}` : ""}
                </div>
              </div>
              <ItemRowButtons id={r.id} active={r.is_active} hide={t.hide} show={t.show} remove={t.remove} confirmText={t.confirmRemove} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
