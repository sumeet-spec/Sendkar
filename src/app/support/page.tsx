import Link from "next/link";

export const metadata = { title: "Support — Sendkar" };

export default function SupportPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <Link href="/" className="text-[13px] text-faint hover:text-muted">← Sendkar</Link>
      <h1 className="mb-1 mt-6 text-2xl font-semibold tracking-tight">Support</h1>
      <p className="mb-8 text-[14px] text-muted">
        Sendkar is early — you&apos;ll reach a person, not a ticket queue.
      </p>

      <div className="sk-card mb-6 p-5">
        <div className="mb-2 text-[11px] font-medium uppercase tracking-wide text-faint">Email</div>
        <a href="mailto:hello@sendkar.shop" className="text-[15px] text-accent hover:text-accent-hover">hello@sendkar.shop</a>
        <p className="mt-2 text-[13px] text-faint">We reply within a business day.</p>
      </div>

      <div className="sk-card p-5">
        <div className="mb-2 text-[11px] font-medium uppercase tracking-wide text-faint">Before you write in</div>
        <ul className="list-disc space-y-1.5 pl-5 text-[13.5px] text-muted">
          <li>Messages not sending? Check Dashboard — it flags whether your WhatsApp number is connected and shows today&apos;s send count against your tier limit.</li>
          <li>Template rejected by Meta? The reason Meta gave is shown on the template in Templates.</li>
          <li>Need the API/MCP endpoint? It&apos;s on the <Link href="/mcp" className="text-accent hover:text-accent-hover">MCP connector</Link> page.</li>
        </ul>
      </div>
    </div>
  );
}
