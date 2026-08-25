import { getCurrentLanguage } from "@/lib/i18n/getLanguage";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default async function LanguageSettingsPage() {
  const lang = await getCurrentLanguage();

  return (
    <div className="max-w-lg">
      <h1 className="mb-2 text-xl font-semibold tracking-tight">Language</h1>
      <p className="mb-6 text-sm text-muted">
        Changes the app&apos;s interface language everywhere — dashboard, inbox, settings, and the WhatsApp connection
        flow. This is the same preference the switcher at the bottom of the sidebar controls; it just lives here too,
        where you&apos;d expect a language setting to be.
      </p>
      <div className="sk-card p-4">
        <label className="sk-label">Interface language</label>
        <LanguageSwitcher current={lang} />
      </div>
    </div>
  );
}
