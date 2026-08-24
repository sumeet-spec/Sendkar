import Link from "next/link";

export const metadata = { title: "Terms of Service — Sendkar" };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <Link href="/" className="text-[13px] text-faint hover:text-muted">← Sendkar</Link>
      <h1 className="mb-1 mt-6 text-2xl font-semibold tracking-tight">Terms of Service</h1>
      <p className="mb-8 text-[12.5px] text-faint">Last updated August 24, 2026</p>

      <div className="space-y-6 text-[14px] leading-relaxed text-muted">
        <p>
          These terms govern your use of Sendkar, operated by Signalpulse Technologies LLC (&quot;Sendkar&quot;, &quot;we&quot;),
          registered in Sheridan, Wyoming, USA. By creating an account you agree to them.
        </p>

        <section>
          <h2 className="mb-2 text-[15px] font-medium text-foreground">The service</h2>
          <p>
            Sendkar is a WhatsApp Business Platform product: campaign sending, a shared inbox, chatbot flows, and
            related tools built on Meta&apos;s WhatsApp Business Cloud API. Sending real messages requires your own
            WhatsApp Business Account through Meta — we can&apos;t create or verify that for you.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-[15px] font-medium text-foreground">Acceptable use</h2>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>You&apos;ll follow Meta&apos;s WhatsApp Business Messaging Policy and Commerce Policy — we can suspend an account that gets a number blocked or banned for policy violations.</li>
            <li>You&apos;ll honor opt-outs. Sendkar tracks and enforces them automatically, but the contacts and consent behind them are yours to manage.</li>
            <li>No sending to numbers you don&apos;t have a legitimate basis to message.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-[15px] font-medium text-foreground">Plans and billing</h2>
          <p>
            Paid plans renew monthly and can be cancelled at any time from Settings — cancelling stops the next
            renewal, it doesn&apos;t refund the current period. The Free plan has no payment method attached.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-[15px] font-medium text-foreground">Your data</h2>
          <p>Your contacts, messages, and campaign data belong to you. You can export or delete them at any time — see our <Link href="/privacy" className="text-accent hover:text-accent-hover">Privacy Policy</Link>.</p>
        </section>

        <section>
          <h2 className="mb-2 text-[15px] font-medium text-foreground">Service &quot;as is&quot;</h2>
          <p>
            Sendkar is provided as-is, without warranty. We work in good faith to keep it reliable, but we&apos;re not
            liable for message delivery failures caused by Meta, your own account standing with Meta, or third-party
            integrations you connect.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-[15px] font-medium text-foreground">Governing law</h2>
          <p>These terms are governed by the laws of the State of Wyoming, USA.</p>
        </section>

        <section>
          <h2 className="mb-2 text-[15px] font-medium text-foreground">Contact</h2>
          <p><a href="mailto:legal@sendkar.com" className="text-accent hover:text-accent-hover">legal@sendkar.com</a></p>
        </section>
      </div>
    </div>
  );
}
