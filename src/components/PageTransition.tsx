"use client";

import { usePathname } from "next/navigation";

// key={pathname} forces React to remount this div on every route change,
// which re-triggers the CSS animation — a plain className alone wouldn't
// replay on navigation since the element itself wouldn't remount.
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="sk-page-transition">
      {children}
    </div>
  );
}
