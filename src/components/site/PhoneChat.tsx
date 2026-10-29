import type { SiteCopy } from "@/lib/i18n/site";

/**
 * What a customer sees on their own phone when a shop messages them. The messages come from the page
 * copy, so the example is in the visitor's own language — the fastest way to show what Sendkar does.
 * Pure CSS animation, no script.
 */
export function PhoneChat({ copy }: { copy: SiteCopy["chat"] }) {
  return (
    <div>
      <div className="sk-site-phone">
        <div className="sk-site-screen">
          <div className="sk-site-phone-head">
            <div className="sk-site-avatar">{Array.from(copy.shopName.trim())[0]}</div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[15px] font-semibold">{copy.shopName}</div>
              <div className="text-[12px] text-faint">WhatsApp Business</div>
            </div>
            <span className="sk-pill flex-shrink-0 text-[11px]">{copy.example}</span>
          </div>
          <div className="sk-site-chat">
            {copy.messages.map((m, i) => (
              <div key={i} className={`sk-site-bubble ${m.side === "in" ? "shop" : "me"}`} style={{ animationDelay: `${0.35 + i * 0.95}s` }}>
                {m.text}
                {m.side === "out" && <span className="sk-site-ticks" title={copy.delivered}>✓✓</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
      <p className="mt-5 text-center text-[13.5px] text-faint">{copy.caption}</p>
    </div>
  );
}
