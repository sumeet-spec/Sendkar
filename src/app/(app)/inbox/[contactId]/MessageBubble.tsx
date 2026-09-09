"use client";

import { useState, useTransition } from "react";
import { reactToMessage } from "../actions";

const QUICK_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

interface Message {
  id: string;
  direction: string;
  body: string | null;
  reaction: string | null;
  sent_by_ai?: boolean;
  created_at?: string;
}

function formatTime(iso?: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

export function MessageBubble({ message, contactId }: { message: Message; contactId: string }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const outbound = message.direction === "outbound";

  function react(emoji: string) {
    setPickerOpen(false);
    const next = message.reaction === emoji ? "" : emoji;
    startTransition(async () => {
      await reactToMessage(contactId, message.id, next);
    });
  }

  const body = message.body ?? "[template message]";
  const isTemplate = !message.body;

  return (
    <div className={`group relative flex ${outbound ? "justify-end" : "justify-start"}`}>
      <div className="relative max-w-[75%]">
        <div
          className={`rounded-lg px-3.5 py-2 text-[13.5px] leading-relaxed ${
            outbound
              ? "bg-accent text-[#05130a]"
              : "border border-border bg-[var(--surface-2)]"
          } ${isTemplate ? "italic opacity-70" : ""}`}
          style={{ wordBreak: "break-word" }}
        >
          {message.sent_by_ai && (
            <div className={`mb-1 flex items-center gap-1 text-[10.5px] font-semibold uppercase tracking-wide ${outbound ? "text-[#05130a]/60" : "text-faint"}`}>
              ✦ AI agent
            </div>
          )}
          {body}
          {message.created_at && (
            <div className={`mt-1 text-right text-[10px] ${outbound ? "text-[#05130a]/50" : "text-faint"}`}>
              {formatTime(message.created_at)}
            </div>
          )}
        </div>

        {message.reaction && (
          <div
            className={`absolute -bottom-2.5 ${outbound ? "left-1" : "right-1"} rounded-full border border-border bg-[var(--surface)] px-1 text-[12px] leading-none`}
            style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}
          >
            {message.reaction}
          </div>
        )}

        {/* Reaction picker trigger */}
        <button
          type="button"
          onClick={() => setPickerOpen((v) => !v)}
          disabled={pending}
          title="React"
          className={`absolute top-1/2 -translate-y-1/2 rounded-full border border-border bg-[var(--surface)] px-1.5 py-0.5 text-[11px] opacity-0 transition-opacity group-hover:opacity-100 disabled:pointer-events-none ${
            outbound ? "-left-8" : "-right-8"
          }`}
        >
          😊
        </button>

        {pickerOpen && (
          <div
            className={`absolute top-full z-10 mt-1 flex gap-1 rounded-lg border border-border bg-[var(--surface)] p-1.5 shadow-lg ${outbound ? "right-0" : "left-0"}`}
          >
            {QUICK_EMOJIS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => react(e)}
                className={`rounded px-1 text-[15px] hover:bg-[var(--surface-2)] ${message.reaction === e ? "ring-1 ring-accent" : ""}`}
              >
                {e}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
