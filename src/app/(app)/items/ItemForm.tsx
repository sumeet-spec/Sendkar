"use client";

import { useActionState, useRef, useEffect } from "react";
import type { ItemsUi } from "@/lib/i18n/itemsUi";
import { addItem, type ItemResult } from "./actions";

export function ItemForm({ t }: { t: ItemsUi }) {
  const [state, formAction, pending] = useActionState<ItemResult | null, FormData>(addItem, null);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state?.success) ref.current?.reset(); }, [state]);

  return (
    <form ref={ref} action={formAction} className="sk-card mb-6 flex max-w-xl flex-col gap-3 p-4">
      <div className="text-[14px] font-medium">{t.add}</div>
      <div className="grid grid-cols-2 gap-2">
        <label className="flex cursor-pointer items-center justify-center rounded-lg border border-border px-3 py-2 text-[14px] has-[:checked]:border-accent has-[:checked]:text-accent">
          <input type="radio" name="kind" value="item" defaultChecked className="sr-only" />{t.kindItem}
        </label>
        <label className="flex cursor-pointer items-center justify-center rounded-lg border border-border px-3 py-2 text-[14px] has-[:checked]:border-accent has-[:checked]:text-accent">
          <input type="radio" name="kind" value="service" className="sr-only" />{t.kindService}
        </label>
      </div>
      <div>
        <label className="sk-label" htmlFor="it-name">{t.name}</label>
        <input id="it-name" name="name" required maxLength={80} placeholder={t.namePlaceholder} className="sk-input text-[16px]" autoComplete="off" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="sk-label" htmlFor="it-price">{t.price}</label>
          <input id="it-price" name="price" inputMode="decimal" className="sk-input text-[16px]" autoComplete="off" />
        </div>
        <div>
          <label className="sk-label" htmlFor="it-unit">{t.unit}</label>
          <input id="it-unit" name="unit" maxLength={30} placeholder={t.unitPlaceholder} className="sk-input text-[16px]" autoComplete="off" />
        </div>
      </div>
      <p className="-mt-2 text-[12px] text-faint">{t.priceHint}</p>
      <div>
        <label className="sk-label" htmlFor="it-desc">{t.description}</label>
        <input id="it-desc" name="description" maxLength={200} className="sk-input text-[16px]" autoComplete="off" />
      </div>
      <div>
        <label className="sk-label" htmlFor="it-photo">{t.photo}</label>
        <input id="it-photo" name="photo" type="file" accept="image/png,image/jpeg,image/webp" className="sk-input text-sm" />
      </div>
      {state?.error && <p className="text-[13px] text-danger">{state.error}</p>}
      <button type="submit" disabled={pending} className="sk-btn sk-btn-primary self-start disabled:opacity-60">{pending ? t.saving : t.save}</button>
    </form>
  );
}
