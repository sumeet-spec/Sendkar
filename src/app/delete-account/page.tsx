import Link from "next/link";

export const metadata = { title: "Delete your account — Sendkar", description: "How to ask Sendkar to delete your account and your data." };

const SUBJECT = "Delete my Sendkar account";
const BODY = "Please delete my Sendkar account and my data.%0D%0A%0D%0AMy login WhatsApp number: %0D%0AMy shop name: ";

export default function DeleteAccountPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <Link href="/" className="text-[13px] text-faint hover:text-muted">← Sendkar</Link>
      <h1 className="mb-1 mt-6 text-2xl font-semibold tracking-tight">Delete your Sendkar account</h1>
      <p className="mb-8 text-[14px] text-muted">
        You can ask us to delete your account and your data at any time. Here is exactly what happens.
      </p>

      <div className="sk-card mb-6 p-5">
        <div className="mb-2 text-[11px] font-medium uppercase tracking-wide text-faint">How to ask</div>
        <ol className="list-decimal space-y-1.5 pl-5 text-[13.5px] text-muted">
          <li>Send an email from any address to <strong>hello@sendkar.shop</strong> with the subject &quot;{SUBJECT}&quot;.</li>
          <li>Write the WhatsApp number you log in with and your shop name, so we can find the right account.</li>
          <li>We reply to confirm it is you, usually within one business day. Because the account is tied to a WhatsApp number, we may ask you to confirm from that number.</li>
        </ol>
        <a
          href={`mailto:hello@sendkar.shop?subject=${encodeURIComponent(SUBJECT)}&body=${BODY}`}
          className="sk-btn sk-btn-primary mt-4 inline-flex"
        >
          Email us to delete my account
        </a>
      </div>

      <div className="sk-card mb-6 p-5">
        <div className="mb-2 text-[11px] font-medium uppercase tracking-wide text-faint">What we delete</div>
        <ul className="list-disc space-y-1.5 pl-5 text-[13.5px] text-muted">
          <li>Your login and your workspace.</li>
          <li>Your contacts, tags and the conversation history stored in Sendkar.</li>
          <li>Your templates, campaigns, saved cards, brand kit, logo and uploaded pictures.</li>
          <li>The WhatsApp connection we hold for you. Your WhatsApp number and your Meta account are yours and are not affected.</li>
        </ul>
        <p className="mt-3 text-[13px] text-faint">Deletion is completed within 30 days of confirming your request.</p>
      </div>

      <div className="sk-card mb-6 p-5">
        <div className="mb-2 text-[11px] font-medium uppercase tracking-wide text-faint">What we may keep, and why</div>
        <ul className="list-disc space-y-1.5 pl-5 text-[13.5px] text-muted">
          <li>Invoices and payment records, for as long as tax and accounting law in India requires.</li>
          <li>A short record that a deletion request was made, so we can show it was carried out.</li>
        </ul>
      </div>

      <div className="sk-card p-5">
        <div className="mb-2 text-[11px] font-medium uppercase tracking-wide text-faint">If you have a paid plan</div>
        <p className="text-[13.5px] text-muted">
          We cancel your plan first, so you are not charged again. Tell us in the same email if you would like us to
          wait until your current month ends.
        </p>
      </div>

      <p className="mt-8 text-[12.5px] text-faint">
        Questions? See our <Link href="/privacy" className="text-accent hover:text-accent-hover">privacy policy</Link> or write to hello@sendkar.shop.
      </p>
    </div>
  );
}
