"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

export function LinkBuilder({ displayNumber }: { displayNumber: string }) {
  const [prefill, setPrefill] = useState("Hi! I'd like to know more.");
  const [copied, setCopied] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  const waLink = `https://wa.me/${displayNumber}${prefill ? `?text=${encodeURIComponent(prefill)}` : ""}`;
  const embedSnippet = `<a href="${waLink}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:8px;background:#22c55e;color:#05130a;padding:10px 16px;border-radius:8px;font-family:sans-serif;font-weight:600;text-decoration:none;">Chat on WhatsApp</a>`;

  useEffect(() => {
    QRCode.toDataURL(waLink, { width: 220, margin: 1, color: { dark: "#05130a", light: "#ffffff" } })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(null));
  }, [waLink]);

  function copy(label: string, value: string) {
    navigator.clipboard.writeText(value);
    setCopied(label);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="sk-label">Prefilled message (optional)</label>
        <input value={prefill} onChange={(e) => setPrefill(e.target.value)} className="sk-input" />
      </div>

      <div className="sk-card p-4">
        <div className="mb-2 text-[11px] font-medium uppercase tracking-wide text-faint">Click-to-chat link</div>
        <div className="flex items-center gap-2">
          <code className="flex-1 truncate text-[13px] text-accent">{waLink}</code>
          <button onClick={() => copy("link", waLink)} className="sk-btn sk-btn-ghost text-[12px]">
            {copied === "link" ? "Copied" : "Copy"}
          </button>
        </div>
        <p className="mt-2 text-[12px] text-faint">Share this anywhere — bio, ads, email signature. Opens WhatsApp with your number and the message above pre-filled.</p>
      </div>

      <div className="sk-card p-4">
        <div className="mb-2 text-[11px] font-medium uppercase tracking-wide text-faint">QR code</div>
        <div className="flex items-center gap-4">
          {qrDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- a data: URI, not an optimizable remote image
            <img src={qrDataUrl} alt="WhatsApp chat QR code" width={110} height={110} className="rounded-md bg-white p-1.5" />
          ) : (
            <div className="h-[110px] w-[110px] animate-pulse rounded-md bg-surface-2" />
          )}
          <div className="flex flex-col gap-2">
            <p className="text-[12px] text-faint">For print — packaging, storefronts, business cards. Scanning opens the same chat as the link above.</p>
            {qrDataUrl && (
              <a href={qrDataUrl} download="sendkar-whatsapp-qr.png" className="sk-btn sk-btn-ghost w-fit text-[12px]">
                Download PNG
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="sk-card p-4">
        <div className="mb-2 text-[11px] font-medium uppercase tracking-wide text-faint">Embeddable button (HTML)</div>
        <pre className="overflow-x-auto rounded-md bg-surface-2 p-3 text-[12px] text-muted">{embedSnippet}</pre>
        <button onClick={() => copy("embed", embedSnippet)} className="sk-btn sk-btn-ghost mt-2 text-[12px]">
          {copied === "embed" ? "Copied" : "Copy snippet"}
        </button>
      </div>

      <div className="sk-card flex items-center justify-center p-6">
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 font-semibold text-[#05130a]"
        >
          Chat on WhatsApp
        </a>
      </div>
    </div>
  );
}
