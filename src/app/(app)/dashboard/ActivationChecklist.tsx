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
  const doneCount = steps.filter((s) => s.done).length;
  if (doneCount === steps.length) return null;

  const nextIndex = steps.findIndex((s) => !s.done);

  return (
    <div className="sk-card flex h-full flex-col p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-[13px] font-medium">{title}</div>
        <div className="font-mono text-[12px] font-semibold text-muted">
          {doneCount}/{steps.length}
        </div>
      </div>

      <div className="mb-4 flex gap-1">
        {steps.map((step, i) => (
          <div
            key={step.label}
            className="h-1.5 flex-1 rounded"
            style={{ background: i < doneCount ? "var(--accent)" : "var(--border)" }}
          />
        ))}
      </div>

      <div className="flex flex-col gap-0.5">
        {steps.map((step, i) => {
          const isNext = i === nextIndex;
          return (
            <Link
              key={step.label}
              href={step.href}
              className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-[13px]"
              style={isNext ? { background: "rgba(34,197,94,0.07)" } : undefined}
            >
              <span
                className="flex h-[17px] w-[17px] flex-shrink-0 items-center justify-center rounded-full"
                style={
                  step.done
                    ? { background: "var(--accent)" }
                    : { border: `1.6px solid ${isNext ? "var(--accent-dim)" : "var(--border)"}` }
                }
              >
                {step.done && (
                  <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5.2L4.2 7.4L8.2 3" stroke="#05130a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <span
                className="flex-1"
                style={
                  step.done
                    ? { color: "var(--faint)", textDecoration: "line-through" }
                    : { color: isNext ? "var(--foreground)" : "var(--muted)", fontWeight: isNext ? 600 : 500 }
                }
              >
                {step.label}
              </span>
              {isNext && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2.5 6h7M6 2.5L9.5 6L6 9.5" />
                </svg>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
