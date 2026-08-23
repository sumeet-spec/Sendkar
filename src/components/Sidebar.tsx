"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/login/actions";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: "grid" },
  { href: "/contacts", label: "Contacts", icon: "users" },
  { href: "/templates", label: "Templates", icon: "doc" },
  { href: "/campaigns", label: "Campaigns", icon: "send" },
  { href: "/inbox", label: "Inbox", icon: "chat" },
] as const;

function Icon({ name }: { name: string }) {
  const common = { width: 17, height: 17, viewBox: "0 0 20 20", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (name) {
    case "grid":
      return <svg {...common}><rect x="2.5" y="2.5" width="6.5" height="6.5" rx="1.4" /><rect x="11" y="2.5" width="6.5" height="6.5" rx="1.4" /><rect x="2.5" y="11" width="6.5" height="6.5" rx="1.4" /><rect x="11" y="11" width="6.5" height="6.5" rx="1.4" /></svg>;
    case "users":
      return <svg {...common}><circle cx="6.5" cy="6.5" r="2.6" /><circle cx="14" cy="6.5" r="2.6" /><path d="M2.3 17c0-2.8 1.9-4.4 4.2-4.4s4.2 1.6 4.2 4.4M9.3 17c0-2.8 1.9-4.4 4.2-4.4s4.2 1.6 4.2 4.4" /></svg>;
    case "doc":
      return <svg {...common}><path d="M5 2.5h7l3 3V17a1 1 0 01-1 1H5a1 1 0 01-1-1V3.5a1 1 0 011-1z" /><path d="M12 2.5V6h3" /><path d="M6.5 10h7M6.5 13h5" /></svg>;
    case "send":
      return <svg {...common}><path d="M2 10l16-7-6 16-3-6-7-3z" /></svg>;
    case "chat":
      return <svg {...common}><path d="M3 4h14a1 1 0 011 1v9a1 1 0 01-1 1H8l-4 3v-3H3a1 1 0 01-1-1V5a1 1 0 011-1z" /></svg>;
    default:
      return null;
  }
}

export function Sidebar({ workspaceName }: { workspaceName: string }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-60 flex-shrink-0 flex-col border-r border-border bg-surface p-3.5">
      <div className="mb-1 flex items-center gap-2.5 px-2 py-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent">
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
            <path d="M3 10l7-7 7 7M3 10l7 7 7-7" stroke="#05130a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <span className="text-[15px] font-semibold tracking-tight">Sendkar</span>
      </div>

      <nav className="mt-4 flex flex-col gap-0.5">
        {NAV.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13.5px] font-medium transition-colors ${
                active ? "bg-accent-glow text-foreground" : "text-muted hover:text-foreground"
              }`}
              style={active ? { background: "rgba(34,197,94,0.10)" } : undefined}
            >
              <Icon name={item.icon} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-border pt-3">
        <div className="flex items-center justify-between px-2.5 py-1.5">
          <div className="truncate text-[12.5px] font-medium text-muted">{workspaceName}</div>
          <button
            onClick={() => logout()}
            className="text-[11.5px] font-medium text-faint hover:text-danger"
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}
