import { getCurrentWorkspace } from "@/lib/workspace";
import { getPlanLimits, effectivePlan } from "@/lib/plans";
import { AiAgentForm } from "./AiAgentForm";

export default async function AiAgentPage() {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return null;

  return (
    <div className="max-w-2xl">
      <h1 className="mb-2 text-xl font-semibold tracking-tight">AI agent</h1>
      <p className="mb-3 text-sm text-muted">
        Your shop&apos;s WhatsApp assistant. When a customer says &quot;hi&quot; it greets them, in their own language, and can answer
        questions, quote prices, take an order and show what they owe and how to pay. A reply goes out on its own, around the clock.
      </p>
      <p className="mb-6 text-[12.5px] text-faint">
        It already knows what you list under <a href="/items" className="text-accent hover:text-accent-hover">My items</a>, your
        opening hours, your brand kit details, how customers pay you, and each customer&apos;s unpaid bills. It only uses prices
        written there, and passes anything else to you. Use the box below for anything extra it should know, such as delivery
        areas or your return policy. Orders it takes show up on the Quick bill page, ready to turn into a bill.
      </p>
      <AiAgentForm
        initialEnabled={workspace.ai_agent_enabled}
        initialKnowledge={workspace.ai_agent_knowledge ?? ""}
        planAllowed={getPlanLimits(effectivePlan(workspace)).aiAgentEnabled}
      />
    </div>
  );
}
