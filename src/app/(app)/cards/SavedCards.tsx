import Link from "next/link";
import { deleteSavedCard } from "./actions";
import type { LibraryCopy } from "@/lib/i18n/libraryCopy";

export type SavedCard = { id: string; title: string; url: string; urls: Record<string, string> | null; created_at: string };

/** Cards the shop has made before, ready to send again in one click. */
export function SavedCards({ cards, t }: { cards: SavedCard[]; t: LibraryCopy }) {
  if (cards.length === 0) return null;
  return (
    <div className="mt-10">
      <h2 className="mb-3 text-sm font-semibold">{t.savedTitle}</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cards.map((c) => (
          <div key={c.id} className="overflow-hidden rounded-xl border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={c.url} alt={c.title} loading="lazy" className="aspect-square w-full bg-[var(--surface-2)] object-cover" />
            <div className="p-2">
              <div className="truncate text-[12px] text-muted">{c.title}</div>
              <div className="mt-1.5 flex items-center justify-between gap-2">
                <Link
                  href={c.urls ? `/campaigns?cards=${encodeURIComponent(JSON.stringify(c.urls))}` : `/campaigns?card=${encodeURIComponent(c.url)}`}
                  className="text-[12px] text-accent hover:text-accent-hover"
                >
                  {t.sendAgain}
                </Link>
                <form action={deleteSavedCard.bind(null, c.id)}>
                  <button type="submit" className="text-[11.5px] text-faint hover:text-danger">{t.remove}</button>
                </form>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
