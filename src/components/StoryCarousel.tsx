"use client";

import { useEffect, useState } from "react";

export type StoryMoment =
  | { emoji: string; tag: string; lines: Array<{ side: "in" | "out"; text: string }> }
  | { emoji: string; tag: string; card: { title: string; price: string; cta?: boolean } };

const AUTO_ADVANCE_MS = 3200;

/** A real phone-chrome mockup (same premium frame as any other Sendkar
 * product screen) whose body cycles through one story "moment" at a time —
 * keeps the tangible, real-UI feel of a full chat thread without the
 * vertical height of stacking every beat as its own section. */
export function StoryCarousel({ moments, name, subtitle }: { moments: StoryMoment[]; name: string; subtitle: string }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % moments.length), AUTO_ADVANCE_MS);
    return () => clearInterval(id);
  }, [moments.length]);

  const m = moments[index];

  return (
    <div>
      <div className="sk-phone">
        <div className="sk-phone-notch" />
        <div className="sk-phone-header">
          <div className="sk-phone-avatar" />
          <div>
            <div className="text-[13px] font-medium">{name}</div>
            <div className="text-[11px] text-faint">{subtitle}</div>
          </div>
        </div>
        <div className="sk-phone-body sk-story-body">
          <div key={index} className="sk-story-slide">
            {"lines" in m && (
              <div className="sk-story-lines">
                {m.lines.map((line, i) => (
                  <div key={i} className={`sk-chat-bubble ${line.side}`}>{line.text}</div>
                ))}
              </div>
            )}
            {"card" in m && (
              <div className="sk-chat-card">
                <div className="sk-chat-card-media" />
                <div className="sk-chat-card-body">
                  <div className="sk-chat-card-title">{m.card.title}</div>
                  <div className="sk-chat-card-price">{m.card.price}</div>
                  {m.card.cta && <div className="sk-chat-card-cta">Pay now →</div>}
                </div>
              </div>
            )}
            <div className={`sk-chat-tag ${"lines" in m && m.lines[m.lines.length - 1]?.side === "out" ? "out" : ""}`}>
              {m.emoji} {m.tag}
            </div>
          </div>
        </div>
      </div>

      <div className="sk-story-dots">
        {moments.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Step ${i + 1} of ${moments.length}`}
            className={`sk-story-dot ${i === index ? "active" : ""}`}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </div>
  );
}
