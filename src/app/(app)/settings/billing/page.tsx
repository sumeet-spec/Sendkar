import { getCurrentWorkspace } from "@/lib/workspace";
import { PLAN_LIMITS } from "@/lib/plans";
import { PlanCard } from "./PlanCard";

export default async function BillingPage() {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return null;

  const cards = [
    { plan: "free", limits: PLAN_LIMITS.free, features: ["1 team member", "WhatsApp only", "No automations"] },
    { plan: "starter", limits: PLAN_LIMITS.starter, features: ["3 team members", "WhatsApp only", "Keyword automations"], highlight: true },
    { plan: "growth", limits: PLAN_LIMITS.growth, features: ["10 team members", "WhatsApp + Instagram", "Automations + outbound webhooks"] },
    { plan: "scale", limits: PLAN_LIMITS.scale, features: ["Unlimited members", "WhatsApp + Instagram", "Everything unlocked"] },
  ];

  return (
    <div className="max-w-4xl">
      <h1 className="mb-6 text-xl font-semibold tracking-tight">Billing</h1>
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
