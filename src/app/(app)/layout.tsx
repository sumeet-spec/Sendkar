import { redirect } from "next/navigation";
import { getCurrentWorkspace } from "@/lib/workspace";
import { Sidebar } from "@/components/Sidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const workspace = await getCurrentWorkspace();
  if (!workspace) redirect("/login");

  return (
    <div className="flex">
      <Sidebar workspaceName={workspace.name} />
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
