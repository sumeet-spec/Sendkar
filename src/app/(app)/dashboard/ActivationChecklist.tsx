import Link from "next/link";

interface Step {
  label: string;
  done: boolean;
  href: string;
}

/**
 * Stripe-style: stays visible in the real UI (not a blocking modal tour)
 * and auto-checks items the workspace already completed through normal use,
 * not just ones ticked through this exact widget. Disappears once every
 * step is done — no separate "dismiss" state to persist.
 */
export function ActivationChecklist({ title, steps }: { title: string; steps: Step[] }) {
  if (steps.every((s) => s.done)) return null;

  return (
    <div className="sk-card mb-6 overflow-hidden">
      <div className="border-b border-border px-4 py-3 text-[13px] font-medium">{title}</div>
      <div className="flex flex-col">
        {steps.map((step) => (
          <Link
            key={step.label}
            href={step.href}
            className="flex items-center gap-3 border-b border-border px-4 py-2.5 text-[13px] last:border-0 hover:bg-surface-2"
          >
            <span
              className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border ${
                step.done ? "border-accent bg-accent-glow text-accent" : "border-border text-transparent"
              }`}
            >
              {step.done && (
                <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6.5L4.5 9L10 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
            <span className={step.done ? "text-faint line-through" : "text-foreground"}>{step.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
