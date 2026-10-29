import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { isJoinCode } from "@/lib/joinCode";
import { LANGUAGES, type LanguageCode } from "@/lib/i18n/dictionaries";
import { JoinForm } from "./JoinForm";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function JoinPage({ params, searchParams }: { params: Promise<{ code: string }>; searchParams: Promise<{ lang?: string }> }) {
  const { code } = await params;
  const { lang } = await searchParams;
  if (!isJoinCode(code)) notFound();

  const admin = createAdminClient();
  const { data: workspace } = await admin.from("workspaces").select("id, name").eq("join_code", code).maybeSingle();
  if (!workspace) notFound();
  const { data: kit } = await admin.from("brand_kits").select("name, names, logo_url, primary_color").eq("workspace_id", workspace.id).maybeSingle();

  const initialLang = (LANGUAGES.find((l) => l.code === lang)?.code ?? "en") as LanguageCode;
  const names = (kit?.names ?? {}) as Record<string, string>;
  const shopNames = Object.fromEntries(LANGUAGES.map((l) => [l.code, names[l.code]?.trim() || kit?.name?.trim() || workspace.name])) as Record<LanguageCode, string>;

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-10">
      <JoinForm code={code} initialLang={initialLang} shopNames={shopNames} logoUrl={kit?.logo_url ?? null} color={kit?.primary_color ?? "#0f766e"} />
    </main>
  );
}
