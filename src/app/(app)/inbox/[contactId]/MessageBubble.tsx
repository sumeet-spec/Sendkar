"use client";

import { useState, useTransition } from "react";
import { reactToMessage } from "../actions";

const QUICK_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

interface Message {
  id: string;
  direction: string;
  body: string | null;
  reaction: string | null;
}

export function MessageBubble({ message, contactId }: { message: Message; contactId: string }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const outbound = message.direction === "outbound";

  function react(emoji: string) {
    setPickerOpen(false);
    // Tapping the reaction already showing removes it — matches WhatsApp's own toggle behavior.
    const next = message.reaction === emoji ? "" : emoji;
    startTransition(async () => {
      await reactToMessage(contactId, message.id, next);
    });
  }

  return (
    <div className={`group relative flex ${outbound ? "justify-end" : "justify-start"}`}>
      <div className="relative">
        <div
          className={`max-w-[75%] rounded-lg px-3.5 py-2 text-[13.5px] ${
            outbound ? "bg-accent text-[#05130a]" : "bg-surface-2 border border-border"
          }`}
        >
          {message.body ?? "[template message]"}
        </div>

        {message.reaction && (
          <div className={`absolute -bottom-2 ${outbound ? "left-1" : "right-1"} rounded-full border border-border bg-surface px-1 text-[12px] leading-none`}>
            {message.reaction}
          </div>
        )}

        <button
          type="button"
          onClick={() => setPickerOpen((v) => !v)}
          disabled={pending}
          className={`absolute top-1/2 -translate-y-1/2 rounded-full border border-border bg-surface px-1.5 py-0.5 text-[11px] opacity-0 transition-opacity group-hover:opacity-100 ${
            outbound ? "-left-8" : "-right-8"
          }`}
        >
          ⌣
        </button>

        {pickerOpen && (
          <div className={`absolute top-full z-10 mt-1 flex gap-1 rounded-lg border border-border bg-surface p-1.5 shadow-lg ${outbound ? "right-0" : "left-0"}`}>
            {QUICK_EMOJIS.map((e) => (
              <button key={e} type="button" onClick={() => react(e)} className="rounded px-1 text-[15px] hover:bg-surface-2">
                {e}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
