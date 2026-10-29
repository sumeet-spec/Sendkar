import { getCurrentWorkspace } from "@/lib/workspace";
import { createClient } from "@/lib/supabase/server";
import { PLAN_LIMITS, allowanceLines, nextMonthStartIst } from "@/lib/plans";
import { getImageAllowance, getNumberAllowance } from "@/lib/planUsage";
import { PlanCard } from "./PlanCard";

function Meter({ label, used, limit, note }: { label: string; used: number | null; limit: number; note?: string }) {
  const pct = used === null || limit === 0 ? 0 : Math.min(100, Math.round((used / limit) * 100));
  return (
    <div>
      <div className="flex items-baseline justify-between text-[13px]">
        <span className="font-medium">{label}</span>
        <span className="text-muted">{used === null ? "—" : used} of {limit}</span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-border">
        <div className={`h-full rounded-full ${pct >= 100 ? "bg-danger" : "bg-accent"}`} style={{ width: `${pct}%` }} />
      </div>
      {note && <p className="mt-1 text-[11.5px] text-faint">{note}</p>}
    </div>
  );
}

export default async function BillingPage() {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return null;
  const supabase = await createClient();

  const numbers = await getNumberAllowance(supabase, workspace);
  const images = await getImageAllowance(supabase, workspace);
  const resetsOn = nextMonthStartIst().toLocaleDateString("en-IN", { day: "numeric", month: "long", timeZone: "Asia/Kolkata" });

  // The number and image lines come from the plan limits themselves, so this page and the
  // public pricing can never disagree with what the product actually enforces.
  const cards = [
    { plan: "free", limits: PLAN_LIMITS.free, features: ["Look around the dashboard", ...allowanceLines("free")] },
    { plan: "starter", limits: PLAN_LIMITS.starter, features: [...allowanceLines("starter"), "Unlimited team seats", "Automations and chatbot flows"], highlight: true },
    { plan: "growth", limits: PLAN_LIMITS.growth, features: [...allowanceLines("growth"), "WhatsApp, Instagram and Messenger", "Catalog, AI agent, outbound webhooks"] },
    { plan: "scale", limits: PLAN_LIMITS.scale, features: [...allowanceLines("scale"), "Everything in Growth", "Priority support"] },
  ];

  return (
    <div className="max-w-4xl">
      <h1 className="mb-6 text-xl font-semibold tracking-tight">Billing</h1>

      <div className="sk-card mb-6 p-4">
        <div className="mb-3 text-[11px] font-medium uppercase tracking-wide text-faint">Your usage — {workspace.plan} plan</div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Meter label="WhatsApp numbers" used={numbers.connected} limit={numbers.allowed} note={numbers.canAdd ? undefined : numbers.blockedReason ?? undefined} />
          <Meter label="AI images this month" used={images ? images.used : null} limit={images ? images.limit : PLAN_LIMITS[workspace.plan as keyof typeof PLAN_LIMITS]?.imagesPerMonth ?? 0} note={`Resets on ${resetsOn}.`} />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {cards.map((c) => (
          <PlanCard
            key={c.plan}
            plan={c.plan}
            priceInr={c.limits.priceInr}
            features={c.features}
            current={workspace.plan === c.plan}
            highlight={c.highlight}
          />
        ))}
      </div>
    </div>
  );
}
