"use client";

import { usePathname } from "next/navigation";

/**
 * When a workspace has no active plan (its trial ended, or a subscription was cancelled) every page
 * except Billing shows this instead. Nothing is deleted: contacts, templates and messages are all
 * still there and come straight back when a plan is chosen.
 */
export function ExpiredGate({ expired, wasTrial, children }: { expired: boolean; wasTrial: boolean; children: React.ReactNode }) {
  const pathname = usePathname();
  if (!expired || pathname.startsWith("/settings/billing")) return <>{children}</>;

  return (
    <div className="mx-auto mt-10 max-w-lg">
      <div className="sk-card p-6">
        <h1 className="text-lg font-semibold tracking-tight">
          {wasTrial ? "Your 7-day free trial has ended" : "Choose a plan to get started"}
        </h1>
        <p className="mt-2 text-[13.5px] text-muted">
          {wasTrial
            ? "Thank you for trying Sendkar. Your contacts, templates and messages are all safe. Choose a plan and everything picks up where you left off."
            : "Pick the plan that fits how many WhatsApp numbers you use. Your account and data stay as they are."}
        </p>
        <div className="mt-5">
          <a href="/settings/billing" className="sk-btn sk-btn-primary">See plans</a>
        </div>
      </div>
    </div>
  );
}
