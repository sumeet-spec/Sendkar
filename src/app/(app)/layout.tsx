import { redirect } from "next/navigation";
import { getCurrentWorkspace, listUserWorkspaces } from "@/lib/workspace";
import { Sidebar } from "@/components/Sidebar";
import { MobileTopBar } from "@/components/MobileTopBar";
import { CommandPalette } from "@/components/CommandPalette";
import { PageTransition } from "@/components/PageTransition";
import { getCurrentLanguage } from "@/lib/i18n/getLanguage";
import { getDictionary } from "@/lib/i18n/dictionaries";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const [workspace, workspaces, lang] = await Promise.all([getCurrentWorkspace(), listUserWorkspaces(), getCurrentLanguage()]);
  if (!workspace) redirect("/login");
  const dict = getDictionary(lang);

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <MobileTopBar />
      <Sidebar workspaceId={workspace.id} workspaces={workspaces} nav={dict.nav} lang={lang} />
      <main className="min-w-0 flex-1 overflow-y-auto p-4 md:p-8">
        <PageTransition>{children}</PageTransition>
      </main>
      <CommandPalette nav={dict.nav} />
    </div>
  );
}
