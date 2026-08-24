import { getCurrentLanguage } from "@/lib/i18n/getLanguage";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { SignupForm } from "./SignupForm";

export default async function SignupPage() {
  const lang = await getCurrentLanguage();
  return <SignupForm dict={getDictionary(lang).auth} lang={lang} />;
}
