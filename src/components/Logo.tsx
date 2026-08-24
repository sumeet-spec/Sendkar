const SIZES = {
  sm: { box: "h-7 w-7", rounded: "rounded-md", icon: 15 },
  md: { box: "h-8 w-8", rounded: "rounded-lg", icon: 17 },
} as const;

/**
 * A dispatched message, mid-flight — the trailing dots read as motion, not
 * just a static arrow. Deliberately not a paper plane (Telegram's mark) or
 * a generic chevron (what this replaced).
 */
export function Logo({ size = "sm" }: { size?: keyof typeof SIZES }) {
  const s = SIZES[size];
  return (
    <div className={`flex ${s.box} shrink-0 items-center justify-center ${s.rounded} bg-accent`}>
      <svg width={s.icon} height={s.icon} viewBox="0 0 20 20" fill="#05130a">
        <circle cx="3.2" cy="10" r="1" opacity="0.35" />
        <circle cx="6.6" cy="10" r="1.3" opacity="0.65" />
        <path d="M9.5 6.2L17 10L9.5 13.8L9.5 10.9L13.2 10L9.5 9.1Z" />
      </svg>
    </div>
  );
}
