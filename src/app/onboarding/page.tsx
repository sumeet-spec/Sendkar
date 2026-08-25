import { getCurrentLanguage } from "@/lib/i18n/getLanguage";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { OnboardingForm } from "./OnboardingForm";

export default async function OnboardingPage() {
  const lang = await getCurrentLanguage();
  const t = getDictionary(lang).onboarding;
  return <OnboardingForm t={t} />;
}
