"use client";

import { usePathname } from "next/navigation";
import type { GateCopy } from "@/lib/i18n/gateCopy";

/**
 * When a workspace has no active plan (its trial ended, or a subscription was cancelled) every page stays open
 * to look around, with a banner saying a plan is needed to send and to connect a number. Nothing is deleted,
 * and what is held (sending, connecting) is refused with a plain message where it is tried.
 */
export function ExpiredGate({ expired, wasTrial, copy, children }: { expired: boolean; wasTrial: boolean; copy: GateCopy; children: React.ReactNode }) {
  const pathname = usePathname();
  const onBilling = pathname.startsWith("/settings/billing");
  return (
    <>
      {expired && !onBilling && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-accent/40 bg-accent/10 px-4 py-3 text-[13.5px]">
          <span className="min-w-0 flex-1">{wasTrial ? copy.trialEnded : copy.noPlan}</span>
          <a href="/settings/billing" className="sk-btn sk-btn-primary flex-shrink-0">{copy.seePlans}</a>
        </div>
      )}
      {children}
    </>
  );
}
