import { headers } from "next/headers";
import QRCode from "qrcode";
import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { LANGUAGES } from "@/lib/i18n/dictionaries";
import { CreateLink } from "./CreateLink";
import { CopyLink } from "./CopyLink";
import { getCurrentLanguage } from "@/lib/i18n/getLanguage";
import { APP_COPY, fillN } from "@/lib/i18n/appCopy";

export default async function JoinSettingsPage() {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return null;
  const t = APP_COPY[await getCurrentLanguage()].permission;
  const supabase = await createClient();
  const { data: row } = await supabase.from("workspaces").select("join_code").eq("id", workspace.id).maybeSingle();

  const [{ count: total }, { count: agreed }] = await Promise.all([
    supabase.from("contacts").select("id", { count: "exact", head: true }).eq("workspace_id", workspace.id),
    supabase.from("contacts").select("id", { count: "exact", head: true }).eq("workspace_id", workspace.id).not("consent_at", "is", null),
  ]);

  const h = await headers();
  const base = process.env.NEXT_PUBLIC_APP_URL ?? `https://${h.get("host")}`;
  const code = row?.join_code as string | null | undefined;
  const url = code ? `${base}/join/${code}` : null;
  const qrSvg = url ? await QRCode.toString(url, { type: "svg", margin: 1, errorCorrectionLevel: "M" }) : null;

  return (
    <div className="max-w-2xl">
      <h1 className="mb-2 text-xl font-semibold tracking-tight">{t.title}</h1>
      <p className="mb-6 text-sm text-muted">
        {t.intro}
      </p>

      <div className="sk-card mb-6 flex items-center justify-between p-4">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-wide text-faint">{t.agreedLabel}</div>
          <div className="mt-1 text-xl font-semibold text-accent">{(agreed ?? 0).toLocaleString("en-IN")} <span className="text-sm font-normal text-faint">{fillN(t.ofContacts, (total ?? 0).toLocaleString("en-IN"))}</span></div>
        </div>
      </div>

      {!url ? (
        <div className="sk-card p-5">
          <p className="mb-3 text-[13.5px]">{t.createIntro}</p>
          <CreateLink label={t.create} busyLabel={t.creating} />
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="sk-card p-5">
            <div className="mb-2 text-sm font-medium">{t.yourLink}</div>
            <CopyLink url={url} copyLabel={t.copy} copiedLabel={t.copied} />
            <p className="mt-2 text-[12.5px] text-faint">{t.linkHelp}</p>
            <div className="mt-4 h-40 w-40 rounded-lg bg-white p-1" dangerouslySetInnerHTML={{ __html: qrSvg ?? "" }} />
          </div>

          <div className="sk-card p-5">
            <div className="mb-1 text-sm font-medium">{t.posterTitle}</div>
            <p className="mb-3 text-[12.5px] text-faint">{t.posterHelp}</p>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map((l) => (
                <a key={l.code} className="sk-btn" href={`/api/join/poster?workspaceId=${workspace.id}&lang=${l.code}`} download>{l.label}</a>
              ))}
            </div>
          </div>

          <p className="text-[12.5px] text-faint">
            {t.footnote}
          </p>
        </div>
      )}
    </div>
  );
}
