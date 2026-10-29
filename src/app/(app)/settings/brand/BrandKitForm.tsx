"use client";

import { useActionState, useRef, useState } from "react";
import { saveBrandKit } from "./actions";
import { LANGUAGES } from "@/lib/i18n/dictionaries";
import { DEFAULT_ACCENT, DEFAULT_PRIMARY, type BrandKit } from "@/lib/brandKit";

export function BrandKitForm({ workspaceName, workspaceId, kit }: { workspaceName: string; workspaceId: string; kit: BrandKit | null }) {
  const [state, formAction, pending] = useActionState(saveBrandKit, null);
  const [logo, setLogo] = useState<string | null>(kit?.logo_url ?? null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [primary, setPrimary] = useState(kit?.primary_color ?? DEFAULT_PRIMARY);
  const [accent, setAccent] = useState(kit?.accent_color ?? DEFAULT_ACCENT);
  const fileRef = useRef<HTMLInputElement>(null);

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
        <label className="sk-label">Shop or business name</label>
        <input name="name" defaultValue={kit?.name ?? workspaceName} className="sk-input" maxLength={60} />
      </div>

      <div className="sk-card p-4">
        <div className="mb-1 text-sm font-medium">Your name in each language</div>
        <p className="mb-3 text-[12.5px] text-faint">
          Optional. When you send a Gujarati card, it shows the Gujarati name. Leave a language empty to use the name above.
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
          <div className="text-sm font-medium">Logo</div>
          <p className="text-[12.5px] text-faint">PNG, JPG or WebP, under 1 MB. A square logo works best.</p>
          <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => onLogo(e.target.files?.[0])} />
          <button type="button" disabled={uploading} onClick={() => fileRef.current?.click()} className="sk-btn mt-2 disabled:opacity-60">
            {uploading ? "Uploading…" : logo ? "Change logo" : "Upload logo"}
          </button>
          {logoError && <p className="mt-1 text-sm text-danger">{logoError}</p>}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="sk-label">Main colour</label>
          <input type="color" name="primary_color" value={primary} onChange={(e) => setPrimary(e.target.value)} className="h-10 w-full cursor-pointer rounded-lg border border-border bg-transparent" />
        </div>
        <div>
          <label className="sk-label">Highlight colour</label>
          <input type="color" name="accent_color" value={accent} onChange={(e) => setAccent(e.target.value)} className="h-10 w-full cursor-pointer rounded-lg border border-border bg-transparent" />
        </div>
      </div>

      <div>
        <label className="sk-label">Tagline (optional)</label>
        <input name="tagline" defaultValue={kit?.tagline ?? ""} className="sk-input" maxLength={60} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="sk-label">Phone shown on cards</label>
          <input name="phone" defaultValue={kit?.phone ?? ""} className="sk-input" maxLength={30} />
        </div>
        <div>
          <label className="sk-label">Website (optional)</label>
          <input name="website" defaultValue={kit?.website ?? ""} className="sk-input" maxLength={60} />
        </div>
      </div>
      <div>
        <label className="sk-label">Address or area (optional)</label>
        <input name="address" defaultValue={kit?.address ?? ""} className="sk-input" maxLength={80} />
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className="sk-btn sk-btn-primary disabled:opacity-60">{pending ? "Saving…" : "Save brand kit"}</button>
        {state && "error" in state && state.error && <p className="text-sm text-danger">{state.error}</p>}
        {state && "success" in state && state.success && <p className="text-sm text-accent">Saved. Now make a card with it.</p>}
      </div>
    </form>
  );
}
