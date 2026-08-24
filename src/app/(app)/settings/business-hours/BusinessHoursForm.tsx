"use client";

import { useActionState, useState } from "react";
import { saveBusinessHours } from "./actions";

const DAYS = [
  { key: "sun", label: "Sunday" },
  { key: "mon", label: "Monday" },
  { key: "tue", label: "Tuesday" },
  { key: "wed", label: "Wednesday" },
  { key: "thu", label: "Thursday" },
  { key: "fri", label: "Friday" },
  { key: "sat", label: "Saturday" },
] as const;

const COMMON_TIMEZONES = [
  "Asia/Kolkata", "Asia/Dubai", "Asia/Singapore", "Europe/London", "America/New_York", "UTC",
];

interface HourRow {
  day_of_week: number;
  opens_at: string;
  closes_at: string;
}

export function BusinessHoursForm({
  enabled, timezone, awayMessage, hours,
}: {
  enabled: boolean;
  timezone: string;
  awayMessage: string;
  hours: HourRow[];
}) {
  const [state, formAction, pending] = useActionState(saveBusinessHours, null);
  const byDay = new Map(hours.map((h) => [h.day_of_week, h]));

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <label className="sk-card flex items-center gap-3 p-4">
        <input type="checkbox" name="enabled" defaultChecked={enabled} className="h-4 w-4 accent-[var(--accent)]" />
        <span className="text-sm">Send an away message outside business hours</span>
      </label>

      <div>
        <label className="sk-label">Timezone</label>
        <select name="timezone" defaultValue={timezone} className="sk-input">
          {COMMON_TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
        </select>
      </div>

      <div>
        <label className="sk-label">Away message</label>
        <textarea name="awayMessage" defaultValue={awayMessage} rows={2} className="sk-input" />
      </div>

      <div className="sk-card overflow-hidden">
        <div className="border-b border-border px-4 py-2.5 text-[11px] font-medium uppercase tracking-wide text-faint">
          Weekly hours
        </div>
        <div className="flex flex-col">
          {DAYS.map((day, i) => {
            const existing = byDay.get(i);
            return <DayRow key={day.key} dayKey={day.key} label={day.label} existing={existing} />;
          })}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className="sk-btn sk-btn-primary disabled:opacity-60">
          {pending ? "Saving…" : "Save"}
        </button>
        {state?.error && <p className="text-sm text-danger">{state.error}</p>}
        {state?.success && <p className="text-sm text-accent">Saved.</p>}
      </div>
    </form>
  );
}

function DayRow({ dayKey, label, existing }: { dayKey: string; label: string; existing?: HourRow }) {
  const [active, setActive] = useState(Boolean(existing));
  return (
    <div className="flex items-center gap-3 border-b border-border px-4 py-2.5 text-sm last:border-0">
      <label className="flex w-32 items-center gap-2">
        <input
          type="checkbox"
          name={`${dayKey}_active`}
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
          className="h-4 w-4 accent-[var(--accent)]"
        />
        {label}
      </label>
      <input
        type="time"
        name={`${dayKey}_opens`}
        defaultValue={existing?.opens_at?.slice(0, 5) ?? "09:00"}
        disabled={!active}
        className="sk-input w-32 disabled:opacity-40"
      />
      <span className="text-faint">–</span>
      <input
        type="time"
        name={`${dayKey}_closes`}
        defaultValue={existing?.closes_at?.slice(0, 5) ?? "18:00"}
        disabled={!active}
        className="sk-input w-32 disabled:opacity-40"
      />
    </div>
  );
}
