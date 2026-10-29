"use client";

import { useState, useTransition } from "react";
import { saveReminderTemplate } from "./actions";

interface TemplateOption { id: string; name: string; language: string }

// Four {{n}} slots, in the order the reminder sends them: name, amount, due date, payment link.
const EXAMPLE_ENGLISH =
  "Hello {{1}}, a friendly reminder: ₹{{2}} is due on {{3}}. You can pay here: {{4}}. If you have already paid, please ignore this message. Thank you!";
const EXAMPLE_GUJARATI =
  "નમસ્તે {{1}}, એક નમ્ર યાદ: ₹{{2}} ની રકમ {{3}} ના રોજ બાકી છે. અહીં ચૂકવો: {{4}}. જો તમે ચૂકવી દીધું હોય તો આ મેસેજ અવગણશો. આભાર!";

export function TemplatePicker({ templates, currentId }: { templates: TemplateOption[]; currentId: string | null }) {
  const [value, setValue] = useState(currentId ?? "");
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);

  function save() {
    startTransition(async () => {
      const result = await saveReminderTemplate(value);
      setMessage(result.error ? { text: result.error, error: true } : { text: "Saved.", error: false });
    });
  }

  return (
    <div className="sk-card p-4">
      <div className="mb-1 font-medium">Reminder message</div>
      <p className="mb-3 text-[12.5px] text-faint">
        Reminders go out as a Meta-approved template, because customers usually haven&apos;t messaged you in the last
        24 hours. Pick an approved one that has four variables: <span className="font-mono">{"{{1}}"}</span> name,{" "}
        <span className="font-mono">{"{{2}}"}</span> amount, <span className="font-mono">{"{{3}}"}</span> due date,{" "}
        <span className="font-mono">{"{{4}}"}</span> payment link.
      </p>
      <div className="flex items-center gap-3">
        <select value={value} onChange={(e) => { setValue(e.target.value); setMessage(null); }} className="sk-input min-w-0 flex-1 text-sm">
          <option value="">No template chosen</option>
          {templates.map((t) => <option key={t.id} value={t.id}>{t.name} ({t.language})</option>)}
        </select>
        <button type="button" onClick={save} disabled={pending || value === (currentId ?? "")} className="sk-btn sk-btn-primary disabled:opacity-60">
          {pending ? "Saving…" : "Save"}
        </button>
      </div>
      {message && <p className={`mt-2 text-[12.5px] ${message.error ? "text-danger" : "text-accent"}`}>{message.text}</p>}
      {templates.length === 0 && (
        <p className="mt-2 text-[12.5px] text-faint">
          No approved templates yet. Create a <strong>Utility</strong> template in{" "}
          <a href="/templates" className="text-accent hover:text-accent-hover">Templates</a> using the text below, then
          come back once Meta approves it.
        </p>
      )}
      <details className="mt-3 text-[12.5px]">
        <summary className="cursor-pointer text-muted">Suggested template text</summary>
        <div className="mt-2 flex flex-col gap-2">
          <div><div className="sk-label">English</div><div className="rounded-md border border-border p-2.5">{EXAMPLE_ENGLISH}</div></div>
          <div><div className="sk-label">Gujarati (have a native speaker check it)</div><div className="rounded-md border border-border p-2.5">{EXAMPLE_GUJARATI}</div></div>
        </div>
      </details>
    </div>
  );
}
