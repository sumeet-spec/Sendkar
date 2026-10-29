import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { getCurrentLanguage } from "@/lib/i18n/getLanguage";
import { LANGUAGES, type LanguageCode } from "@/lib/i18n/dictionaries";
import { LIBRARY_COPY } from "@/lib/i18n/libraryCopy";
import { STATES, todayInIndia, upcomingFestivals, type StateCode } from "@/lib/festivals";
import { designsFor } from "@/lib/cards/designs";
import { occasionById } from "@/lib/cards/occasions";
import { festivalName, localDate } from "@/lib/festivalNames";
import { LibraryBrowser, type LibraryFestival } from "./LibraryBrowser";

export default async function LibraryPage({ searchParams }: { searchParams: Promise<{ lang?: string; festival?: string; state?: string }> }) {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return null;
  const { lang: langParam, festival, state: stateParam } = await searchParams;
  const state = (STATES.find((s) => s.code === stateParam)?.code ?? null) as StateCode | null;
  const uiLang = await getCurrentLanguage();
  const supabase = await createClient();

  // The festivals shown follow the language chosen here. It starts as the language most of this shop's
  // customers speak, else the language the app is shown in, and the shopkeeper can switch it.
  const { data: langRows } = await supabase.from("contacts").select("language").eq("workspace_id", workspace.id).not("language", "is", null).limit(2000);
  const counts = new Map<string, number>();
  for (const r of langRows ?? []) counts.set(r.language as string, (counts.get(r.language as string) ?? 0) + 1);
  const known = new Set<string>(LANGUAGES.map((l) => l.code));
  const ranked = [...counts.entries()].filter(([code]) => known.has(code)).sort((a, b) => b[1] - a[1]).map(([code]) => code as LanguageCode);
  const lang = (LANGUAGES.find((l) => l.code === langParam)?.code ?? ranked[0] ?? uiLang) as LanguageCode;

  const { data: kit } = await supabase.from("brand_kits").select("name").eq("workspace_id", workspace.id).maybeSingle();

  const today = todayInIndia();
  const festivals: LibraryFestival[] = upcomingFestivals(today, 40, lang, state).map((f) => ({
    id: f.id, name: festivalName(f.id, f.name, lang), occasion: f.occasion, title: occasionById(f.occasion)!.label[lang],
    dateLabel: f.exact ? localDate(f.date, lang) : `${LIBRARY_COPY[uiLang].around} ${localDate(f.date, lang)}`, exact: f.exact,
    daysLeft: f.daysLeft, stage: f.stage, released: f.released, releaseDate: f.releaseDate,
    designs: designsFor(f.occasion).map((d) => ({ id: d.id, name: d.name })),
  }));

  const anyTime: LibraryFestival[] = (["sale", "thanks"] as const).map((o) => ({
    id: `any-${o}`, name: occasionById(o)!.label.en, occasion: o, title: occasionById(o)!.label[lang], dateLabel: "", exact: true,
    daysLeft: -1, stage: "later" as const, released: true, releaseDate: today,
    designs: designsFor(o).map((d) => ({ id: d.id, name: d.name })),
  }));

  return (
    <div className="max-w-5xl">
      <LibraryBrowser
        workspaceId={workspace.id}
        lang={lang}
        langFromUrl={Boolean(LANGUAGES.find((l) => l.code === langParam))}
        state={state}
        festivals={festivals}
        anyTime={anyTime}
        initialFestival={festival ?? null}
        customerLangs={ranked}
        hasKit={Boolean(kit?.name?.trim())}
        t={LIBRARY_COPY[uiLang]}
      />
    </div>
  );
}
