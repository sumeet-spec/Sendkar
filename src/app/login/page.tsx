import { getCurrentLanguage } from "@/lib/i18n/getLanguage";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
  const lang = await getCurrentLanguage();
  return <LoginForm dict={getDictionary(lang).auth} lang={lang} />;
}
