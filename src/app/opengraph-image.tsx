import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Matches the dark green theme in globals.css (--background, --accent,
// --foreground, --muted) and the Logo component's dispatched-message mark —
// generated at request time so there's no separate static asset to keep in
// sync with the real brand colors.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0d0b",
          backgroundImage: "radial-gradient(120% 140% at 50% 0%, rgba(34,197,94,0.18), transparent 60%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 36 }}>
          <div style={{ display: "flex", width: 72, height: 72, borderRadius: 16, background: "#22c55e", alignItems: "center", justifyContent: "center" }}>
            <svg width={38} height={38} viewBox="0 0 20 20" fill="#05130a">
              <circle cx="3.2" cy="10" r="1" opacity="0.35" />
              <circle cx="6.6" cy="10" r="1.3" opacity="0.65" />
              <path d="M9.5 6.2L17 10L9.5 13.8L9.5 10.9L13.2 10L9.5 9.1Z" />
            </svg>
          </div>
          <div style={{ display: "flex", fontSize: 56, fontWeight: 700, color: "#eef5f0" }}>Sendkar</div>
        </div>
        <div style={{ display: "flex", fontSize: 30, color: "#8ea299", maxWidth: 860, textAlign: "center", lineHeight: 1.4 }}>
          WhatsApp marketing, AI automations, and revenue attribution — built on Meta&apos;s real Cloud API.
        </div>
      </div>
    ),
    { ...size },
  );
}
