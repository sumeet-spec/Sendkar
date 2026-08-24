import { redirect } from "next/navigation";
import { getCurrentWorkspace, listUserWorkspaces } from "@/lib/workspace";
import { Sidebar } from "@/components/Sidebar";
import { CommandPalette } from "@/components/CommandPalette";
import { getCurrentLanguage } from "@/lib/i18n/getLanguage";
import { getDictionary } from "@/lib/i18n/dictionaries";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const [workspace, workspaces, lang] = await Promise.all([getCurrentWorkspace(), listUserWorkspaces(), getCurrentLanguage()]);
  if (!workspace) redirect("/login");
  const dict = getDictionary(lang);

  return (
    <div className="flex">
      <Sidebar workspaceId={workspace.id} workspaces={workspaces} nav={dict.nav} lang={lang} />
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
      <CommandPalette nav={dict.nav} />
    </div>
  );
}
