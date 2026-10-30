"use client";

import { useActionState, useRef, useState } from "react";
import { saveBrandKit } from "./actions";
import { LANGUAGES } from "@/lib/i18n/dictionaries";
import { DEFAULT_ACCENT, DEFAULT_PRIMARY, type BrandKit } from "@/lib/brandKit";
import type { AppCopy } from "@/lib/i18n/appCopy";

export function BrandKitForm({ t, workspaceName, workspaceId, kit }: { t: AppCopy["brand"]; workspaceName: string; workspaceId: string; kit: BrandKit | null }) {
  const [state, formAction, pending] = useActionState(saveBrandKit, null);
  const [logo, setLogo] = useState<string | null>(kit?.logo_url ?? null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [primary, setPrimary] = useState(kit?.primary_color ?? DEFAULT_PRIMARY);
  const [accent, setAccent] = useState(kit?.accent_color ?? DEFAULT_ACCENT);
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(kit?.name ?? workspaceName);
  const [site, setSite] = useState(kit?.website ?? "");
  const [shape, setShape] = useState<"circle" | "rounded" | "square">("circle");
  const [working, setWorking] = useState<"site" | "make" | null>(null);

  async function callLogo(kind: "logo-from-site" | "logo-make", payload: Record<string, unknown>) {
    setLogoError(null);
    setWorking(kind === "logo-make" ? "make" : "site");
    try {
      const res = await fetch(`/api/brand/${kind}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ workspaceId, ...payload }) });
      const json = (await res.json()) as { url?: string; error?: string; themeColor?: string | null };
      if (!res.ok || !json.url) setLogoError(json.error ?? "Could not get a logo.");
      else {
        setLogo(json.url);
        if (json.themeColor) setPrimary(json.themeColor);
      }
    } catch {
      setLogoError("Could not get a logo. Check your internet and try again.");
    } finally {
      setWorking(null);
    }
  }

  async function onLogo(file: File | undefined) {
    if (!file) return;
    setLogoError(null);
    if (file.size > 1024 * 1024) { setLogoError("Logo must be under 1 MB."); return; }
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("workspaceId", workspaceId);
      const res = await fetch("/api/brand/logo", { method: "POST", body });
      const json = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !json.url) setLogoError(json.error ?? "Could not upload the logo.");
      else setLogo(json.url);
    } catch {
      setLogoError("Could not upload the logo.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div>
        <label className="sk-label">{t.shopName}</label>
        <input name="name" value={name} onChange={(e) => setName(e.target.value)} className="sk-input" maxLength={60} />
      </div>

      <div className="sk-card p-4">
        <div className="mb-1 text-sm font-medium">{t.namesTitle}</div>
        <p className="mb-3 text-[12.5px] text-faint">
          {t.namesHelp}
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {LANGUAGES.filter((l) => l.code !== "en").map((l) => (
            <div key={l.code}>
              <label className="sk-label">{l.label}</label>
              <input name={`name_${l.code}`} defaultValue={kit?.names?.[l.code] ?? ""} className="sk-input" maxLength={60} lang={l.code} />
            </div>
          ))}
        </div>
      </div>

      <div className="sk-card flex items-center gap-4 p-4">
        <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {logo ? <img src={logo} alt="Your logo" className="h-full w-full object-contain p-1" /> : <span className="text-[11px] text-faint">No logo</span>}
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium">{t.logo}</div>
          <p className="text-[12.5px] text-faint">{t.logoHelp}</p>
          <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => onLogo(e.target.files?.[0])} />
          <div className="mt-2 flex flex-wrap gap-2">
            <button type="button" disabled={uploading} onClick={() => fileRef.current?.click()} className="sk-btn disabled:opacity-60">
              {uploading ? t.uploading : logo ? t.uploadAnother : t.upload}
            </button>
            <button type="button" disabled={working !== null || !site.trim()} onClick={() => callLogo("logo-from-site", { website: site })} className="sk-btn disabled:opacity-60" title={site.trim() ? undefined : "Type your website below first"}>
              {working === "site" ? t.looking : t.fromWebsite}
            </button>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
            <span className="text-[12.5px] text-muted">{t.makeOne}</span>
            {(["circle", "rounded", "square"] as const).map((sh) => (
              <button key={sh} type="button" onClick={() => setShape(sh)} aria-label={sh} className={`h-7 w-7 border ${sh === "circle" ? "rounded-full" : sh === "rounded" ? "rounded-md" : ""} ${shape === sh ? "border-accent bg-accent/20" : "border-border"}`} />
            ))}
            <button type="button" disabled={working !== null || !name.trim()} onClick={() => callLogo("logo-make", { name, shape, fill: primary, ink: "#ffffff" })} className="sk-btn disabled:opacity-60">
              {working === "make" ? t.making : t.makeLogo}
            </button>
          </div>
          {logoError && <p className="mt-2 text-sm text-danger">{logoError}</p>}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="sk-label">{t.mainColour}</label>
          <input type="color" name="primary_color" value={primary} onChange={(e) => setPrimary(e.target.value)} className="h-10 w-full cursor-pointer rounded-lg border border-border bg-transparent" />
        </div>
        <div>
          <label className="sk-label">{t.highlightColour}</label>
          <input type="color" name="accent_color" value={accent} onChange={(e) => setAccent(e.target.value)} className="h-10 w-full cursor-pointer rounded-lg border border-border bg-transparent" />
        </div>
      </div>

      <div>
        <label className="sk-label">{t.tagline}</label>
        <input name="tagline" defaultValue={kit?.tagline ?? ""} className="sk-input" maxLength={60} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="sk-label">{t.phone}</label>
          <input name="phone" defaultValue={kit?.phone ?? ""} className="sk-input" maxLength={30} />
        </div>
        <div>
          <label className="sk-label">{t.website}</label>
          <input name="website" value={site} onChange={(e) => setSite(e.target.value)} className="sk-input" maxLength={60} />
          <label className="sk-label mt-3">GSTIN</label>
          <input name="gstin" defaultValue={kit?.gstin ?? ""} placeholder="24ABCDE1234F1Z5" className="sk-input" maxLength={15} autoCapitalize="characters" autoComplete="off" />
        </div>
      </div>
      <div>
        <label className="sk-label">{t.address}</label>
        <input name="address" defaultValue={kit?.address ?? ""} className="sk-input" maxLength={80} />
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className="sk-btn sk-btn-primary disabled:opacity-60">{pending ? t.saving : t.save}</button>
        {state && "error" in state && state.error && <p className="text-sm text-danger">{state.error}</p>}
        {state && "success" in state && state.success && <p className="text-sm text-accent">{t.saved}</p>}
      </div>
    </form>
  );
}
