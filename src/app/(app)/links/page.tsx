import { getCurrentWorkspace } from "@/lib/workspace";
import { LinkBuilder } from "./LinkBuilder";
import Link from "next/link";

export default async function LinksPage() {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return null;

  if (!workspace.whatsapp_display_number) {
    return (
      <div className="max-w-2xl">
        <h1 className="mb-4 text-xl font-semibold tracking-tight">Links & widget</h1>
        <div className="sk-card p-5" style={{ borderColor: "rgba(251,191,36,0.3)" }}>
          <p className="text-sm">
            Add your WhatsApp number&apos;s display number in{" "}
            <Link href="/settings/channels" className="text-accent hover:text-accent-hover">Settings → Channels</Link> to generate a
            click-to-chat link — the Cloud API&apos;s phone_number_id alone can&apos;t build one.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="mb-1 text-xl font-semibold tracking-tight">Links & widget</h1>
      <p className="mb-6 text-sm text-muted">A shareable link and an embeddable button that open a chat with your WhatsApp number.</p>
      <LinkBuilder displayNumber={workspace.whatsapp_display_number} />
    </div>
  );
}
