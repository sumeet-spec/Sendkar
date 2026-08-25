import Link from "next/link";

export const metadata = { title: "Privacy Policy — Sendkar" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <Link href="/" className="text-[13px] text-faint hover:text-muted">← Sendkar</Link>
      <h1 className="mb-1 mt-6 text-2xl font-semibold tracking-tight">Privacy Policy</h1>
      <p className="mb-8 text-[12.5px] text-faint">Last updated August 24, 2026</p>

      <div className="space-y-6 text-[14px] leading-relaxed text-muted">
        <p>
          Sendkar is operated by Signalpulse Technologies LLC (&quot;Sendkar&quot;, &quot;we&quot;, &quot;us&quot;), registered in Sheridan, Wyoming, USA.
          This policy explains what we collect through the product and why.
        </p>

        <section>
          <h2 className="mb-2 text-[15px] font-medium text-foreground">What we collect</h2>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Your WhatsApp number and password, used to create and sign in to your account — we don&apos;t verify this number with Meta ourselves; it&apos;s just your login identity.</li>
            <li>Your business data — contacts, message content, templates, campaigns, and any order/revenue data you log or connect from Shopify or WooCommerce.</li>
            <li>Basic account activity (sign-ins, API key usage) needed to operate and secure the product.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-[15px] font-medium text-foreground">How messages actually flow</h2>
          <p>
            Sendkar sends and receives WhatsApp messages through Meta&apos;s WhatsApp Business Cloud API directly —
            we are not a reseller sitting on someone else&apos;s infrastructure. That means message content also
            passes through and is subject to Meta&apos;s own platform terms and privacy practices, separate from ours.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-[15px] font-medium text-foreground">What we don&apos;t do</h2>
          <p>We don&apos;t sell your data or your contacts&apos; data to third parties, and we don&apos;t run advertising trackers on this site — see our cookie notice for what little we do store.</p>
        </section>

        <section>
          <h2 className="mb-2 text-[15px] font-medium text-foreground">Third parties we use</h2>
          <p>
            Supabase (database and authentication), Meta (WhatsApp/Instagram/Messenger delivery), and, only if you
            connect them yourself, Shopify, WooCommerce, and Klaviyo. Each processes data under its own privacy terms.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-[15px] font-medium text-foreground">Your data, your control</h2>
          <p>
            You can export your contacts at any time from Sendkar, and you can ask us to delete your workspace and
            everything in it. Reach out using the contact below.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-[15px] font-medium text-foreground">Contact</h2>
          <p>Questions about this policy or a data request: <a href="mailto:privacy@sendkar.com" className="text-accent hover:text-accent-hover">privacy@sendkar.com</a></p>
        </section>
      </div>
    </div>
  );
}
