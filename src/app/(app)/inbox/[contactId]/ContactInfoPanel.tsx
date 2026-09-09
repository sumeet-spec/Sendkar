"use client";

import { useState, useTransition } from "react";
import { updateContact } from "../actions";

const LANGUAGE_LABEL: Record<string, string> = {
  hi: "Hindi", mr: "Marathi", ta: "Tamil", te: "Telugu", kn: "Kannada", en: "English",
  ar: "Arabic", es: "Spanish", pt_BR: "Portuguese", id: "Indonesian", bn: "Bengali",
  gu: "Gujarati", pa: "Punjabi", ur: "Urdu",
};

interface Props {
  contactId: string;
  name: string | null;
  email: string | null;
  language: string | null;
  source: string | null;
  adHeadline: string | null;
  optedOut: boolean;
  createdAt: string;
}

export function ContactInfoPanel({ contactId, name: initialName, email: initialEmail, language, source, adHeadline, optedOut: initialOptedOut, createdAt }: Props) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(initialName ?? "");
  const [email, setEmail] = useState(initialEmail ?? "");
  const [optedOut, setOptedOut] = useState(initialOptedOut);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function save() {
    setSaveError(null);
    startTransition(async () => {
      const result = await updateContact(contactId, { name: name.trim() || undefined, email: email.trim() || undefined });
      if (result.error) { setSaveError(result.error); return; }
      setEditing(false);
    });
  }

  function toggleOptOut() {
    const next = !optedOut;
    setOptedOut(next);
    startTransition(async () => {
      await updateContact(contactId, { opted_out: next });
    });
  }

  return (
    <div className="sk-card p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-[11px] font-medium uppercase tracking-wide text-faint">Contact info</div>
        {!editing && (
          <button onClick={() => setEditing(true)} className="text-[11.5px] text-accent hover:text-accent-hover">Edit</button>
        )}
      </div>

      {editing ? (
        <div className="flex flex-col gap-2">
          <div>
            <label className="sk-label text-[10.5px]">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="sk-input text-[12.5px]" placeholder="Contact name" />
          </div>
          <div>
            <label className="sk-label text-[10.5px]">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="sk-input text-[12.5px]" placeholder="email@example.com" type="email" />
          </div>
          {saveError && <p className="text-[11.5px] text-danger">{saveError}</p>}
          <div className="flex gap-2">
            <button onClick={save} disabled={pending} className="sk-btn sk-btn-primary py-1 text-[12px] disabled:opacity-60">
              {pending ? "Saving…" : "Save"}
            </button>
            <button onClick={() => { setEditing(false); setName(initialName ?? ""); setEmail(initialEmail ?? ""); }} className="sk-btn sk-btn-ghost py-1 text-[12px]">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5 text-[12.5px]">
          {name && (
            <div className="flex items-center gap-2">
              <span className="w-14 flex-shrink-0 text-[11px] text-faint">Name</span>
              <span className="text-muted">{name}</span>
            </div>
          )}
          {email && (
            <div className="flex items-center gap-2">
              <span className="w-14 flex-shrink-0 text-[11px] text-faint">Email</span>
              <a href={`mailto:${email}`} className="text-muted hover:text-accent truncate">{email}</a>
            </div>
          )}
          {language && (
            <div className="flex items-center gap-2">
              <span className="w-14 flex-shrink-0 text-[11px] text-faint">Language</span>
              <span className="text-muted">{LANGUAGE_LABEL[language] ?? language}</span>
            </div>
          )}
          {source && (
            <div className="flex items-center gap-2">
              <span className="w-14 flex-shrink-0 text-[11px] text-faint">Source</span>
              <span className="text-muted">{source}</span>
            </div>
          )}
          {adHeadline && (
            <div className="flex items-start gap-2">
              <span className="w-14 flex-shrink-0 text-[11px] text-faint">Ad</span>
              <span className="text-accent text-[11.5px]">{adHeadline}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="w-14 flex-shrink-0 text-[11px] text-faint">Since</span>
            <span className="text-faint">{new Date(createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      )}

      {/* Opt-out toggle */}
      <div className="mt-3 border-t border-border pt-3">
        <label className={`flex cursor-pointer items-center justify-between text-[12.5px] ${pending ? "opacity-60" : ""}`}>
          <span style={{ color: optedOut ? "var(--danger)" : "var(--muted)" }}>
            {optedOut ? "Opted out — no campaigns" : "Opted in"}
          </span>
          <button
            type="button"
            onClick={toggleOptOut}
            disabled={pending}
            className={`relative h-4 w-8 rounded-full transition-colors disabled:pointer-events-none ${
              optedOut ? "bg-danger" : "bg-accent"
            }`}
          >
            <span
              className="absolute top-0.5 h-3 w-3 rounded-full bg-white shadow transition-transform"
              style={{ left: optedOut ? "16px" : "2px" }}
            />
          </button>
        </label>
      </div>
    </div>
  );
}
