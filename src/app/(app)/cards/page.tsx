import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { CardMaker } from "./CardMaker";
import { getCurrentLanguage } from "@/lib/i18n/getLanguage";
import { LANGUAGES, type LanguageCode } from "@/lib/i18n/dictionaries";

export default async function CardsPage() {
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

  return (
    <div className="max-w-3xl">
      <h1 className="mb-2 text-xl font-semibold tracking-tight">Make a card</h1>
      <p className="mb-6 text-sm text-muted">
        Pick a festival or write what you want to say. Your name, logo and colours are added for you, in the language you choose.
      </p>
      {ready ? (
        <CardMaker workspaceId={workspace.id} hasLogo={Boolean(kit?.logo_url)} defaultLang={defaultLang} fromCustomers={fromCustomers} />
      ) : (
        <div className="sk-card p-5 text-[13.5px]">
          Set up your brand kit first, so every card carries your name and logo.{" "}
          <Link href="/settings/brand" className="text-accent hover:text-accent-hover">Set up brand kit →</Link>
        </div>
      )}
    </div>
  );
}
