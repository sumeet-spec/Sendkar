import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { CardMaker } from "./CardMaker";
import { occasionById, type OccasionId } from "@/lib/cards/occasions";
import { todayInIndia, upcomingFestivals } from "@/lib/festivals";
import { APP_COPY, fillN } from "@/lib/i18n/appCopy";
import { LIBRARY_COPY } from "@/lib/i18n/libraryCopy";
import { getCurrentLanguage } from "@/lib/i18n/getLanguage";
import { LANGUAGES, type LanguageCode } from "@/lib/i18n/dictionaries";

export default async function CardsPage({ searchParams }: { searchParams: Promise<{ occasion?: string }> }) {
  const { occasion } = await searchParams;
  const uiLang = await getCurrentLanguage();
  const t = APP_COPY[uiLang].cards;
  const initialOccasion = (occasionById(occasion ?? "")?.id ?? "diwali") as OccasionId;
  const coming = upcomingFestivals(todayInIndia(), 4, await getCurrentLanguage());
  const workspace = await getCurrentWorkspace();
  if (!workspace) return null;
  const supabase = await createClient();
  const { data: kit } = await supabase.from("brand_kits").select("name, logo_url").eq("workspace_id", workspace.id).maybeSingle();
  const ready = Boolean(kit?.name?.trim());

  // The card language starts as the language most of this shop's customers speak, else the language
  // the app is shown in. It is only a starting point: the shopkeeper can change it on every card.
  const { data: langRows } = await supabase.from("contacts").select("language").eq("workspace_id", workspace.id).not("language", "is", null).limit(2000);
  const counts = new Map<string, number>();
  for (const r of langRows ?? []) counts.set(r.language as string, (counts.get(r.language as string) ?? 0) + 1);
  const known = new Set<string>(LANGUAGES.map((l) => l.code));
  const top = [...counts.entries()].filter(([code]) => known.has(code)).sort((a, b) => b[1] - a[1])[0]?.[0] as LanguageCode | undefined;
  const defaultLang: LanguageCode = top ?? (await getCurrentLanguage());
  const fromCustomers = Boolean(top);
  const customerLangs = [...counts.entries()].filter(([code]) => known.has(code)).sort((a, b) => b[1] - a[1]).map(([code]) => code as LanguageCode);

  return (
    <div className="max-w-3xl">
      <h1 className="mb-2 text-xl font-semibold tracking-tight">{t.title}</h1>
      <p className="mb-6 text-sm text-muted">
        {t.intro}
      </p>
      {coming.length > 0 && (
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between"><span className="text-[11px] font-medium uppercase tracking-wide text-faint">{t.comingUp}</span><Link href="/library" className="text-[12px] text-accent hover:text-accent-hover">{LIBRARY_COPY[uiLang].title} →</Link></div>
          <div className="grid gap-2 sm:grid-cols-2">
            {coming.map((f) => (
              <Link key={f.id} href={`/cards?occasion=${f.occasion}`} className="sk-card flex items-center justify-between gap-3 p-3 hover:border-accent">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{f.name}</div>
                  <div className="text-[12px] text-faint">{f.dateLabel}{!f.exact ? ` · ${t.confirmDay}` : ""}</div>
                </div>
                <div className={`flex-shrink-0 text-right text-[12px] ${f.stage === "now" ? "font-semibold text-accent" : "text-muted"}`}>
                  {f.daysLeft === 0 ? t.today : f.daysLeft === 1 ? t.tomorrow : fillN(t.inDays, f.daysLeft)}
                  <div className="text-[11px] font-normal text-faint">{f.stage === "now" ? t.stageNow : f.stage === "soon" ? t.stageSoon : t.stageLater}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
      {ready ? (
        <CardMaker t={t} uiLang={uiLang} workspaceId={workspace.id} hasLogo={Boolean(kit?.logo_url)} defaultLang={defaultLang} fromCustomers={fromCustomers} initialOccasion={initialOccasion} customerLangs={customerLangs} />
      ) : (
        <div className="sk-card p-5 text-[13.5px]">
          {t.setupFirst}{" "}
          <Link href="/settings/brand" className="text-accent hover:text-accent-hover">{t.setupLink}</Link>
        </div>
      )}
    </div>
  );
}
