export function TrialBanner({ daysLeft }: { daysLeft: number }) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-accent/30 bg-accent/5 px-4 py-2.5 text-[13px]">
      <span>
        <strong className="font-semibold">Free trial</strong> — {daysLeft} day{daysLeft === 1 ? "" : "s"} left. Everything is unlocked.
      </span>
      <a href="/settings/billing" className="font-medium text-accent hover:text-accent-hover">Choose a plan</a>
    </div>
  );
}
