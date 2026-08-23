import { redirect } from "next/navigation";
import { getCurrentWorkspace, listUserWorkspaces } from "@/lib/workspace";
import { Sidebar } from "@/components/Sidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const [workspace, workspaces] = await Promise.all([getCurrentWorkspace(), listUserWorkspaces()]);
  if (!workspace) redirect("/login");

  return (
    <div className="flex">
      <Sidebar workspaceId={workspace.id} workspaces={workspaces} />
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
