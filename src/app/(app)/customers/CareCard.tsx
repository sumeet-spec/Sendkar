"use client";

import { useActionState, useState, useTransition } from "react";
import type { CareUi } from "@/lib/i18n/careUi";
import { saveCareSwitches, setUpCareMessages, type CareResult } from "./actions";

export function CareCard({ t, birthdayOn, reorderOn, canSetUp, setUpDone }: { t: CareUi; birthdayOn: boolean; reorderOn: boolean; canSetUp: boolean; setUpDone: boolean }) {
  const [state, formAction, pending] = useActionState<CareResult | null, FormData>(saveCareSwitches, null);
  const [setting, startSetUp] = useTransition();
  const [setUpState, setSetUpState] = useState<CareResult | null>(setUpDone ? { success: true } : null);

  return (
    <details className="sk-card mb-5 p-4">
      <summary className="cursor-pointer text-[14px] font-medium">{t.careTitle}</summary>
      <p className="mt-3 text-[12.5px] text-faint">{t.careIntro}</p>
      <form action={formAction} className="mt-3 flex flex-col gap-2">
        <label className="flex items-center gap-2 text-[13.5px]"><input type="checkbox" name="birthday" defaultChecked={birthdayOn} className="h-4 w-4" />{t.birthdayOn}</label>
        <label className="flex items-center gap-2 text-[13.5px]"><input type="checkbox" name="reorder" defaultChecked={reorderOn} className="h-4 w-4" />{t.reorderOn}</label>
        {state?.error && <p className="text-[13px] text-danger">{state.error}</p>}
        {state?.success && <p className="text-[13px] text-accent">{t.saved}</p>}
        <button type="submit" disabled={pending} className="sk-btn self-start disabled:opacity-60">{pending ? t.saving : t.save}</button>
      </form>
      <div className="mt-4 border-t border-border pt-3">
        {!canSetUp ? (
          <p className="text-[12.5px] text-faint">{t.careNeedsNumber}</p>
        ) : (
          <>
            <button
              type="button" disabled={setting || Boolean(setUpState?.success)} className="sk-btn disabled:opacity-60"
              onClick={() => startSetUp(async () => setSetUpState(await setUpCareMessages()))}
            >
              {setting ? t.installing : t.installTemplates}
            </button>
            {setUpState?.error && <p className="mt-2 text-[13px] text-danger">{setUpState.error}</p>}
            {setUpState?.success && <p className="mt-2 text-[12.5px] text-muted">{t.installedNote}</p>}
          </>
        )}
      </div>
    </details>
  );
}
